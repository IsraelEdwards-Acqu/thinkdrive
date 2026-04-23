// ThinkDrive Paystack Payment Integration (Ghana)
window.paystackCheckout = {
    // Get your key from https://dashboard.paystack.com/#/settings/developer
    publicKey: 'pk_live_54e054350c282bdcfa330584b5e3843e0a8d07f4',

    initiate: function(planType, amount, userId, userEmail) {
        console.log('[Paystack] Initiating payment:', planType, amount);

        const handler = PaystackPop.setup({
            key: this.publicKey,
            email: userEmail,
            amount: amount * 100, // Amount in pesewas
            currency: 'GHS',
            ref: 'TD-' + Math.floor((Math.random() * 1000000000) + 1),
            metadata: {
                custom_fields: [
                    {
                        display_name: "Plan Type",
                        variable_name: "plan_type",
                        value: planType
                    },
                    {
                        display_name: "User ID",
                        variable_name: "user_id",
                        value: userId
                    }
                ]
            },
            callback: function(response) {
                window.paystackCheckout.handleSuccess(response, planType);
            },
            onClose: function() {
                console.log('[Paystack] Payment cancelled');
                alert('Payment cancelled. You can try again anytime.');
            }
        });

        handler.openIframe();
    },

    handleSuccess: function(response, planType) {
        console.log('[Paystack] Payment successful:', response.reference);

        // Save to Firebase
        fetch('/api/process-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                reference: response.reference,
                planType: planType
            })
        })
        .then(() => {
            alert('✅ Payment successful! Your premium features are now active.');
            window.location.href = '/premium?success=true';
        })
        .catch(error => {
            console.error('[Paystack] Verification error:', error);
            alert('Payment received but verification failed. Please contact support.');
        });
    }
};