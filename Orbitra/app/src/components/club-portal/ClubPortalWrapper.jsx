import React from 'react';
import { useParams, Routes, Route } from 'react-router-dom';
import { ClubPortalProvider } from '../../contexts/ClubPortalContext';
import ClubPortalLayout from './ClubPortalLayout';
import ClubDashboard from '../../pages/club-portal/ClubDashboard';

// Import actual components
import AttendanceSessions from '../../pages/club-portal/AttendanceSessions';
import AttendanceSessionView from '../../pages/club-portal/AttendanceSessionView';
import EventsList from '../../pages/club-portal/EventsList';
import GalleryGrid from '../../pages/club-portal/GalleryGrid';
import LeaderboardView from '../../pages/club-portal/LeaderboardView';
import BillingPage from '../../pages/club-portal/BillingPage';
import AnalyticsDashboard from '../../pages/club-portal/AnalyticsDashboard';

// Import real Step 5-7 components
import ClubMembers from '../../pages/club-portal/ClubMembers';
import ClubAnnouncements from '../../pages/club-portal/ClubAnnouncements';
import ClubAdmin from '../../pages/club-portal/ClubAdmin';

const ClubPortalWrapper = () => {
  const { clubSlug } = useParams();

  return (
    <ClubPortalProvider clubSlug={clubSlug}>
      <ClubPortalLayout>
        <Routes>
          <Route index element={<ClubDashboard />} />
          <Route path="members" element={<ClubMembers />} />
          <Route path="events" element={<EventsList />} />
          <Route path="announcements" element={<ClubAnnouncements />} />
          <Route path="attendance" element={<AttendanceSessions />} />
          <Route path="attendance/:sessionId" element={<AttendanceSessionView />} />
          <Route path="gallery" element={<GalleryGrid />} />
          <Route path="leaderboard" element={<LeaderboardView />} />
          <Route path="billing" element={<BillingPage />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="admin" element={<ClubAdmin />} />
        </Routes>
      </ClubPortalLayout>
    </ClubPortalProvider>
  );
};

export default ClubPortalWrapper;
