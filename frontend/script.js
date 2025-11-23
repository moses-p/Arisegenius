// DOM Elements
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const tireFinderSection = document.getElementById('tire-finder');

// Navigation Toggle
navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(9, 1, 1, 0.98)';
    } else {
        navbar.style.background = 'rgba(9, 1, 1, 0.95)';
    }
});

// Smooth scroll to tire finder
function scrollToTireFinder() {
    tireFinderSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// Tire Finder Functionality
class TireFinder {
    constructor() {
        this.vehicleData = {
            toyota: ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Prius', 'Tacoma', 'Tundra'],
            honda: ['Civic', 'Accord', 'CR-V', 'Pilot', 'Fit', 'HR-V', 'Passport'],
            ford: ['F-150', 'Explorer', 'Escape', 'Focus', 'Mustang', 'Edge', 'Expedition'],
            nissan: ['Altima', 'Sentra', 'Rogue', 'Pathfinder', 'Murano', 'Titan', 'Frontier'],
            bmw: ['3 Series', '5 Series', 'X3', 'X5', '7 Series', 'X1', 'X7'],
            mercedes: ['C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE', 'A-Class', 'G-Class'],
            audi: ['A4', 'A6', 'Q5', 'Q7', 'A3', 'Q3', 'A8'],
            volkswagen: ['Jetta', 'Passat', 'Tiguan', 'Atlas', 'Golf', 'Beetle', 'Arteon'],
            hyundai: ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Accent', 'Kona', 'Palisade'],
            kia: ['Forte', 'Optima', 'Sportage', 'Sorento', 'Rio', 'Niro', 'Telluride']
        };
        
        this.tireResults = [
            {
                id: 1,
                name: 'Arisegenius Performance Pro',
                size: '205/55R16',
                category: 'passenger',
                price: '$120',
                features: ['All-season traction', 'Fuel efficient', '50,000 mile warranty'],
                image: 'assets/images/tire-1.jpg'
            },
            {
                id: 2,
                name: 'Arisegenius Sport Max',
                size: '225/45R17',
                category: 'performance',
                price: '$180',
                features: ['High-speed stability', 'Precision handling', 'Sport performance'],
                image: 'assets/images/tire-2.jpg'
            },
            {
                id: 3,
                name: 'Arisegenius Heavy Duty',
                size: '275/70R18',
                category: 'truck',
                price: '$250',
                features: ['Heavy load capacity', 'Long-lasting tread', 'Commercial grade'],
                image: 'assets/images/tire-3.jpg'
            },
            {
                id: 4,
                name: 'Arisegenius Off-Road Master',
                size: '265/75R16',
                category: 'offroad',
                price: '$200',
                features: ['Mud terrain', 'Rock crawling', 'All-terrain capability'],
                image: 'assets/images/tire-4.jpg'
            }
        ];
        
        this.init();
    }
    
    init() {
        this.setupVehicleSearch();
        this.setupSizeSearch();
        this.setupTabs();
    }
    
    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                
                // Remove active class from all buttons and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked button and corresponding content
                button.classList.add('active');
                document.getElementById(`${targetTab}-search`).classList.add('active');
            });
        });
    }
    
    setupVehicleSearch() {
        const makeSelect = document.getElementById('make');
        const modelSelect = document.getElementById('model');
        const yearSelect = document.getElementById('year');
        const form = document.querySelector('#vehicle-search form');
        
        // Populate years (current year back to 2000)
        const currentYear = new Date().getFullYear();
        for (let year = currentYear; year >= 2000; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        }
        
        // Handle make selection
        makeSelect.addEventListener('change', () => {
            const selectedMake = makeSelect.value;
            modelSelect.innerHTML = '<option value="">Select Model</option>';
            
            if (selectedMake && this.vehicleData[selectedMake]) {
                this.vehicleData[selectedMake].forEach(model => {
                    const option = document.createElement('option');
                    option.value = model.toLowerCase().replace(/\s+/g, '-');
                    option.textContent = model;
                    modelSelect.appendChild(option);
                });
            }
        });
        
        // Handle form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.searchTires('vehicle', {
                make: makeSelect.value,
                model: modelSelect.value,
                year: yearSelect.value
            });
        });
    }
    
    setupSizeSearch() {
        const form = document.querySelector('#size-search form');
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            this.searchTires('size', {
                width: formData.get('width'),
                profile: formData.get('profile'),
                rim: formData.get('rim')
            });
        });
    }
    
    searchTires(type, criteria) {
        const resultsContainer = document.getElementById('search-results');
        const searchButton = document.querySelector('.search-button');
        
        // Show loading state
        searchButton.innerHTML = '<div class="loading"></div> Searching...';
        searchButton.disabled = true;
        
        // Simulate API call delay
        setTimeout(() => {
            let filteredResults = this.tireResults;
            
            if (type === 'size') {
                // Filter by tire size (simplified matching)
                const targetSize = `${criteria.width}/${criteria.profile}R${criteria.rim}`;
                filteredResults = this.tireResults.filter(tire => 
                    tire.size.includes(criteria.width) || 
                    tire.size.includes(criteria.rim)
                );
            }
            
            this.displayResults(filteredResults);
            
            // Reset button
            searchButton.innerHTML = '<i class="fas fa-search"></i> Find Tires';
            searchButton.disabled = false;
            
            // Scroll to results
            resultsContainer.scrollIntoView({ behavior: 'smooth' });
        }, 1500);
    }
    
    displayResults(results) {
        const resultsContainer = document.getElementById('search-results');
        
        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <h3>No tires found matching your criteria</h3>
                    <p>Please try adjusting your search parameters or contact our support team for assistance.</p>
                </div>
            `;
        } else {
            resultsContainer.innerHTML = `
                <div class="results-header">
                    <h3>Found ${results.length} tire${results.length > 1 ? 's' : ''} matching your search</h3>
                </div>
                <div class="results-grid">
                    ${results.map(tire => this.createTireCard(tire)).join('')}
                </div>
            `;
        }
        
        resultsContainer.classList.add('active');
    }
    
    createTireCard(tire) {
        return `
            <div class="tire-card">
                <div class="tire-image">
                    <div class="tire-placeholder">
                        <i class="fas fa-circle"></i>
                    </div>
                </div>
                <div class="tire-info">
                    <h4>${tire.name}</h4>
                    <p class="tire-size">${tire.size}</p>
                    <div class="tire-features">
                        ${tire.features.map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
                    </div>
                    <div class="tire-price">${tire.price}</div>
                    <button class="btn-primary" onclick="showTireDetails(${tire.id})">
                        View Details
                    </button>
                </div>
            </div>
        `;
    }
}

// Initialize Tire Finder
const tireFinder = new TireFinder();

// Parallax Scrolling Effect
class ParallaxController {
    constructor() {
        this.parallaxElements = document.querySelectorAll('[data-speed]');
        this.init();
    }
    
    init() {
        window.addEventListener('scroll', () => {
            this.updateParallax();
        });
    }
    
    updateParallax() {
        const scrolled = window.pageYOffset;
        
        this.parallaxElements.forEach(element => {
            const speed = element.getAttribute('data-speed');
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    }
}

// Initialize Parallax
const parallaxController = new ParallaxController();

// Intersection Observer for Animations
class AnimationController {
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
        const animatedElements = document.querySelectorAll('.product-card, .tech-item, .stat-item');
        animatedElements.forEach((element, index) => {
            element.classList.add('fade-in');
            element.style.animationDelay = `${index * 0.1}s`;
            this.observer.observe(element);
        });
    }
}

// Initialize Animations
const animationController = new AnimationController();

// B2B Portal Functionality
class B2BPortal {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupDealerLogin();
        this.setupDealerApplication();
    }
    
    setupDealerLogin() {
        const loginButton = document.querySelector('.btn-primary');
        if (loginButton) {
            loginButton.addEventListener('click', () => {
                this.showLoginModal();
            });
        }
    }
    
    setupDealerApplication() {
        const applyButton = document.querySelector('.btn-secondary');
        if (applyButton) {
            applyButton.addEventListener('click', () => {
                this.showApplicationModal();
            });
        }
    }
    
    showLoginModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Dealer Login</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form class="login-form">
                        <div class="form-group">
                            <label for="dealer-id">Dealer ID</label>
                            <input type="text" id="dealer-id" name="dealerId" required>
                        </div>
                        <div class="form-group">
                            <label for="password">Password</label>
                            <input type="password" id="password" name="password" required>
                        </div>
                        <button type="submit" class="btn-primary">Login</button>
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
    }
    
    showApplicationModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Become a Dealer</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form class="application-form">
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
                            <label for="location">Business Location</label>
                            <input type="text" id="location" name="location" required>
                        </div>
                        <div class="form-group">
                            <label for="experience">Years in Tire Business</label>
                            <select id="experience" name="experience" required>
                                <option value="">Select Experience</option>
                                <option value="0-2">0-2 years</option>
                                <option value="3-5">3-5 years</option>
                                <option value="6-10">6-10 years</option>
                                <option value="10+">10+ years</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="message">Additional Information</label>
                            <textarea id="message" name="message" rows="4"></textarea>
                        </div>
                        <button type="submit" class="btn-primary">Submit Application</button>
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
    }
}

// Initialize B2B Portal
const b2bPortal = new B2BPortal();

// Tire Details Modal
function showTireDetails(tireId) {
    const tire = tireFinder.tireResults.find(t => t.id === tireId);
    if (!tire) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content tire-details-modal">
            <div class="modal-header">
                <h3>${tire.name}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="tire-details-content">
                    <div class="tire-details-image">
                        <div class="tire-placeholder-large">
                            <i class="fas fa-circle"></i>
                        </div>
                    </div>
                    <div class="tire-details-info">
                        <div class="tire-specs">
                            <h4>Specifications</h4>
                            <ul>
                                <li><strong>Size:</strong> ${tire.size}</li>
                                <li><strong>Category:</strong> ${tire.category}</li>
                                <li><strong>Price:</strong> ${tire.price}</li>
                            </ul>
                        </div>
                        <div class="tire-features-detail">
                            <h4>Key Features</h4>
                            <ul>
                                ${tire.features.map(feature => `<li>${feature}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="tire-actions">
                            <button class="btn-primary">Find a Dealer</button>
                            <button class="btn-secondary">Get Quote</button>
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
}

// Search functionality for dealer locations
class DealerLocator {
    constructor() {
        this.dealers = [
            { name: 'Lagos Tire Center', address: 'Victoria Island, Lagos', phone: '+234-xxx-xxxx' },
            { name: 'Nairobi Auto Parts', address: 'Westlands, Nairobi', phone: '+254-xxx-xxxx' },
            { name: 'Cairo Tire Hub', address: 'New Cairo, Egypt', phone: '+20-xxx-xxxx' },
            { name: 'Cape Town Motors', address: 'Cape Town CBD', phone: '+27-xxx-xxxx' },
            { name: 'Accra Auto Solutions', address: 'Accra Central, Ghana', phone: '+233-xxx-xxxx' }
        ];
    }
    
    searchDealers(location) {
        return this.dealers.filter(dealer => 
            dealer.name.toLowerCase().includes(location.toLowerCase()) ||
            dealer.address.toLowerCase().includes(location.toLowerCase())
        );
    }
}

// Initialize Dealer Locator
const dealerLocator = new DealerLocator();

// Performance optimization: Lazy loading for images
class LazyLoader {
    constructor() {
        this.imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    this.imageObserver.unobserve(img);
                }
            });
        });
        
        this.init();
    }
    
    init() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => this.imageObserver.observe(img));
    }
}

