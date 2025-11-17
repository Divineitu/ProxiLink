// Service Worker for ProxiLink push notifications
// Handles background push events and displays notifications

self.addEventListener('push', (event) => {
  if (!event.data) {
    console.warn('Push event received but no data');
    return;
  }

  let notificationData = {};
  try {
    notificationData = event.data.json();
  } catch (e) {
    // Fallback if data is not JSON
    notificationData = {
      title: 'ProxiLink Notification',
      body: event.data.text(),
    };
  }

  const { title = 'ProxiLink', body = '', icon = '/logo.png', badge = '/logo.png', tag = 'proxilink-notification', data = {} } = notificationData;

  const options = {
    body,
    icon,
    badge,
    tag, // Groups notifications with same tag
    data, // Can include action URLs, IDs, etc.
    vibrate: [200, 100, 200],
    requireInteraction: false, // Allow dismissal without user interaction
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const { data = {} } = event.notification;
  const targetUrl = data.actionUrl || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if window with target URL is already open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // If not open, open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Sync event for reliable notification delivery (background sync)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-notifications') {
    event.waitUntil(
      // Sync logic can go here (e.g., retry failed sends)
      Promise.resolve()
    );
  }
});
