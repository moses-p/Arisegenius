// Payment Page JavaScript

// Payment processing state
let selectedPaymentMethod = null;
let selectedMobileProvider = null;

// Initialize payment page
document.addEventListener('DOMContentLoaded', function() {
    initializePaymentOptions();
    initializeFormValidation();
    initializeAnimations();
});

// Initialize payment options
function initializePaymentOptions() {
    const paymentOptions = document.querySelectorAll('.payment-option');
    const paymentRadios = document.querySelectorAll('input[name="payment-method"]');
    
    paymentRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                selectedPaymentMethod = this.value;
                showPaymentDetails(this.value);
                updatePaymentOptionSelection(this.value);
            }
        });
    });
    
    // Mobile money provider selection
    const mobileButtons = document.querySelectorAll('.select-mobile');
    mobileButtons.forEach(button => {
        button.addEventListener('click', function() {
            selectedMobileProvider = this.getAttribute('data-provider');
            selectMobileProvider(this);
        });
    });
}

// Show payment details based on selection
function showPaymentDetails(method) {
    // Hide all payment details
    const allDetails = document.querySelectorAll('.payment-details');
    allDetails.forEach(detail => {
        detail.classList.remove('active');
    });
    
    // Show selected payment details
    const selectedDetails = document.getElementById(`${method}-details`);
    if (selectedDetails) {
        selectedDetails.classList.add('active');
    }
    
    // Update payment method used for success page
    const methodNames = {
        'mobile-money': 'Mobile Money',
        'paypal': 'PayPal',
        'credit-card': 'Credit Card'
    };
    
    document.getElementById('payment-method-used').textContent = methodNames[method] || method;
}

// Update payment option selection styling
function updatePaymentOptionSelection(method) {
    const paymentOptions = document.querySelectorAll('.payment-option');
    paymentOptions.forEach(option => {
        option.classList.remove('selected');
        if (option.getAttribute('data-method') === method) {
            option.classList.add('selected');
        }
    });
}

// Select mobile money provider
function selectMobileProvider(button) {
    // Remove active class from all mobile options
    const mobileOptions = document.querySelectorAll('.mobile-option');
    mobileOptions.forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add active class to selected option
    button.closest('.mobile-option').classList.add('selected');
    
    // Update button text
    const allButtons = document.querySelectorAll('.select-mobile');
    allButtons.forEach(btn => {
        btn.textContent = 'Select';
    });
    button.textContent = 'Selected';
}

// Proceed with payment
function proceedPayment() {
    if (!selectedPaymentMethod) {
        showNotification('Please select a payment method', 'error');
        return;
    }
    
    // Validate payment method specific requirements
    if (selectedPaymentMethod === 'mobile-money' && !selectedMobileProvider) {
        showNotification('Please select a mobile money provider', 'error');
        return;
    }
    
    if (selectedPaymentMethod === 'credit-card') {
        if (!validateCreditCardForm()) {
            return;
        }
    }
    
    // Start payment processing
    startPaymentProcessing();
}

// Validate credit card form
function validateCreditCardForm() {
    const form = document.getElementById('card-form');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Basic validation
    if (!data.cardNumber || !data.expiryDate || !data.cvv || !data.cardName || !data.billingAddress) {
        showNotification('Please fill in all credit card details', 'error');
        return false;
    }
    
    // Card number validation (basic)
    const cardNumber = data.cardNumber.replace(/\s/g, '');
    if (cardNumber.length < 13 || cardNumber.length > 19) {
        showNotification('Please enter a valid card number', 'error');
        return false;
    }
    
    // Expiry date validation
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryRegex.test(data.expiryDate)) {
        showNotification('Please enter a valid expiry date (MM/YY)', 'error');
        return false;
    }
    
    // CVV validation
    if (data.cvv.length < 3 || data.cvv.length > 4) {
        showNotification('Please enter a valid CVV', 'error');
        return false;
    }
    
    return true;
}

