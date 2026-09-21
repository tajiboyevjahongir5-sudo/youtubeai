import { createBrowserRouter, Navigate } from 'react-router';
import AppLayout from './layouts/app-layout';

import LandingPage from './pages/landing';
import AuthPage from './pages/auth-page';
import ProtectedRoute from './components/protected-route';

import DashboardPage from './pages/dashboard';
import OnboardingPage from './pages/onboarding';
import ContentListPage from './pages/content-list';
import NewContentPage from './pages/content-new';
import ContentDetailPage from './pages/content-detail';
import CalendarPage from './pages/calendar';
import AnalyticsPage from './pages/analytics';
import StrategyPage from './pages/strategy';
import IntegrationsPage from './pages/integrations';
import SettingsPage from './pages/settings';
import ActivityPage from './pages/activity';
import AdminPage from './pages/admin';
import TrendSpyPage from './pages/trend-spy';
import AiDirectorPage from './pages/ai-director';

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/auth', element: <AuthPage /> },
  { path: '/onboarding', element: <OnboardingPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/content', element: <ContentListPage /> },
          { path: '/trends', element: <TrendSpyPage /> },
          { path: '/content/new', element: <NewContentPage /> },
          { path: '/content/:id', element: <ContentDetailPage /> },
          { path: '/calendar', element: <CalendarPage /> },
          { path: '/analytics', element: <AnalyticsPage /> },
          { path: '/strategy', element: <StrategyPage /> },
          { path: '/integrations', element: <IntegrationsPage /> },
          { path: '/settings', element: <SettingsPage /> },
          { path: '/activity', element: <ActivityPage /> },
          { path: '/ai-director', element: <AiDirectorPage /> },
          { path: '/admin', element: <AdminPage /> },
          { path: '*', element: <Navigate to="/dashboard" replace /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
