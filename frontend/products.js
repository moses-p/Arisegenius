// Products Page JavaScript

// Product data
const productData = {
    'comfort-pro': {
        name: 'Arisegenius Comfort Pro',
        category: 'Passenger Tire',
        size: '205/55R16',
        price: '$120',
        features: [
            'All-season traction for year-round performance',
            'Fuel-efficient design reduces rolling resistance',
            'Quiet ride comfort with advanced noise reduction',
            '50,000 mile warranty for peace of mind',
            'Enhanced wet weather performance',
            'Long-lasting tread compound'
        ],
        specifications: {
            'Load Index': '91',
            'Speed Rating': 'H',
            'Tread Depth': '10/32"',
            'Weight': '22 lbs',
            'Warranty': '50,000 miles'
        }
    },
    'sport-max': {
        name: 'Arisegenius Sport Max',
        category: 'Performance Tire',
        size: '225/45R17',
        price: '$180',
        features: [
            'High-speed stability up to 130 mph',
            'Precision handling for sport driving',
            'Enhanced grip on dry and wet surfaces',
            'Sport performance compound',
            'Asymmetric tread pattern',
            'Reinforced sidewalls for cornering'
        ],
        specifications: {
            'Load Index': '94',
            'Speed Rating': 'Y',
            'Tread Depth': '9/32"',
            'Weight': '24 lbs',
            'Warranty': '30,000 miles'
        }
    },
    'heavy-duty': {
        name: 'Arisegenius Heavy Duty',
        category: 'Truck Tire',
        size: '275/70R18',
        price: '$250',
        features: [
            'Heavy load capacity for commercial use',
            'Long-lasting tread for fleet operations',
            'Commercial grade construction',
            'Fleet optimized for cost efficiency',
            'Enhanced puncture resistance',
            'Steel belt construction'
        ],
        specifications: {
            'Load Index': '125',
            'Speed Rating': 'L',
            'Tread Depth': '18/32"',
            'Weight': '45 lbs',
            'Warranty': '80,000 miles'
        }
    },
    'offroad-master': {
        name: 'Arisegenius Off-Road Master',
        category: 'Off-Road Tire',
        size: '265/75R16',
        price: '$200',
        features: [
            'Mud terrain design for extreme conditions',
            'Rock crawling capability',
            'All-terrain performance',
            'Reinforced sidewalls for protection',
            'Self-cleaning tread pattern',
            'Aggressive shoulder blocks'
        ],
        specifications: {
            'Load Index': '112',
            'Speed Rating': 'Q',
            'Tread Depth': '15/32"',
            'Weight': '38 lbs',
            'Warranty': '40,000 miles'
        }
    }
};

