/**
 * Google AdSense Integration for ThinkDrive
 * Publisher ID: ca-pub-6180157732495792
 * Monetization: Display Ads for Non-Premium Users
 */

window.GoogleAdsenseManager = (function () {
    'use strict';

    // ===================================
    // CONFIGURATION
    // ===================================
    const CONFIG = {
        publisherId: 'ca-pub-6180157732495792',
        scriptUrl: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
        enabled: true,

        settings: {
            respectPremium: true,
            autoLoadScript: true,
            enableLogging: true
        },

        // Ad slot configurations (you'll get these from AdSense dashboard)
        adSlots: {
            homeLeaderboard: {
                slot: 'SLOT_ID_HERE', // Get from AdSense dashboard
                format: 'auto',
                responsive: true
            },
            sidebarRectangle: {
                slot: 'SLOT_ID_HERE',
                format: 'rectangle',
                responsive: true
            },
            inFeedNative: {
                slot: 'SLOT_ID_HERE',
                format: 'fluid',
                layoutKey: '-fb+5w+4e-db+86'
            }
        }
    };

    let state = {
        isInitialized: false,
        scriptLoaded: false,
        isPremiumUser: false,
        adsDisplayed: 0
    };

    // ===================================
    // LOGGING
    // ===================================
    function log(message, type = 'info') {
        if (!CONFIG.settings.enableLogging) return;

        const prefix = '[AdSense]';
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

        log('🚀 Initializing Google AdSense...');
        log(`Publisher ID: ${CONFIG.publisherId}`);

        // Check premium status
        checkPremiumStatus();

        if (state.isPremiumUser) {
            log('👑 Premium user - Ads disabled', 'warn');
            return;
        }

        // Load AdSense script
        if (CONFIG.settings.autoLoadScript) {
            loadAdSenseScript();
        }

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
                hideAllAdContainers();
            } else {
                log('Premium Status: NO (Ads enabled)');
            }
        } catch (e) {
            log('Error checking premium status: ' + e.message, 'error');
            state.isPremiumUser = false;
        }
    }

    // ===================================
    // LOAD ADSENSE SCRIPT
    // ===================================
    function loadAdSenseScript() {
        if (state.scriptLoaded) {
            log('Script already loaded', 'warn');
            return;
        }

        log('📥 Loading AdSense script...');

        const script = document.createElement('script');
        script.src = `${CONFIG.scriptUrl}?client=${CONFIG.publisherId}`;
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.setAttribute('data-ad-client', CONFIG.publisherId);

        script.onload = () => {
            state.scriptLoaded = true;
            log('✅ AdSense script loaded successfully!', 'success');

            // Initialize ads on page
            initializeAdsOnPage();
        };

        script.onerror = (error) => {
            log('❌ Failed to load AdSense script', 'error');
            log('Error details: ' + error.message, 'error');
            state.scriptLoaded = false;
        };

        document.head.appendChild(script);
    }

    // ===================================
    // INITIALIZE ADS ON PAGE
    // ===================================
    function initializeAdsOnPage() {
        log('Initializing ads on current page...');

        // Find all ad containers
        const adContainers = document.querySelectorAll('.adsense-ad');

        if (adContainers.length === 0) {
            log('No ad containers found on page', 'warn');
            return;
        }

        log(`Found ${adContainers.length} ad containers`);

        // Initialize each ad
        adContainers.forEach((container, index) => {
            try {
                if (typeof adsbygoogle !== 'undefined') {
                    (adsbygoogle = window.adsbygoogle || []).push({});
                    state.adsDisplayed++;
                    log(`Ad ${index + 1} initialized`);
                }
            } catch (error) {
                log(`Error initializing ad ${index + 1}: ${error.message}`, 'error');
            }
        });

        log(`✅ ${state.adsDisplayed} ads initialized`, 'success');
    }

    // ===================================
    // CREATE AD UNIT
    // ===================================
    function createAdUnit(containerId, slotConfig) {
        const container = document.getElementById(containerId);
        if (!container) {
            log(`Container ${containerId} not found`, 'error');
            return;
        }

        // Create ad element
        const ad = document.createElement('ins');
        ad.className = 'adsbygoogle adsense-ad';
        ad.style.display = 'block';
        ad.setAttribute('data-ad-client', CONFIG.publisherId);
        ad.setAttribute('data-ad-slot', slotConfig.slot);
        ad.setAttribute('data-ad-format', slotConfig.format);

        if (slotConfig.responsive) {
            ad.setAttribute('data-full-width-responsive', 'true');
        }

        if (slotConfig.layoutKey) {
            ad.setAttribute('data-ad-layout-key', slotConfig.layoutKey);
        }

        container.appendChild(ad);

        // Initialize ad
        try {
            if (typeof adsbygoogle !== 'undefined') {
                (adsbygoogle = window.adsbygoogle || []).push({});
                state.adsDisplayed++;
                log(`Ad created in ${containerId}`, 'success');
            }
        } catch (error) {
            log(`Error creating ad in ${containerId}: ${error.message}`, 'error');
        }
    }

    // ===================================
    // HIDE ADS
    // ===================================
    function hideAllAdContainers() {
        const adContainers = document.querySelectorAll('.adsense-ad, .adsense-container');
        adContainers.forEach(container => {
            container.style.display = 'none';
        });
        log('All ad containers hidden');
    }

    // ===================================
    // REFRESH
    // ===================================
    function refresh() {
        log('🔄 Refreshing AdSense...');

        const wasPremium = state.isPremiumUser;
        checkPremiumStatus();

        if (wasPremium !== state.isPremiumUser) {
            if (state.isPremiumUser) {
                log('User became premium - Hiding ads', 'success');
                hideAllAdContainers();
            } else {
                log('User is no longer premium - Showing ads');
                if (!state.scriptLoaded) {
                    loadAdSenseScript();
                }
            }
        }
    }

    // ===================================
    // STATS
    // ===================================
    function getStats() {
        return {
            initialized: state.isInitialized,
            scriptLoaded: state.scriptLoaded,
            isPremium: state.isPremiumUser,
            adsDisplayed: state.adsDisplayed,
            publisherId: CONFIG.publisherId
        };
    }

    // ===================================
    // PUBLIC API
    // ===================================
    return {
        init: initialize,
        refresh: refresh,
        createAd: createAdUnit,
        getStats: getStats,
        isInitialized: () => state.isInitialized,
        isPremium: () => state.isPremiumUser
    };
})();

// ===================================
// AUTO-INITIALIZE
// ===================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            window.GoogleAdsenseManager.init();
        }, 2000); // Wait 2 seconds for page to load
    });
} else {
    setTimeout(() => {
        window.GoogleAdsenseManager.init();
    }, 2000);
}

// ===================================
// LISTEN FOR PREMIUM CHANGES
// ===================================
window.addEventListener('premiumStatusChanged', () => {
    console.log('[AdSense] Premium status changed, refreshing...');
    if (window.GoogleAdsenseManager) {
        window.GoogleAdsenseManager.refresh();
    }
});