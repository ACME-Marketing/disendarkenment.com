/**
 * Comprehensive Error Handling and User Feedback System
 * Provides centralized error management, logging, and user notifications
 */

export class ErrorHandler {
	constructor() {
		this.errorLog = [];
		this.maxLogSize = 100;
		this.notificationContainer = null;
		this.init();
	}

	/**
	 * Initialize error handler
	 */
	init() {
		// Create notification container
		this.createNotificationContainer();
		
		// Set up global error handlers
		this.setupGlobalHandlers();
		
		// Initialize performance monitoring
		this.initPerformanceMonitoring();
	}

	/**
	 * Create notification container for user feedback
	 */
	createNotificationContainer() {
		if (typeof document === 'undefined') return;

		this.notificationContainer = document.createElement('div');
		this.notificationContainer.id = 'notification-container';
		this.notificationContainer.className = 'fixed top-4 right-4 z-50 space-y-2';
		this.notificationContainer.style.cssText = `
			position: fixed;
			top: 1rem;
			right: 1rem;
			z-index: 9999;
			display: flex;
			flex-direction: column;
			gap: 0.5rem;
			pointer-events: none;
		`;

		document.body.appendChild(this.notificationContainer);
	}

	/**
	 * Set up global error handlers
	 */
	setupGlobalHandlers() {
		if (typeof window === 'undefined') return;

		// Handle JavaScript errors
		window.addEventListener('error', (event) => {
			this.handleError({
				type: 'javascript',
				message: event.message,
				filename: event.filename,
				lineno: event.lineno,
				colno: event.colno,
				error: event.error,
				stack: event.error?.stack
			});
		});

		// Handle unhandled promise rejections
		window.addEventListener('unhandledrejection', (event) => {
			this.handleError({
				type: 'promise',
				message: event.reason?.message || 'Unhandled promise rejection',
				error: event.reason,
				stack: event.reason?.stack
			});
		});

		// Handle network errors
		this.setupNetworkErrorHandling();
	}

	/**
	 * Set up network error handling
	 */
	setupNetworkErrorHandling() {
		// Override fetch to catch network errors
		const originalFetch = window.fetch;
		window.fetch = async (...args) => {
			try {
				const response = await originalFetch(...args);
				
				if (!response.ok) {
					this.handleError({
						type: 'network',
						message: `HTTP ${response.status}: ${response.statusText}`,
						url: args[0],
						status: response.status,
						statusText: response.statusText
					});
				}
				
				return response;
			} catch (error) {
				this.handleError({
					type: 'network',
					message: error.message,
					url: args[0],
					error
				});
				throw error;
			}
		};
	}

	/**
	 * Initialize performance monitoring
	 */
	initPerformanceMonitoring() {
		if (typeof window === 'undefined' || !window.performance) return;

		// Monitor Core Web Vitals
		this.monitorCoreWebVitals();
		
		// Monitor resource loading
		this.monitorResourceLoading();
	}

	/**
	 * Monitor Core Web Vitals
	 */
	monitorCoreWebVitals() {
		// Monitor Largest Contentful Paint (LCP)
		if ('PerformanceObserver' in window) {
			try {
				const lcpObserver = new PerformanceObserver((list) => {
					const entries = list.getEntries();
					const lastEntry = entries[entries.length - 1];
					
					if (lastEntry.startTime > 2500) { // LCP threshold
						this.handlePerformanceIssue({
							type: 'lcp',
							value: lastEntry.startTime,
							threshold: 2500,
							message: 'Largest Contentful Paint is slow'
						});
					}
				});
				
				lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
			} catch (error) {
				console.warn('LCP monitoring not supported:', error);
			}

			// Monitor First Input Delay (FID)
			try {
				const fidObserver = new PerformanceObserver((list) => {
					const entries = list.getEntries();
					entries.forEach(entry => {
						if (entry.processingStart - entry.startTime > 100) { // FID threshold
							this.handlePerformanceIssue({
								type: 'fid',
								value: entry.processingStart - entry.startTime,
								threshold: 100,
								message: 'First Input Delay is high'
							});
						}
					});
				});
				
				fidObserver.observe({ entryTypes: ['first-input'] });
			} catch (error) {
				console.warn('FID monitoring not supported:', error);
			}
		}
	}