// Initialize Lazy Loader
const lazyLoader = new LazyLoader();

// Form validation utility
class FormValidator {
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    static validatePhone(phone) {
        const re = /^[\+]?[1-9][\d]{0,15}$/;
        return re.test(phone.replace(/\s/g, ''));
    }
    
    static showError(field, message) {
        const errorElement = field.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = message;
        } else {
            const error = document.createElement('div');
            error.className = 'error-message';
            error.textContent = message;
            field.parentNode.appendChild(error);
        }
        field.classList.add('error');
    }
    
    static clearError(field) {
        const errorElement = field.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
        field.classList.remove('error');
    }
}

// SEO and Analytics
class Analytics {
    static trackEvent(category, action, label) {
        // Google Analytics 4 event tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: category,
                event_label: label
            });
        }
        
        // Console log for development
        console.log(`Analytics: ${category} - ${action} - ${label}`);
    }
    
    static trackPageView(page) {
        if (typeof gtag !== 'undefined') {
            gtag('config', 'GA_MEASUREMENT_ID', {
                page_title: page,
                page_location: window.location.href
            });
        }
    }
}

// Initialize page tracking
Analytics.trackPageView('Home Page');

// Export functions for global access
window.scrollToTireFinder = scrollToTireFinder;
window.showTireDetails = showTireDetails;
window.Analytics = Analytics;
