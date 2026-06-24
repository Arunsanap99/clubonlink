/**
 * Firestore Helper Functions for Club Features
 * Handles transactions, batch operations, and data management
 */

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  runTransaction,
  writeBatch,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';

// ============================================================================
// ATTENDANCE MODULE HELPERS
// ============================================================================

/**
 * Create attendance session
 * @param {string} clubId - Club ID
 * @param {Object} sessionData - Session data
 * @param {string} createdBy - Creator user ID
 * @returns {Promise<string>} Session ID
 */
export const createAttendanceSession = async (clubId, sessionData, createdBy) => {
  try {
    const sessionRef = doc(collection(db, 'clubs', clubId, 'attendanceSessions'));
    
    const session = {
      ...sessionData,
      createdBy,
      createdAt: new Date().toISOString(),
      status: 'open',
      attendeeCount: 0
    };
    
    await setDoc(sessionRef, session);
    
    // Create audit log
    await createAuditLog(clubId, {
      type: 'attendance_session_created',
      performedBy: createdBy,
      details: `Created attendance session: ${sessionData.title}`,
      sessionId: sessionRef.id
    });
    
    return sessionRef.id;
  } catch (error) {
    console.error('Error creating attendance session:', error);
    throw error;
  }
};

/**
 * Mark attendance for a user (transaction-safe)
 * @param {string} clubId - Club ID
 * @param {string} sessionId - Session ID
 * @param {string} uid - User ID
 * @param {boolean} present - Present status
 * @param {string} markedBy - Who marked the attendance
 * @param {Object} userInfo - User information
 * @returns {Promise<boolean>} Success status
 */
export const markAttendance = async (clubId, sessionId, uid, present, markedBy, userInfo = {}) => {
  try {
    const result = await runTransaction(db, async (transaction) => {
      const recordRef = doc(db, 'clubs', clubId, 'attendanceSessions', sessionId, 'records', uid);
      const sessionRef = doc(db, 'clubs', clubId, 'attendanceSessions', sessionId);
      
      // Check if record already exists
      const existingRecord = await transaction.get(recordRef);
      const sessionDoc = await transaction.get(sessionRef);
      
      if (!sessionDoc.exists()) {
        throw new Error('Attendance session not found');
      }
      
      const sessionData = sessionDoc.data();
      if (sessionData.status === 'closed') {
        throw new Error('Attendance session is closed');
      }
      
      const record = {
        uid,
        name: userInfo.name || 'Unknown',
        email: userInfo.email || '',
        present,
        markedBy,
        timestamp: new Date().toISOString()
      };
      
      let attendeeCountChange = 0;
      
      if (existingRecord.exists()) {
        // Update existing record
        const existingData = existingRecord.data();
        if (existingData.present !== present) {
          attendeeCountChange = present ? 1 : -1;
        }
        transaction.update(recordRef, record);
      } else {
        // Create new record
        attendeeCountChange = present ? 1 : 0;
        transaction.set(recordRef, record);
      }
      
      // Update session attendee count
      if (attendeeCountChange !== 0) {
        transaction.update(sessionRef, {
          attendeeCount: increment(attendeeCountChange)
        });
      }
      
      return true;
    });
    
    return result;
  } catch (error) {
    console.error('Error marking attendance:', error);
    throw error;
  }
};

/**
 * Bulk mark attendance (batched operation)
 * @param {string} clubId - Club ID
 * @param {string} sessionId - Session ID
 * @param {Array} attendanceRecords - Array of {uid, present, userInfo}
 * @param {string} markedBy - Who marked the attendance
 * @returns {Promise<Object>} { success: number, failed: number, errors: Array }
 */
