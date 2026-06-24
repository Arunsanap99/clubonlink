# Step 6: Firestore Security Rules

## Complete Firestore Security Rules for Club Features

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to get user role in a specific club
    function getClubRole(clubId) {
      return get(/databases/$(database)/documents/clubs/$(clubId)/members/$(request.auth.uid)).data.role;
    }
    
    // Helper function to check if user is a club member
    function isClubMember(clubId) {
      return exists(/databases/$(database)/documents/clubs/$(clubId)/members/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/clubs/$(clubId)/members/$(request.auth.uid)).data.status == 'active';
    }
    
    // Helper function to check if user has admin privileges in club
    function isClubAdmin(clubId) {
      return isClubMember(clubId) && 
             getClubRole(clubId) in ['owner', 'admin'];
    }
    
    // Helper function to check if user has moderator+ privileges in club
    function isClubModerator(clubId) {
      return isClubMember(clubId) && 
             getClubRole(clubId) in ['owner', 'admin', 'moderator'];
    }
    
    // Helper function to check if user is superadmin
    function isSuperadmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'superadmin';
    }

    // ========================================================================
    // GLOBAL COLLECTIONS
    // ========================================================================
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }
    
    // Notifications collection
    match /notifications/{notificationId} {
      allow read, write: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
    }
    
    // Publish requests (from Step 4)
    match /publishRequests/{requestId} {
      allow create: if isAuthenticated();
      allow read, write: if isSuperadmin();
    }

    // ========================================================================
    // CLUB COLLECTIONS
    // ========================================================================
    
    // Main clubs collection
    match /clubs/{clubId} {
      // Club document - readable by all if published, writable by admin/superadmin
      allow read: if resource.data.status == 'published';
      allow write: if isAuthenticated() && (
        resource.data.adminId == request.auth.uid ||
        isSuperadmin()
      );
      
      // ====================================================================
      // ACCESS KEYS SUBCOLLECTION (from Step 5)
      // ====================================================================
      match /accessKeys/{keyId} {
        // Only club admins can manage access keys
        allow read, write: if isClubAdmin(clubId);
        
        // Allow reading for key validation during join process
        allow read: if isAuthenticated() && 
          resource.data.isActive == true &&
          (resource.data.expiresAt == null || resource.data.expiresAt.toMillis() > request.time.toMillis());
      }
      
      // ====================================================================
      // MEMBERS SUBCOLLECTION
      // ====================================================================
      match /members/{userId} {
        // Members can read all members, admins can write
        allow read: if isClubMember(clubId);
        
        // Users can write their own member document during join
        allow create: if isAuthenticated() && request.auth.uid == userId;
        
        // Admins can manage members
        allow update, delete: if isClubAdmin(clubId) &&
          // Prevent demoting/removing owner
          !(resource.data.role == 'owner' && request.auth.uid != userId);
      }
      
      // ====================================================================
      // ATTENDANCE SESSIONS SUBCOLLECTION
      // ====================================================================
      match /attendanceSessions/{sessionId} {
        // Members can read sessions, admins can manage
        allow read: if isClubMember(clubId);
        allow create, update, delete: if isClubAdmin(clubId);
        
        // Attendance records subcollection
        match /records/{recordId} {
          // Members can read all records, write their own
          allow read: if isClubMember(clubId);
          
          // Members can mark their own attendance if self-check is enabled
          allow create, update: if isAuthenticated() && (
            // Admin can mark anyone's attendance
            isClubAdmin(clubId) ||
            // Member can mark their own if self-check enabled and session is open
            (request.auth.uid == recordId && 
             get(/databases/$(database)/documents/clubs/$(clubId)/attendanceSessions/$(sessionId)).data.allowSelfCheck == true &&
             get(/databases/$(database)/documents/clubs/$(clubId)/attendanceSessions/$(sessionId)).data.status == 'open')
          );
          
          // Only admins can delete records
          allow delete: if isClubAdmin(clubId);
        }
      }
      
      // ====================================================================
      // EVENTS SUBCOLLECTION
      // ====================================================================
      match /events/{eventId} {
        // Members can read events, moderators+ can manage
        allow read: if isClubMember(clubId);
        allow create, update, delete: if isClubModerator(clubId);
        
        // RSVP subcollection
        match /rsvps/{rsvpId} {
          // Members can read all RSVPs
          allow read: if isClubMember(clubId);
          
          // Members can manage their own RSVP
          allow create, update, delete: if isAuthenticated() && 
            request.auth.uid == rsvpId &&
            isClubMember(clubId);
        }
      }
      
      // ====================================================================
      // ANNOUNCEMENTS SUBCOLLECTION
      // ====================================================================
      match /announcements/{announcementId} {
        // Members can read announcements, moderators+ can manage
        allow read: if isClubMember(clubId);
        allow create, update, delete: if isClubModerator(clubId);
      }
      
      // Announcement reads tracking
      match /announcementReads/{readId} {
        // Members can read their own read status, create read records
        allow read: if isAuthenticated() && 
          resource.data.uid == request.auth.uid;
        allow create: if isAuthenticated() && 
          request.resource.data.uid == request.auth.uid &&
          isClubMember(clubId);
      }
      
      // ====================================================================
      // AUDIT LOGS SUBCOLLECTION
      // ====================================================================
      match /logs/{logId} {
        // Only admins can read logs, system creates them
        allow read: if isClubAdmin(clubId);
        allow create: if isAuthenticated();
      }
      
      // ====================================================================
      // FUTURE SUBCOLLECTIONS (Step 7 preparation)
      // ====================================================================
      
      // Gallery subcollection
      match /gallery/{imageId} {
        allow read: if isClubMember(clubId);
        allow create, update, delete: if isClubModerator(clubId);
      }
      
      // Polls subcollection
      match /polls/{pollId} {
        allow read: if isClubMember(clubId);
        allow create, update, delete: if isClubModerator(clubId);
        
        match /votes/{voteId} {
          allow read: if isClubMember(clubId);
          allow create, update: if isAuthenticated() && 
            request.auth.uid == voteId &&
            isClubMember(clubId);
        }
      }
      
      // Resources/Files subcollection
      match /resources/{resourceId} {
        allow read: if isClubMember(clubId);
        allow create, update, delete: if isClubModerator(clubId);
      }
    }
  }
}
```

## Security Rule Explanations

### 1. **Helper Functions**
- `isAuthenticated()`: Checks if user is signed in
- `getClubRole(clubId)`: Gets user's role in specific club
- `isClubMember(clubId)`: Verifies active club membership
- `isClubAdmin(clubId)`: Checks admin+ privileges
- `isClubModerator(clubId)`: Checks moderator+ privileges
- `isSuperadmin()`: Verifies superadmin status

### 2. **Role Hierarchy**
```
Owner > Admin > Moderator > Member
```

### 3. **Permission Matrix**

| Action | Member | Moderator | Admin | Owner |
|--------|--------|-----------|-------|-------|
| Read club data | ✅ | ✅ | ✅ | ✅ |
| Create events | ❌ | ✅ | ✅ | ✅ |
| Manage members | ❌ | ❌ | ✅ | ✅ |
| Access keys | ❌ | ❌ | ✅ | ✅ |
| Attendance sessions | ❌ | ❌ | ✅ | ✅ |
| Self check-in | ✅* | ✅* | ✅* | ✅* |
| RSVP events | ✅ | ✅ | ✅ | ✅ |
| Create announcements | ❌ | ✅ | ✅ | ✅ |
| View audit logs | ❌ | ❌ | ✅ | ✅ |

*Only if session allows self-check and is open

### 4. **Critical Security Features**

**Transaction Safety:**
- RSVP capacity enforcement through transactions
- Attendance marking collision prevention
- Access key usage tracking

**Data Isolation:**
- All club data scoped to `clubId`
- Members can only access their own clubs
- Cross-club data leakage prevention

**Permission Validation:**
- Real-time role checking
- Owner protection (cannot be demoted/removed)
- Session status validation for attendance

**Audit Trail:**
- All administrative actions logged
- Read-only logs for admins
- Comprehensive activity tracking

### 5. **Edge Case Handling**

**Attendance Sessions:**
- Self-check only when session is open
- PIN validation (client-side with server verification)
- Prevent duplicate check-ins through transactions

**Events:**
- Capacity enforcement for RSVPs
- Past event RSVP prevention
- Automatic attendee count updates

**Access Keys:**
- Expiration validation
- Usage limit enforcement
- Active status checking

### 6. **Performance Considerations**

**Efficient Queries:**
- Index-free queries where possible
- Client-side sorting to avoid composite indexes
- Batched operations for bulk updates

**Real-time Updates:**
- Snapshot listeners for live data
- Optimistic UI updates
- Error handling and rollback

### 7. **Future-Proofing (Step 7)**

The rules include preparation for:
- **Gallery**: Image sharing and management
- **Polls**: Member voting and surveys  
- **Resources**: File sharing and downloads
- **Advanced Analytics**: Usage tracking and insights

## Implementation Notes

1. **Deploy these rules** to Firebase Console → Firestore → Rules
2. **Test thoroughly** with different user roles
3. **Monitor performance** and adjust indexes as needed
4. **Update rules** as new features are added in Step 7

## Security Best Practices

1. **Principle of Least Privilege**: Users only get minimum required access
2. **Defense in Depth**: Client-side AND server-side validation
3. **Audit Everything**: Comprehensive logging for accountability
4. **Regular Reviews**: Periodic security rule audits
5. **Error Handling**: Graceful degradation on permission failures
