// Security and privacy utilities
export class SecurityManager {
    constructor() {
        this.csrfToken = null;
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.lastActivity = Date.now();
        this.encryptionKey = null;
        this.init();
    }

    // Initialize security features
    init() {
        this.generateCSRFToken();
        this.setupSessionManagement();
        this.setupSecurityHeaders();
        this.setupContentSecurityPolicy();
        this.setupPrivacyControls();
        this.monitorSecurity();
    }

    // CSRF Token Management
    generateCSRFToken() {
        this.csrfToken = this.generateSecureToken(32);
        
        // Store in session storage (more secure than localStorage for tokens)
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('csrf_token', this.csrfToken);
            
            // Add to all forms
            this.addCSRFTokenToForms();
        }
        
        return this.csrfToken;
    }

    addCSRFTokenToForms() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            let csrfInput = form.querySelector('input[name="csrf_token"]');
            if (!csrfInput) {
                csrfInput = document.createElement('input');
                csrfInput.type = 'hidden';
                csrfInput.name = 'csrf_token';
                form.appendChild(csrfInput);
            }
            csrfInput.value = this.csrfToken;
        });
    }

    validateCSRFToken(token) {
        return token === this.csrfToken && this.csrfToken !== null;
    }

    // Session Management
    setupSessionManagement() {
        if (typeof window === 'undefined') return;

        // Track user activity
        const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        
        activityEvents.forEach(event => {
            document.addEventListener(event, () => {
                this.updateLastActivity();
            }, { passive: true });
        });

        // Check session timeout periodically
        setInterval(() => {
            this.checkSessionTimeout();
        }, 60000); // Check every minute

        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseSession();
            } else {
                this.resumeSession();
            }
        });
    }

    updateLastActivity() {
        this.lastActivity = Date.now();
        sessionStorage.setItem('last_activity', this.lastActivity.toString());
    }

    checkSessionTimeout() {
        const now = Date.now();
        const timeSinceActivity = now - this.lastActivity;
        
        if (timeSinceActivity > this.sessionTimeout) {
            this.handleSessionTimeout();
        } else if (timeSinceActivity > this.sessionTimeout * 0.8) {
            this.showSessionWarning();
        }
    }

    handleSessionTimeout() {
        // Clear sensitive data
        this.clearSensitiveData();
        
        // Show timeout message
        this.showTimeoutModal();
        
        // Redirect to home or show login
        setTimeout(() => {
            window.location.href = '/';
        }, 5000);
    }

    showSessionWarning() {
        // Show warning that session will expire soon
        const warning = document.createElement('div');
        warning.className = 'session-warning fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded z-50';
        warning.innerHTML = `
            <div class="flex items-center">
                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                </svg>
                <span>Your session will expire in 5 minutes due to inactivity.</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-yellow-800 hover:text-yellow-900">×</button>
            </div>
        `;
        
        document.body.appendChild(warning);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (warning.parentNode) {
                warning.remove();
            }
        }, 10000);
    }

    showTimeoutModal() {
        const modal = document.createElement('div');
        modal.className = 'session-timeout-modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-8 max-w-md mx-4">
                <div class="text-center">
                    <svg class="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                    <h3 class="text-xl font-bold text-gray-900 mb-2">Session Expired</h3>
                    <p class="text-gray-600 mb-6">Your session has expired due to inactivity. You will be redirected to the home page.</p>
                    <button onclick="window.location.href='/'" class="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded">
                        Continue
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    pauseSession() {
        // Pause session timer when page is hidden
        this.sessionPaused = true;
    }

    resumeSession() {
        // Resume session timer when page is visible
        this.sessionPaused = false;
        this.updateLastActivity();
    }

    // Data Encryption
    async generateEncryptionKey() {
        if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
            return null;
        }

        try {
            const key = await window.crypto.subtle.generateKey(
                {
                    name: 'AES-GCM',
                    length: 256,
                },
                true,
                ['encrypt', 'decrypt']
            );
            
            this.encryptionKey = key;
            return key;
        } catch (error) {
            console.error('Failed to generate encryption key:', error);
            return null;
        }
    }

    async encryptData(data) {
        if (!this.encryptionKey) {
            await this.generateEncryptionKey();
        }

        if (!this.encryptionKey || typeof window === 'undefined') {
            return data; // Fallback to unencrypted
        }

        try {
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(JSON.stringify(data));
            const iv = window.crypto.getRandomValues(new Uint8Array(12));
            
            const encrypted = await window.crypto.subtle.encrypt(
                {
                    name: 'AES-GCM',
                    iv: iv,
                },
                this.encryptionKey,
                dataBuffer
            );

            return {
                encrypted: Array.from(new Uint8Array(encrypted)),
                iv: Array.from(iv)
            };
        } catch (error) {
            console.error('Encryption failed:', error);
            return data; // Fallback to unencrypted
        }
    }

    async decryptData(encryptedData) {
        if (!this.encryptionKey || !encryptedData.encrypted || !encryptedData.iv) {
            return encryptedData; // Return as-is if not encrypted
        }

        try {
            const encrypted = new Uint8Array(encryptedData.encrypted);
            const iv = new Uint8Array(encryptedData.iv);
            
            const decrypted = await window.crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: iv,
                },
                this.encryptionKey,
                encrypted
            );

            const decoder = new TextDecoder();
            const decryptedText = decoder.decode(decrypted);
            return JSON.parse(decryptedText);
        } catch (error) {
            console.error('Decryption failed:', error);
            return encryptedData; // Return as-is if decryption fails
        }
    }

    // Secure Storage
    setSecureItem(key, value) {
        if (typeof window === 'undefined') return;

        try {
            const encryptedValue = this.encryptData(value);
            sessionStorage.setItem(key, JSON.stringify(encryptedValue));
        } catch (error) {
            console.error('Secure storage failed:', error);
            // Fallback to regular storage
            sessionStorage.setItem(key, JSON.stringify(value));
        }
    }

    async getSecureItem(key) {
        if (typeof window === 'undefined') return null;

        try {
            const stored = sessionStorage.getItem(key);
            if (!stored) return null;

            const parsed = JSON.parse(stored);
            return await this.decryptData(parsed);
        } catch (error) {
            console.error('Secure retrieval failed:', error);
            return null;
        }
    }

    // Input Sanitization
    sanitizeInput(input) {
        if (typeof input !== 'string') return input;

        return input
            .replace(/[<>]/g, '') // Remove potential HTML tags
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+=/gi, '') // Remove event handlers
            .trim();
    }

    sanitizeHTML(html) {
        if (typeof window === 'undefined') return html;

        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    }

    // Form Security
    secureForm(form) {
        if (!form) return;

        // Add CSRF token
        this.addCSRFTokenToForms();

        // Add input validation
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('input', (e) => {
                e.target.value = this.sanitizeInput(e.target.value);
            });
        });

        // Add form submission security
        form.addEventListener('submit', (e) => {
            if (!this.validateFormSecurity(form)) {
                e.preventDefault();
                this.showSecurityError('Form validation failed. Please try again.');
            }
        });
    }

    validateFormSecurity(form) {
        // Check CSRF token
        const csrfInput = form.querySelector('input[name="csrf_token"]');
        if (!csrfInput || !this.validateCSRFToken(csrfInput.value)) {
            return false;
        }

        // Check for suspicious patterns
        const formData = new FormData(form);
        for (let [key, value] of formData.entries()) {
            if (this.containsSuspiciousContent(value)) {
                return false;
            }
        }

        return true;
    }

    containsSuspiciousContent(content) {
        if (typeof content !== 'string') return false;

        const suspiciousPatterns = [
            /<script/i,
            /javascript:/i,
            /on\w+=/i,
            /<iframe/i,
            /eval\(/i,
            /document\.cookie/i,
            /window\.location/i
        ];

        return suspiciousPatterns.some(pattern => pattern.test(content));
    }

    // Privacy Controls
    setupPrivacyControls() {
        this.setupCookieConsent();
        this.setupDataRetention();
        this.setupPrivacySettings();
    }

    setupCookieConsent() {
        if (typeof window === 'undefined') return;

        const hasConsent = localStorage.getItem('cookie_consent');
        if (!hasConsent) {
            this.showCookieConsent();
        }
    }

    showCookieConsent() {
        const banner = document.createElement('div');
        banner.className = 'cookie-consent fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50';
        banner.innerHTML = `
            <div class="container mx-auto flex flex-col md:flex-row items-center justify-between">
                <div class="mb-4 md:mb-0 md:mr-4">
                    <p class="text-sm">
                        We use cookies to enhance your experience and analyze site usage. 
                        <a href="/privacy" class="underline hover:text-gray-300">Learn more</a>
                    </p>
                </div>
                <div class="flex space-x-4">
                    <button id="accept-cookies" class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded text-sm">
                        Accept All
                    </button>
                    <button id="customize-cookies" class="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded text-sm">
                        Customize
                    </button>
                    <button id="reject-cookies" class="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded text-sm">
                        Reject
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(banner);

        // Handle consent choices
        document.getElementById('accept-cookies')?.addEventListener('click', () => {
            this.setCookieConsent('all');
            banner.remove();
        });

        document.getElementById('reject-cookies')?.addEventListener('click', () => {
            this.setCookieConsent('essential');
            banner.remove();
        });

        document.getElementById('customize-cookies')?.addEventListener('click', () => {
            this.showCookieCustomization();
            banner.remove();
        });
    }

    setCookieConsent(level) {
        localStorage.setItem('cookie_consent', level);
        localStorage.setItem('cookie_consent_date', new Date().toISOString());
        
        // Enable/disable tracking based on consent
        if (level === 'all') {
            this.enableAnalytics();
        } else {
            this.disableAnalytics();
        }
    }

    showCookieCustomization() {
        const modal = document.createElement('div');
        modal.className = 'cookie-modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-8 max-w-md mx-4 max-h-96 overflow-y-auto">
                <h3 class="text-xl font-bold mb-4">Cookie Preferences</h3>
                <div class="space-y-4">
                    <div>
                        <label class="flex items-center">
                            <input type="checkbox" checked disabled class="mr-3">
                            <div>
                                <span class="font-medium">Essential Cookies</span>
                                <p class="text-sm text-gray-600">Required for basic site functionality</p>
                            </div>
                        </label>
                    </div>
                    <div>
                        <label class="flex items-center">
                            <input type="checkbox" id="analytics-cookies" class="mr-3">
                            <div>
                                <span class="font-medium">Analytics Cookies</span>
                                <p class="text-sm text-gray-600">Help us understand how you use our site</p>
                            </div>
                        </label>
                    </div>
                    <div>
                        <label class="flex items-center">
                            <input type="checkbox" id="marketing-cookies" class="mr-3">
                            <div>
                                <span class="font-medium">Marketing Cookies</span>
                                <p class="text-sm text-gray-600">Used to show relevant content and ads</p>
                            </div>
                        </label>
                    </div>
                </div>
                <div class="flex justify-end space-x-4 mt-6">
                    <button id="save-preferences" class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded">
                        Save Preferences
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('save-preferences')?.addEventListener('click', () => {
            const analytics = document.getElementById('analytics-cookies')?.checked;
            const marketing = document.getElementById('marketing-cookies')?.checked;
            
            const preferences = {
                essential: true,
                analytics: analytics,
                marketing: marketing
            };
            
            localStorage.setItem('cookie_preferences', JSON.stringify(preferences));
            this.setCookieConsent('custom');
            modal.remove();
        });
    }

    // Data Retention
    setupDataRetention() {
        // Clean up old data periodically
        setInterval(() => {
            this.cleanupOldData();
        }, 24 * 60 * 60 * 1000); // Daily cleanup
    }

    cleanupOldData() {
        if (typeof window === 'undefined') return;

        const retentionPeriod = 30 * 24 * 60 * 60 * 1000; // 30 days
        const now = Date.now();

        // Clean up session storage
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && key.includes('_timestamp')) {
                const timestamp = parseInt(sessionStorage.getItem(key) || '0');
                if (now - timestamp > retentionPeriod) {
                    const dataKey = key.replace('_timestamp', '');
                    sessionStorage.removeItem(key);
                    sessionStorage.removeItem(dataKey);
                }
            }
        }

        // Clean up local storage (be more selective)
        const localStorageKeys = ['analytics_user_id', 'form_data', 'assessment_data'];
        localStorageKeys.forEach(key => {
            const timestampKey = key + '_timestamp';
            const timestamp = parseInt(localStorage.getItem(timestampKey) || '0');
            if (timestamp && now - timestamp > retentionPeriod) {
                localStorage.removeItem(key);
                localStorage.removeItem(timestampKey);
            }
        });
    }

    // Security Monitoring
    monitorSecurity() {
        // Monitor for suspicious activity
        this.setupSecurityEventListeners();
        this.monitorNetworkRequests();
        this.detectAnomalousActivity();
    }

    setupSecurityEventListeners() {
        // Monitor for potential XSS attempts
        window.addEventListener('error', (event) => {
            if (event.message && event.message.includes('Script error')) {
                this.logSecurityEvent('potential_xss', {
                    message: event.message,
                    source: event.filename,
                    line: event.lineno
                });
            }
        });

        // Monitor for console access (potential debugging attempts)
        let devtools = false;
        setInterval(() => {
            if (window.outerHeight - window.innerHeight > 200 || window.outerWidth - window.innerWidth > 200) {
                if (!devtools) {
                    devtools = true;
                    this.logSecurityEvent('devtools_opened', {
                        timestamp: Date.now(),
                        userAgent: navigator.userAgent
                    });
                }
            } else {
                devtools = false;
            }
        }, 1000);
    }

    monitorNetworkRequests() {
        // Override fetch to monitor requests
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const response = await originalFetch(...args);
            
            // Log suspicious requests
            if (response.status >= 400) {
                this.logSecurityEvent('failed_request', {
                    url: args[0],
                    status: response.status,
                    timestamp: Date.now()
                });
            }
            
            return response;
        };
    }

    detectAnomalousActivity() {
        let clickCount = 0;
        let rapidClicks = 0;
        
        document.addEventListener('click', () => {
            clickCount++;
            
            // Reset counter every second
            setTimeout(() => {
                if (clickCount > 10) {
                    rapidClicks++;
                    if (rapidClicks > 3) {
                        this.logSecurityEvent('rapid_clicking', {
                            clickCount,
                            timestamp: Date.now()
                        });
                    }
                }
                clickCount = 0;
            }, 1000);
        });
    }

    logSecurityEvent(eventType, data) {
        console.warn('Security Event:', eventType, data);
        
        // Send to security monitoring endpoint
        if (typeof window !== 'undefined') {
            fetch('/api/security-log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    event: eventType,
                    data,
                    timestamp: Date.now(),
                    userAgent: navigator.userAgent,
                    url: window.location.href
                })
            }).catch(error => {
                console.error('Failed to log security event:', error);
            });
        }
    }

    // Utility Functions
    generateSecureToken(length = 32) {
        if (typeof window !== 'undefined' && window.crypto) {
            const array = new Uint8Array(length);
            window.crypto.getRandomValues(array);
            return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
        } else {
            // Fallback for environments without crypto
            return Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        }
    }

    clearSensitiveData() {
        if (typeof window === 'undefined') return;

        // Clear session storage
        sessionStorage.clear();
        
        // Clear specific localStorage items
        const sensitiveKeys = ['csrf_token', 'session_data', 'form_data', 'assessment_data'];
        sensitiveKeys.forEach(key => {
            localStorage.removeItem(key);
        });
        
        // Clear encryption key
        this.encryptionKey = null;
        this.csrfToken = null;
    }

    showSecurityError(message) {
        const error = document.createElement('div');
        error.className = 'security-error fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50';
        error.innerHTML = `
            <div class="flex items-center">
                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                </svg>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-red-800 hover:text-red-900">×</button>
            </div>
        `;
        
        document.body.appendChild(error);
        
        setTimeout(() => {
            if (error.parentNode) {
                error.remove();
            }
        }, 5000);
    }

    enableAnalytics() {
        // Enable analytics tracking
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('consent', 'update', {
                'analytics_storage': 'granted'
            });
        }
    }

    disableAnalytics() {
        // Disable analytics tracking
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('consent', 'update', {
                'analytics_storage': 'denied'
            });
        }
    }

    // Content Security Policy
    setupContentSecurityPolicy() {
        // This would typically be set via HTTP headers, but we can add some client-side enforcement
        if (typeof window !== 'undefined') {
            // Monitor for inline script violations
            document.addEventListener('securitypolicyviolation', (event) => {
                this.logSecurityEvent('csp_violation', {
                    violatedDirective: event.violatedDirective,
                    blockedURI: event.blockedURI,
                    documentURI: event.documentURI
                });
            });
        }
    }

    setupSecurityHeaders() {
        // Client-side security header validation
        if (typeof window !== 'undefined') {
            // Check if security headers are present
            fetch(window.location.href, { method: 'HEAD' })
                .then(response => {
                    const securityHeaders = [
                        'X-Content-Type-Options',
                        'X-Frame-Options',
                        'X-XSS-Protection',
                        'Strict-Transport-Security'
                    ];
                    
                    securityHeaders.forEach(header => {
                        if (!response.headers.get(header)) {
                            console.warn(`Missing security header: ${header}`);
                        }
                    });
                })
                .catch(error => {
                    console.error('Failed to check security headers:', error);
                });
        }
    }

    setupPrivacySettings() {
        // Initialize privacy settings UI
        this.createPrivacySettingsPanel();
    }

    createPrivacySettingsPanel() {
        // This would create a privacy settings panel that users can access
        // Implementation would depend on specific UI requirements
    }
}

// Initialize security manager
export const security = new SecurityManager();

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => security.init());
    } else {
        security.init();
    }
}