// Show product details modal
function showProductModal(productId) {
    const product = productData[productId];
    if (!product) return;
    
    const modal = document.createElement('div');
    modal.className = 'product-modal';
    modal.innerHTML = `
        <div class="product-modal-content">
            <div class="product-modal-header">
                <h3>${product.name}</h3>
                <button class="product-modal-close">&times;</button>
            </div>
            <div class="product-modal-body">
                <div class="product-modal-grid">
                    <div class="product-modal-image">
                        <div class="product-placeholder">
                            <i class="fas fa-circle"></i>
                        </div>
                    </div>
                    <div class="product-modal-info">
                        <h4>${product.name}</h4>
                        <p class="product-category">${product.category}</p>
                        <p class="product-size">${product.size}</p>
                        <div class="product-price">${product.price}</div>
                        
                        <div class="product-modal-features">
                            <h5>Key Features</h5>
                            <ul>
                                ${product.features.map(feature => `<li>${feature}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <div class="product-modal-specifications">
                            <h5>Specifications</h5>
                            <div class="specs-grid">
                                ${Object.entries(product.specifications).map(([key, value]) => 
                                    `<div class="spec-item">
                                        <span class="spec-label">${key}:</span>
                                        <span class="spec-value">${value}</span>
                                    </div>`
                                ).join('')}
                            </div>
                        </div>
                        
                        <div class="product-modal-actions">
                            <button class="btn btn-primary" onclick="findDealer('${productId}')">
                                <i class="fas fa-map-marker-alt"></i>
                                Find a Dealer
                            </button>
                            <button class="btn btn-secondary" onclick="getQuote('${productId}')">
                                <i class="fas fa-calculator"></i>
                                Get Quote
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    modal.querySelector('.product-modal-close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // Track analytics
    if (typeof Analytics !== 'undefined') {
        Analytics.trackEvent('Products', 'View Product Details', product.name);
    }
}

// Show product details for category
function showProductDetails(category) {
    const categoryData = {
        passenger: {
            title: 'Passenger Tires',
            description: 'Comfort, safety, and fuel efficiency for everyday driving',
            products: [
                { name: 'Comfort Pro', size: '205/55R16', price: '$120' },
                { name: 'Eco Drive', size: '195/65R15', price: '$110' },
                { name: 'City Master', size: '185/70R14', price: '$100' },
                { name: 'Premium Plus', size: '215/50R17', price: '$140' }
            ]
        },
        performance: {
            title: 'Performance Tires',
            description: 'High-speed stability and precision handling for sports cars',
            products: [
                { name: 'Sport Max', size: '225/45R17', price: '$180' },
                { name: 'Speed Pro', size: '235/40R18', price: '$200' },
                { name: 'Track Master', size: '245/35R19', price: '$220' },
                { name: 'Racing Elite', size: '255/30R20', price: '$250' }
            ]
        },
        truck: {
            title: 'Truck & Bus Tires',
            description: 'Heavy-duty reliability for commercial vehicles',
            products: [
                { name: 'Heavy Duty', size: '275/70R18', price: '$250' },
                { name: 'Fleet Master', size: '285/65R19', price: '$270' },
                { name: 'Commercial Pro', size: '295/60R20', price: '$290' },
                { name: 'Transport Elite', size: '305/55R22', price: '$320' }
            ]
        },
        offroad: {
            title: 'Off-Road Tires',
            description: 'Maximum traction for challenging terrains',
            products: [
                { name: 'Off-Road Master', size: '265/75R16', price: '$200' },
                { name: 'Mud Terrain Pro', size: '285/70R17', price: '$220' },
                { name: 'Rock Crawler', size: '305/65R18', price: '$240' },
                { name: 'Adventure King', size: '315/60R20', price: '$260' }
            ]
        }
    };
    
    const data = categoryData[category];
    if (!data) return;
    
    const modal = document.createElement('div');
    modal.className = 'product-modal';
    modal.innerHTML = `
        <div class="product-modal-content">
            <div class="product-modal-header">
                <h3>${data.title}</h3>
                <button class="product-modal-close">&times;</button>
            </div>
            <div class="product-modal-body">
                <p class="category-description">${data.description}</p>
                
                <div class="category-products-grid">
                    ${data.products.map(product => `
                        <div class="category-product-item">
                            <div class="product-image-small">
                                <div class="product-placeholder">
                                    <i class="fas fa-circle"></i>
                                </div>
                            </div>
                            <div class="product-info-small">
                                <h4>${product.name}</h4>
                                <p class="product-size">${product.size}</p>
                                <p class="product-price">${product.price}</p>
                                <button class="btn btn-primary" onclick="showProductModal('${product.name.toLowerCase().replace(/\s+/g, '-')}')">
                                    View Details
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="category-actions">
                    <button class="btn btn-primary" onclick="window.location.href='/#tire-finder'">
                        <i class="fas fa-search"></i>
                        Find Your Tire
                    </button>
                    <button class="btn btn-secondary" onclick="window.location.href='/#contact'">
                        <i class="fas fa-phone"></i>
                        Contact Us
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    modal.querySelector('.product-modal-close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // Track analytics
    if (typeof Analytics !== 'undefined') {
        Analytics.trackEvent('Products', 'View Category', data.title);
    }
}

// Find dealer functionality
function findDealer(productId) {
    const product = productData[productId];
    if (!product) return;
    
    // Show dealer locator modal
    const modal = document.createElement('div');
    modal.className = 'product-modal';
    modal.innerHTML = `
        <div class="product-modal-content">
            <div class="product-modal-header">
                <h3>Find a Dealer for ${product.name}</h3>
                <button class="product-modal-close">&times;</button>
            </div>
            <div class="product-modal-body">
                <div class="dealer-locator">
                    <div class="search-section">
                        <h4>Search by Location</h4>
                        <div class="search-form">
                            <input type="text" id="location-search" placeholder="Enter city or country" class="search-input">
                            <button class="search-button" onclick="searchDealers()">
                                <i class="fas fa-search"></i>
                                Search
                            </button>
                        </div>
                    </div>
                    
                    <div class="dealers-list" id="dealers-list">
                        <div class="dealer-item">
                            <div class="dealer-info">
                                <h5>Lagos Tire Center</h5>
                                <p>Victoria Island, Lagos, Nigeria</p>
                                <p>Phone: +234-xxx-xxxx</p>
                            </div>
                            <div class="dealer-actions">
                                <button class="btn btn-primary">Call</button>
                                <button class="btn btn-secondary">Directions</button>
                            </div>
                        </div>
                        
                        <div class="dealer-item">
                            <div class="dealer-info">
                                <h5>Nairobi Auto Parts</h5>
                                <p>Westlands, Nairobi, Kenya</p>
                                <p>Phone: +254-xxx-xxxx</p>
                            </div>
                            <div class="dealer-actions">
                                <button class="btn btn-primary">Call</button>
                                <button class="btn btn-secondary">Directions</button>
                            </div>
                        </div>
                        
                        <div class="dealer-item">
                            <div class="dealer-info">
                                <h5>Cairo Tire Hub</h5>
                                <p>New Cairo, Egypt</p>
                                <p>Phone: +20-xxx-xxxx</p>
                            </div>
                            <div class="dealer-actions">
                                <button class="btn btn-primary">Call</button>
                                <button class="btn btn-secondary">Directions</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    modal.querySelector('.product-modal-close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // Track analytics
    if (typeof Analytics !== 'undefined') {
        Analytics.trackEvent('Products', 'Find Dealer', product.name);
    }
}

// Get quote functionality
function getQuote(productId) {
    const product = productData[productId];
    if (!product) return;
    
    // Show quote request modal
    const modal = document.createElement('div');
    modal.className = 'product-modal';
    modal.innerHTML = `
        <div class="product-modal-content">
            <div class="product-modal-header">
                <h3>Get Quote for ${product.name}</h3>
                <button class="product-modal-close">&times;</button>
            </div>
            <div class="product-modal-body">
                <form class="quote-form" id="quote-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="customer-name">Full Name</label>
                            <input type="text" id="customer-name" name="customerName" required>
                        </div>
                        <div class="form-group">
                            <label for="customer-email">Email</label>
                            <input type="email" id="customer-email" name="customerEmail" required>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="customer-phone">Phone</label>
                            <input type="tel" id="customer-phone" name="customerPhone" required>
                        </div>
                        <div class="form-group">
                            <label for="quantity">Quantity</label>
                            <select id="quantity" name="quantity" required>
                                <option value="">Select Quantity</option>
                                <option value="1">1 tire</option>
                                <option value="2">2 tires</option>
                                <option value="4">4 tires</option>
                                <option value="custom">Custom quantity</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="vehicle-info">Vehicle Information</label>
                        <input type="text" id="vehicle-info" name="vehicleInfo" placeholder="Make, Model, Year (e.g., Toyota Camry 2020)">
                    </div>
                    
                    <div class="form-group">
                        <label for="delivery-location">Delivery Location</label>
                        <input type="text" id="delivery-location" name="deliveryLocation" placeholder="City, Country">
                    </div>
                    
                    <div class="form-group">
                        <label for="additional-notes">Additional Notes</label>
                        <textarea id="additional-notes" name="additionalNotes" rows="3" placeholder="Any special requirements or questions..."></textarea>
                    </div>
                    
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-paper-plane"></i>
                        Request Quote
                    </button>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    modal.querySelector('.product-modal-close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // Form submission
    const form = modal.querySelector('#quote-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleQuoteSubmission(form, product);
    });
    
    // Track analytics
    if (typeof Analytics !== 'undefined') {
        Analytics.trackEvent('Products', 'Request Quote', product.name);
    }
}

// Handle quote submission
function handleQuoteSubmission(form, product) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<div class="loading"></div> Sending...';
    submitButton.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Show success message
        showSuccessMessage('Quote Request', `Thank you for your interest in ${product.name}! Our sales team will contact you within 24 hours with a detailed quote.`);
        
        // Close modal
        const modal = form.closest('.product-modal');
        document.body.removeChild(modal);
        
        // Reset button
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }, 2000);
}

