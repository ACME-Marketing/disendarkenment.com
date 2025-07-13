// Analytics and tracking utilities
export class AnalyticsManager {
    constructor() {
        this.isInitialized = false;
        this.trackingQueue = [];
        this.sessionId = this.generateSessionId();
        this.userId = this.getUserId();
        this.pageLoadTime = Date.now();
    }

    // Initialize analytics
    init() {
        if (this.isInitialized) return;
        
        this.setupGoogleAnalytics();
        this.setupCustomTracking();
        this.trackPageView();
        this.setupPerformanceTracking();
        this.setupUserEngagement();
        
        this.isInitialized = true;
        this.processQueue();
    }

    // Google Analytics setup
    setupGoogleAnalytics() {
        if (typeof window === 'undefined') return;
        
        // GA4 configuration
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        
        gtag('js', new Date());
        gtag('config', 'GA_MEASUREMENT_ID', {
            page_title: document.title,
            page_location: window.location.href,
            custom_map: {
                'custom_parameter_1': 'user_type',
                'custom_parameter_2': 'journey_stage'
            }
        });
    }

    // Custom tracking setup
    setupCustomTracking() {
        this.trackFormInteractions();
        this.trackScrollDepth();
        this.trackTimeOnPage();
        this.trackClickTracking();
        this.trackDownloads();
    }

    // Track page views
    trackPageView(path = null) {
        const page = path || window.location.pathname;
        
        this.track('page_view', {
            page_title: document.title,
            page_location: window.location.href,
            page_path: page,
            session_id: this.sessionId,
            user_id: this.userId,
            timestamp: Date.now()
        });
    }

    // Track custom events
    trackEvent(eventName, parameters = {}) {
        this.track(eventName, {
            ...parameters,
            session_id: this.sessionId,
            user_id: this.userId,
            timestamp: Date.now()
        });
    }

    // Core tracking function
    track(eventName, parameters = {}) {
        if (!this.isInitialized) {
            this.trackingQueue.push({ eventName, parameters });
            return;
        }

        // Send to Google Analytics
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', eventName, parameters);
        }

        // Send to custom analytics endpoint
        this.sendToCustomAnalytics(eventName, parameters);

