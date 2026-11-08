/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

let swRegistration: ServiceWorkerRegistration | null = null;
let channelsCreated = false;
let cachedNativePerm: NotificationPermission | null = null;

/**
 * Checks if the app is currently running as a native Android (or iOS) app via Capacitor
 */
export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Creates high-priority notification channels in Android.
 * Essential on Android 8.0+ for alarms and notifications to sound and appear in status bar/heads-up.
 */
export async function ensureChannelsCreated(): Promise<void> {
  if (!Capacitor.isNativePlatform() || channelsCreated) return;

  try {
    await LocalNotifications.createChannel({
      id: 'arynotes_alarms',
      name: 'Alarm & Pengingat Penting',
      description: 'Alarm bersuara dan pengingat waktu tenggat tugas AryNotes',
      importance: 5, // High importance (heads-up notification & sound)
      visibility: 1, // Public on lock screen
      sound: 'beep.wav',
      vibration: true,
      lights: true,
    });

    await LocalNotifications.createChannel({
      id: 'arynotes_general',
      name: 'Notifikasi AryNotes',
      description: 'Pengingat umum dan status tugas AryNotes',
      importance: 4,
      visibility: 1,
      vibration: true,
    });

    channelsCreated = true;
  } catch (err) {
    console.warn('Capacitor LocalNotifications createChannel warning:', err);
  }
}

/**
 * Initializes and registers the Service Worker for web browser & PWA environments
 */
export async function initServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    swRegistration = reg;

    navigator.serviceWorker.ready.then((readyReg) => {
      swRegistration = readyReg;
    });

    return reg;
  } catch (err) {
    console.warn('Service Worker registration error:', err);
    return null;
  }
}

/**
 * Initializes all notification subsystems (both Capacitor native Android & Web Service Worker)
 */
export async function initNotifications(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await ensureChannelsCreated();
    try {
      const perm = await LocalNotifications.checkPermissions();
      cachedNativePerm =
        perm.display === 'granted'
          ? 'granted'
          : perm.display === 'denied'
          ? 'denied'
          : 'default';

      // Listen for notification clicks when user taps a status bar notification
      LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
        console.log('Notification action performed:', action);
      });
    } catch (e) {
      console.warn('Native permission check warning:', e);
    }
  } else {
    await initServiceWorker();
  }
}

/**
 * Returns current Notification permission: 'granted' | 'denied' | 'default' | 'unsupported'
 */
export function getNotificationPermissionStatus(): NotificationPermission | 'unsupported' {
  if (Capacitor.isNativePlatform() && cachedNativePerm) {
    return cachedNativePerm;
  }

  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Explicitly requests notification permission from the user for Android system notifications
 */
export async function requestAndroidNotificationPermission(): Promise<NotificationPermission> {
  // 1. Native Android via Capacitor LocalNotifications
  if (Capacitor.isNativePlatform()) {
    try {
      const res = await LocalNotifications.requestPermissions();
      cachedNativePerm =
        res.display === 'granted'
          ? 'granted'
          : res.display === 'denied'
          ? 'denied'
          : 'default';
      await ensureChannelsCreated();
      return cachedNativePerm;
    } catch (err) {
      console.warn('Capacitor requestPermissions error:', err);
    }
  }

  // 2. Web browser fallback via standard Notification API & Service Worker
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  try {
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      await initServiceWorker();
    }
    return perm;
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return Notification.permission;
  }
}

/**
 * Dispatches a native notification directly to Android status bar / lock screen.
 * - When in Android Studio / Capacitor APK: Uses LocalNotifications.schedule with high priority channel.
 * - When in Web Browser / AI Studio: Uses ServiceWorkerRegistration.showNotification / Notification.
 */
export async function sendAndroidSystemNotification(
  title: string,
  options?: {
    body?: string;
    tag?: string;
    url?: string;
    vibrate?: number[];
    channelId?: string;
  }
): Promise<boolean> {
  // 1. Native Android Studio via Capacitor
  if (Capacitor.isNativePlatform()) {
    try {
      const perm = await LocalNotifications.checkPermissions();
      if (perm.display !== 'granted') {
        const req = await LocalNotifications.requestPermissions();
        if (req.display !== 'granted') return false;
        cachedNativePerm = req.display;
      }

      await ensureChannelsCreated();

      const notifId = Math.floor(Math.random() * 2147483647);
      await LocalNotifications.schedule({
        notifications: [
          {
            id: notifId,
            title,
            body: options?.body || '',
            channelId: options?.channelId || 'arynotes_alarms',
            schedule: { at: new Date(Date.now() + 150), allowWhileIdle: true },
            sound: 'beep.wav',
            extra: {
              url: options?.url || '/',
              tag: options?.tag || `arynotes-${Date.now()}`,
            },
          },
        ],
      });
      return true;
    } catch (nativeErr) {
      console.warn('Capacitor schedule notification failed, trying web fallback:', nativeErr);
    }
  }

  // 2. Web Browser Fallback
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'default') {
    const perm = await requestAndroidNotificationPermission();
    if (perm !== 'granted') return false;
  } else if (Notification.permission !== 'granted') {
    return false;
  }

  const notificationOptions = {
    body: options?.body || '',
    icon: '/icon.svg',
    badge: '/icon.svg',
    vibrate: options?.vibrate || [400, 200, 400],
    tag: options?.tag || `arynotes-${Date.now()}`,
    renotify: true,
    requireInteraction: true,
    data: {
      url: options?.url || '/',
      dateOfArrival: Date.now(),
    },
  };

  if ('serviceWorker' in navigator) {
    try {
      const reg = swRegistration || (await navigator.serviceWorker.ready);
      if (reg && reg.showNotification) {
        await reg.showNotification(title, notificationOptions);
        return true;
      }
    } catch (swErr) {
      console.warn('Service Worker showNotification failed, trying fallback:', swErr);
    }
  }

  try {
    new Notification(title, notificationOptions);
    return true;
  } catch (err) {
    console.warn('Fallback window Notification failed:', err);
    return false;
  }
}

/**
 * Schedules an exact alarm in Android AlarmManager / NotificationManager.
 * Runs in background or even when the app is suspended/closed on Android devices.
 */
export async function scheduleNativeAlarm(
  id: number,
  title: string,
  body: string,
  date: Date
): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;

  try {
    await ensureChannelsCreated();
    await LocalNotifications.schedule({
      notifications: [
        {
          id: Math.abs(id % 2147483647),
          title,
          body,
          channelId: 'arynotes_alarms',
          schedule: { at: date, allowWhileIdle: true },
          sound: 'beep.wav',
        },
      ],
    });
    return true;
  } catch (err) {
    console.warn('Failed to schedule native alarm:', err);
    return false;
  }
}

/**
 * Cancels a scheduled native alarm in Android
 */
export async function cancelNativeAlarm(id: number): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;

  try {
    await LocalNotifications.cancel({
      notifications: [{ id: Math.abs(id % 2147483647) }],
    });
    return true;
  } catch (err) {
    console.warn('Failed to cancel native alarm:', err);
    return false;
  }
}

/**
 * Tests Android notification to demonstrate it appearing in Android's notification drawer
 */
export async function testAndroidNotification(): Promise<boolean> {
  return await sendAndroidSystemNotification('🔔 AryNotes: Uji Notifikasi Android', {
    body: 'Notifikasi berhasil muncul di sistem Android Anda, bahkan saat di luar aplikasi!',
    tag: 'test-notification',
  });
}
