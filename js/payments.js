/**
 * ThinkDrive — Payment Gateway & Terms Module v2.0
 * Paystack/Flutterwave placeholder integration
 * Student Registration: 40 GHS | School Onboarding: 100 GHS
 */
window.ThinkDrivePayments = (function () {
    'use strict';

    const TERMS_ACCEPTED_KEY = 'thinkdrive_terms_accepted';

    const FEES = {
        student: { amount: 40, currency: 'GHS', label: 'Student Registration' },
        school: { amount: 100, currency: 'GHS', label: 'School Onboarding' }
    };

    const TERMS_TEXT = `
<h4 style="color:#D4AF37;margin-bottom:0.75rem;">ThinkDrive Terms & Conditions</h4>
<p><strong>Effective Date:</strong> January 2025</p>
<p><strong>1. Acceptance of Terms</strong><br>
By registering for and using ThinkDrive, you agree to comply with these Terms and Conditions. If you do not agree, do not use the platform.</p>

<p><strong>2. Platform Services</strong><br>
ThinkDrive provides driving education tools including video lessons, quizzes, marketplace access, and study materials. ThinkDrive does not directly issue driving licenses or permits.</p>

<p><strong>3. Registration & Fees</strong><br>
- Student Registration Fee: GHS 40 (one-time, non-refundable)<br>
- Driving School Onboarding Fee: GHS 100 (one-time, non-refundable)<br>
- All payments are processed through secure third-party payment gateways (Paystack/Flutterwave).</p>

<p><strong>4. User Responsibilities</strong><br>
- You must provide accurate registration information.<br>
- You are responsible for maintaining the confidentiality of your account.<br>
- You agree not to misuse the platform, engage in fraud, or violate any laws.</p>

<p><strong>5. Intellectual Property</strong><br>
All content, including videos, quizzes, images, and text, is the property of ThinkDrive and may not be reproduced without permission.</p>
<p><strong>6. Data Privacy</strong><br>
ThinkDrive collects and processes data in accordance with Ghana's Data Protection Act, 2012 (Act 843). Your data will not be sold to third parties.</p>

<p><strong>7. Disclaimer</strong><br>
ThinkDrive is an educational tool and does not guarantee passing the DVLA driving test. Success depends on individual study and practice.</p>

<p><strong>8. Governing Law</strong><br>
These terms are governed by the laws of the Republic of Ghana.</p>

<p><strong>9. Contact</strong><br>
For questions, contact us at thinkingdrive@gmail.com.</p>
    `;

    // Check if terms have been accepted
    function hasAcceptedTerms() {
        return localStorage.getItem(TERMS_ACCEPTED_KEY) === 'true';
    }

    // Show Terms and Conditions modal (returns Promise)
    function showTermsModal() {
      return new Promise((resolve, reject) => {
            // Remove existing
            const existing = document.getElementById('td-terms-overlay');
            if (existing) existing.remove();

            const overlay = document.createElement('div');
            overlay.id = 'td-terms-overlay';
            overlay.className = 'td-modal-overlay';
            overlay.innerHTML = `
                <div class="td-modal">
                    <div class="td-modal-title">
                        <i class="fas fa-file-contract"></i> Terms & Conditions
                    </div>
                    <div class="td-modal-body">${TERMS_TEXT}</div>
                    <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1rem;">
                        <input type="checkbox" id="td-terms-check" style="accent-color:#D4AF37;width:18px;height:18px;cursor:pointer;" />
                        <label for="td-terms-check" style="color:rgba(255,255,255,0.8);font-size:0.85rem;cursor:pointer;">
                            I have read and agree to the Terms & Conditions
                        </label>
                    </div>
                    <div class="td-modal-actions">
                        <button class="td-navy-btn" id="td-terms-decline">Decline</button>
                        <button class="td-gold-btn" id="td-terms-accept" disabled style="opacity:0.5;cursor:not-allowed;">
                            <i class="fas fa-check"></i> Accept & Continue
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            const checkbox = document.getElementById('td-terms-check');
            const acceptBtn = document.getElementById('td-terms-accept');
            const declineBtn = document.getElementById('td-terms-decline');

            checkbox.addEventListener('change', () => {
                acceptBtn.disabled = !checkbox.checked;
                acceptBtn.style.opacity = checkbox.checked ? '1' : '0.5';
                acceptBtn.style.cursor = checkbox.checked ? 'pointer' : 'not-allowed';
            });
acceptBtn.addEventListener('click', () => {
                if (checkbox.checked) {
                    localStorage.setItem(TERMS_ACCEPTED_KEY, 'true');
                    overlay.remove();
                    resolve(true);
                }
            });

            declineBtn.addEventListener('click', () => {
                overlay.remove();
                reject(new Error('Terms declined'));
            });
        });
    }

    // Show Payment modal
    function showPaymentModal(type) {
        return new Promise(async (resolve, reject) => {
            const fee = FEES[type];
            if (!fee) { reject(new Error('Invalid payment type')); return; }

            // Force terms acceptance first
            if (!hasAcceptedTerms()) {
                try { await showTermsModal(); }
                catch { reject(new Error('Terms not accepted')); return; }
            }

            // Remove existing
            const existing = document.getElementById('td-payment-overlay');
            if (existing) existing.remove();

            let selectedMethod = 'paystack';

            const overlay = document.createElement('div');
            overlay.id = 'td-payment-overlay';
            overlay.className = 'td-modal-overlay';
            overlay.innerHTML = `
                <div class="td-modal" style="max-width:480px;">
                    <div class="td-modal-title">
                        <i class="fas fa-credit-card"></i> ${fee.label}
                    </div>
                    <div class="td-payment-card" style="margin:0;max-width:100%;background:transparent;border:none;padding:1rem 0;">
                        <div class="td-payment-amount">${fee.amount} <span class="td-payment-currency">${fee.currency}</span></div>
                        <p style="color:rgba(255,255,255,0.6);font-size:0.85rem;margin-bottom:1.5rem;">One-time non-refundable fee</p>
                        <div class="td-payment-methods">
                            <button class="td-payment-method selected" id="td-pay-paystack" onclick="ThinkDrivePayments._selectMethod('paystack')">
                                <i class="fas fa-bolt"></i> Paystack
                            </button>
                            <button class="td-payment-method" id="td-pay-flutterwave" onclick="ThinkDrivePayments._selectMethod('flutterwave')">
                                <i class="fas fa-wave-square"></i> Flutterwave
                            </button>
                            <button class="td-payment-method" id="td-pay-momo" onclick="ThinkDrivePayments._selectMethod('momo')">
                                <i class="fas fa-mobile-alt"></i> MoMo
                            </button>
                        </div>
                    </div>
                    <div class="td-modal-actions" style="justify-content:center;gap:1rem;">
                        <button class="td-navy-btn" id="td-pay-cancel">Cancel</button>
                        <button class="td-gold-btn" id="td-pay-proceed">
                            <i class="fas fa-lock"></i> Pay ${fee.amount} ${fee.currency}
                        </button>
                    </div>
                    <p style="text-align:center;font-size:0.7rem;color:rgba(255,255,255,0.4);margin-top:1rem;">
                        <i class="fas fa-shield-alt"></i> Secured by 256-bit encryption
                    </p>
                </div>
            `;

            document.body.appendChild(overlay);

            document.getElementById('td-pay-cancel').addEventListener('click', () => {
                overlay.remove();
                reject(new Error('Payment cancelled'));
            });

            document.getElementById('td-pay-proceed').addEventListener('click', () => {
                // Simulate payment processing
                const proceedBtn = document.getElementById('td-pay-proceed');
                proceedBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                proceedBtn.disabled = true;
              setTimeout(() => {
                    overlay.remove();
                    showPaymentSuccess(fee);
                    resolve({ method: selectedMethod, amount: fee.amount, currency: fee.currency, type });
                }, 2000);
            });

            // Store method selection handler
            window.ThinkDrivePayments._selectedMethod = selectedMethod;
        });
    }

    function _selectMethod(method) {
        window.ThinkDrivePayments._selectedMethod = method;
        document.querySelectorAll('.td-payment-method').forEach(el => el.classList.remove('selected'));
        const btn = document.getElementById('td-pay-' + method);
        if (btn) btn.classList.add('selected');
    }

    function showPaymentSuccess(fee) {
        const overlay = document.createElement('div');
        overlay.className = 'td-modal-overlay';
        overlay.innerHTML = `
<div class="td-modal" style="max-width:400px;text-align:center;">
                <div style="font-size:4rem;color:#22c55e;margin-bottom:1rem;">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3 style="color:#fff;font-size:1.4rem;font-weight:800;margin-bottom:0.5rem;">Payment Successful!</h3>
                <p style="color:rgba(255,255,255,0.7);font-size:0.95rem;margin-bottom:1.5rem;">
                    ${fee.label} — ${fee.amount} ${fee.currency} has been processed.
                </p>
                <button class="td-gold-btn" onclick="this.closest('.td-modal-overlay').remove()">
                    <i class="fas fa-arrow-right"></i> Continue
                </button>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    // Trigger payment for student
    function payStudentRegistration() { return showPaymentModal('student'); }
// Trigger payment for school onboarding
    function paySchoolOnboarding() { return showPaymentModal('school'); }

    return {
        showTermsModal,
        showPaymentModal,
        payStudentRegistration,
        paySchoolOnboarding,
        hasAcceptedTerms,
        _selectMethod,
        FEES
    };
})();
