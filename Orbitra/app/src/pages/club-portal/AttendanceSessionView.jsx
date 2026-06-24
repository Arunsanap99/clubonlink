import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useClubPortal } from '../../contexts/ClubPortalContext';
import { useRealtimeCollection } from '../../hooks/useRealtimeCollection';
import { markAttendance, bulkMarkAttendance } from '../../utils/firestoreHelpers';
import { exportAttendanceCSV, downloadCSV } from '../../utils/csvHelpers';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { 
  ArrowLeftIcon,
  UserGroupIcon,
  CheckIcon,
  XMarkIcon,
  QrCodeIcon,
  DocumentArrowDownIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  MapPinIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AttendanceSessionView = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { club, clubSlug, clubMembers, isAdmin, currentUser } = useClubPortal();
  
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMembers, setSelectedMembers] = useState(new Set());
  const [showQRModal, setShowQRModal] = useState(false);

  // Fetch attendance records
  const { 
    data: attendanceRecords, 
    loading: recordsLoading 
  } = useRealtimeCollection(`clubs/${club?.id}/attendanceSessions/${sessionId}/records`, {
    enabled: !!club?.id && !!sessionId
  });

  // Load session data
  useEffect(() => {
    const loadSession = async () => {
      if (!club?.id || !sessionId) return;
      
      try {
        const sessionDoc = await getDoc(doc(db, 'clubs', club.id, 'attendanceSessions', sessionId));
        if (sessionDoc.exists()) {
          setSession({ id: sessionDoc.id, ...sessionDoc.data() });
        } else {
          toast.error('Attendance session not found');
          navigate(`/clubs/${clubSlug}/attendance`);
        }
      } catch (error) {
        console.error('Error loading session:', error);
        toast.error('Failed to load session');
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [club?.id, sessionId, navigate, clubSlug]);

  // Filter members based on search
  const filteredMembers = clubMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get attendance status for a member
  const getAttendanceStatus = (memberId) => {
    const record = attendanceRecords.find(r => r.uid === memberId);
    return record ? (record.present ? 'present' : 'absent') : 'unmarked';
  };

  // Mark individual attendance
  const handleMarkAttendance = async (memberId, present) => {
    if (!isAdmin) {
      toast.error('Only admins can mark attendance');
      return;
    }

    const member = clubMembers.find(m => m.userId === memberId);
    if (!member) return;

    setProcessing(true);
    try {
      await markAttendance(
        club.id, 
        sessionId, 
        memberId, 
        present, 
        currentUser.uid,
        {
          name: member.name,
          email: member.email
        }
      );
      
      toast.success(`Marked ${member.name} as ${present ? 'present' : 'absent'}`);
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error('Failed to mark attendance');
    } finally {
      setProcessing(false);
    }
  };

  // Bulk mark attendance
  const handleBulkMark = async (present) => {
    if (!isAdmin || selectedMembers.size === 0) return;

    setProcessing(true);
    try {
      const records = Array.from(selectedMembers).map(memberId => {
        const member = clubMembers.find(m => m.userId === memberId);
        return {
          uid: memberId,
          present,
          userInfo: {
            name: member?.name || 'Unknown',
            email: member?.email || ''
          }
        };
      });

      const result = await bulkMarkAttendance(club.id, sessionId, records, currentUser.uid);
      
      if (result.success > 0) {
        toast.success(`Marked ${result.success} members as ${present ? 'present' : 'absent'}`);
      }
      
      if (result.failed > 0) {
        toast.error(`Failed to mark ${result.failed} members`);
      }
      
      setSelectedMembers(new Set());
    } catch (error) {
      console.error('Error bulk marking attendance:', error);
      toast.error('Failed to bulk mark attendance');
    } finally {
      setProcessing(false);
    }
  };

  // Toggle session status
  const toggleSessionStatus = async () => {
    if (!isAdmin || !session) return;

    const newStatus = session.status === 'open' ? 'closed' : 'open';
    
    try {
      await updateDoc(doc(db, 'clubs', club.id, 'attendanceSessions', sessionId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      
      setSession(prev => ({ ...prev, status: newStatus }));
      toast.success(`Session ${newStatus === 'open' ? 'opened' : 'closed'}`);
    } catch (error) {
      console.error('Error updating session status:', error);
      toast.error('Failed to update session status');
    }
  };

  // Export attendance
  const handleExport = () => {
    if (!session || attendanceRecords.length === 0) {
      toast.error('No attendance data to export');
      return;
    }

    const { csvContent, filename } = exportAttendanceCSV(session, attendanceRecords);
    downloadCSV(filename, csvContent);
    toast.success('Attendance exported successfully');
  };

  // Generate QR code URL (placeholder - would integrate with QR library)
  const generateQRCodeURL = () => {
    const checkInURL = `${window.location.origin}/clubs/${clubSlug}/attendance/${sessionId}/checkin`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(checkInURL)}`;
  };

  // Toggle member selection
  const toggleMemberSelection = (memberId) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMembers(newSelected);
  };

  // Select all filtered members
  const selectAllFiltered = () => {
    const allFilteredIds = new Set(filteredMembers.map(m => m.userId));
    setSelectedMembers(allFilteredIds);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedMembers(new Set());
  };

  if (loading || recordsLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">Session not found</div>
        <button 
          onClick={() => navigate(`/clubs/${clubSlug}/attendance`)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Back to Sessions
        </button>
      </div>
    );
  }

  const presentCount = attendanceRecords.filter(r => r.present).length;
  const absentCount = attendanceRecords.filter(r => !r.present).length;
  const unmarkedCount = clubMembers.length - attendanceRecords.length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/clubs/${clubSlug}/attendance`)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {session.title}
            </h1>
            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-1" />
                {new Date(session.scheduledAt).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
              {session.location && (
                <div className="flex items-center">
                  <MapPinIcon className="w-4 h-4 mr-1" />
                  {session.location}
                </div>
              )}
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                session.status === 'open' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
              }`}>
                {session.status}
              </span>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowQRModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <QrCodeIcon className="w-4 h-4" />
              <span>QR Code</span>
            </button>
            
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
              <span>Export</span>
            </button>
            
            <button
              onClick={toggleSessionStatus}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                session.status === 'open'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {session.status === 'open' ? 'Close Session' : 'Open Session'}
            </button>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <div className="flex items-center">
            <UserGroupIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Members</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{clubMembers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <div className="flex items-center">
            <CheckIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Present</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{presentCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <div className="flex items-center">
            <XMarkIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Absent</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{absentCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <div className="flex items-center">
            <ClockIcon className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Unmarked</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{unmarkedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Bulk Actions */}
          {isAdmin && selectedMembers.size > 0 && (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {selectedMembers.size} selected
              </span>
              <button
                onClick={() => handleBulkMark(true)}
                disabled={processing}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded text-sm transition-colors"
              >
                Mark Present
              </button>
              <button
                onClick={() => handleBulkMark(false)}
                disabled={processing}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded text-sm transition-colors"
              >
                Mark Absent
              </button>
              <button
                onClick={clearSelection}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
              >
                Clear
              </button>
            </div>
          )}

          {/* Select All */}
          {isAdmin && filteredMembers.length > 0 && (
            <button
              onClick={selectAllFiltered}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm transition-colors"
            >
              Select All
            </button>
          )}
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {isAdmin && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedMembers.size === filteredMembers.length && filteredMembers.length > 0}
                      onChange={selectedMembers.size === filteredMembers.length ? clearSelection : selectAllFiltered}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Marked By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Time
                </th>
                {isAdmin && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredMembers.map((member) => {
                const status = getAttendanceStatus(member.userId);
                const record = attendanceRecords.find(r => r.uid === member.userId);
                
                return (
                  <tr key={member.userId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedMembers.has(member.userId)}
                          onChange={() => toggleMemberSelection(member.userId)}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {member.name?.charAt(0) || 'U'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {member.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {member.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        status === 'present' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                          : status === 'absent'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                      }`}>
                        {status === 'present' ? 'Present' : status === 'absent' ? 'Absent' : 'Unmarked'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {record?.markedBy === currentUser.uid ? 'You' : record?.markedBy || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {record?.timestamp ? new Date(record.timestamp).toLocaleTimeString() : '-'}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleMarkAttendance(member.userId, true)}
                            disabled={processing}
                            className={`px-2 py-1 rounded text-xs transition-colors ${
                              status === 'present'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => handleMarkAttendance(member.userId, false)}
                            disabled={processing}
                            className={`px-2 py-1 rounded text-xs transition-colors ${
                              status === 'absent'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQRModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowQRModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-sm w-full text-center"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                QR Code Check-in
              </h3>
              
              <div className="mb-4">
                <img
                  src={generateQRCodeURL()}
                  alt="QR Code for check-in"
                  className="mx-auto rounded-lg"
                />
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Members can scan this QR code to check themselves in
              </p>
              
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                {`${window.location.origin}/clubs/${clubSlug}/attendance/${sessionId}/checkin`}
              </div>
              
              <button
                onClick={() => setShowQRModal(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AttendanceSessionView;
