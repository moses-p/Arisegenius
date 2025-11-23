// Ventures Page JavaScript

// Tech Quote Modal
function showTechQuote() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Request Tech Quote</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <form class="tech-quote-form" id="tech-quote-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="company-name">Company Name</label>
                            <input type="text" id="company-name" name="companyName" required>
                        </div>
                        <div class="form-group">
                            <label for="contact-person">Contact Person</label>
                            <input type="text" id="contact-person" name="contactPerson" required>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" id="email" name="email" required>
                        </div>
                        <div class="form-group">
                            <label for="phone">Phone</label>
                            <input type="tel" id="phone" name="phone" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="project-type">Project Type</label>
                        <select id="project-type" name="projectType" required>
                            <option value="">Select Project Type</option>
                            <option value="erp">ERP System</option>
                            <option value="mobile">Mobile Application</option>
                            <option value="web">Web Application</option>
                            <option value="ecommerce">E-commerce Platform</option>
                            <option value="api">API Development</option>
                            <option value="integration">System Integration</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="industry">Industry</label>
                        <select id="industry" name="industry" required>
                            <option value="">Select Industry</option>
                            <option value="manufacturing">Manufacturing</option>
                            <option value="retail">Retail</option>
                            <option value="finance">Finance</option>
                            <option value="healthcare">Healthcare</option>
                            <option value="education">Education</option>
                            <option value="logistics">Logistics</option>
                            <option value="agriculture">Agriculture</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="timeline">Project Timeline</label>
                        <select id="timeline" name="timeline" required>
                            <option value="">Select Timeline</option>
                            <option value="1-3months">1-3 months</option>
                            <option value="3-6months">3-6 months</option>
                            <option value="6-12months">6-12 months</option>
                            <option value="12+months">12+ months</option>
                            <option value="flexible">Flexible</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="budget">Budget Range</label>
                        <select id="budget" name="budget" required>
                            <option value="">Select Budget Range</option>
                            <option value="under-10k">Under $10,000</option>
                            <option value="10k-25k">$10,000 - $25,000</option>
                            <option value="25k-50k">$25,000 - $50,000</option>
                            <option value="50k-100k">$50,000 - $100,000</option>
                            <option value="over-100k">Over $100,000</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="current-systems">Current Systems</label>
                        <textarea id="current-systems" name="currentSystems" rows="3" placeholder="Describe your current systems and any integration requirements..."></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="requirements">Project Requirements</label>
                        <textarea id="requirements" name="requirements" rows="4" placeholder="Describe your project requirements in detail..." required></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="additional-info">Additional Information</label>
                        <textarea id="additional-info" name="additionalInfo" rows="3" placeholder="Any other relevant information..."></textarea>
                    </div>
                    
                    <button type="submit" class="btn-primary">
                        <span>Submit Quote Request</span>
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </form>
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
    
    // Form submission
    const form = modal.querySelector('#tech-quote-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleTechQuoteSubmission(form);
    });
}

