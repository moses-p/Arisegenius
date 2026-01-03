/**
 * Convert OG Image HTML templates to PNG files using Puppeteer
 * Run: npm install puppeteer (if not already installed)
 * Then: node convert-og-images.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { pages } = require('./generate-og-images');

async function convertOGImages() {
    console.log('🚀 Starting OG Image Conversion...\n');
    
    const tempDir = path.join(__dirname, 'og-images-temp');
    const outputDir = __dirname;
    
    // Check if temp directory exists
    if (!fs.existsSync(tempDir)) {
        console.error('❌ Error: og-images-temp directory not found!');
        console.log('💡 Run: node generate-og-images.js first');
        process.exit(1);
    }
    
    let browser;
    try {
        // Launch browser
        console.log('🌐 Launching browser...');
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Set viewport to OG image size
        await page.setViewport({
            width: 1200,
            height: 630,
            deviceScaleFactor: 2 // For better quality
        });
        
        // Convert each HTML file to PNG
        for (const pageData of pages) {
            const htmlPath = path.join(tempDir, `${pageData.name}.html`);
            const outputPath = path.join(outputDir, pageData.filename);
            
            if (!fs.existsSync(htmlPath)) {
                console.log(`⚠️  Skipping ${pageData.name}.html (not found)`);
                continue;
            }
            
            console.log(`📸 Converting: ${pageData.name}...`);
            
            // Load HTML file
            const htmlContent = fs.readFileSync(htmlPath, 'utf8');
            await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
            
            // Wait a bit for fonts and rendering
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Take screenshot
            await page.screenshot({
                path: outputPath,
                type: 'png',
                fullPage: false,
                clip: {
                    x: 0,
                    y: 0,
                    width: 1200,
                    height: 630
                }
            });
            
            console.log(`✅ Created: ${pageData.filename}`);
        }
        
        console.log('\n🎉 All OG images generated successfully!');
        console.log(`📁 Images saved to: ${outputDir}/`);
        console.log('\n📋 Next Steps:');
        console.log('1. Optimize images using TinyPNG or similar tool');
        console.log('2. Update HTML files with new OG image paths');
        console.log('3. Run: node update-og-tags.js (to auto-update HTML)');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.message.includes('puppeteer')) {
            console.log('\n💡 Install Puppeteer: npm install puppeteer');
        }
        process.exit(1);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Run if called directly
if (require.main === module) {
    convertOGImages().catch(console.error);
}

module.exports = { convertOGImages };

