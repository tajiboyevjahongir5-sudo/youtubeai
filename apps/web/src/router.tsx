import { createBrowserRouter, Navigate } from 'react-router';
import AppLayout from './layouts/app-layout';

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

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/onboarding',
    element: <OnboardingPage />,
  },
  {
    element: <AppLayout />,
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/content', element: <ContentListPage /> },
      { path: '/content/new', element: <NewContentPage /> },
      { path: '/content/:id', element: <ContentDetailPage /> },
      { path: '/calendar', element: <CalendarPage /> },
      { path: '/analytics', element: <AnalyticsPage /> },
      { path: '/strategy', element: <StrategyPage /> },
      { path: '/integrations', element: <IntegrationsPage /> },
      { path: '/settings', element: <SettingsPage /> },
      { path: '/activity', element: <ActivityPage /> },
    ],
  },
]);
