import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useClubPortal } from '../../contexts/ClubPortalContext';
import { getClubStatistics } from '../../utils/firestoreHelpers';
import { 
  ChartBarIcon,
  UserGroupIcon,
  CalendarIcon,
  SpeakerWaveIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { logEvent } from 'firebase/analytics';
import { analytics } from '../../config/firebase';

const AnalyticsDashboard = () => {
  const { club, clubMembers, isAdmin } = useClubPortal();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d'); // 7d, 30d, 90d, 1y
  const [analyticsData, setAnalyticsData] = useState({
    memberGrowth: [],
    eventAttendance: [],
    announcementEngagement: [],
    activityTrends: []
  });

  // Load club statistics
  useEffect(() => {
    const loadStats = async () => {
      if (!club?.id) return;

      try {
        const clubStats = await getClubStatistics(club.id);
        setStats(clubStats);
        
        // Generate mock analytics data (in production, this would come from aggregated Firestore data)
        generateAnalyticsData(timeRange);
        
        // Log analytics event
        if (analytics) {
          logEvent(analytics, 'view_analytics_dashboard', {
            club_id: club.id,
            time_range: timeRange
          });
        }
      } catch (error) {
        console.error('Error loading statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [club?.id, timeRange]);

  // Generate analytics data based on time range
  const generateAnalyticsData = (range) => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
    const memberGrowth = [];
    const eventAttendance = [];
    const announcementEngagement = [];
    const activityTrends = [];

    // Generate sample data for the specified range
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      memberGrowth.push({
        date: dateStr,
        members: Math.max(0, (clubMembers?.length || 0) - Math.floor(Math.random() * 10)),
        newMembers: Math.floor(Math.random() * 3)
      });

      eventAttendance.push({
        date: dateStr,
        events: Math.floor(Math.random() * 5),
        attendance: Math.floor(Math.random() * 50) + 10,
        rsvps: Math.floor(Math.random() * 80) + 20
      });

      announcementEngagement.push({
        date: dateStr,
        announcements: Math.floor(Math.random() * 3),
        views: Math.floor(Math.random() * 100) + 20,
        reads: Math.floor(Math.random() * 80) + 15
      });

      activityTrends.push({
        date: dateStr,
        logins: Math.floor(Math.random() * 30) + 5,
        interactions: Math.floor(Math.random() * 50) + 10,
        engagement: Math.floor(Math.random() * 40) + 20
      });
    }

    setAnalyticsData({
      memberGrowth,
      eventAttendance,
      announcementEngagement,
      activityTrends
    });
  };

  // KPI Card Component
  const KPICard = ({ title, value, change, icon: Icon, color = 'indigo' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {change !== undefined && (
            <div className={`flex items-center mt-1 text-sm ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change >= 0 ? (
                <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
              )}
              {Math.abs(change)}% from last period
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900/20`}>
          <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
      </div>
    </motion.div>
  );

  // Chart colors
  const chartColors = {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444'
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center">
        <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Access Restricted
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Only club admins can access analytics.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="h-80 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Track your club's performance and engagement
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Total Members"
          value={stats?.totalMembers || 0}
          change={12}
          icon={UserGroupIcon}
          color="blue"
        />
        <KPICard
          title="Active Events"
          value={stats?.upcomingEvents || 0}
          change={-5}
          icon={CalendarIcon}
          color="green"
        />
        <KPICard
          title="Announcements"
          value={stats?.recentAnnouncements || 0}
          change={8}
          icon={SpeakerWaveIcon}
          color="purple"
        />
        <KPICard
          title="Attendance Rate"
          value="87%"
          change={3}
          icon={ArrowTrendingUpIcon}
          color="indigo"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Member Growth Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Member Growth
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analyticsData.memberGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="members" 
                stackId="1"
                stroke={chartColors.primary} 
                fill={chartColors.primary}
                fillOpacity={0.6}
                name="Total Members"
              />
              <Area 
                type="monotone" 
                dataKey="newMembers" 
                stackId="2"
                stroke={chartColors.success} 
                fill={chartColors.success}
                fillOpacity={0.6}
                name="New Members"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Event Attendance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Event Attendance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.eventAttendance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <Legend />
              <Bar dataKey="rsvps" fill={chartColors.secondary} name="RSVPs" />
              <Bar dataKey="attendance" fill={chartColors.primary} name="Actual Attendance" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Announcement Engagement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Announcement Engagement
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.announcementEngagement}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="views" 
                stroke={chartColors.warning} 
                strokeWidth={2}
                name="Views"
              />
              <Line 
                type="monotone" 
                dataKey="reads" 
                stroke={chartColors.success} 
                strokeWidth={2}
                name="Reads"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Activity Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Activity Trends
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analyticsData.activityTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="logins" 
                stackId="1"
                stroke={chartColors.primary} 
                fill={chartColors.primary}
                fillOpacity={0.6}
                name="Logins"
              />
              <Area 
                type="monotone" 
                dataKey="interactions" 
                stackId="1"
                stroke={chartColors.secondary} 
                fill={chartColors.secondary}
                fillOpacity={0.6}
                name="Interactions"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <EyeIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Page Views
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                2,847
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <ClockIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Avg. Session
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                12m 34s
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <ArrowTrendingUpIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Engagement Rate
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                73.2%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

/**
 * Cloud Function for aggregating analytics data:
 * 
 * exports.aggregateDailyStats = functions.pubsub
 *   .schedule('0 1 * * *') // Run daily at 1 AM
 *   .onRun(async (context) => {
 *     const yesterday = new Date();
 *     yesterday.setDate(yesterday.getDate() - 1);
 *     const dateStr = yesterday.toISOString().split('T')[0];
 *     
 *     const clubsSnapshot = await admin.firestore()
 *       .collection('clubs')
 *       .where('status', '==', 'published')
 *       .get();
 *     
 *     const batch = admin.firestore().batch();
 *     
 *     for (const clubDoc of clubsSnapshot.docs) {
 *       const clubId = clubDoc.id;
 *       
 *       // Aggregate member stats
 *       const membersSnapshot = await admin.firestore()
 *         .collection(`clubs/${clubId}/members`)
 *         .get();
 *       
 *       // Aggregate event stats
 *       const eventsSnapshot = await admin.firestore()
 *         .collection(`clubs/${clubId}/events`)
 *         .where('startAt', '>=', yesterday.toISOString())
 *         .where('startAt', '<', new Date().toISOString())
 *         .get();
 *       
 *       // Create daily stats document
 *       const statsRef = admin.firestore()
 *         .doc(`analytics/${clubId}/dailyStats/${dateStr}`);
 *       
 *       batch.set(statsRef, {
 *         date: dateStr,
 *         memberCount: membersSnapshot.size,
 *         eventCount: eventsSnapshot.size,
 *         // Add more aggregated metrics
 *         createdAt: admin.firestore.FieldValue.serverTimestamp()
 *       });
 *     }
 *     
 *     await batch.commit();
 *     console.log('Daily stats aggregated successfully');
 *   });
 */
