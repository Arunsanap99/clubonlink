import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { makeMeSuperadmin, makeMeAdmin, resetMyRole } from '../utils/roleManager';

const DebugWorkflow = () => {
  const { currentUser, userRole } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [publishRequests, setPublishRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to clubs collection
    const clubsQuery = query(collection(db, 'clubs'), orderBy('createdAt', 'desc'));
    const unsubscribeClubs = onSnapshot(clubsQuery, (snapshot) => {
      const clubsData = [];
      snapshot.forEach((doc) => {
        clubsData.push({ id: doc.id, ...doc.data() });
      });
      setClubs(clubsData);
    });

    // Listen to publish requests
    const requestsQuery = query(collection(db, 'publishRequests'), orderBy('requestedAt', 'desc'));
    const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
      const requestsData = [];
      snapshot.forEach((doc) => {
        requestsData.push({ id: doc.id, ...doc.data() });
      });
      setPublishRequests(requestsData);
      setLoading(false);
    });

    return () => {
      unsubscribeClubs();
      unsubscribeRequests();
    };
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'review': return 'bg-blue-100 text-blue-800';
      case 'published': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Workflow Debug Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Current User: {currentUser?.email} | Role: {userRole || 'user'}
          </p>
        </div>

        {/* Workflow Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Total Clubs
            </h3>
            <p className="text-3xl font-bold text-indigo-600">{clubs.length}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Publish Requests
            </h3>
            <p className="text-3xl font-bold text-blue-600">{publishRequests.length}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Published Clubs
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {clubs.filter(club => club.status === 'published').length}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Clubs List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                All Clubs ({clubs.length})
              </h2>
            </div>
            <div className="p-6">
              {clubs.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No clubs created yet
                </p>
              ) : (
                <div className="space-y-4">
                  {clubs.map((club) => (
                    <div key={club.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {club.clubName || 'Unnamed Club'}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Type: {club.clubType} | Template: {club.template}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Created: {new Date(club.createdAt).toLocaleDateString()}
                          </p>
                          {club.route && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                              Route: {club.route}
                            </p>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(club.status)}`}>
                          {club.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Publish Requests List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Publish Requests ({publishRequests.length})
              </h2>
            </div>
            <div className="p-6">
              {publishRequests.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No publish requests yet
                </p>
              ) : (
                <div className="space-y-4">
                  {publishRequests.map((request) => (
                    <div key={request.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {request.clubName || 'Unnamed Club'}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Admin: {request.adminName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Requested: {new Date(request.requestedAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Club ID: {request.clubId}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Workflow Steps */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Expected Workflow
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
              <span className="text-gray-700 dark:text-gray-300">
                <strong>Create Club:</strong> Admin creates club via /create-club (status: 'pending')
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <span className="text-gray-700 dark:text-gray-300">
                <strong>Customize Club:</strong> Admin customizes club via /customize-club/:clubId
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <span className="text-gray-700 dark:text-gray-300">
                <strong>Request Publish:</strong> Admin clicks "Request Publish" (status: 'review', creates publishRequest)
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
              <span className="text-gray-700 dark:text-gray-300">
                <strong>Superadmin Review:</strong> Superadmin sees request in /superadmin/review
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">5</div>
              <span className="text-gray-700 dark:text-gray-300">
                <strong>Approve/Reject:</strong> Superadmin approves (status: 'published', generates route) or rejects
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">6</div>
              <span className="text-gray-700 dark:text-gray-300">
                <strong>Live Club:</strong> Club accessible at /clubs/:clubSlug
              </span>
            </div>
          </div>
        </div>

        {/* Role Management */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
            Role Management (Development Only)
          </h3>
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={() => makeMeAdmin(currentUser)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              Make Me Admin
            </button>
            <button
              onClick={() => makeMeSuperadmin(currentUser)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              Make Me Superadmin
            </button>
            <button
              onClick={() => resetMyRole(currentUser)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              Reset to User
            </button>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Note:</strong> After changing roles, refresh the page to see the changes take effect.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Complete Workflow Testing Guide
          </h3>
          <div className="space-y-3 text-sm text-yellow-700 dark:text-yellow-300">
            <div className="border-l-4 border-yellow-400 pl-4">
              <p><strong>Step 1: Get Admin Role</strong></p>
              <p>• Click "Make Me Admin" button above</p>
              <p>• Refresh the page (F5)</p>
              <p>• Verify your role shows as "admin" in status section</p>
            </div>
            
            <div className="border-l-4 border-yellow-400 pl-4">
              <p><strong>Step 2: Create Club</strong></p>
              <p>• Go to <a href="/create-club" className="underline">/create-club</a></p>
              <p>• Complete all 4 steps of the wizard</p>
              <p>• You should be redirected to customization page</p>
            </div>
            
            <div className="border-l-4 border-yellow-400 pl-4">
              <p><strong>Step 3: Customize & Request Publish</strong></p>
              <p>• Customize your club (add name, description, etc.)</p>
              <p>• Click "Request Publish" button</p>
              <p>• Check this page - should show 1 publish request</p>
            </div>
            
            <div className="border-l-4 border-yellow-400 pl-4">
              <p><strong>Step 4: Get Superadmin Role</strong></p>
              <p>• Click "Make Me Superadmin" button above</p>
              <p>• Refresh the page (F5)</p>
              <p>• Verify your role shows as "superadmin"</p>
            </div>
            
            <div className="border-l-4 border-yellow-400 pl-4">
              <p><strong>Step 5: Approve Club</strong></p>
              <p>• Go to <a href="/superadmin/review" className="underline">/superadmin/review</a></p>
              <p>• You should see your pending request</p>
              <p>• Click "Approve" and confirm</p>
              <p>• Check browser console for any errors</p>
            </div>
            
            <div className="border-l-4 border-yellow-400 pl-4">
              <p><strong>Step 6: Verify Published Club</strong></p>
              <p>• Return to this debug page</p>
              <p>• Published clubs should show 1</p>
              <p>• Club should have a route like "/clubs/my-club-abc123"</p>
              <p>• Visit that route to see your live club</p>
            </div>
            
            <div className="border-l-4 border-yellow-400 pl-4">
              <p><strong>Step 7: Test Club Features</strong></p>
              <p>• Navigate through club sections: Members, Events, Announcements</p>
              <p>• Test admin panel functionality</p>
              <p>• Verify all Step 5-7 features are working</p>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="mt-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-4">
            Troubleshooting Common Issues
          </h3>
          <div className="space-y-3 text-sm text-red-700 dark:text-red-300">
            <div>
              <strong>Issue:</strong> Superadmin doesn't see publish requests
              <br />
              <strong>Solution:</strong> 
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>Make sure you clicked "Make Me Superadmin" and refreshed the page</li>
                <li>Check that publish requests exist in the database (see table above)</li>
                <li>Verify Firestore security rules allow read access to publishRequests collection</li>
              </ul>
            </div>
            
            <div>
              <strong>Issue:</strong> Club creation doesn't work
              <br />
              <strong>Solution:</strong>
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>Make sure you have admin role before accessing /create-club</li>
                <li>Check browser console for Firebase errors</li>
                <li>Verify Firestore security rules allow write access to clubs collection</li>
              </ul>
            </div>
            
            <div>
              <strong>Issue:</strong> Publish request not created
              <br />
              <strong>Solution:</strong>
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>Complete club customization before clicking "Request Publish"</li>
                <li>Check that club status changes from 'pending' to 'review'</li>
                <li>Verify publishRequests collection has write permissions</li>
              </ul>
            </div>
            
            <div>
              <strong>Current Status Check:</strong>
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>Your Role: <strong>{userRole || 'user'}</strong></li>
                <li>Clubs in Database: <strong>{clubs.length}</strong></li>
                <li>Publish Requests: <strong>{publishRequests.length}</strong></li>
                <li>Published Clubs: <strong>{clubs.filter(club => club.status === 'published').length}</strong></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugWorkflow;
