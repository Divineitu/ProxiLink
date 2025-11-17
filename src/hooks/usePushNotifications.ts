// Hook to manage push notifications subscription and permissions
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PushSubscription {
  id: string;
  user_id: string;
  subscription: PushSubscriptionJSON;
  is_active: boolean;
  created_at: string;
}

// Minimal shape for the subscription JSON stored in DB. Use a loose record
// so we avoid `any` while keeping compatibility with varying browser shapes.
// Local JSON type compatible with Supabase json/Json column typing
type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

type PushSubscriptionJSON = Json;

export function usePushNotifications() {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [autoSubscribeRequested, setAutoSubscribeRequested] = useState(false);

  useEffect(() => {
    // Check browser support
    const isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    setSupported(isSupported);

    if (!isSupported) {
      setLoading(false);
      return;
    }

    // Register service worker
    const registerServiceWorker = async () => {
      try {
        console.log('Attempting to register service worker from /service-worker.js...');
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
          scope: '/',
        });
        console.log('✓ Service Worker registered successfully:', registration);
        console.log('  - Scope:', registration.scope);
        console.log('  - State:', registration.active?.state || 'not active');
      } catch (err) {
        console.error('✗ Service Worker registration failed:', err);
        const _errMsg = err instanceof Error ? err.message : String(err);
        console.error('  Error:', _errMsg);
      }
    };

    registerServiceWorker();

    // Check current permission
    if (Notification.permission) {
      setPermission(Notification.permission);
    }

    // Check if user is already subscribed
    const checkSubscription = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = (data as unknown as { session?: { user?: { id?: string } } })?.session;
        if (!session?.user?.id) {
          setLoading(false);
          return;
        }

        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setSubscribed(!!subscription);
        // If not subscribed, request auto-subscribe (so push is enabled by default)
        if (!subscription) {
          setAutoSubscribeRequested(true);
        }
      } catch (err) {
        console.error('Failed to check subscription:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isSupported) {
      checkSubscription();
    }
  }, []);

  

  const requestNotificationPermission = useCallback(async () => {
    if (!supported) {
      toast.error('Push notifications not supported in this browser');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission !== 'granted') {
        toast.error('Notification permission denied');
        return false;
      }

      return true;
    } catch (err) {
      const _errMsg = err instanceof Error ? err.message : String(err);
      console.error('Permission request failed:', _errMsg);
      toast.error('Failed to request notification permission');
      return false;
    }
  }, [supported]);

  const subscribeToPushNotifications = useCallback(async () => {
    if (!supported) {
      console.error('Push notifications not supported');
      toast.error('Push notifications not supported');
      return false;
    }

    setLoading(true);
    try {
      console.log('Starting push subscription...');
      
      // Request permission first
      if (Notification.permission !== 'granted') {
        console.log('Requesting notification permission...');
        const granted = await requestNotificationPermission();
        if (!granted) {
          console.error('Permission not granted');
          setLoading(false);
          return false;
        }
      }

      const { data } = await supabase.auth.getSession();
      const session = (data as unknown as { session?: { user?: { id?: string } } })?.session;
      if (!session?.user?.id) {
        console.error('No session or user ID');
        toast.error('You must be logged in');
        setLoading(false);
        return false;
      }
      console.log('Session confirmed, user ID:', session.user.id);

      // Get service worker registration
      console.log('Waiting for service worker...');
      const registration = await navigator.serviceWorker.ready;
      console.log('Service worker ready:', registration);

      // Subscribe to push manager
      // Note: VAPID public key should be stored in env variable in production
      const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';
      console.log('VAPID key loaded:', vapidKey ? 'Yes (' + vapidKey.substring(0, 20) + '...)' : 'No');
      
      if (!vapidKey) {
        throw new Error('VAPID public key not configured');
      }

      console.log('Subscribing to push manager...');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: (urlBase64ToUint8Array(vapidKey) as unknown) as BufferSource,
      });
      console.log('Push subscription created:', subscription.endpoint);

      // Store subscription in database
      console.log('Storing subscription in database...');
      const payload = {
        user_id: session.user.id,
        subscription: subscription.toJSON() as PushSubscriptionJSON,
        is_active: true,
      };

      const { error } = await supabase.from('push_subscriptions').insert(payload);

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      setSubscribed(true);
      toast.success('Notifications enabled!');
      return true;
    } catch (err) {
      console.error('Subscription failed:', err);
      const _errMsg = err instanceof Error ? err.message : String(err);
      console.error('Error details:', _errMsg);
      toast.error('Failed to enable notifications');
      return false;
    } finally {
      setLoading(false);
    }
  }, [supported, requestNotificationPermission]);

  const unsubscribeFromPushNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      // Mark subscription as inactive in database
      const { data } = await supabase.auth.getSession();
      const session = (data as unknown as { session?: { user?: { id?: string } } })?.session;
      if (session?.user?.id) {
        await supabase.from('push_subscriptions').update({ is_active: false }).eq('user_id', session.user.id);
      }

      setSubscribed(false);
      toast.success('Notifications disabled');
      return true;
    } catch (err) {
      const _errMsg = err instanceof Error ? err.message : String(err);
      console.error('Unsubscribe failed:', _errMsg);
      toast.error('Failed to disable notifications');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // If the initial check indicated we should auto-subscribe, try to subscribe now
  useEffect(() => {
    if (!autoSubscribeRequested) return;
    if (!supported) return;
    if (subscribed) return;

    // Attempt to subscribe, don't block render
    (async () => {
      try {
        await subscribeToPushNotifications();
      } catch (e) {
        console.warn('Auto-subscribe failed or was blocked by user', e);
      }
    })();
  }, [autoSubscribeRequested, supported, subscribed, subscribeToPushNotifications]);

  return {
    supported,
    subscribed,
    loading,
    permission,
    requestNotificationPermission,
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications,
  };
}

// Helper function to convert VAPID public key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export default usePushNotifications;
