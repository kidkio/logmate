export function getDeviceId(): string {
  if (typeof window === 'undefined') return 'server-device';
  
  const STORAGE_KEY = 'todays_failure_device_id';
  let deviceId = localStorage.getItem(STORAGE_KEY);
  
  if (!deviceId) {
    deviceId = 'dev_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
    localStorage.setItem(STORAGE_KEY, deviceId);
  }
  
  return deviceId;
}
