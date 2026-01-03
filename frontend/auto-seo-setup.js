/**
 * Automated SEO Setup Script
 * Generates OG images and updates all HTML files automatically
 * Run: npm install puppeteer (first time only)
 * Then: node auto-seo-setup.js
 */

const { generateOGImages } = require('./generate-og-images');
const { convertOGImages } = require('./convert-og-images');
const { updateOGTags } = require('./update-og-tags');
const fs = require('fs');
const path = require('path');

async function checkDependencies() {
    console.log('🔍 Checking dependencies...\n');
    
    const packageJsonPath = path.join(__dirname, 'package.json');
    let packageJson = {};
    
    if (fs.existsSync(packageJsonPath)) {
        packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    }
    
    // Check if puppeteer is installed
    const puppeteerPath = path.join(__dirname, 'node_modules', 'puppeteer');
    const hasPuppeteer = fs.existsSync(puppeteerPath);
    
    if (!hasPuppeteer) {
        console.log('⚠️  Puppeteer not found. Installing...\n');
        console.log('💡 Run: npm install puppeteer');
        console.log('   Then run this script again.\n');
        return false;
    }
    
    console.log('✅ All dependencies found!\n');
    return true;
}

async function runAutoSetup() {
    console.log('🚀 Starting Automated SEO Setup...\n');
    console.log('=' .repeat(50));
    console.log('');
    
    try {
        // Step 1: Check dependencies
        const depsOk = await checkDependencies();
        if (!depsOk) {
            console.log('\n📝 Alternative: Use the HTML generator and screenshot manually');
            console.log('   1. Open og-image-generator.html in browser');
            console.log('   2. Capture screenshots of each page');
            console.log('   3. Save as og-[pagename].png');
            console.log('   4. Run: node update-og-tags.js\n');
            return;
        }
        
        // Step 2: Generate HTML templates
        console.log('📝 Step 1: Generating OG Image HTML templates...');
        generateOGImages();
        console.log('');
        
        // Step 3: Convert to PNG
        console.log('📸 Step 2: Converting HTML to PNG images...');
        await convertOGImages();
        console.log('');
        
        // Step 4: Update HTML files
        console.log('🔄 Step 3: Updating HTML files with new OG image paths...');
        updateOGTags();
        console.log('');
        
        console.log('=' .repeat(50));
        console.log('🎉 Automated SEO Setup Complete!');
        console.log('');
        console.log('✅ OG images generated');
        console.log('✅ HTML files updated');
        console.log('');
        console.log('📋 Next Steps:');
        console.log('1. Optimize images (TinyPNG.com) to reduce file size');
        console.log('2. Test OG images: https://developers.facebook.com/tools/debug/');
        console.log('3. Submit sitemap: See SITEMAP_SUBMISSION_GUIDE.md');
        console.log('');
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.log('\n💡 Troubleshooting:');
        console.log('   - Install Puppeteer: npm install puppeteer');
        console.log('   - Check Node.js version: node --version (need v14+)');
        console.log('   - Try manual method: Use og-image-generator.html\n');
    }
}

// Run if called directly
if (require.main === module) {
    runAutoSetup();
}

module.exports = { runAutoSetup };