// Start payment processing
function startPaymentProcessing() {
    // Hide payment methods section
    document.querySelector('.payment-methods').style.display = 'none';
    
    // Show processing section
    const processingSection = document.getElementById('payment-processing');
    processingSection.style.display = 'block';
    
    // Start processing steps
    processPaymentSteps();
}

// Process payment steps
function processPaymentSteps() {
    const steps = [
        { id: 'step-1', delay: 1000 },
        { id: 'step-2', delay: 2000 },
        { id: 'step-3', delay: 1500 }
    ];
    
    let currentStep = 0;
    
    function processNextStep() {
        if (currentStep < steps.length) {
            const step = steps[currentStep];
            
            setTimeout(() => {
                // Mark current step as completed
                const stepElement = document.getElementById(step.id);
                stepElement.classList.add('completed');
                
                // Move to next step
                currentStep++;
                
                if (currentStep < steps.length) {
                    // Activate next step
                    const nextStep = document.getElementById(steps[currentStep].id);
                    nextStep.classList.add('active');
                }
                
                processNextStep();
            }, step.delay);
        } else {
            // All steps completed, show success
            setTimeout(() => {
                showPaymentSuccess();
            }, 1000);
        }
    }
    
    processNextStep();
}

// Show payment success
function showPaymentSuccess() {
    // Hide processing section
    document.getElementById('payment-processing').style.display = 'none';
    
    // Show success section
    document.getElementById('payment-success').style.display = 'block';
    
    // Track analytics
    if (typeof Analytics !== 'undefined') {
        Analytics.trackEvent('Payment', 'Payment Completed', selectedPaymentMethod);
    }
    
    // Generate order number
    const orderNumber = generateOrderNumber();
    document.querySelector('.detail-item .value').textContent = orderNumber;
}

// Generate order number
function generateOrderNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `#AG-2024-${random.toString().padStart(6, '0')}`;
}

// Download receipt
function downloadReceipt() {
    // Create receipt content
    const receiptContent = generateReceiptContent();
    
    // Create and download file
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'arisegenius-receipt.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    // Track analytics
    if (typeof Analytics !== 'undefined') {
        Analytics.trackEvent('Payment', 'Receipt Downloaded', selectedPaymentMethod);
    }
}

// Generate receipt content
function generateReceiptContent() {
    const orderNumber = document.querySelector('.detail-item .value').textContent;
    const paymentMethod = document.getElementById('payment-method-used').textContent;
    const amount = '$555.50';
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    
    return `
ARISEGENIUS - PAYMENT RECEIPT
============================

Order Number: ${orderNumber}
Date: ${date}
Time: ${time}
Payment Method: ${paymentMethod}
Amount: ${amount}

Items:
- Arisegenius Comfort Pro (205/55R16) x4: $480.00
- Shipping: $25.00
- Tax: $50.50
- Total: ${amount}

Thank you for choosing Arisegenius!
Your order will be processed and shipped within 3-5 business days.

For support, contact us at:
Email: support@arisegenius.com
Phone: +234-xxx-xxxx

ARISEGENIUS - Leading African Tire Innovation
    `;
}

// Track order
function trackOrder() {
    const orderNumber = document.querySelector('.detail-item .value').textContent;
    
    // Show tracking modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Track Your Order</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="tracking-info">
                    <p><strong>Order Number:</strong> ${orderNumber}</p>
                    <p><strong>Status:</strong> Processing</p>
                    <p><strong>Estimated Delivery:</strong> 3-5 business days</p>
                    
                    <div class="tracking-steps">
                        <div class="tracking-step completed">
                            <div class="step-icon">
                                <i class="fas fa-check"></i>
                            </div>
                            <div class="step-content">
                                <h4>Order Confirmed</h4>
                                <p>Your payment has been processed successfully</p>
                                <span class="step-time">Just now</span>
                            </div>
                        </div>
                        
                        <div class="tracking-step active">
                            <div class="step-icon">
                                <i class="fas fa-cog fa-spin"></i>
                            </div>
                            <div class="step-content">
                                <h4>Processing</h4>
                                <p>Your order is being prepared for shipment</p>
                                <span class="step-time">In progress</span>
                            </div>
                        </div>
                        
                        <div class="tracking-step">
                            <div class="step-icon">
                                <i class="fas fa-truck"></i>
                            </div>
                            <div class="step-content">
                                <h4>Shipped</h4>
                                <p>Your order is on its way</p>
                                <span class="step-time">Pending</span>
                            </div>
                        </div>
                        
                        <div class="tracking-step">
                            <div class="step-icon">
                                <i class="fas fa-home"></i>
                            </div>
                            <div class="step-content">
                                <h4>Delivered</h4>
                                <p>Your order has been delivered</p>
                                <span class="step-time">Pending</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    modal.querySelector('.modal-close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // Track analytics
    if (typeof Analytics !== 'undefined') {
        Analytics.trackEvent('Payment', 'Track Order', orderNumber);
    }
}

// Initialize form validation
function initializeFormValidation() {
    const cardForm = document.getElementById('card-form');
    if (cardForm) {
        const inputs = cardForm.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                validateField(this);
            });
            
            input.addEventListener('blur', function() {
                validateField(this);
            });
        });
    }
}

