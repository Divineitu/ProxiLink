import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createRoot } from 'react-dom/client';
import NotificationToast from '@/components/NotificationToast';

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
  const hasShownWelcomeRef = useRef(false);
  const hasShownSpecialOfferRef = useRef(false);

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
        setNotifications([]);
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
        setNotifications([]);
      } else {
        setNotifications(data as NotificationRow[] || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Show special offer notification after 50 seconds (only once per session)
  const startSpecialOfferNotification = useCallback(() => {
    // Clear any existing timer
    if (demoTimerRef.current) {
      clearTimeout(demoTimerRef.current);
    }

    // Only show if not already shown
    if (hasShownSpecialOfferRef.current) {
      return;
    }

    // Show special offer after 50 seconds
    demoTimerRef.current = setTimeout(() => {
      if (hasShownSpecialOfferRef.current) return;
      
      const specialOfferNotification: NotificationRow = {
        id: `special-offer-${Date.now()}`,
        user_id: 'current',
        title: '🎉 Special Offer!',
        content: 'Get exclusive discounts on premium services today. Check out our latest deals and save up to 30%!',
        notification_type: 'promotion',
        is_read: false,
        created_at: new Date().toISOString(),
      };

      setNotifications((prev) => [specialOfferNotification, ...prev]);
      showNotificationToast(
        specialOfferNotification.title, 
        specialOfferNotification.content,
        () => {
          const event = new CustomEvent('openNotificationCenter');
          window.dispatchEvent(event);
        }
      );
      
      hasShownSpecialOfferRef.current = true;
    }, 50000); // 50 seconds
  }, [showNotificationToast]);

  useEffect(() => {
    let mounted = true;
    let cleanupFn: (() => void) | undefined;

    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        await fetchNotifications();

        if (!session?.user) {
          setLoading(false);
          return;
        }
        const userId = session.user.id;

        // Show welcome notification immediately on login (only once per session)
        if (!hasShownWelcomeRef.current) {
          const welcomeNotification: NotificationRow = {
            id: `welcome-${Date.now()}`,
            user_id: userId,
            title: '👋 Welcome to ProxiLink!',
            content: 'Discover amazing services and vendors near you. Start exploring now!',
            notification_type: 'welcome',
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
          hasShownWelcomeRef.current = true;
        }

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

        // Schedule special offer notification after 50 seconds
        startSpecialOfferNotification();

        cleanupFn = () => {
          mounted = false;
          if (demoTimerRef.current) {
            clearTimeout(demoTimerRef.current);
            demoTimerRef.current = null;
          }
          try {
            // remove channel properly
            if (typeof supabase.removeChannel === 'function') {
              // call but don't wait (in cleanup)
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
  }, [fetchNotifications, startSpecialOfferNotification, showNotificationToast]);

  const markAsRead = async (id: string) => {
    // update UI right away
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    
    // skip DB update for session notifications
    if (id.startsWith('welcome-') || id.startsWith('special-offer-')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      
      if (error) {
        console.error('Failed to mark notification as read:', error);
        // undo if it fails
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: false } : n)));
      }
    } catch (e) {
      console.error('Failed to mark notification read', e);
    }
  };

  const markAllRead = async () => {
    // Separate session-based notifications from database notifications
    const unreadSessionNotifications = notifications.filter(
      (n) => !n.is_read && (n.id.startsWith('welcome-') || n.id.startsWith('special-offer-'))
    );
    const unreadDbNotifications = notifications.filter(
      (n) => !n.is_read && !n.id.startsWith('welcome-') && !n.id.startsWith('special-offer-')
    );
    const unreadDbIds = unreadDbNotifications.map((n) => n.id);
    
    // Optimistically update UI - mark ALL notifications as read
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

    // Update database notifications
    if (unreadDbIds.length > 0) {
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .in('id', unreadDbIds);
        
        if (error) {
          console.error('Failed to mark all as read:', error);
          // Revert optimistic update on error for DB notifications only
          setNotifications((prev) => 
            prev.map((n) => {
              const wasUnread = unreadDbIds.includes(n.id);
              return wasUnread ? { ...n, is_read: false } : n;
            })
          );
        }
      } catch (e) {
        console.error('Failed to mark all read', e);
      }
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return { notifications, loading, unreadCount, markAsRead, markAllRead, refetch: fetchNotifications };
}

export default useNotifications;
