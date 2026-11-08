/**
 * AryNotes Service Worker for Android Notifications & Offline Capabilities
 */

const CACHE_NAME = 'arynotes-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle clicking on an Android notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Handle push notification events if server push is utilized
self.addEventListener('push', (event) => {
  let data = { title: 'AryNotes', body: 'Kamu memiliki pengingat baru!', tag: 'arynotes-alert' };
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/icon.svg',
    badge: '/icon.svg',
    vibrate: [300, 100, 300, 100, 300],
    tag: data.tag || 'arynotes-notification',
    renotify: true,
    requireInteraction: true,
    data: { url: '/' },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Handle client messages requesting immediate background notification
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, tag, url } = event.data;
    const options = {
      body: body || '',
      icon: '/icon.svg',
      badge: '/icon.svg',
      vibrate: [400, 200, 400],
      tag: tag || 'arynotes-alert',
      renotify: true,
      requireInteraction: true,
      data: { url: url || '/' },
    };
    self.registration.showNotification(title, options);
  }
});