// Search dealers functionality
function searchDealers() {
    const searchInput = document.getElementById('location-search');
    const location = searchInput.value.toLowerCase();
    
    // Simulate search
    const dealersList = document.getElementById('dealers-list');
    dealersList.innerHTML = '<div class="loading">Searching dealers...</div>';
    
    setTimeout(() => {
        // Mock search results
        dealersList.innerHTML = `
            <div class="dealer-item">
                <div class="dealer-info">
                    <h5>Lagos Tire Center</h5>
                    <p>Victoria Island, Lagos, Nigeria</p>
                    <p>Phone: +234-xxx-xxxx</p>
                    <p class="distance">Distance: 2.5 km</p>
                </div>
                <div class="dealer-actions">
                    <button class="btn btn-primary">Call</button>
                    <button class="btn btn-secondary">Directions</button>
                </div>
            </div>
            
            <div class="dealer-item">
                <div class="dealer-info">
                    <h5>Ikeja Auto Parts</h5>
                    <p>Ikeja, Lagos, Nigeria</p>
                    <p>Phone: +234-xxx-xxxx</p>
                    <p class="distance">Distance: 5.2 km</p>
                </div>
                <div class="dealer-actions">
                    <button class="btn btn-primary">Call</button>
                    <button class="btn btn-secondary">Directions</button>
                </div>
            </div>
        `;
    }, 1500);
}