// Validate individual field
function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Clear previous error
    clearFieldError(field);
    
    switch (field.name) {
        case 'cardNumber':
            const cardNumber = value.replace(/\s/g, '');
            if (value && (cardNumber.length < 13 || cardNumber.length > 19)) {
                isValid = false;
                errorMessage = 'Please enter a valid card number';
            }
            break;
            
        case 'expiryDate':
            const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
            if (value && !expiryRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid expiry date (MM/YY)';
            }
            break;
            
        case 'cvv':
            if (value && (value.length < 3 || value.length > 4)) {
                isValid = false;
                errorMessage = 'Please enter a valid CVV';
            }
            break;
            
        case 'cardName':
            if (value && value.length < 2) {
                isValid = false;
                errorMessage = 'Please enter a valid name';
            }
            break;
    }
    
    if (!isValid) {
        showFieldError(field, errorMessage);
    }
    
    return isValid;
}

// Show field error
function showFieldError(field, message) {
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.textContent = message;
    } else {
        const error = document.createElement('div');
        error.className = 'field-error';
        error.style.color = '#ff6b6b';
        error.style.fontSize = '0.9rem';
        error.style.marginTop = '5px';
        error.textContent = message;
        field.parentNode.appendChild(error);
    }
    field.style.borderColor = '#ff6b6b';
}

// Clear field error
function clearFieldError(field) {
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
    field.style.borderColor = '';
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'error' ? '#ff6b6b' : '#28a745'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Initialize animations
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.payment-option, .order-item');
    animatedElements.forEach((element, index) => {
        element.style.animationDelay = `${index * 0.1}s`;
        observer.observe(element);
    });
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .tracking-step {
        display: flex;
        align-items: flex-start;
        gap: 15px;
        margin-bottom: 20px;
        opacity: 0.5;
        transition: opacity 0.3s ease;
    }
    
    .tracking-step.active,
    .tracking-step.completed {
        opacity: 1;
    }
    
    .step-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--border-gray);
        color: var(--text-gray);
        flex-shrink: 0;
    }
    
    .tracking-step.active .step-icon {
        background: var(--accent-gold);
        color: var(--primary-black);
    }
    
    .tracking-step.completed .step-icon {
        background: #28a745;
        color: white;
    }
    
    .step-content h4 {
        font-size: 1.1rem;
        font-weight: var(--font-weight-semibold);
        color: var(--primary-white);
        margin-bottom: 5px;
    }
    
    .step-content p {
        color: var(--text-gray);
        margin-bottom: 5px;
    }
    
    .step-time {
        font-size: 0.9rem;
        color: var(--accent-gold);
        font-weight: var(--font-weight-medium);
    }
    
    .mobile-option.selected {
        border-color: var(--accent-gold);
        background: rgba(215, 138, 0, 0.1);
    }
`;
document.head.appendChild(style);

// Export functions for global access
window.proceedPayment = proceedPayment;
window.downloadReceipt = downloadReceipt;
window.trackOrder = trackOrder;
