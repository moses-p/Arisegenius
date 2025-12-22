// Centralized Contact Information Configuration
// This ensures consistent contact numbers across the entire site

const CONTACT_CONFIG = {
    // Mobile Money Payment Numbers (Primary)
    mobileMoney: {
        mtn: {
            display: '+256 775 538 145',
            raw: '256775538145',
            formatted: '+256775538145',
            link: 'tel:+256775538145'
        },
        airtel: {
            display: '+256 743 232 445',
            raw: '256743232445',
            formatted: '+256743232445',
            link: 'tel:+256743232445'
        }
    },
    
    // General Contact Numbers
    phone: {
        primary: '+256 775 538 145', // MTN (Primary)
        secondary: '+256 743 232 445', // Airtel (Secondary)
        nigeria: '+234 700 ARISE',
        kenya: '+254 709 000 111'
    },
    
    // Email Addresses
    email: {
        support: 'support@arisegenius.com',
        ventures: 'ventures@arisegenius.com',
        sales: 'sales@arisegenius.com',
        info: 'info@arisegenius.com'
    },
    
    // Payment Support
    paymentSupport: {
        mtn: {
            label: 'MTN Mobile Money',
            number: '+256 775 538 145',
            link: 'tel:+256775538145',
            whatsapp: 'https://wa.me/256775538145'
        },
        airtel: {
            label: 'Airtel Money',
            number: '+256 743 232 445',
            link: 'tel:+256743232445',
            whatsapp: 'https://wa.me/256743232445'
        }
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONTACT_CONFIG;
}