	/**
	 * Monitor resource loading
	 */
	monitorResourceLoading() {
		if ('PerformanceObserver' in window) {
			try {
				const resourceObserver = new PerformanceObserver((list) => {
					const entries = list.getEntries();
					entries.forEach(entry => {
						// Check for slow resources
						if (entry.duration > 3000) {
							this.handlePerformanceIssue({
								type: 'slow-resource',
								resource: entry.name,
								duration: entry.duration,
								threshold: 3000,
								message: `Slow resource loading: ${entry.name}`
							});
						}
						
						// Check for failed resources
						if (entry.transferSize === 0 && entry.decodedBodySize === 0) {
							this.handleError({
								type: 'resource',
								message: `Failed to load resource: ${entry.name}`,
								resource: entry.name
							});
						}
					});
				});
				
				resourceObserver.observe({ entryTypes: ['resource'] });
			} catch (error) {
				console.warn('Resource monitoring not supported:', error);
			}
		}
	}

	/**
	 * Handle errors
	 * @param {Object} errorInfo - Error information
	 */
	handleError(errorInfo) {
		// Log error
		this.logError(errorInfo);
		
		// Show user notification if appropriate
		if (this.shouldShowUserNotification(errorInfo)) {
			this.showNotification({
				type: 'error',
				message: this.getUserFriendlyMessage(errorInfo),
				duration: 5000
			});
		}
		
		// Send to analytics if available
		this.sendToAnalytics('error', errorInfo);
	}

	/**
	 * Handle performance issues
	 * @param {Object} performanceInfo - Performance issue information
	 */
	handlePerformanceIssue(performanceInfo) {
		// Log performance issue
		this.logError({
			type: 'performance',
			...performanceInfo
		});
		
		// Send to analytics
		this.sendToAnalytics('performance', performanceInfo);
	}

	/**
	 * Log error to internal log
	 * @param {Object} errorInfo - Error information
	 */
	logError(errorInfo) {
		const logEntry = {
			timestamp: new Date().toISOString(),
			userAgent: navigator.userAgent,
			url: window.location.href,
			...errorInfo
		};

		this.errorLog.push(logEntry);
		
		// Maintain log size
		if (this.errorLog.length > this.maxLogSize) {
			this.errorLog.shift();
		}

		// Console log for development
		if (process.env.NODE_ENV === 'development') {
			console.error('Error logged:', logEntry);
		}
	}

	/**
	 * Determine if error should show user notification
	 * @param {Object} errorInfo - Error information
	 * @returns {boolean}
	 */
	shouldShowUserNotification(errorInfo) {
		// Don't show notifications for certain error types
		const silentTypes = ['performance', 'analytics'];
		if (silentTypes.includes(errorInfo.type)) return false;
		
		// Don't show for minor JavaScript errors
		if (errorInfo.type === 'javascript' && errorInfo.message?.includes('Script error')) {
			return false;
		}
		
		return true;
	}

	/**
	 * Get user-friendly error message
	 * @param {Object} errorInfo - Error information
	 * @returns {string}
	 */
	getUserFriendlyMessage(errorInfo) {
		switch (errorInfo.type) {
			case 'network':
				if (errorInfo.status === 404) {
					return 'The requested page or resource was not found.';
				} else if (errorInfo.status >= 500) {
					return 'Server error. Please try again later.';
				} else if (errorInfo.message?.includes('Failed to fetch')) {
					return 'Network connection error. Please check your internet connection.';
				}
				return 'Network error occurred. Please try again.';
				
			case 'javascript':
				return 'An unexpected error occurred. Please refresh the page and try again.';
				
			case 'promise':
				return 'An error occurred while processing your request. Please try again.';
				
			case 'resource':
				return 'Failed to load some resources. The page may not function correctly.';
				
			default:
				return 'An error occurred. Please try again or contact support if the problem persists.';
		}
	}

