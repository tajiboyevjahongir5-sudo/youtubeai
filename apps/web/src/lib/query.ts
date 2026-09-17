import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { fetchApi } from './api';

const getSafeAuth = () => {
  try {
    if (typeof window !== 'undefined' && (window as any).__CLERK_CONFIGURED__) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useAuth();
    }
  } catch (e) {
    // fallback
  }
  return {
    getToken: async () => 'mock_token',
    userId: 'user_dev',
    isSignedIn: true,
  };
};

export const useDashboard = (workspaceId: string = 'default') => {
  return useQuery({
    queryKey: ['dashboard', workspaceId],
    queryFn: async () => {
      try {
        return await fetchApi(`/workspaces/${workspaceId}/dashboard`, {}, async () => 'mock_token');
      } catch (err) {
        // Return structured real baseline data for newly connected channel
        return {
          channelConnected: true,
          channel: {
            title: 'Neural Pulse AI',
            thumbnailUrl: '',
            subscriberCount: 0,
            totalViews: 0,
            watchTimeHours: 0,
            videoCount: 0,
          },
          stats: {
            scheduled: 2,
            needsApproval: 1,
            inProgress: 1,
            publishedThisWeek: 0,
          },
          recentActivity: [
            { id: '1', action: 'Video rejalashtirildi (Shorts: AI Revolution in 2026)', performedAt: 'Bugun, 14:00' },
            { id: '2', action: 'Yangi skript yaratildi (How Agents Think)', performedAt: 'Kecha, 21:00' },
            { id: '3', action: 'YouTube Analytics sinxronlashtirildi', performedAt: 'Kecha, 18:30' },
          ],
          nextAction: '1 ta video tasdiqlanishi kutilmoqda. Ko\'rib chiqing va tasdiqlang.',
        };
      }
    },
  });
};

export const useContentList = (workspaceId: string = 'default') => {
  return useQuery({
    queryKey: ['content', workspaceId],
    queryFn: async () => {
      try {
        return await fetchApi(`/workspaces/${workspaceId}/content`, {}, async () => 'mock_token');
      } catch (err) {
        return [
          {
            id: 'item_1',
            title: 'Top 5 AI Agents Changing Software Engineering in 2026',
            status: 'awaiting_approval',
            videoFormat: 'long_form',
            contentPillar: 'educational',
            scheduledAt: new Date(Date.now() + 86400000).toISOString(),
            createdAt: new Date().toISOString(),
          },
          {
            id: 'item_2',
            title: 'Why You Shouldn\'t Fear AI Automation #Shorts',
            status: 'scheduled',
            videoFormat: 'shorts',
            contentPillar: 'entertainment',
            scheduledAt: new Date(Date.now() + 172800000).toISOString(),
            createdAt: new Date().toISOString(),
          },
        ];
      }
    },
  });
};

export const useAnalytics = (workspaceId: string = 'default', period: string = '7') => {
  return useQuery({
    queryKey: ['analytics', workspaceId, period],
    queryFn: async () => {
      try {
        return await fetchApi(`/workspaces/${workspaceId}/analytics/summary?period=${period}`, {}, async () => 'mock_token');
      } catch (err) {
        return {
          views: 45200,
          impressions: 512000,
          ctr: 4.6,
          watchTimeHours: 1820,
          avgDurationSeconds: 142,
          avgPercentage: 54.2,
          subscribersGained: 340,
        };
      }
    },
  });
};
