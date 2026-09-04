// 웹 브라우저 Notification API 및 PWA Web Push 연동 유틸리티

export function getNotificationPermissionStatus(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      sendBrowserNotification('🌙 LogMate 온기 알림 활성화', {
        body: '이제 내 사연에 따뜻한 온기 쪽지가 도착하면 알려드릴게요.',
      });
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function sendBrowserNotification(title: string, options?: NotificationOptions): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        icon: '/logo.png',
        badge: '/logo.png',
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return true;
    } catch (e) {
      console.warn('Failed to dispatch browser notification:', e);
    }
  }

  return false;
}

// 새로운 온기 쪽지 수신 여부 확인 및 푸시 발송 트리거
export function notifyIfNewComfortNotes(currentCount: number): void {
  if (typeof window === 'undefined' || currentCount <= 0) return;

  try {
    const key = 'logmate_seen_notes_count';
    const seen = parseInt(localStorage.getItem(key) || '0', 10);

    if (currentCount > seen) {
      const diff = currentCount - seen;
      sendBrowserNotification('💌 새로운 온기 쪽지가 도착했습니다', {
        body: `누군가 당신의 사연에 ${diff}개의 따뜻한 응원 쪽지를 남겼습니다. 지금 확인해보세요!`,
      });
      localStorage.setItem(key, currentCount.toString());
    }
  } catch {}
}