export const bulkMarkAttendance = async (clubId, sessionId, attendanceRecords, markedBy) => {
  const results = { success: 0, failed: 0, errors: [] };
  const batchSize = 500; // Firestore batch limit
  
  try {
    // Process in batches
    for (let i = 0; i < attendanceRecords.length; i += batchSize) {
      const batch = attendanceRecords.slice(i, i + batchSize);
      
      try {
        await Promise.all(
          batch.map(async ({ uid, present, userInfo }) => {
            try {
              await markAttendance(clubId, sessionId, uid, present, markedBy, userInfo);
              results.success++;
            } catch (error) {
              results.failed++;
              results.errors.push(`${userInfo.name || uid}: ${error.message}`);
            }
          })
        );
      } catch (error) {
        results.failed += batch.length;
        results.errors.push(`Batch error: ${error.message}`);
      }
    }
    
    // Create audit log
    await createAuditLog(clubId, {
      type: 'bulk_attendance_marked',
      performedBy: markedBy,
      details: `Bulk marked attendance for ${results.success} members`,
      sessionId,
      metadata: { success: results.success, failed: results.failed }
    });
    
    return results;
  } catch (error) {
    console.error('Error in bulk attendance marking:', error);
    throw error;
  }
};

// ============================================================================
// EVENTS MODULE HELPERS
// ============================================================================

/**
 * Create event
 * @param {string} clubId - Club ID
 * @param {Object} eventData - Event data
 * @param {string} createdBy - Creator user ID
 * @returns {Promise<string>} Event ID
 */
