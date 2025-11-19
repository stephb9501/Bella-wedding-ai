// Error Monitoring & Logging
// Provides error tracking, performance monitoring, and user action logging

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface ErrorLog {
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  timestamp: string;
  userId?: number;
  context?: Record<string, any>;
}

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: string;
  url: string;
  userId?: number;
}

interface UserAction {
  action: string;
  category: string;
  label?: string;
  value?: number;
  timestamp: string;
  userId?: number;
  metadata?: Record<string, any>;
}

class Monitor {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private apiEndpoint = '/api/monitoring/errors';

  /**
   * Log messages to console in development, structured logs in production
   */
  log(level: LogLevel, message: string, data?: Record<string, any>) {
    const logEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...data,
    };

    if (this.isDevelopment) {
      // Pretty console logs for development
      const styles: Record<LogLevel, string> = {
        debug: 'color: #888',
        info: 'color: #0070f3',
        warn: 'color: #f5a623',
        error: 'color: #e00',
      };

      console.log(
        `%c[${level.toUpperCase()}] ${message}`,
        styles[level],
        data || ''
      );
    } else {
      // Structured logs for production
      console.log(JSON.stringify(logEntry));
    }
  }

  /**
   * Track and report errors
   */
  async trackError(error: Error, context?: Record<string, any>) {
    const errorLog: ErrorLog = {
      message: error.message,
      stack: error.stack,
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      timestamp: new Date().toISOString(),
      context,
    };

    // Get user ID from session if available
    try {
      const userId = this.getUserId();
      if (userId) {
        errorLog.userId = userId;
      }
    } catch (e) {
      // Ignore if unable to get user ID
    }

    // Log to console
    this.log('error', error.message, { stack: error.stack, context });

    // Send to server in production
    if (!this.isDevelopment) {
      try {
        await fetch(this.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(errorLog),
        });
      } catch (e) {
        // Fail silently - don't want error reporting to cause more errors
        console.error('Failed to report error:', e);
      }
    }

    return errorLog;
  }

  /**
   * Track API errors specifically
   */
  async trackApiError(
    endpoint: string,
    status: number,
    message: string,
    context?: Record<string, any>
  ) {
    const error = new Error(`API Error: ${endpoint} returned ${status}`);
    return this.trackError(error, {
      type: 'api_error',
      endpoint,
      status,
      message,
      ...context,
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(name: string, value: number, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
    };

    try {
      const userId = this.getUserId();
      if (userId) {
        metric.userId = userId;
      }
    } catch (e) {
      // Ignore
    }

    this.log('info', `Performance: ${name} - ${value}ms`, metadata);

    // Could send to analytics service in production
    if (!this.isDevelopment && typeof window !== 'undefined') {
      // Store in localStorage for later batch sending
      this.storeMetric(metric);
    }
  }

  /**
   * Track user actions for analytics
   */
  trackAction(action: string, category: string, label?: string, value?: number, metadata?: Record<string, any>) {
    const userAction: UserAction = {
      action,
      category,
      label,
      value,
      timestamp: new Date().toISOString(),
      metadata,
    };

    try {
      const userId = this.getUserId();
      if (userId) {
        userAction.userId = userId;
      }
    } catch (e) {
      // Ignore
    }

    this.log('info', `Action: ${category} - ${action}`, { label, value, metadata });

    // Could integrate with analytics service (Google Analytics, Mixpanel, etc.)
  }

  /**
   * Measure page load performance
   */
  trackPageLoad() {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      // Use Navigation Timing API
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      const connectTime = perfData.responseEnd - perfData.requestStart;
      const renderTime = perfData.domComplete - perfData.domLoading;

      this.trackPerformance('page_load', pageLoadTime);
      this.trackPerformance('connect_time', connectTime);
      this.trackPerformance('render_time', renderTime);
    });
  }

  /**
   * Monitor for unhandled errors
   */
  initGlobalErrorHandlers() {
    if (typeof window === 'undefined') return;

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(new Error(event.reason), {
        type: 'unhandled_rejection',
      });
    });

    // Global error handler
    window.addEventListener('error', (event) => {
      this.trackError(event.error || new Error(event.message), {
        type: 'global_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });
  }

  /**
   * Helper to get user ID from session/local storage
   */
  private getUserId(): number | undefined {
    if (typeof window === 'undefined') return undefined;

    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id;
      }
    } catch (e) {
      // Ignore parsing errors
    }

    return undefined;
  }

  /**
   * Store metrics in localStorage for batch sending
   */
  private storeMetric(metric: PerformanceMetric) {
    try {
      const key = 'performance_metrics';
      const stored = localStorage.getItem(key);
      const metrics = stored ? JSON.parse(stored) : [];
      metrics.push(metric);

      // Keep only last 100 metrics
      if (metrics.length > 100) {
        metrics.shift();
      }

      localStorage.setItem(key, JSON.stringify(metrics));
    } catch (e) {
      // Ignore storage errors
    }
  }
}

// Export singleton instance
export const monitor = new Monitor();

// Convenience functions
export const logError = (error: Error, context?: Record<string, any>) =>
  monitor.trackError(error, context);

export const logApiError = (
  endpoint: string,
  status: number,
  message: string,
  context?: Record<string, any>
) => monitor.trackApiError(endpoint, status, message, context);

export const logPerformance = (name: string, value: number, metadata?: Record<string, any>) =>
  monitor.trackPerformance(name, value, metadata);

export const logAction = (
  action: string,
  category: string,
  label?: string,
  value?: number,
  metadata?: Record<string, any>
) => monitor.trackAction(action, category, label, value, metadata);

// Initialize global error handlers on client side
if (typeof window !== 'undefined') {
  monitor.initGlobalErrorHandlers();
  monitor.trackPageLoad();
}