	/**
	 * Show notification to user
	 * @param {Object} options - Notification options
	 */
	showNotification(options) {
		if (!this.notificationContainer) return;

		const notification = document.createElement('div');
		notification.className = `notification notification-${options.type}`;
		
		const bgColor = {
			error: 'bg-red-500',
			warning: 'bg-yellow-500',
			success: 'bg-green-500',
			info: 'bg-blue-500'
		}[options.type] || 'bg-gray-500';

		notification.style.cssText = `
			pointer-events: auto;
			padding: 1rem;
			border-radius: 0.5rem;
			color: white;
			font-size: 0.875rem;
			max-width: 20rem;
			box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
			transform: translateX(100%);
			transition: transform 0.3s ease-in-out;
		`;
		
		notification.classList.add(bgColor);
		
		notification.innerHTML = `
			<div class="flex items-start">
				<div class="flex-1">
					${options.message}
				</div>
				<button class="ml-2 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
					<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
					</svg>
				</button>
			</div>
		`;

		this.notificationContainer.appendChild(notification);

		// Animate in
		setTimeout(() => {
			notification.style.transform = 'translateX(0)';
		}, 10);

		// Auto-remove
		if (options.duration) {
			setTimeout(() => {
				if (notification.parentNode) {
					notification.style.transform = 'translateX(100%)';
					setTimeout(() => {
						if (notification.parentNode) {
							notification.remove();
						}
					}, 300);
				}
			}, options.duration);
		}
	}

	/**
	 * Send error data to analytics
	 * @param {string} eventType - Event type
	 * @param {Object} data - Error data
	 */
	sendToAnalytics(eventType, data) {
		if (typeof gtag !== 'undefined') {
			gtag('event', 'exception', {
				description: data.message,
				fatal: eventType === 'error',
				custom_map: {
					error_type: data.type,
					error_url: data.url || window.location.href
				}
			});
		}

		// Send to custom analytics if available
		if (window.analytics && typeof window.analytics.track === 'function') {
			window.analytics.track(`${eventType}_occurred`, {
				type: data.type,
				message: data.message,
				url: window.location.href,
				timestamp: new Date().toISOString()
			});
		}
	}

	/**
	 * Get error log
	 * @returns {Array} Error log entries
	 */
	getErrorLog() {
		return [...this.errorLog];
	}

	/**
	 * Clear error log
	 */
	clearErrorLog() {
		this.errorLog = [];
	}

	/**
	 * Export error log as JSON
	 * @returns {string} JSON string of error log
	 */
	exportErrorLog() {
		return JSON.stringify(this.errorLog, null, 2);
	}

	/**
	 * Show success notification
	 * @param {string} message - Success message
	 */
	showSuccess(message) {
		this.showNotification({
			type: 'success',
			message,
			duration: 3000
		});
	}

	/**
	 * Show warning notification
	 * @param {string} message - Warning message
	 */
	showWarning(message) {
		this.showNotification({
			type: 'warning',
			message,
			duration: 4000
		});
	}

	/**
	 * Show info notification
	 * @param {string} message - Info message
	 */
	showInfo(message) {
		this.showNotification({
			type: 'info',
			message,
			duration: 3000
		});
	}
}

// Create global instance
export const errorHandler = new ErrorHandler();

// Export utility functions
export const showSuccess = (message) => errorHandler.showSuccess(message);
export const showWarning = (message) => errorHandler.showWarning(message);
export const showInfo = (message) => errorHandler.showInfo(message);
export const showError = (message) => errorHandler.showNotification({
	type: 'error',
	message,
	duration: 5000
});

// Export default
export default errorHandler;