/**
 * Error and notification management
 * Provides better error handling alternatives to browser alert()
 */

export type NotificationType = "success" | "error" | "warning" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  details?: string;
  timestamp: number;
  duration?: number; // ms, undefined = persistent
}

// Internal event type for notification removals
type NotificationEvent = Notification | { id: string; type?: never };

/**
 * Stores notifications for UI display
 * This is a simple in-memory store; a real app might use a context or state manager
 */
const notifications: Map<string, Notification> = new Map();

const notificationListeners: Set<(notif: NotificationEvent) => void> =
  new Set();

/**
 * Subscribe to notification changes
 */
export const subscribeToNotifications = (
  callback: (notification: NotificationEvent) => void,
): (() => void) => {
  notificationListeners.add(callback);
  return () => notificationListeners.delete(callback);
};

/**
 * Broadcast notification to all listeners
 */
const broadcastNotification = (notification: NotificationEvent) => {
  notificationListeners.forEach((listener) => listener(notification));
};

/**
 * Create and show a notification
 */
export const notify = (
  type: NotificationType,
  message: string,
  details?: string,
  duration?: number,
): string => {
  const id = `notif-${Date.now()}-${Math.random()}`;
  const notification: Notification = {
    id,
    type,
    message,
    details,
    timestamp: Date.now(),
    duration,
  };

  notifications.set(id, notification);
  broadcastNotification(notification);

  // Auto-remove after duration if specified
  if (duration && duration > 0) {
    setTimeout(() => {
      notifications.delete(id);
      broadcastNotification({ id: "remove-" + id });
    }, duration);
  }

  return id;
};

/**
 * Show success notification
 */
export const notifySuccess = (message: string, duration = 3000): string => {
  console.log("[SUCCESS]", message);
  return notify("success", message, undefined, duration);
};

/**
 * Show error notification
 */
export const notifyError = (
  message: string,
  details?: Error | string,
  duration?: number,
): string => {
  const detailsStr = typeof details === "string" ? details : details?.message;
  console.error("[ERROR]", message, details);
  return notify("error", message, detailsStr, duration);
};

/**
 * Show warning notification
 */
export const notifyWarning = (message: string, duration = 4000): string => {
  console.warn("[WARNING]", message);
  return notify("warning", message, undefined, duration);
};

/**
 * Show info notification
 */
export const notifyInfo = (message: string, duration = 3000): string => {
  return notify("info", message, undefined, duration);
};

/**
 * Remove a notification by ID
 */
export const removeNotification = (id: string): void => {
  if (notifications.has(id)) {
    notifications.delete(id);
    broadcastNotification({ id: "remove-" + id });
  }
};

/**
 * Clear all notifications
 */
export const clearAllNotifications = (): void => {
  notifications.clear();
  broadcastNotification({ id: "clear-all" });
};

/**
 * Get all active notifications
 */
export const getNotifications = (): Notification[] => {
  return Array.from(notifications.values());
};
