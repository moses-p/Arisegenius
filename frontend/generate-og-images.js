/**
 * Automated OG Image Generator for Arisegenius
 * Generates 1200x630px Open Graph images for all pages
 */

const fs = require('fs');
const path = require('path');

// Page data for OG images
const pages = [
    {
        name: 'home',
        title: 'Leading African Tire Innovation',
        description: 'Premium quality tires for all vehicles. Innovation, safety, and durability from Africa\'s leading tire manufacturer.',
        filename: 'og-home.png'
    },
    {
        name: 'products',
        title: 'Premium Tires for Every Vehicle',
        description: 'Discover our complete range of premium tires designed for African conditions and global quality standards.',
        filename: 'og-products.png'
    },
    {
        name: 'about',
        title: 'About Arisegenius',
        description: 'Discover our mission, values, and commitment to African tire innovation.',
        filename: 'og-about.png'
    },
    {
        name: 'technology',
        title: 'Innovation & Engineering',
        description: 'Cutting-edge technology meets African engineering excellence.',
        filename: 'og-technology.png'
    },
    {
        name: 'sustainability',
        title: 'Environmental Impact',
        description: 'Responsible manufacturing practices that honor communities and protect the environment.',
        filename: 'og-sustainability.png'
    },
    {
        name: 'news',
        title: 'News & Insights',
        description: 'Stories from our innovation labs, dealer network, and impact projects.',
        filename: 'og-news.png'
    },
    {
        name: 'contact',
        title: 'Contact Us',
        description: 'Get in touch with our regional teams for dealer support and inquiries.',
        filename: 'og-contact.png'
    },
    {
        name: 'ventures',
        title: 'Digital Innovation & Brand Excellence',
        description: 'Enterprise software solutions, custom mobile applications, and strategic brand consulting.',
        filename: 'og-ventures.png'
    },
    {
        name: 'payment',
        title: 'Secure Payment',
        description: 'Multiple secure payment options for your Arisegenius tire purchase.',
        filename: 'og-payment.png'
    }
];

// Generate HTML template for each OG image
function generateOGImageHTML(page) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            width: 1200px;
            height: 630px;
            background: linear-gradient(135deg, #090101 0%, #1a1a1a 100%);
            position: relative;
            overflow: hidden;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        body::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
                radial-gradient(circle at 20% 50%, rgba(215, 138, 0, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 80% 50%, rgba(215, 138, 0, 0.15) 0%, transparent 50%);
        }
        
        .content {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            padding: 60px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            color: white;
            z-index: 1;
        }
        
        .logo {
            font-size: 32px;
            font-weight: 800;
            color: #d78a00;
            margin-bottom: 20px;
            letter-spacing: 2px;
        }
        
        .title {
            font-size: 56px;
            font-weight: 700;
            line-height: 1.2;
            margin-bottom: 20px;
            color: #ffffff;
        }
        
        .description {
            font-size: 28px;
            font-weight: 400;
            color: #cccccc;
            line-height: 1.4;
            max-width: 900px;
        }
        
        .accent {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 8px;
            background: linear-gradient(90deg, #d78a00 0%, #ffa500 100%);
            z-index: 2;
        }
    </style>
</head>
<body>
    <div class="content">
        <div class="logo">ARISEGENIUS</div>
        <div class="title">${page.title}</div>
        <div class="description">${page.description}</div>
    </div>
    <div class="accent"></div>
</body>
</html>`;
}

// Generate all OG image HTML files
function generateOGImages() {
    console.log('🎨 Generating OG Image HTML templates...\n');
    
    const outputDir = path.join(__dirname, 'og-images-temp');
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    pages.forEach(page => {
        const html = generateOGImageHTML(page);
        const filePath = path.join(outputDir, `${page.name}.html`);
        fs.writeFileSync(filePath, html);
        console.log(`✅ Generated: ${page.name}.html`);
    });
    
    console.log(`\n📁 HTML templates saved to: ${outputDir}/`);
    console.log('\n📋 Next Steps:');
    console.log('1. Install Puppeteer: npm install puppeteer');
    console.log('2. Run: node convert-og-images.js');
    console.log('3. This will convert HTML to PNG images');
    console.log('\nOr use the HTML files with a screenshot tool!');
}

// Run if called directly
if (require.main === module) {
    generateOGImages();
}

module.exports = { pages, generateOGImageHTML };

