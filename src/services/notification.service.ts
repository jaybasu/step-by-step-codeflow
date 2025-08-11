/**
 * Notification Service
 * Centralized notification management with different channels
 */

export interface NotificationOptions {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  actions?: {
    label: string;
    action: () => void;
  }[];
}

export interface ToastNotification extends NotificationOptions {
  id: string;
  timestamp: Date;
}

class NotificationService {
  private subscribers: Set<(notification: ToastNotification) => void> = new Set();
  private activeNotifications: Map<string, ToastNotification> = new Map();

  /**
   * Subscribe to notifications
   */
  subscribe(callback: (notification: ToastNotification) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  /**
   * Show notification
   */
  show(options: NotificationOptions): string {
    const notification: ToastNotification = {
      ...options,
      id: this.generateId(),
      timestamp: new Date(),
    };

    this.activeNotifications.set(notification.id, notification);
    this.notifySubscribers(notification);

    // Auto-dismiss non-persistent notifications
    if (!options.persistent) {
      setTimeout(() => {
        this.dismiss(notification.id);
      }, options.duration || 5000);
    }

    return notification.id;
  }

  /**
   * Dismiss notification
   */
  dismiss(id: string): void {
    if (this.activeNotifications.has(id)) {
      this.activeNotifications.delete(id);
      // Could emit dismissal event if needed
    }
  }

  /**
   * Convenience methods
   */
  success(title: string, message?: string, options?: Partial<NotificationOptions>): string {
    return this.show({
      type: 'success',
      title,
      message,
      ...options,
    });
  }

  error(title: string, message?: string, options?: Partial<NotificationOptions>): string {
    return this.show({
      type: 'error',
      title,
      message,
      persistent: true, // Errors should be persistent by default
      ...options,
    });
  }

  warning(title: string, message?: string, options?: Partial<NotificationOptions>): string {
    return this.show({
      type: 'warning',
      title,
      message,
      ...options,
    });
  }

  info(title: string, message?: string, options?: Partial<NotificationOptions>): string {
    return this.show({
      type: 'info',
      title,
      message,
      ...options,
    });
  }

  /**
   * Pipeline-specific notifications
   */
  pipelineStarted(pipelineName: string): string {
    return this.success(
      'Pipeline Started',
      `${pipelineName} is now running`,
      { duration: 3000 }
    );
  }

  pipelineCompleted(pipelineName: string, duration: string): string {
    return this.success(
      'Pipeline Completed',
      `${pipelineName} finished in ${duration}`,
      { 
        duration: 5000,
        actions: [
          {
            label: 'View Results',
            action: () => {
              // Navigate to results page
              console.log('Navigate to results');
            }
          }
        ]
      }
    );
  }

  pipelineError(pipelineName: string, error: string): string {
    return this.error(
      'Pipeline Failed',
      `${pipelineName} failed: ${error}`,
      {
        actions: [
          {
            label: 'Retry',
            action: () => {
              // Retry pipeline
              console.log('Retry pipeline');
            }
          },
          {
            label: 'View Logs',
            action: () => {
              // Open logs
              console.log('View logs');
            }
          }
        ]
      }
    );
  }

  stepCompleted(stepName: string): string {
    return this.info(
      'Step Completed',
      `${stepName} finished successfully`,
      { duration: 2000 }
    );
  }

  /**
   * Bulk operations
   */
  dismissAll(): void {
    this.activeNotifications.clear();
  }

  getActive(): ToastNotification[] {
    return Array.from(this.activeNotifications.values());
  }

  /**
   * Private methods
   */
  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private notifySubscribers(notification: ToastNotification): void {
    this.subscribers.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error in notification subscriber:', error);
      }
    });
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

// Export class for testing
export { NotificationService };