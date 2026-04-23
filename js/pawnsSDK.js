/**
 * ThinkDrive — Pawns.app SDK Integration
 * Provides 10% discount on student registration
 */
window.PawnsSDK = (function () {
    'use strict';

    const STORAGE_KEY = 'thinkdrive_pawns_active';
    let isActive = false;

    /**
     * Initialize Pawns.app SDK
     */
    function init() {
        try {
            // Check if Pawns is already active
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored === 'true') {
                isActive = true;
                console.log('[Pawns] SDK already active');
            }

            // Listen for Pawns activation
            window.addEventListener('pawns_activated', () => {
                isActive = true;
                localStorage.setItem(STORAGE_KEY, 'true');
                console.log('[Pawns] SDK activated');
            });

            console.log('[Pawns] SDK initialized');
        } catch (error) {
            console.error('[Pawns] Init error:', error);
        }
    }

    /**
     * Check if Pawns is active
     */
    function isActiveUser() {
        return isActive || localStorage.getItem(STORAGE_KEY) === 'true';
    }

    /**
     * Activate Pawns for discount
     */
    async function activate() {
        try {
            // In production, integrate actual Pawns.app SDK
            // For now, simulate activation
            const confirmed = confirm(
                'Subscribe to Pawns.app to earn passive income and get 10% discount on registration fees.\n\n' +
                'Do you want to activate Pawns?'
            );

            if (confirmed) {
                isActive = true;
                localStorage.setItem(STORAGE_KEY, 'true');

                // Dispatch event
                window.dispatchEvent(new CustomEvent('pawns_activated'));

                return { success: true, discount: 0.10 };
            }

            return { success: false };
        } catch (error) {
            console.error('[Pawns] Activation error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Calculate discounted price
     */
    function calculateDiscount(originalPrice) {
        if (!isActiveUser()) {
            return {
                originalPrice,
                discount: 0,
                finalPrice: originalPrice,
                hasDiscount: false
            };
        }

        const discountPercent = 0.10; // 10%
        const discountAmount = originalPrice * discountPercent;
        const finalPrice = originalPrice - discountAmount;

        return {
            originalPrice,
            discountPercent: discountPercent * 100,
            discountAmount,
            finalPrice,
            hasDiscount: true
        };
    }

    /**
     * Deactivate Pawns
     */
    function deactivate() {
        isActive = false;
        localStorage.removeItem(STORAGE_KEY);
        console.log('[Pawns] SDK deactivated');
    }

    // Auto-init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return {
        init,
        activate,
        deactivate,
        isActive: isActiveUser,
        calculateDiscount
    };
})();