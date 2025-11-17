import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface NotificationRow {
  id: string;
  user_id: string;
  title: string;
  content: string;
  related_id?: string | null;
  notification_type: string;
  is_read?: boolean | null;
  created_at?: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      // Add demo notifications if empty
      const allNotifications = (data as NotificationRow[]) || [];
      if (allNotifications.length === 0) {
        const demoNotifications: NotificationRow[] = [
          {
            id: 'demo-1',
            user_id: 'demo',
            title: '🎉 Welcome to ProxiLink!',
            content: 'Discover nearby service providers and vendors in your area.',
            notification_type: 'welcome',
            is_read: false,
            created_at: new Date(Date.now() - 5 * 60000).toISOString(),
          },
          {
            id: 'demo-2',
            user_id: 'demo',
            title: '📍 Nearby Services Available',
            content: 'Fresh Water Services is now available within 2km of your location.',
            notification_type: 'proximity',
            is_read: false,
            created_at: new Date(Date.now() - 15 * 60000).toISOString(),
          },
          {
            id: 'demo-3',
            user_id: 'demo',
            title: '⭐ Service Rating Updated',
            content: 'You received a 5-star rating for your recent service.',
            notification_type: 'rating',
            is_read: true,
            created_at: new Date(Date.now() - 60 * 60000).toISOString(),
          },
          {
            id: 'demo-4',
            user_id: 'demo',
            title: '🔔 New Service Request',
            content: 'Someone is interested in your photography services.',
            notification_type: 'request',
            is_read: true,
            created_at: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
          },
          {
            id: 'demo-5',
            user_id: 'demo',
            title: '💰 Payment Received',
            content: 'You received ₦50,000 for your recent service delivery.',
            notification_type: 'payment',
            is_read: true,
            created_at: new Date(Date.now() - 24 * 60 * 60000).toISOString(),
          },
        ];
        setNotifications(demoNotifications);
      } else {
        setNotifications(allNotifications);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
      // Still show demo notifications on error
      const demoNotifications: NotificationRow[] = [
        {
          id: 'demo-1',
          user_id: 'demo',
          title: '🎉 Welcome to ProxiLink!',
          content: 'Discover nearby service providers and vendors in your area.',
          notification_type: 'welcome',
          is_read: false,
          created_at: new Date(Date.now() - 5 * 60000).toISOString(),
        },
      ];
      setNotifications(demoNotifications);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let cleanupFn: (() => void) | undefined;

    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setLoading(false);
          return;
        }
        const userId = session.user.id;

        await fetchNotifications();

        const channel = supabase
          .from(`notifications:user_id=eq.${userId}`)
          .on('INSERT', (payload: { new?: unknown }) => {
            const newRow = payload.new as NotificationRow;
            if (!mounted || !newRow) return;
            setNotifications((prev) => [newRow, ...prev]);
            toast(`${newRow.title}${newRow.content ? ` — ${newRow.content}` : ''}`);
          })
          .subscribe();

        cleanupFn = () => {
          mounted = false;
          try {
            const ch = channel as unknown as { unsubscribe?: () => void };
            if (ch.unsubscribe) {
              ch.unsubscribe();
            } else {
              const s = supabase as unknown as { removeSubscription?: (c: unknown) => void; removeChannel?: (c: unknown) => void };
              if (s.removeSubscription) s.removeSubscription(channel);
              else if (s.removeChannel) s.removeChannel(channel);
            }
          } catch (e) {
            console.warn('Failed to unsubscribe from notifications channel', e);
          }
        };
      } catch (e) {
        console.error('useNotifications setup failed', e);
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      if (typeof cleanupFn === 'function') cleanupFn();
    };
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch (e) {
      console.error('Failed to mark notification read', e);
    }
  };

  const markAllRead = async () => {
    try {
      const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
      if (unreadIds.length === 0) return;
      await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (e) {
      console.error('Failed to mark all read', e);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return { notifications, loading, unreadCount, markAsRead, markAllRead, refetch: fetchNotifications };
}

export default useNotifications;