export const createEvent = async (clubId, eventData, createdBy) => {
  try {
    const eventRef = doc(collection(db, 'clubs', clubId, 'events'));
    
    const event = {
      ...eventData,
      createdBy,
      createdAt: new Date().toISOString(),
      rsvpCount: 0,
      attendeeCount: 0
    };
    
    await setDoc(eventRef, event);
    
    // Create audit log
    await createAuditLog(clubId, {
      type: 'event_created',
      performedBy: createdBy,
      details: `Created event: ${eventData.title}`,
      eventId: eventRef.id
    });
    
    return eventRef.id;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

/**
 * RSVP to event (transaction-safe)
 * @param {string} clubId - Club ID
 * @param {string} eventId - Event ID
 * @param {string} uid - User ID
 * @param {string} response - RSVP response ('yes', 'maybe', 'no')
 * @param {Object} userInfo - User information
 * @returns {Promise<boolean>} Success status
 */
export const rsvpEvent = async (clubId, eventId, uid, response, userInfo = {}) => {
  try {
    const result = await runTransaction(db, async (transaction) => {
      const rsvpRef = doc(db, 'clubs', clubId, 'events', eventId, 'rsvps', uid);
      const eventRef = doc(db, 'clubs', clubId, 'events', eventId);
      
      // Get current RSVP and event data
      const existingRsvp = await transaction.get(rsvpRef);
      const eventDoc = await transaction.get(eventRef);
      
      if (!eventDoc.exists()) {
        throw new Error('Event not found');
      }
      
      const eventData = eventDoc.data();
      const eventDate = new Date(eventData.startAt);
      
      // Check if event has passed
      if (eventDate < new Date()) {
        throw new Error('Cannot RSVP to past events');
      }
      
      // Check capacity for 'yes' responses
      if (response === 'yes' && eventData.capacity) {
        const currentAttendees = eventData.attendeeCount || 0;
        const existingResponse = existingRsvp.exists() ? existingRsvp.data().response : null;
        
        // If changing from non-yes to yes, check capacity
        if (existingResponse !== 'yes' && currentAttendees >= eventData.capacity) {
          throw new Error('Event is at full capacity');
        }
      }
      
      const rsvp = {
        uid,
        name: userInfo.name || 'Unknown',
        email: userInfo.email || '',
        response,
        respondedAt: new Date().toISOString()
      };
      
      // Calculate attendee count change
      let attendeeChange = 0;
      if (existingRsvp.exists()) {
        const oldResponse = existingRsvp.data().response;
        if (oldResponse === 'yes' && response !== 'yes') {
          attendeeChange = -1;
        } else if (oldResponse !== 'yes' && response === 'yes') {
          attendeeChange = 1;
        }
      } else if (response === 'yes') {
        attendeeChange = 1;
      }
      
      // Update RSVP
      transaction.set(rsvpRef, rsvp);
      
      // Update event attendee count
      if (attendeeChange !== 0) {
        transaction.update(eventRef, {
          attendeeCount: increment(attendeeChange)
        });
      }
      
      return true;
    });
    
    return result;
  } catch (error) {
    console.error('Error RSVPing to event:', error);
    throw error;
  }
};

// ============================================================================
// ANNOUNCEMENTS MODULE HELPERS
// ============================================================================

/**
 * Create announcement
 * @param {string} clubId - Club ID
 * @param {Object} announcementData - Announcement data
 * @param {string} createdBy - Creator user ID
 * @returns {Promise<string>} Announcement ID
 */
export const createAnnouncement = async (clubId, announcementData, createdBy) => {
  try {
    const announcementRef = doc(collection(db, 'clubs', clubId, 'announcements'));
    
    const announcement = {
      ...announcementData,
      createdBy,
      createdAt: new Date().toISOString(),
      readCount: 0
    };
    
    await setDoc(announcementRef, announcement);
    
    // Create audit log
    await createAuditLog(clubId, {
      type: 'announcement_created',
      performedBy: createdBy,
      details: `Created announcement: ${announcementData.title}`,
      announcementId: announcementRef.id
    });
    
    return announcementRef.id;
  } catch (error) {
    console.error('Error creating announcement:', error);
    throw error;
  }
};

/**
 * Mark announcement as read
 * @param {string} clubId - Club ID
 * @param {string} announcementId - Announcement ID
 * @param {string} uid - User ID
 * @returns {Promise<boolean>} Success status
 */
export const markAnnouncementRead = async (clubId, announcementId, uid) => {
  try {
    const readRef = doc(db, 'clubs', clubId, 'announcementReads', `${announcementId}_${uid}`);
    
    await setDoc(readRef, {
      announcementId,
      uid,
      readAt: new Date().toISOString()
    });
    
    // Increment read count on announcement
    const announcementRef = doc(db, 'clubs', clubId, 'announcements', announcementId);
    await updateDoc(announcementRef, {
      readCount: increment(1)
    });
    
    return true;
  } catch (error) {
    console.error('Error marking announcement as read:', error);
    throw error;
  }
};

// ============================================================================
// MEMBERS MODULE HELPERS
// ============================================================================

/**
 * Update member role (transaction-safe)
 * @param {string} clubId - Club ID
 * @param {string} memberId - Member user ID
 * @param {string} newRole - New role
 * @param {string} updatedBy - Who updated the role
 * @returns {Promise<boolean>} Success status
 */
export const updateMemberRole = async (clubId, memberId, newRole, updatedBy) => {
  try {
    const result = await runTransaction(db, async (transaction) => {
      const memberRef = doc(db, 'clubs', clubId, 'members', memberId);
      const memberDoc = await transaction.get(memberRef);
      
      if (!memberDoc.exists()) {
        throw new Error('Member not found');
      }
      
      const memberData = memberDoc.data();
      const oldRole = memberData.role;
      
      // Prevent changing owner role
      if (oldRole === 'owner' && newRole !== 'owner') {
        throw new Error('Cannot change owner role');
      }
      
      // Update member role
      transaction.update(memberRef, {
        role: newRole,
        roleUpdatedAt: new Date().toISOString(),
        roleUpdatedBy: updatedBy
      });
      
      return { oldRole, newRole, memberName: memberData.name };
    });
    
    // Create audit log
    await createAuditLog(clubId, {
      type: 'member_role_updated',
      performedBy: updatedBy,
      details: `Changed ${result.memberName}'s role from ${result.oldRole} to ${result.newRole}`,
      targetUserId: memberId,
      metadata: { oldRole: result.oldRole, newRole: result.newRole }
    });
    
    return true;
  } catch (error) {
    console.error('Error updating member role:', error);
    throw error;
  }
};

/**
 * Remove member from club
 * @param {string} clubId - Club ID
 * @param {string} memberId - Member user ID
 * @param {string} removedBy - Who removed the member
 * @returns {Promise<boolean>} Success status
 */
export const removeMember = async (clubId, memberId, removedBy) => {
  try {
    const memberRef = doc(db, 'clubs', clubId, 'members', memberId);
    const memberDoc = await getDoc(memberRef);
    
    if (!memberDoc.exists()) {
      throw new Error('Member not found');
    }
    
    const memberData = memberDoc.data();
    
    // Prevent removing owner
    if (memberData.role === 'owner') {
      throw new Error('Cannot remove club owner');
    }
    
    await deleteDoc(memberRef);
    
    // Create audit log
    await createAuditLog(clubId, {
      type: 'member_removed',
      performedBy: removedBy,
      details: `Removed ${memberData.name} from club`,
      targetUserId: memberId,
      metadata: { removedRole: memberData.role }
    });
    
    return true;
  } catch (error) {
    console.error('Error removing member:', error);
    throw error;
  }
};

// ============================================================================
// AUDIT LOG HELPERS
// ============================================================================

/**
 * Create audit log entry
 * @param {string} clubId - Club ID
 * @param {Object} logData - Log data
 * @returns {Promise<string>} Log ID
 */
export const createAuditLog = async (clubId, logData) => {
  try {
    const logRef = doc(collection(db, 'clubs', clubId, 'logs'));
    
    const log = {
      ...logData,
      timestamp: new Date().toISOString(),
      id: logRef.id
    };
    
    await setDoc(logRef, log);
    return logRef.id;
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw error for audit logs to avoid breaking main operations
    return null;
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if user has permission for action
 * @param {string} clubId - Club ID
 * @param {string} uid - User ID
 * @param {string} requiredRole - Required role level
 * @returns {Promise<boolean>} Has permission
 */
export const checkUserPermission = async (clubId, uid, requiredRole = 'member') => {
  try {
    const memberRef = doc(db, 'clubs', clubId, 'members', uid);
    const memberDoc = await getDoc(memberRef);
    
    if (!memberDoc.exists()) {
      return false;
    }
    
    const memberData = memberDoc.data();
    const roleHierarchy = {
      'member': 0,
      'moderator': 1,
      'admin': 2,
      'owner': 3
    };
    
    const userLevel = roleHierarchy[memberData.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;
    
    return userLevel >= requiredLevel && memberData.status === 'active';
  } catch (error) {
    console.error('Error checking user permission:', error);
    return false;
  }
};

/**
 * Get club statistics
 * @param {string} clubId - Club ID
 * @returns {Promise<Object>} Club statistics
 */
export const getClubStatistics = async (clubId) => {
  try {
    const [membersSnapshot, eventsSnapshot, announcementsSnapshot, sessionsSnapshot] = await Promise.all([
      getDocs(collection(db, 'clubs', clubId, 'members')),
      getDocs(collection(db, 'clubs', clubId, 'events')),
      getDocs(collection(db, 'clubs', clubId, 'announcements')),
      getDocs(collection(db, 'clubs', clubId, 'attendanceSessions'))
    ]);
    
    const now = new Date();
    const upcomingEvents = [];
    const recentAnnouncements = [];
    const openSessions = [];
    
    eventsSnapshot.forEach(doc => {
      const event = doc.data();
      if (new Date(event.startAt) > now) {
        upcomingEvents.push({ id: doc.id, ...event });
      }
    });
    
    announcementsSnapshot.forEach(doc => {
      const announcement = doc.data();
      const createdAt = new Date(announcement.createdAt);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      if (createdAt > weekAgo) {
        recentAnnouncements.push({ id: doc.id, ...announcement });
      }
    });
    
    sessionsSnapshot.forEach(doc => {
      const session = doc.data();
      if (session.status === 'open') {
        openSessions.push({ id: doc.id, ...session });
      }
    });
    
    return {
      totalMembers: membersSnapshot.size,
      totalEvents: eventsSnapshot.size,
      upcomingEvents: upcomingEvents.length,
      totalAnnouncements: announcementsSnapshot.size,
      recentAnnouncements: recentAnnouncements.length,
      totalSessions: sessionsSnapshot.size,
      openSessions: openSessions.length,
      upcomingEventsData: upcomingEvents.slice(0, 5),
      recentAnnouncementsData: recentAnnouncements.slice(0, 5),
      openSessionsData: openSessions.slice(0, 5)
    };
  } catch (error) {
    console.error('Error getting club statistics:', error);
    return {
      totalMembers: 0,
      totalEvents: 0,
      upcomingEvents: 0,
      totalAnnouncements: 0,
      recentAnnouncements: 0,
      totalSessions: 0,
      openSessions: 0,
      upcomingEventsData: [],
      recentAnnouncementsData: [],
      openSessionsData: []
    };
  }
};