// Creative Consultation Modal
function showCreativeConsultation() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Request Creative Consultation</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <form class="creative-consultation-form" id="creative-consultation-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="company-name">Company Name</label>
                            <input type="text" id="company-name" name="companyName" required>
                        </div>
                        <div class="form-group">
                            <label for="contact-person">Contact Person</label>
                            <input type="text" id="contact-person" name="contactPerson" required>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" id="email" name="email" required>
                        </div>
                        <div class="form-group">
                            <label for="phone">Phone</label>
                            <input type="tel" id="phone" name="phone" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="service-type">Service Type</label>
                        <select id="service-type" name="serviceType" required>
                            <option value="">Select Service Type</option>
                            <option value="branding">Complete Brand Identity</option>
                            <option value="rebrand">Brand Rebranding</option>
                            <option value="digital-marketing">Digital Marketing Strategy</option>
                            <option value="website-design">Website Design</option>
                            <option value="social-media">Social Media Strategy</option>
                            <option value="consultation">General Brand Consultation</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="industry">Industry</label>
                        <select id="industry" name="industry" required>
                            <option value="">Select Industry</option>
                            <option value="manufacturing">Manufacturing</option>
                            <option value="retail">Retail</option>
                            <option value="finance">Finance</option>
                            <option value="healthcare">Healthcare</option>
                            <option value="education">Education</option>
                            <option value="technology">Technology</option>
                            <option value="nonprofit">Non-profit</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="company-size">Company Size</label>
                        <select id="company-size" name="companySize" required>
                            <option value="">Select Company Size</option>
                            <option value="startup">Startup (1-10 employees)</option>
                            <option value="small">Small (11-50 employees)</option>
                            <option value="medium">Medium (51-200 employees)</option>
                            <option value="large">Large (200+ employees)</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="timeline">Project Timeline</label>
                        <select id="timeline" name="timeline" required>
                            <option value="">Select Timeline</option>
                            <option value="urgent">Urgent (1-2 weeks)</option>
                            <option value="1month">1 month</option>
                            <option value="2-3months">2-3 months</option>
                            <option value="3-6months">3-6 months</option>
                            <option value="flexible">Flexible</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="budget">Budget Range</label>
                        <select id="budget" name="budget" required>
                            <option value="">Select Budget Range</option>
                            <option value="under-5k">Under $5,000</option>
                            <option value="5k-15k">$5,000 - $15,000</option>
                            <option value="15k-30k">$15,000 - $30,000</option>
                            <option value="30k-50k">$30,000 - $50,000</option>
                            <option value="over-50k">Over $50,000</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="current-brand">Current Brand Status</label>
                        <textarea id="current-brand" name="currentBrand" rows="3" placeholder="Describe your current brand, logo, and marketing materials..."></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="goals">Brand Goals & Objectives</label>
                        <textarea id="goals" name="goals" rows="4" placeholder="What are your brand goals? What message do you want to convey?" required></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="target-audience">Target Audience</label>
                        <textarea id="target-audience" name="targetAudience" rows="3" placeholder="Describe your target audience and customer demographics..."></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="competitors">Competitors</label>
                        <textarea id="competitors" name="competitors" rows="3" placeholder="Who are your main competitors? What makes you different?"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="additional-info">Additional Information</label>
                        <textarea id="additional-info" name="additionalInfo" rows="3" placeholder="Any other relevant information about your project..."></textarea>
                    </div>
                    
                    <button type="submit" class="btn-primary">
                        <span>Submit Consultation Request</span>
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </form>
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
    
    // Form submission
    const form = modal.querySelector('#creative-consultation-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleCreativeConsultationSubmission(form);
    });
}

// Handle Tech Quote Submission
function handleTechQuoteSubmission(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<div class="loading"></div> Submitting...';
    submitButton.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Track analytics
        if (typeof Analytics !== 'undefined') {
            Analytics.trackEvent('Ventures', 'Tech Quote Request', data.projectType);
        }
        
        // Show success message
        showSuccessMessage('Tech Quote Request', 'Thank you for your interest! Our tech team will review your requirements and contact you within 24 hours with a detailed quote.');
        
        // Close modal
        const modal = form.closest('.modal-overlay');
        document.body.removeChild(modal);
        
        // Reset button
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }, 2000);
}

// Handle Creative Consultation Submission
function handleCreativeConsultationSubmission(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<div class="loading"></div> Submitting...';
    submitButton.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Track analytics
        if (typeof Analytics !== 'undefined') {
            Analytics.trackEvent('Ventures', 'Creative Consultation Request', data.serviceType);
        }
        
        // Show success message
        showSuccessMessage('Creative Consultation Request', 'Thank you for your interest! Our creative team will review your requirements and contact you within 24 hours to schedule a consultation.');
        
        // Close modal
        const modal = form.closest('.modal-overlay');
        document.body.removeChild(modal);
        
        // Reset button
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }, 2000);
}

// Show Success Message
function showSuccessMessage(title, message) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content success-modal">
            <div class="modal-header">
                <h3>${title} Submitted Successfully!</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="success-content">
                    <div class="success-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <p>${message}</p>
                    <div class="success-actions">
                        <button class="btn-primary" onclick="closeSuccessModal()">Close</button>
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
}

