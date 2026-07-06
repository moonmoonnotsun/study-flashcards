/**
 * Mixpanel Analytics Tracker
 * For iOS App Landing Pages
 * 
 * Usage:
 * 1. Include Mixpanel SDK in <head>
 * 2. Include this file after Mixpanel SDK
 * 3. Initialize: MixpanelTracker.init('YOUR_PROJECT_TOKEN')
 */

(function() {
    'use strict';

    // Don't check Mixpanel here - it might load later
    // We'll check it in the init function instead

    const MixpanelTracker = {
        // Configuration
        config: {
            projectToken: null,
            projectName: null, // e.g., 'metronome', 'decibel', 'beatmaker', 'soundboard', 'main'
            debug: false, // Set to true for development
            throttleScroll: true
        },

        // State
        state: {
            pageStartTime: Date.now(),
            scrollMilestones: new Set()
        },

        /**
         * Format event name with project prefix
         * @param {string} eventName - The event name
         * @returns {string} Formatted event name like [project] event_name
         */
        formatEventName: function(eventName) {
            const project = this.config.projectName || 'unknown';
            return `[${project}] ${eventName}`;
        },

        /**
         * Initialize Mixpanel tracker
         * @param {string} projectToken - Your Mixpanel project token
         * @param {object} options - Optional configuration
         */
        init: function(projectToken, options = {}) {
            if (!projectToken) {
                console.error('Mixpanel project token is required');
                return;
            }

            // Check if Mixpanel is available (stub or loaded)
            if (typeof mixpanel === 'undefined') {
                console.error('Mixpanel SDK not loaded! Make sure the official Mixpanel snippet is included before this script.');
                return;
            }

            this.config.projectToken = projectToken;
            this.config = { ...this.config, ...options };

            // Ensure projectName is set
            if (!this.config.projectName) {
                console.error('⚠️ MixpanelTracker: projectName is required! All events must have a prefix: [metronome], [decibel], [beatmaker], [soundboard], or [main]');
                // Try to infer from page path as fallback
                const pageName = this.getPageName();
                const mapping = {
                    'home': 'main',
                    'metronome': 'metronome',
                    'decibel-meter': 'decibel',
                    'beatmaker': 'beatmaker',
                    'soundboard': 'soundboard'
                };
                this.config.projectName = mapping[pageName] || 'unknown';
                if (this.config.debug) {
                    console.warn('⚠️ Inferred projectName:', this.config.projectName, 'from page:', pageName);
                }
            }

            // Don't re-initialize - Mixpanel should already be initialized by the official snippet
            // Just set user properties and start tracking

            // Set user properties
            this.setUserProperties();

            // Track initial page view
            this.trackPageView();

            // Setup event listeners
            this.setupEventListeners();

            // Setup scroll tracking
            this.setupScrollTracking();

            if (this.config.debug) {
                console.log('Mixpanel Tracker initialized');
            }
        },

        /**
         * Set user properties (device, browser, etc.)
         */
        setUserProperties: function() {
            const props = {
                device_type: this.getDeviceType(),
                browser: this.getBrowser(),
                os: this.getOS(),
                country: this.getCountry(),
                referrer: document.referrer || 'direct',
                utm_source: this.getUTMParam('utm_source'),
                utm_campaign: this.getUTMParam('utm_campaign'),
                utm_medium: this.getUTMParam('utm_medium'),
                first_seen: new Date().toISOString()
            };

            mixpanel.register(props);
        },

        /**
         * Track page view
         */
        trackPageView: function() {
            const pageName = this.getPageName();
            const pagePath = window.location.pathname;

            mixpanel.track(this.formatEventName('page_viewed'), {
                page_name: pageName,
                page_path: pagePath,
                referrer: document.referrer || 'direct',
                utm_source: this.getUTMParam('utm_source'),
                utm_campaign: this.getUTMParam('utm_campaign'),
                utm_medium: this.getUTMParam('utm_medium'),
                device_type: this.getDeviceType(),
                browser: this.getBrowser(),
                os: this.getOS(),
                country: this.getCountry()
            });

            if (this.config.debug) {
                console.log('Tracked:', this.formatEventName('page_viewed'), { page_name: pageName });
            }
        },

        /**
         * Track download button click
         */
        trackDownloadClick: function(buttonElement) {
            const appName = this.getPageName();
            const buttonLocation = this.getButtonLocation(buttonElement);
            const timeOnPage = Math.floor((Date.now() - this.state.pageStartTime) / 1000);
            const scrollDepth = this.getScrollDepth();

            mixpanel.track(this.formatEventName('download_button_clicked'), {
                app_name: appName,
                button_location: buttonLocation,
                page_name: appName,
                device_type: this.getDeviceType(),
                time_on_page: timeOnPage,
                scroll_depth: scrollDepth,
                referrer: document.referrer || 'direct',
                utm_source: this.getUTMParam('utm_source')
            });

            if (this.config.debug) {
                console.log('Tracked:', this.formatEventName('download_button_clicked'), { app_name: appName, button_location: buttonLocation });
            }
        },

        /**
         * Track logo click
         */
        trackLogoClick: function() {
            const appName = this.getPageName();

            mixpanel.track(this.formatEventName('logo_clicked'), {
                app_name: appName,
                page_name: appName,
                device_type: this.getDeviceType()
            });

            if (this.config.debug) {
                console.log('Tracked:', this.formatEventName('logo_clicked'), { app_name: appName });
            }
        },

        /**
         * Track "Learn More" click
         */
        trackLearnMoreClick: function(appName) {
            mixpanel.track(this.formatEventName('learn_more_clicked'), {
                app_name: appName,
                source_page: 'home'
            });

            if (this.config.debug) {
                console.log('Tracked:', this.formatEventName('learn_more_clicked'), { app_name: appName });
            }
        },

        /**
         * Track scroll milestone
         */
        trackScrollMilestone: function(depth) {
            if (this.state.scrollMilestones.has(depth)) {
                return; // Already tracked
            }

            this.state.scrollMilestones.add(depth);

            const timeToScroll = Math.floor((Date.now() - this.state.pageStartTime) / 1000);

            mixpanel.track(this.formatEventName('scroll_milestone'), {
                page_name: this.getPageName(),
                scroll_depth: depth,
                time_to_scroll: timeToScroll
            });

            if (this.config.debug) {
                console.log('Tracked:', this.formatEventName('scroll_milestone'), { scroll_depth: depth });
            }
        },

        /**
         * Setup event listeners
         */
        setupEventListeners: function() {
            // Track download button clicks
            document.addEventListener('click', (e) => {
                const target = e.target.closest('.btn-app-store, a[href*="apps.apple.com"]');
                if (target) {
                    e.preventDefault();
                    this.trackDownloadClick(target);
                    // Navigate after tracking
                    setTimeout(() => {
                        window.open(target.href, '_blank', 'noopener,noreferrer');
                    }, 100);
                }
            });

            // Track logo clicks (app pages only)
            const logoLink = document.querySelector('.app-icon-large a');
            if (logoLink) {
                logoLink.addEventListener('click', (e) => {
                    this.trackLogoClick();
                });
            }

            // Track "Learn More" clicks (home page only)
            const learnMoreLinks = document.querySelectorAll('.app-card');
            learnMoreLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    const appName = this.getAppNameFromCard(link);
                    if (appName) {
                        this.trackLearnMoreClick(appName);
                    }
                });
            });
        },

        /**
         * Setup scroll tracking
         */
        setupScrollTracking: function() {
            if (!this.config.throttleScroll) {
                return;
            }

            let ticking = false;
            const milestones = [25, 50, 75, 100];

            window.addEventListener('scroll', () => {
                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        const scrollDepth = this.getScrollDepth();
                        
                        milestones.forEach(milestone => {
                            if (scrollDepth >= milestone && !this.state.scrollMilestones.has(milestone)) {
                                this.trackScrollMilestone(milestone);
                            }
                        });

                        ticking = false;
                    });
                    ticking = true;
                }
            });
        },


        // Helper methods

        getPageName: function() {
            const path = window.location.pathname;
            if (path === '/' || path === '/index.html') return 'home';
            const match = path.match(/\/([^\/]+)/);
            return match ? match[1] : 'unknown';
        },

        getAppNameFromCard: function(cardElement) {
            const appNameElement = cardElement.querySelector('.app-name');
            if (!appNameElement) return null;
            
            const name = appNameElement.textContent.trim().toLowerCase();
            const mapping = {
                'metronome': 'metronome',
                'sound board': 'soundboard',
                'decibel meter': 'decibel-meter',
                'beat maker': 'beatmaker'
            };
            
            return mapping[name] || name.replace(/\s+/g, '-');
        },

        getButtonLocation: function(buttonElement) {
            // Check if button is in hero section
            if (buttonElement.closest('.app-hero')) {
                return 'hero';
            }
            // Check if button is in CTA section
            if (buttonElement.closest('.cta-section')) {
                return 'cta_section';
            }
            // Check if button is in footer
            if (buttonElement.closest('footer')) {
                return 'footer';
            }
            return 'unknown';
        },

        getScrollDepth: function() {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollDepth = Math.round((scrollTop / (documentHeight - windowHeight)) * 100);
            return Math.min(100, Math.max(0, scrollDepth));
        },

        getDeviceType: function() {
            const width = window.innerWidth;
            if (width < 768) return 'mobile';
            if (width < 1024) return 'tablet';
            return 'desktop';
        },

        getBrowser: function() {
            const ua = navigator.userAgent;
            if (ua.indexOf('Chrome') > -1) return 'Chrome';
            if (ua.indexOf('Safari') > -1) return 'Safari';
            if (ua.indexOf('Firefox') > -1) return 'Firefox';
            if (ua.indexOf('Edge') > -1) return 'Edge';
            return 'Unknown';
        },

        getOS: function() {
            const ua = navigator.userAgent;
            if (ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) return 'iOS';
            if (ua.indexOf('Android') > -1) return 'Android';
            if (ua.indexOf('Windows') > -1) return 'Windows';
            if (ua.indexOf('Mac') > -1) return 'macOS';
            if (ua.indexOf('Linux') > -1) return 'Linux';
            return 'Unknown';
        },

        getCountry: function() {
            // This is a placeholder - you'd need to use a geolocation service
            // or detect from Accept-Language header
            return 'Unknown';
        },

        getUTMParam: function(param) {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get(param) || null;
        }
    };

    // Export to global scope
    window.MixpanelTracker = MixpanelTracker;

})();
