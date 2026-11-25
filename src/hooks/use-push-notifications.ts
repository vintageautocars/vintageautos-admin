import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}

export type PushPermission = 'default' | 'granted' | 'denied' | 'unsupported';

export function usePushNotifications() {
  const [permission, setPermission] = useState<PushPermission>(() =>
    'Notification' in window ? (Notification.permission as PushPermission) : 'unsupported',
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check current subscription state on mount
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    navigator.serviceWorker.ready
      .then(async (reg) => {
        const sub = await reg.pushManager.getSubscription();
        setIsSubscribed(!!sub);
      })
      .catch(() => undefined);
  }, []);

  const subscribe = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    setIsLoading(true);
    try {
      const { data } = await api.get<{ vapidPublicKey: string }>('/push-subscriptions/vapid-public-key');
      if (!data.vapidPublicKey) throw new Error('No VAPID key');

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(data.vapidPublicKey),
      });

      const json = sub.toJSON();
      await api.post('/push-subscriptions', {
        endpoint: json.endpoint,
        p256dh: (json.keys as Record<string, string>).p256dh,
        auth: (json.keys as Record<string, string>).auth,
      });

      setIsSubscribed(true);
      setPermission('granted');
    } catch {
      setPermission(('Notification' in window ? Notification.permission : 'unsupported') as PushPermission);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return;
    setIsLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await api.delete('/push-subscriptions', { data: { endpoint: sub.endpoint } });
        await sub.unsubscribe();
      }
      setIsSubscribed(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestAndSubscribe = useCallback(async () => {
    if (Notification.permission === 'denied') return;
    const result = await Notification.requestPermission();
    setPermission(result as PushPermission);
    if (result === 'granted') await subscribe();
  }, [subscribe]);

  return { permission, isSubscribed, isLoading, requestAndSubscribe, unsubscribe };
}