// Show success message
function showSuccessMessage(title, message) {
    const modal = document.createElement('div');
    modal.className = 'product-modal';
    modal.innerHTML = `
        <div class="product-modal-content success-modal">
            <div class="product-modal-header">
                <h3>${title} Submitted Successfully!</h3>
                <button class="product-modal-close">&times;</button>
            </div>
            <div class="product-modal-body">
                <div class="success-content">
                    <div class="success-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <p>${message}</p>
                    <div class="success-actions">
                        <button class="btn btn-primary" onclick="closeSuccessModal()">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    modal.querySelector('.product-modal-close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Close success modal
function closeSuccessModal() {
    const modal = document.querySelector('.success-modal').closest('.product-modal');
    if (modal) {
        document.body.removeChild(modal);
    }
}

// Enhanced Animation Controller for Products Page
class ProductsAnimationController {
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
        const animatedElements = document.querySelectorAll('.category-card, .product-item, .tech-feature');
        animatedElements.forEach((element, index) => {
            element.style.animationDelay = `${index * 0.1}s`;
            this.observer.observe(element);
        });
    }
}

// Initialize Products Animations
const productsAnimationController = new ProductsAnimationController();

// Hash navigation handler for product categories
function handleHashNavigation() {
    // Check if there's a hash in the URL
    if (window.location.hash) {
        const hash = window.location.hash.substring(1); // Remove the #
        const validCategories = ['passenger', 'performance', 'truck', 'offroad'];
        
        if (validCategories.includes(hash)) {
            // Wait for page to load, then scroll to the section
            setTimeout(() => {
                const targetElement = document.getElementById(hash);
                if (targetElement) {
                    const offset = 80; // Account for fixed navbar
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - offset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Add a highlight effect
                    targetElement.style.transition = 'box-shadow 0.3s ease';
                    targetElement.style.boxShadow = '0 0 20px rgba(215, 138, 0, 0.5)';
                    setTimeout(() => {
                        targetElement.style.boxShadow = '';
                    }, 2000);
                }
            }, 100);
        }
    }
}

// Handle hash changes (when clicking links)
window.addEventListener('hashchange', handleHashNavigation);

// Handle initial page load with hash
document.addEventListener('DOMContentLoaded', () => {
    handleHashNavigation();
    
    // Initialize navbar functionality
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active') && 
                !navMenu.contains(e.target) && 
                !navToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    }
    
    // Mobile dropdown toggle
    document.querySelectorAll('.nav-dropdown > .nav-link').forEach(dropdownLink => {
        dropdownLink.addEventListener('click', function(e) {
            // Only toggle on mobile (screen width <= 768px)
            if (window.innerWidth <= 768) {
                e.preventDefault();
                const dropdown = this.parentElement;
                const isActive = dropdown.classList.contains('active');
                
                // Close all other dropdowns
                document.querySelectorAll('.nav-dropdown').forEach(dd => {
                    if (dd !== dropdown) {
                        dd.classList.remove('active');
                    }
                });
                
                // Toggle current dropdown
                dropdown.classList.toggle('active', !isActive);
            }
        });
    });
    
    // Close mobile menu when clicking on a link (but not dropdown parent)
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            // Don't close if it's a dropdown parent on mobile
            if (window.innerWidth <= 768 && this.parentElement.classList.contains('nav-dropdown')) {
                return; // Let dropdown toggle handle it
            }
            
            if (navMenu) navMenu.classList.remove('active');
            if (navToggle) navToggle.classList.remove('active');
        });
    });
    
    // Smooth scroll for anchor links with offset
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '#!') return;
            
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                e.preventDefault();
                const offset = 80; // Account for fixed navbar
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (navMenu) navMenu.classList.remove('active');
                if (navToggle) navToggle.classList.remove('active');
            }
        });
    });
    
    // Fix dropdown links to properly navigate
    const dropdownLinks = document.querySelectorAll('.dropdown-content a');
    dropdownLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href) {
                // If it's a hash link on the same page
                if (href.startsWith('#')) {
                    e.preventDefault();
                    const hash = href.substring(1);
                    const targetElement = document.getElementById(hash);
                    if (targetElement) {
                        const offset = 80;
                        const elementPosition = targetElement.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - offset;
                        
                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                        
                        // Update URL hash
                        window.history.pushState(null, null, href);
                        
                        // Add highlight effect
                        targetElement.style.transition = 'box-shadow 0.3s ease';
                        targetElement.style.boxShadow = '0 0 20px rgba(215, 138, 0, 0.5)';
                        setTimeout(() => {
                            targetElement.style.boxShadow = '';
                        }, 2000);
                    }
                }
                // If it's a cross-page link (products.html#section), let it navigate normally
                // The target page will handle the hash navigation
                
                // Close mobile menu
                if (navMenu) navMenu.classList.remove('active');
                if (navToggle) navToggle.classList.remove('active');
            }
        });
    });
});

// Export functions for global access
window.showProductModal = showProductModal;
window.showProductDetails = showProductDetails;
window.findDealer = findDealer;
window.getQuote = getQuote;
window.searchDealers = searchDealers;
window.closeSuccessModal = closeSuccessModal;
window.handleHashNavigation = handleHashNavigation;