        // Log for development
        if (process.env.NODE_ENV === 'development') {
            console.log('Analytics Event:', eventName, parameters);
        }
    }

    // Send to custom analytics endpoint
    async sendToCustomAnalytics(eventName, parameters) {
        try {
            await fetch('/api/analytics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    event: eventName,
                    parameters,
                    timestamp: Date.now(),
                    url: window.location.href,
                    referrer: document.referrer,
                    userAgent: navigator.userAgent
                })
            });
        } catch (error) {
            console.error('Analytics error:', error);
        }
    }

    // Form interaction tracking
    trackFormInteractions() {
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form.tagName === 'FORM') {
                this.trackEvent('form_submit', {
                    form_id: form.id || 'unknown',
                    form_name: form.name || 'unknown',
                    form_action: form.action || 'unknown'
                });
            }
        });

        document.addEventListener('focusin', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
                this.trackEvent('form_field_focus', {
                    field_name: e.target.name || 'unknown',
                    field_type: e.target.type || 'unknown',
                    form_id: e.target.form?.id || 'unknown'
                });
            }
        });
    }

    // Scroll depth tracking
    trackScrollDepth() {
        let maxScroll = 0;
        const thresholds = [25, 50, 75, 90, 100];
        const tracked = new Set();

        const trackScroll = () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );
            
            maxScroll = Math.max(maxScroll, scrollPercent);
            
            thresholds.forEach(threshold => {
                if (scrollPercent >= threshold && !tracked.has(threshold)) {
                    tracked.add(threshold);
                    this.trackEvent('scroll_depth', {
                        scroll_depth: threshold,
                        page_path: window.location.pathname
                    });
                }
            });
        };

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    trackScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // Time on page tracking
    trackTimeOnPage() {
        let startTime = Date.now();
        let isActive = true;
        let totalActiveTime = 0;
        let lastActiveTime = startTime;

        const trackTime = () => {
            if (isActive) {
                totalActiveTime += Date.now() - lastActiveTime;
            }
            lastActiveTime = Date.now();
        };

        // Track visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                trackTime();
                isActive = false;
            } else {
                isActive = true;
                lastActiveTime = Date.now();
            }
        });

        // Track before page unload
        window.addEventListener('beforeunload', () => {
            trackTime();
            this.trackEvent('time_on_page', {
                time_on_page: Math.round(totalActiveTime / 1000),
                page_path: window.location.pathname
            });
        });

        // Periodic tracking
        setInterval(() => {
            trackTime();
            if (totalActiveTime > 0) {
                this.trackEvent('engagement_time', {
                    engagement_time: Math.round(totalActiveTime / 1000),
                    page_path: window.location.pathname
                });
            }
        }, 30000); // Every 30 seconds
    }

    // Click tracking
    trackClickTracking() {
        document.addEventListener('click', (e) => {
            const element = e.target;
            
            // Track CTA clicks
            if (element.classList.contains('cta-button') || element.closest('.cta-button')) {
                this.trackEvent('cta_click', {
                    cta_text: element.textContent?.trim() || 'unknown',
                    cta_location: this.getElementLocation(element),
                    page_path: window.location.pathname
                });
            }

            // Track navigation clicks
            if (element.tagName === 'A' || element.closest('a')) {
                const link = element.tagName === 'A' ? element : element.closest('a');
                this.trackEvent('link_click', {
                    link_text: link.textContent?.trim() || 'unknown',
                    link_url: link.href || 'unknown',
                    link_type: this.getLinkType(link),
                    page_path: window.location.pathname
                });
            }

            // Track button clicks
            if (element.tagName === 'BUTTON' || element.closest('button')) {
                const button = element.tagName === 'BUTTON' ? element : element.closest('button');
                this.trackEvent('button_click', {
                    button_text: button.textContent?.trim() || 'unknown',
                    button_type: button.type || 'unknown',
                    page_path: window.location.pathname
                });
            }
        });
    }

    // Download tracking
    trackDownloads() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href) {
                const url = new URL(link.href);
                const extension = url.pathname.split('.').pop()?.toLowerCase();
                const downloadExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'rar'];
                
                if (downloadExtensions.includes(extension)) {
                    this.trackEvent('file_download', {
                        file_name: url.pathname.split('/').pop() || 'unknown',
                        file_extension: extension,
                        download_url: link.href,
                        page_path: window.location.pathname
                    });
                }
            }
        });
    }

    // Performance tracking
    setupPerformanceTracking() {
        if (typeof window === 'undefined' || !window.performance) return;

        // Track page load performance
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    this.trackEvent('page_performance', {
                        load_time: Math.round(perfData.loadEventEnd - perfData.fetchStart),
                        dom_content_loaded: Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart),
                        first_byte: Math.round(perfData.responseStart - perfData.fetchStart),
                        page_path: window.location.pathname
                    });
                }
            }, 0);
        });

        // Track Core Web Vitals if available
        if ('PerformanceObserver' in window) {
            try {
                // Largest Contentful Paint
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    this.trackEvent('core_web_vital', {
                        metric_name: 'LCP',
                        metric_value: Math.round(lastEntry.startTime),
                        page_path: window.location.pathname
                    });
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

                // First Input Delay
                const fidObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach((entry) => {
                        this.trackEvent('core_web_vital', {
                            metric_name: 'FID',
                            metric_value: Math.round(entry.processingStart - entry.startTime),
                            page_path: window.location.pathname
                        });
                    });
                });
                fidObserver.observe({ entryTypes: ['first-input'] });

                // Cumulative Layout Shift
                let clsValue = 0;
                const clsObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach((entry) => {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    });
                });
                clsObserver.observe({ entryTypes: ['layout-shift'] });

                // Report CLS on page unload
                window.addEventListener('beforeunload', () => {
                    this.trackEvent('core_web_vital', {
                        metric_name: 'CLS',
                        metric_value: Math.round(clsValue * 1000) / 1000,
                        page_path: window.location.pathname
                    });
                });
            } catch (error) {
                console.error('Performance Observer error:', error);
            }
        }
    }

    // User engagement tracking
    setupUserEngagement() {
        let mouseMovements = 0;
        let keystrokes = 0;
        let clicks = 0;

        document.addEventListener('mousemove', () => mouseMovements++);
        document.addEventListener('keydown', () => keystrokes++);
        document.addEventListener('click', () => clicks++);

        // Report engagement metrics periodically
        setInterval(() => {
            if (mouseMovements > 0 || keystrokes > 0 || clicks > 0) {
                this.trackEvent('user_engagement', {
                    mouse_movements: mouseMovements,
                    keystrokes: keystrokes,
                    clicks: clicks,
                    page_path: window.location.pathname
                });
                
                // Reset counters
                mouseMovements = 0;
                keystrokes = 0;
                clicks = 0;
            }
        }, 60000); // Every minute
    }

    // Utility functions
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getUserId() {
        let userId = localStorage.getItem('analytics_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('analytics_user_id', userId);
        }
        return userId;
    }

    getElementLocation(element) {
        const rect = element.getBoundingClientRect();
        return {
            x: Math.round(rect.left + rect.width / 2),
            y: Math.round(rect.top + rect.height / 2),
            viewport_width: window.innerWidth,
            viewport_height: window.innerHeight
        };
    }

    getLinkType(link) {
        const href = link.href;
        if (href.startsWith('mailto:')) return 'email';
        if (href.startsWith('tel:')) return 'phone';
        if (href.includes(window.location.hostname)) return 'internal';
        return 'external';
    }

    processQueue() {
        while (this.trackingQueue.length > 0) {
            const { eventName, parameters } = this.trackingQueue.shift();
            this.track(eventName, parameters);
        }
    }

    // Assessment-specific tracking
    trackAssessmentStart() {
        this.trackEvent('assessment_start', {
            assessment_type: 'readiness',
            page_path: window.location.pathname
        });
    }

    trackAssessmentStep(step, totalSteps) {
        this.trackEvent('assessment_step', {
            step_number: step,
            total_steps: totalSteps,
            step_progress: Math.round((step / totalSteps) * 100),
            assessment_type: 'readiness'
        });
    }

    trackAssessmentComplete(score, readinessLevel) {
        this.trackEvent('assessment_complete', {
            assessment_score: score,
            readiness_level: readinessLevel,
            assessment_type: 'readiness',
            completion_time: Date.now() - this.pageLoadTime
        });
    }

    trackFormStart(formId) {
        this.trackEvent('form_start', {
            form_id: formId,
            page_path: window.location.pathname
        });
    }

    trackFormStep(formId, step, totalSteps) {
        this.trackEvent('form_step', {
            form_id: formId,
            step_number: step,
            total_steps: totalSteps,
            step_progress: Math.round((step / totalSteps) * 100)
        });
    }

    trackFormComplete(formId) {
        this.trackEvent('form_complete', {
            form_id: formId,
            completion_time: Date.now() - this.pageLoadTime,
            page_path: window.location.pathname
        });
    }

    // Resource tracking
    trackResourceView(resourceType, resourceName) {
        this.trackEvent('resource_view', {
            resource_type: resourceType,
            resource_name: resourceName,
            page_path: window.location.pathname
        });
    }

    trackResourceDownload(resourceName, resourceUrl) {
        this.trackEvent('resource_download', {
            resource_name: resourceName,
            resource_url: resourceUrl,
            page_path: window.location.pathname
        });
    }

    // Service tracking
    trackServiceInterest(serviceName) {
        this.trackEvent('service_interest', {
            service_name: serviceName,
            page_path: window.location.pathname
        });
    }

    trackConsultationRequest(serviceType) {
        this.trackEvent('consultation_request', {
            service_type: serviceType,
            page_path: window.location.pathname
        });
    }
}

// Initialize analytics
export const analytics = new AnalyticsManager();

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => analytics.init());
    } else {
        analytics.init();
    }
}