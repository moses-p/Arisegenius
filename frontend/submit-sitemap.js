/**
 * Automated Sitemap Submission Helper
 * This script helps automate sitemap submission to Google and Bing
 * Note: Full automation requires API access, but this script helps with the process
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const SITEMAP_URL = 'https://arisegenius.com/sitemap.xml';
const ROBOTS_URL = 'https://arisegenius.com/robots.txt';

// Check if sitemap is accessible
function checkSitemapAccessibility() {
    return new Promise((resolve, reject) => {
        console.log('🔍 Checking sitemap accessibility...\n');
        
        const url = new URL(SITEMAP_URL);
        const client = url.protocol === 'https:' ? https : http;
        
        const req = client.get(SITEMAP_URL, (res) => {
            if (res.statusCode === 200) {
                console.log('✅ Sitemap is accessible!');
                console.log(`   URL: ${SITEMAP_URL}`);
                console.log(`   Status: ${res.statusCode}\n`);
                resolve(true);
            } else {
                console.log(`⚠️  Sitemap returned status: ${res.statusCode}`);
                resolve(false);
            }
        });
        
        req.on('error', (error) => {
            console.log('⚠️  Could not check sitemap (site may not be live yet)');
            console.log(`   Error: ${error.message}\n`);
            resolve(false);
        });
        
        req.setTimeout(5000, () => {
            req.destroy();
            console.log('⚠️  Request timeout (site may not be live yet)\n');
            resolve(false);
        });
    });
}

// Validate sitemap.xml file
function validateSitemapFile() {
    console.log('📋 Validating sitemap.xml file...\n');
    
    const sitemapPath = path.join(__dirname, 'sitemap.xml');
    
    if (!fs.existsSync(sitemapPath)) {
        console.log('❌ sitemap.xml not found!');
        return false;
    }
    
    const content = fs.readFileSync(sitemapPath, 'utf8');
    
    // Basic validation
    const hasXMLHeader = content.includes('<?xml');
    const hasURLSet = content.includes('<urlset');
    const hasURLs = (content.match(/<url>/g) || []).length > 0;
    
    if (hasXMLHeader && hasURLSet && hasURLs) {
        const urlCount = (content.match(/<url>/g) || []).length;
        console.log('✅ sitemap.xml is valid!');
        console.log(`   Found ${urlCount} URLs\n`);
        return true;
    } else {
        console.log('❌ sitemap.xml appears to be invalid');
        return false;
    }
}

// Generate submission URLs
function generateSubmissionURLs() {
    console.log('🔗 Generating submission URLs...\n');
    
    console.log('📊 Google Search Console:');
    console.log('   1. Visit: https://search.google.com/search-console');
    console.log('   2. Add property: https://arisegenius.com');
    console.log('   3. Verify ownership');
    console.log(`   4. Submit sitemap: ${SITEMAP_URL}\n`);
    
    console.log('📊 Bing Webmaster Tools:');
    console.log('   1. Visit: https://www.bing.com/webmasters');
    console.log('   2. Add site: https://arisegenius.com');
    console.log('   3. Verify ownership');
    console.log(`   4. Submit sitemap: ${SITEMAP_URL}\n`);
    
    // Generate direct submission URLs (if API keys are available)
    console.log('💡 Direct Submission URLs (if you have API access):');
    console.log(`   Google: https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`);
    console.log(`   Bing: https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}\n`);
}

// Create verification meta tags template
function createVerificationTemplate() {
    console.log('📝 Creating verification meta tags template...\n');
    
    const template = `<!-- 
    Add these meta tags to your index.html <head> section
    after you get verification codes from Google and Bing
-->

<!-- Google Search Console Verification -->
<!-- Replace YOUR_GOOGLE_VERIFICATION_CODE with code from Search Console -->
<meta name="google-site-verification" content="YOUR_GOOGLE_VERIFICATION_CODE" />

<!-- Bing Webmaster Tools Verification -->
<!-- Replace YOUR_BING_VERIFICATION_CODE with code from Bing Webmaster Tools -->
<meta name="msvalidate.01" content="YOUR_BING_VERIFICATION_CODE" />
`;
    
    const outputPath = path.join(__dirname, 'verification-tags.txt');
    fs.writeFileSync(outputPath, template);
    console.log(`✅ Verification template saved to: ${outputPath}\n`);
}

// Main function
async function submitSitemap() {
    console.log('🚀 Sitemap Submission Helper\n');
    console.log('=' .repeat(50));
    console.log('');
    
    // Step 1: Validate sitemap file
    const isValid = validateSitemapFile();
    if (!isValid) {
        console.log('❌ Please fix sitemap.xml before proceeding\n');
        return;
    }
    
    // Step 2: Check accessibility (if site is live)
    await checkSitemapAccessibility();
    
    // Step 3: Generate submission instructions
    generateSubmissionURLs();
    
    // Step 4: Create verification template
    createVerificationTemplate();
    
    console.log('=' .repeat(50));
    console.log('📋 Next Steps:');
    console.log('1. Ensure your website is live and accessible');
    console.log('2. Follow the submission URLs above');
    console.log('3. Add verification meta tags to index.html');
    console.log('4. Submit sitemap in both Google and Bing');
    console.log('5. Monitor indexing status in 24-48 hours');
    console.log('');
    console.log('💡 For automated submission, you need:');
    console.log('   - Google Search Console API access');
    console.log('   - Bing Webmaster Tools API access');
    console.log('   - OAuth credentials');
    console.log('');
}

// Run if called directly
if (require.main === module) {
    submitSitemap();
}

module.exports = { submitSitemap, checkSitemapAccessibility, validateSitemapFile };