// Close Success Modal
function closeSuccessModal() {
    const modal = document.querySelector('.success-modal').closest('.modal-overlay');
    if (modal) {
        document.body.removeChild(modal);
    }
}

// Handle Main Contact Form
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('ventures-contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleMainContactSubmission(this);
        });
    }
});

// Handle Main Contact Form Submission
function handleMainContactSubmission(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<div class="loading"></div> Sending...';
    submitButton.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Track analytics
        if (typeof Analytics !== 'undefined') {
            Analytics.trackEvent('Ventures', 'Contact Form Submission', data.service);
        }
        
        // Show success message
        showSuccessMessage('Contact Form', 'Thank you for reaching out! Our team will review your message and contact you within 24 hours.');
        
        // Reset form
        form.reset();
        
        // Reset button
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }, 2000);
}

// Enhanced Animation Controller for Ventures Page
class VenturesAnimationController {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, this.observerOptions);
        
        this.init();
    }
    
    init() {
        // Add animation classes to elements
        const animatedElements = document.querySelectorAll('.venture-card, .case-study, .advantage-item');
        animatedElements.forEach((element, index) => {
            element.style.animationDelay = `${index * 0.2}s`;
            this.observer.observe(element);
        });
    }
}

// Initialize Ventures Animations
const venturesAnimationController = new VenturesAnimationController();

// Floating Elements Animation Enhancement
class FloatingElementsController {
    constructor() {
        this.elements = document.querySelectorAll('.floating-element');
        this.init();
    }
    
    init() {
        this.elements.forEach((element, index) => {
            // Add random movement
            setInterval(() => {
                const randomX = (Math.random() - 0.5) * 20;
                const randomY = (Math.random() - 0.5) * 20;
                element.style.transform = `translate(${randomX}px, ${randomY}px) rotate(${Math.random() * 360}deg)`;
            }, 3000 + (index * 1000));
        });
    }
}

// Initialize Floating Elements
const floatingElementsController = new FloatingElementsController();

// Form Validation Enhancement
class VenturesFormValidator {
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    static validatePhone(phone) {
        const re = /^[\+]?[1-9][\d]{0,15}$/;
        return re.test(phone.replace(/\s/g, ''));
    }
    
    static validateRequired(value) {
        return value && value.trim().length > 0;
    }
    
    static showFieldError(field, message) {
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
    
    static clearFieldError(field) {
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
        field.style.borderColor = '';
    }
    
    static validateForm(form) {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            this.clearFieldError(field);
            
            if (!this.validateRequired(field.value)) {
                this.showFieldError(field, 'This field is required');
                isValid = false;
            } else if (field.type === 'email' && !this.validateEmail(field.value)) {
                this.showFieldError(field, 'Please enter a valid email address');
                isValid = false;
            } else if (field.type === 'tel' && !this.validatePhone(field.value)) {
                this.showFieldError(field, 'Please enter a valid phone number');
                isValid = false;
            }
        });
        
        return isValid;
    }
}

// Add real-time validation to forms
document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                if (this.hasAttribute('required')) {
                    if (!VenturesFormValidator.validateRequired(this.value)) {
                        VenturesFormValidator.showFieldError(this, 'This field is required');
                    } else {
                        VenturesFormValidator.clearFieldError(this);
                    }
                }
                
                if (this.type === 'email' && this.value) {
                    if (!VenturesFormValidator.validateEmail(this.value)) {
                        VenturesFormValidator.showFieldError(this, 'Please enter a valid email address');
                    } else {
                        VenturesFormValidator.clearFieldError(this);
                    }
                }
                
                if (this.type === 'tel' && this.value) {
                    if (!VenturesFormValidator.validatePhone(this.value)) {
                        VenturesFormValidator.showFieldError(this, 'Please enter a valid phone number');
                    } else {
                        VenturesFormValidator.clearFieldError(this);
                    }
                }
            });
        });
    });
});

// Export functions for global access
window.showTechQuote = showTechQuote;
window.showCreativeConsultation = showCreativeConsultation;
window.closeSuccessModal = closeSuccessModal;
window.VenturesFormValidator = VenturesFormValidator;
