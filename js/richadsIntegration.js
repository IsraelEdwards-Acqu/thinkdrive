/**
         * RichAds In-Page Push Notification Integration for ThinkDrive
         * Publisher ID: 1002971
         * Site ID: 394695 (✅ UPDATED)
         */

        window.RichAdsManager = (function () {
            'use strict';

            // ✅ YOUR ACTUAL RICHADS CONFIGURATION
            const CONFIG = {
                publisherId: '1002971',
                siteId: '394695',  // ✅ UPDATED from 394641 to 394695
                scriptUrl: 'https://richinfo.co/richpartners/in-page/js/richads-ob.js',
                enabled: true,
                
                settings: {
                    respectPremium: true,  // Don't show to premium users
                    enableLogging: true,
                    delayLoad: 2000  // Wait 2 seconds after page load
                }
            };

            let state = {
                isInitialized: false,
                scriptLoaded: false,
                isPremiumUser: false,
                adBlockDetected: false
            };

            // ===================================
            // LOGGING
            // ===================================
            function log(message, type = 'info') {
                if (!CONFIG.settings.enableLogging) return;
                
                const prefix = '[RichAds]';
                const timestamp = new Date().toLocaleTimeString();
                const fullMessage = `${prefix} [${timestamp}] ${message}`;
                
                switch(type) {
                    case 'error':
                        console.error(fullMessage);
                        break;
                    case 'warn':
                        console.warn(fullMessage);
                        break;
                    case 'success':
                        console.log(`%c${fullMessage}`, 'color: #0f0; font-weight: bold;');
                        break;
                    default:
                        console.log(fullMessage);
                }
            }

            // ===================================
            // INITIALIZATION
            // ===================================
            function initialize() {
                if (state.isInitialized) {
                    log('Already initialized', 'warn');
                    return;
                }
                
                log('🚀 Initializing RichAds In-Page Push...');
                log(`Publisher ID: ${CONFIG.publisherId}`);
                log(`Site ID: ${CONFIG.siteId}`);

                // Check premium status
                checkPremiumStatus();

                if (state.isPremiumUser) {
                    log('👑 Premium user detected - Ads disabled', 'warn');
                    return;
                }

                // Check for ad blocker
                detectAdBlocker();

                // Load RichAds script with delay
                setTimeout(() => {
                    loadRichAdsScript();
                }, CONFIG.settings.delayLoad);

                state.isInitialized = true;
                log('✅ Initialization complete', 'success');
            }

            // ===================================
            // PREMIUM CHECK
            // ===================================
            function checkPremiumStatus() {
                try {
                    const isPremium = localStorage.getItem('user_premium') === 'true';
                    state.isPremiumUser = CONFIG.settings.respectPremium && isPremium;
                    
                    if (state.isPremiumUser) {
                        log('Premium Status: YES (Ads disabled)', 'success');
                    } else {
                        log('Premium Status: NO (Ads enabled)');
                    }
                } catch (e) {
                    log('Error checking premium status: ' + e.message, 'error');
                    state.isPremiumUser = false;
                }
            }

            // ===================================
            // AD BLOCKER DETECTION
            // ===================================
            function detectAdBlocker() {
                // Simple ad blocker detection
                const testAd = document.createElement('div');
                testAd.innerHTML = '&nbsp;';
                testAd.className = 'adsbox';
                testAd.style.position = 'absolute';
                testAd.style.left = '-9999px';
                document.body.appendChild(testAd);
                
                setTimeout(() => {
                    if (testAd.offsetHeight === 0) {
                        state.adBlockDetected = true;
                        log('⚠️ Ad blocker detected', 'warn');
                    }
                    document.body.removeChild(testAd);
                }, 100);
            }

            // ===================================
            // LOAD RICHADS SCRIPT
            // ===================================
            function loadRichAdsScript() {
                if (state.scriptLoaded) {
                    log('Script already loaded', 'warn');
                    return;
                }

                if (state.adBlockDetected) {
                    log('⚠️ Skipping script load due to ad blocker', 'warn');
                    return;
                }

                log('📥 Loading RichAds script...');

                const script = document.createElement('script');
                script.src = `${CONFIG.scriptUrl}?pubid=${CONFIG.publisherId}&siteid=${CONFIG.siteId}`;
                script.async = true;
                script.setAttribute('data-richads', 'true');
                
                script.onload = () => {
                    state.scriptLoaded = true;
                    log('✅ RichAds script loaded successfully!', 'success');
                    
                    // Verify RichAds object is available
                    if (typeof window.richAds !== 'undefined' || typeof window.RichAds !== 'undefined') {
                        log('✅ RichAds API detected', 'success');
                    } else {
                        log('RichAds API not immediately available (may load async)', 'warn');
                    }
                };
                
                script.onerror = (error) => {
                    log('❌ Failed to load RichAds script', 'error');
                    log('Error details: ' + error.message, 'error');
                    state.scriptLoaded = false;
                };
                
                document.head.appendChild(script);
            }

            // ===================================
            // REFRESH (for premium status changes)
            // ===================================
            function refresh() {
                log('🔄 Refreshing RichAds...');
                
                // Re-check premium status
                const wasPremium = state.isPremiumUser;
                checkPremiumStatus();

                // If premium status changed
                if (wasPremium !== state.isPremiumUser) {
                    if (state.isPremiumUser) {
                        log('User became premium - Ads should stop showing', 'success');
                        // Remove RichAds script if possible
                        const scripts = document.querySelectorAll('script[data-richads="true"]');
                        scripts.forEach(script => script.remove());
                        state.scriptLoaded = false;
                    } else {
                        log('User is no longer premium - Re-enabling ads');
                        if (!state.scriptLoaded) {
                            loadRichAdsScript();
                        }
                    }
                }
            }

            // ===================================
            // VERIFY INTEGRATION
            // ===================================
            function verifyIntegration() {
                const report = {
                    timestamp: new Date().toISOString(),
                    config: {
                        publisherId: CONFIG.publisherId,
                        siteId: CONFIG.siteId,
                        scriptUrl: CONFIG.scriptUrl,
                        enabled: CONFIG.enabled
                    },
                    state: {
                        initialized: state.isInitialized,
                        scriptLoaded: state.scriptLoaded,
                        isPremium: state.isPremiumUser,
                        adBlockDetected: state.adBlockDetected
                    },
                    checks: {
                        scriptTagExists: !!document.querySelector('script[data-richads="true"]'),
                        richAdsObjectExists: typeof window.richAds !== 'undefined' || typeof window.RichAds !== 'undefined',
                        premiumCheckWorking: true
                    }
                };

                console.log('%c=== RichAds Integration Verification ===', 'color: #D4AF37; font-weight: bold; font-size: 14px;');
                console.table(report.config);
                console.table(report.state);
                console.table(report.checks);
                
                if (report.state.scriptLoaded && !report.state.isPremium) {
                    log('✅ Integration is working correctly!', 'success');
                } else if (report.state.isPremium) {
                    log('✅ Premium user - Ads correctly disabled', 'success');
                } else {
                    log('⚠️ Integration may have issues - Check console for details', 'warn');
                }

                return report;
            }

            // ===================================
            // STATS
            // ===================================
            function getStats() {
                return {
                    initialized: state.isInitialized,
                    scriptLoaded: state.scriptLoaded,
                    isPremium: state.isPremiumUser,
                    adBlockDetected: state.adBlockDetected,
                    publisherId: CONFIG.publisherId,
                    siteId: CONFIG.siteId,
                    scriptUrl: `${CONFIG.scriptUrl}?pubid=${CONFIG.publisherId}&siteid=${CONFIG.siteId}`
                };
            }

            // ===================================
            // PUBLIC API
            // ===================================
            return {
                init: initialize,
                refresh: refresh,
                verify: verifyIntegration,
                getStats: getStats,
                isInitialized: () => state.isInitialized,
                isPremium: () => state.isPremiumUser,
                checkPremium: checkPremiumStatus
            };
        })();

        // ===================================
        // AUTO-INITIALIZE
        // ===================================
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => {
                    window.RichAdsManager.init();
                }, 1500);
            });
        } else {
            setTimeout(() => {
                window.RichAdsManager.init();
            }, 1500);
        }

        // ===================================
        // LISTEN FOR PREMIUM STATUS CHANGES
        // ===================================
        window.addEventListener('premiumStatusChanged', () => {
            console.log('[RichAds] Premium status changed, refreshing...');
            if (window.RichAdsManager) {
                window.RichAdsManager.refresh();
            }
        });

        // ===================================
        // GLOBAL VERIFICATION COMMAND
        // ===================================
        window.verifyRichAds = function() {
            if (window.RichAdsManager) {
                return window.RichAdsManager.verify();
            } else {
                console.error('[RichAds] Manager not initialized');
                return null;
            }
        };