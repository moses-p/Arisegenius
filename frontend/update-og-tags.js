/**
 * Automatically update OG image meta tags in all HTML files
 * Run: node update-og-tags.js
 */

const fs = require('fs');
const path = require('path');
const { pages } = require('./generate-og-images');

const htmlFiles = [
    'index.html',
    'products.html',
    'about.html',
    'technology.html',
    'sustainability.html',
    'news.html',
    'contact.html',
    'ventures.html',
    'payment.html'
];

// Map HTML files to page data
const fileToPageMap = {
    'index.html': 'home',
    'products.html': 'products',
    'about.html': 'about',
    'technology.html': 'technology',
    'sustainability.html': 'sustainability',
    'news.html': 'news',
    'contact.html': 'contact',
    'ventures.html': 'ventures',
    'payment.html': 'payment'
};

function updateOGTags() {
    console.log('🔄 Updating OG image tags in HTML files...\n');
    
    let updatedCount = 0;
    
    htmlFiles.forEach(filename => {
        const filePath = path.join(__dirname, filename);
        
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  Skipping ${filename} (not found)`);
            return;
        }
        
        const pageName = fileToPageMap[filename];
        const pageData = pages.find(p => p.name === pageName);
        
        if (!pageData) {
            console.log(`⚠️  No page data found for ${filename}`);
            return;
        }
        
        // Read file
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Check if OG image file exists
        const ogImagePath = path.join(__dirname, pageData.filename);
        if (!fs.existsSync(ogImagePath)) {
            console.log(`⚠️  OG image not found: ${pageData.filename} (skipping ${filename})`);
            return;
        }
        
        // Update OG image URL
        const oldImagePattern = /<meta\s+property="og:image"\s+content="[^"]*">/i;
        const newImageTag = `<meta property="og:image" content="https://arisegenius.com/${pageData.filename}">`;
        
        if (oldImagePattern.test(content)) {
            content = content.replace(oldImagePattern, newImageTag);
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Updated: ${filename} → ${pageData.filename}`);
            updatedCount++;
        } else {
            console.log(`⚠️  OG image tag not found in ${filename}`);
        }
    });
    
    console.log(`\n🎉 Updated ${updatedCount} HTML files!`);
    console.log('\n📋 Verification:');
    console.log('1. Check that OG images exist in frontend/ directory');
    console.log('2. Verify HTML files have correct og:image URLs');
    console.log('3. Test with Facebook Debugger: https://developers.facebook.com/tools/debug/');
}

// Run if called directly
if (require.main === module) {
    updateOGTags();
}

module.exports = { updateOGTags };

