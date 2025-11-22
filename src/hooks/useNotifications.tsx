import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createRoot } from 'react-dom/client';
import NotificationToast from '@/components/NotificationToast';
import { demoNotifications, incomingDemoNotifications } from '@/data/demoNotifications';

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
  const notificationIndexRef = useRef(0);
  const demoTimerRef = useRef<NodeJS.Timeout | null>(null);
  const toastContainerRef = useRef<HTMLDivElement | null>(null);
  const toastRootRef = useRef<any>(null);

  // Function to show custom toast
  const showNotificationToast = useCallback((title: string, content: string, onClick?: () => void) => {
    // Create container if it doesn't exist
    if (!toastContainerRef.current) {
      toastContainerRef.current = document.createElement('div');
      toastContainerRef.current.id = 'notification-toast-container';
      document.body.appendChild(toastContainerRef.current);
      toastRootRef.current = createRoot(toastContainerRef.current);
    }

    // Render the toast
    toastRootRef.current.render(
      <NotificationToast
        title={title}
        content={content}
        duration={6000} // 6 seconds
        onClick={onClick}
        onDismiss={() => {
          toastRootRef.current?.render(null);
        }}
      />
    );
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        // Use demo notifications for non-authenticated users
        setNotifications([...demoNotifications]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notifications:', error);
        // Fallback to demo notifications
        setNotifications([...demoNotifications]);
      } else {
        // Mix real and demo notifications
        const allNotifications = [...(data as NotificationRow[])];
        if (allNotifications.length === 0) {
          setNotifications([...demoNotifications]);
        } else {
          setNotifications(allNotifications);
        }
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
      setNotifications([...demoNotifications]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Simulate incoming demo notifications
  const startDemoNotifications = useCallback(() => {
    // Clear any existing timer
    if (demoTimerRef.current) {
      clearInterval(demoTimerRef.current);
    }

    // Generate a new notification every 35-55 seconds
    const scheduleNextNotification = () => {
      const delay = Math.floor(Math.random() * 20000) + 35000; // 35-55 seconds
      
      demoTimerRef.current = setTimeout(() => {
        const nextNotification = incomingDemoNotifications[notificationIndexRef.current % incomingDemoNotifications.length];
        const newNotification: NotificationRow = {
          ...nextNotification,
          id: `demo-incoming-${Date.now()}`,
          created_at: new Date().toISOString(),
        };

        setNotifications((prev) => [newNotification, ...prev]);
        showNotificationToast(
          newNotification.title, 
          newNotification.content,
          () => {
            // Open notification center when clicked
            const event = new CustomEvent('openNotificationCenter');
            window.dispatchEvent(event);
          }
        );

        notificationIndexRef.current += 1;
        scheduleNextNotification(); // Schedule the next one
      }, delay);
    };

    scheduleNextNotification();
  }, []);

  useEffect(() => {
    let mounted = true;
    let cleanupFn: (() => void) | undefined;

    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        await fetchNotifications();

        if (!session?.user) {
          setLoading(false);
          // Start demo notifications for non-authenticated users
          startDemoNotifications();
          return;
        }
        const userId = session.user.id;

        // Show welcome notification immediately on login
        const welcomeNotification: NotificationRow = {
          id: `welcome-${Date.now()}`,
          user_id: userId,
          title: '🎉 Special ProxiLink Offers!',
          content: 'Get exclusive discounts on premium services today. Check out our latest deals and save up to 30%!',
          notification_type: 'promotion',
          is_read: false,
          created_at: new Date().toISOString(),
        };
        setNotifications((prev) => [welcomeNotification, ...prev]);
        showNotificationToast(
          welcomeNotification.title,
          welcomeNotification.content,
          () => {
            const event = new CustomEvent('openNotificationCenter');
            window.dispatchEvent(event);
          }
        );

        // Use Supabase v2 Realtime `channel` API to subscribe to notifications for the user
        const channel = supabase
          .channel(`notifications:${userId}`)
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
            (payload: any) => {
              const newRow = payload.new as NotificationRow;
              if (!mounted || !newRow) return;
              setNotifications((prev) => [newRow, ...prev]);
              showNotificationToast(
                newRow.title, 
                newRow.content,
                () => {
                  const event = new CustomEvent('openNotificationCenter');
                  window.dispatchEvent(event);
                }
              );
            }
          )
          .subscribe();

        // Also start demo notifications for authenticated users (fallback)
        startDemoNotifications();

        cleanupFn = () => {
          mounted = false;
          if (demoTimerRef.current) {
            clearTimeout(demoTimerRef.current);
            demoTimerRef.current = null;
          }
          try {
            // supabase.removeChannel is the correct way to remove v2 channels
            if (typeof supabase.removeChannel === 'function') {
              // removeChannel may be async; call it but don't await in cleanup
              // @ts-ignore
              supabase.removeChannel(channel);
            } else if (typeof channel?.unsubscribe === 'function') {
              // fallback for older client implementations
              channel.unsubscribe();
            }
          } catch (e) {
            console.warn('Failed to unsubscribe from notifications channel', e);
          }
        };
      } catch (e) {
        console.error('useNotifications setup failed', e);
        setLoading(false);
        // Start demo notifications on error
        startDemoNotifications();
      }
    })();

    return () => {
      mounted = false;
      if (demoTimerRef.current) {
        clearTimeout(demoTimerRef.current);
        demoTimerRef.current = null;
      }
      // Cleanup toast container
      if (toastContainerRef.current) {
        toastRootRef.current?.unmount();
        document.body.removeChild(toastContainerRef.current);
        toastContainerRef.current = null;
        toastRootRef.current = null;
      }
      if (typeof cleanupFn === 'function') cleanupFn();
    };
  }, [fetchNotifications, startDemoNotifications, showNotificationToast]);

  const markAsRead = async (id: string) => {
    // Optimistically update UI
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    
    // Don't attempt database update for demo notifications
    if (id.startsWith('demo')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      
      if (error) {
        console.error('Failed to mark notification as read:', error);
        // Revert optimistic update on error
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: false } : n)));
      }
    } catch (e) {
      console.error('Failed to mark notification read', e);
    }
  };

  const markAllRead = async () => {
    const unreadNonDemo = notifications.filter((n) => !n.is_read && !n.id.startsWith('demo'));
    const unreadIds = unreadNonDemo.map((n) => n.id);
    
    // Optimistically update UI
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

    if (unreadIds.length === 0) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', unreadIds);
      
      if (error) {
        console.error('Failed to mark all as read:', error);
        // Revert optimistic update on error
        setNotifications((prev) => 
          prev.map((n) => {
            const wasUnread = unreadIds.includes(n.id);
            return wasUnread ? { ...n, is_read: false } : n;
          })
        );
      }
    } catch (e) {
      console.error('Failed to mark all read', e);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return { notifications, loading, unreadCount, markAsRead, markAllRead, refetch: fetchNotifications };
}

export default useNotifications;
