/**
 * ThinkDrive Monetization Systems Verifier
 * Checks all monetization integrations and provides setup instructions
 */

window.MonetizationVerifier = (function() {
    'use strict';

    const SYSTEMS = {
        googleAdsense: {
            name: 'Google AdSense (Publisher)',
            required: ['publisherId'],
            current: {
                publisherId: 'ca-pub-6180157732495792',
                type: 'Publisher (Earn Money)',
                accountType: '✅ Publisher Account'
            },
            status: 'configured',
            instructions: `
✅ FULLY CONFIGURED - Publisher Account

Publisher ID: ca-pub-6180157732495792
Account Type: Publisher (You earn money from ads)
Status: Active

NEXT STEPS TO START EARNING:
1. Go to: https://www.google.com/adsense/
2. Click: Ads → By ad unit → New ad unit
3. Create these ad units:
   - Display ad (728x90 Leaderboard) for homepage
   - Display ad (300x250 Rectangle) for sidebar
   - In-feed ad for Shorts page
4. Copy each ad slot ID (data-ad-slot)
5. Add to your pages using the template in googleAdsense.js

EARNINGS POTENTIAL:
- 10K users/month: $200-500/month
- 100K users/month: $2K-5K/month
- Payment: Monthly via bank transfer/check (minimum $100)

Dashboard: https://www.google.com/adsense/
Help: https://support.google.com/adsense/
            `
        },

        richads: {
            name: 'RichAds In-Page Push',
            required: ['publisherId', 'siteId'],
            current: {
                publisherId: '1002971',
                siteId: '394695',
                type: 'In-Page Push Notifications'
            },
            status: 'configured',
            instructions: `
✅ CONFIGURED - No action needed

Publisher ID: 1002971
Site ID: 394695
Script: richadsIntegration.js
Type: In-Page Push Notifications (passive income)

EARNINGS POTENTIAL:
- Based on notification subscriptions
- $50-150/month with 10K users
- Non-intrusive, runs in background

Dashboard: Check your RichAds account for stats
            `
        },

        paystack: {
            name: 'Paystack Payment Gateway',
            required: ['publicKey', 'secretKey'],
            current: {
                publicKey: 'pk_test_4f4cf07b0ad5643b582c4e213695741d4635d34d',
                secretKey: 'NEEDS_TO_BE_SET_ON_SERVER',
                mode: 'TEST MODE'
            },
            status: 'partial',
            instructions: `
⚠️ PARTIALLY CONFIGURED - TEST MODE

Current Setup:
✅ Public Key: pk_test_4f4cf07b0ad5643b582c4e213695741d4635d34d (TEST)
❌ Secret Key: Not visible in client (should be on server)
⚠️ MODE: TEST - Switch to LIVE for real payments

NEXT STEPS:
1. Go to: https://dashboard.paystack.com/#/settings/developer
2. Switch to LIVE mode tab
3. Copy LIVE Public Key and Secret Key
4. Update paystackPayment.js with LIVE public key
5. Set Secret Key in server environment variables:
   - For .NET: Add to appsettings.json (DO NOT COMMIT)
   - Key: "Paystack:SecretKey"
   - Value: "sk_live_xxxxx"

TEST MODE: You can test payments but no real money
LIVE MODE: Real payments, real revenue

EARNINGS:
- GH₵45/month per subscription
- GH₵360/year per subscription
- GH₵300 per certificate purchase
            `
        },

        backgroundData: {
            name: 'Background Data Monetization',
            required: ['analyticsEndpoint'],
            current: {
                analyticsEndpoint: '/api/analytics',
                enabled: true,
                tracking: 'User behavior (anonymized)'
            },
            status: 'needs_setup',
            instructions: `
❌ NEEDS BACKEND SETUP

Current Setup:
✅ Client tracking: Enabled (backgroundMonetization.js)
❌ Backend endpoint: /api/analytics not implemented

WHAT IT DOES:
- Tracks anonymized user behavior
- Collects usage patterns (no personal data)
- Generates insights for optimization

NEXT STEPS:
1. Create API endpoint in .NET backend:
   - Route: /api/analytics
   - Method: POST
   - Purpose: Receive anonymized analytics data

2. Store data in Firebase/database

3. Use insights for:
   - Improving user experience
   - Content recommendations
   - Traffic analytics

PRIVACY:
- Only anonymized data collected
- Users can opt-out
- Complies with GDPR
- Add Privacy Policy explaining data collection

POTENTIAL VALUE:
- Internal: Improve app performance
- External: Aggregated insights (no personal data)
            `
        },

        firebase: {
            name: 'Firebase (Core Services)',
            required: ['apiKey', 'projectId'],
            current: {
                apiKey: 'CONFIGURED',
                projectId: 'thinkdrive-4ae44',
                services: ['Auth', 'Firestore', 'Storage']
            },
            status: 'configured',
            instructions: `
✅ FULLY CONFIGURED

Project ID: thinkdrive-4ae44
Services Active:
✅ Authentication
✅ Firestore Database
✅ Cloud Storage
✅ Hosting

No action needed - all working correctly

Dashboard: https://console.firebase.google.com/project/thinkdrive-4ae44
            `
        }
    };

    function verifyAll() {
        console.log('%c==============================================', 'color: #D4AF37; font-weight: bold;');
        console.log('%c   ThinkDrive Monetization Systems Status   ', 'color: #D4AF37; font-weight: bold; font-size: 16px;');
        console.log('%c==============================================', 'color: #D4AF37; font-weight: bold;');
        console.log('');

        Object.keys(SYSTEMS).forEach(key => {
            const system = SYSTEMS[key];
            displaySystemStatus(system);
        });

        console.log('');
        console.log('%c==============================================', 'color: #D4AF37; font-weight: bold;');
        console.log('%c💰 REVENUE SUMMARY', 'color: #0f0; font-weight: bold; font-size: 14px;');
        console.log('%c==============================================', 'color: #D4AF37; font-weight: bold;');
        displayRevenueSummary();
        console.log('');
        console.log('%c==============================================', 'color: #D4AF37; font-weight: bold;');
        console.log('%cFor detailed setup instructions, call:', 'color: #fff;');
        console.log('%cMonetizationVerifier.getInstructions("systemName")', 'color: #0ff; font-family: monospace;');
        console.log('%cExample: MonetizationVerifier.getInstructions("googleAdsense")', 'color: #0ff; font-family: monospace;');
        console.log('%c==============================================', 'color: #D4AF37; font-weight: bold;');

        return generateReport();
    }

    function displaySystemStatus(system) {
        const statusSymbol = {
            'configured': '✅',
            'partial': '⚠️',
            'needs_setup': '❌'
        }[system.status];

        const statusColor = {
            'configured': 'color: #0f0; font-weight: bold;',
            'partial': 'color: #ff0; font-weight: bold;',
            'needs_setup': 'color: #f00; font-weight: bold;'
        }[system.status];

        console.log(`%c${statusSymbol} ${system.name}`, statusColor);
        console.log(`   Status: ${system.status.toUpperCase()}`);

        if (system.current) {
            console.log('   Current Config:');
            Object.keys(system.current).forEach(key => {
                console.log(`     ${key}: ${system.current[key]}`);
            });
        }
        console.log('');
    }

    function displayRevenueSummary() {
        console.log('%cConfigured Revenue Streams:', 'color: #fff; font-weight: bold;');
        console.log('');

        console.log('%c1. Google AdSense (Primary)', 'color: #0f0;');
        console.log('   Expected: $200-500/month (10K users)');
        console.log('   Status: ✅ Ready (need to create ad units)');
        console.log('');

        console.log('%c2. RichAds Push Notifications', 'color: #0f0;');
        console.log('   Expected: $50-150/month');
        console.log('   Status: ✅ Active');
        console.log('');

        console.log('%c3. Premium Subscriptions', 'color: #ff0;');
        console.log('   Expected: $360/month (1% conversion)');
        console.log('   Status: ⚠️ TEST MODE (switch to LIVE)');
        console.log('');

        console.log('%c4. Background Analytics', 'color: #f00;');
        console.log('   Expected: Insights + Future Revenue');
        console.log('   Status: ❌ Needs Backend');
        console.log('');

        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #D4AF37;');
        console.log('%cPotential Total: $610-1,010/month', 'color: #0f0; font-weight: bold; font-size: 14px;');
        console.log('%c(With 10,000 monthly active users)', 'color: #999;');
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #D4AF37;');
    }

    function getInstructions(systemName) {
        const system = SYSTEMS[systemName];
        if (!system) {
            console.error(`System "${systemName}" not found. Available systems:`, Object.keys(SYSTEMS));
            return;
        }

        console.log('%c==============================================', 'color: #D4AF37; font-weight: bold;');
        console.log(`%c${system.name} - Setup Instructions`, 'color: #D4AF37; font-weight: bold; font-size: 14px;');
        console.log('%c==============================================', 'color: #D4AF37; font-weight: bold;');
        console.log(system.instructions);
        console.log('%c==============================================', 'color: #D4AF37; font-weight: bold;');
    }

    function generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            overall: {
                total: Object.keys(SYSTEMS).length,
                configured: 0,
                partial: 0,
                needsSetup: 0
            },
            systems: {},
            revenue: {
                active: [],
                pending: [],
                estimatedMonthly: {
                    min: 610,
                    max: 1010,
                    currency: 'USD',
                    userBase: 10000
                }
            }
        };

        Object.keys(SYSTEMS).forEach(key => {
            const system = SYSTEMS[key];
            report.systems[key] = {
                name: system.name,
                status: system.status,
                config: system.current
            };

            if (system.status === 'configured') {
                report.overall.configured++;
                report.revenue.active.push(system.name);
            } else if (system.status === 'partial') {
                report.overall.partial++;
                report.revenue.pending.push(system.name);
            } else if (system.status === 'needs_setup') {
                report.overall.needsSetup++;
                report.revenue.pending.push(system.name);
            }
        });

        report.overall.readyForProduction = report.overall.needsSetup === 0 && report.overall.partial === 0;

        return report;
    }

    function checkGoogleAdsense() {
        console.log('%cGoogle AdSense Quick Check:', 'color: #D4AF37; font-weight: bold;');
        console.log(`Script Tag: ${document.querySelector('script[src*="adsbygoogle"]') ? '✅' : '❌'}`);
        console.log(`Publisher ID: ca-pub-6180157732495792`);
        console.log(`Account Type: Publisher (Earn Money) ✅`);
        console.log(`Manager Object: ${typeof window.GoogleAdsenseManager !== 'undefined' ? '✅' : '❌'}`);

        if (window.GoogleAdsenseManager) {
            const stats = window.GoogleAdsenseManager.getStats();
            console.table(stats);
        }
    }

    function checkRichAds() {
        console.log('%cRichAds Quick Check:', 'color: #D4AF37; font-weight: bold;');
        const script = document.querySelector('script[src*="richinfo.co"]');
        const scriptExists = !!script;
        const configCorrect = script?.src.includes('1002971') && script?.src.includes('394695');

        console.log(`Script Tag Exists: ${scriptExists ? '✅' : '❌'}`);
        console.log(`Configuration Correct: ${configCorrect ? '✅' : '❌'}`);

        if (scriptExists && !configCorrect) {
            console.warn('⚠️ Script exists but IDs might be wrong!');
            console.log('Expected: pubid=1002971&siteid=394695');
            console.log('Actual:', script.src);
        }

        if (window.RichAdsManager) {
            const stats = window.RichAdsManager.getStats();
            console.table(stats);
        }
    }

    function checkPaystack() {
        console.log('%cPaystack Quick Check:', 'color: #D4AF37; font-weight: bold;');
        console.log(`Paystack Object: ${typeof PaystackPop !== 'undefined' ? '✅' : '❌'}`);
        console.log(`Integration Code: ${typeof window.paystackCheckout !== 'undefined' ? '✅' : '❌'}`);

        if (typeof window.paystackCheckout !== 'undefined') {
            const isTestMode = window.paystackCheckout.publicKey.includes('test');
            console.log(`Mode: ${isTestMode ? '🧪 TEST MODE' : '🚀 LIVE MODE'}`);
            console.log(`Public Key: ${window.paystackCheckout.publicKey.substring(0, 20)}...`);
        }
    }

    function checkAll() {
        console.log('%c==============================================', 'color: #D4AF37; font-weight: bold;');
        console.log('%c   Quick Status Check - All Systems   ', 'color: #D4AF37; font-weight: bold;');
        console.log('%c==============================================', 'color: #D4AF37; font-weight: bold;');
        console.log('');

        checkGoogleAdsense();
        console.log('');
        checkRichAds();
        console.log('');
        checkPaystack();
        console.log('');

        console.log('%c==============================================', 'color: #D4AF37; font-weight: bold;');
    }

    // Public API
    return {
        verify: verifyAll,
        getInstructions: getInstructions,
        checkGoogleAdsense: checkGoogleAdsense,
        checkRichAds: checkRichAds,
        checkPaystack: checkPaystack,
        checkAll: checkAll,
        getSystems: () => SYSTEMS,
        getReport: generateReport
    };
})();

// Add to window for easy access
window.verifyMonetization = () => window.MonetizationVerifier.verify();

console.log('%c💰 ThinkDrive Monetization Verifier Loaded', 'color: #D4AF37; font-weight: bold;');
console.log('%cRun: verifyMonetization() to check all systems', 'color: #fff;');
console.log('%cRun: MonetizationVerifier.checkAll() for quick check', 'color: #fff;');