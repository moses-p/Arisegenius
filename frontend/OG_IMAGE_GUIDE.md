# OG Image Creation Guide - Arisegenius

## 🎨 Step 1: Creating Open Graph Images

### What Are OG Images?

Open Graph (OG) images are the preview images that appear when your website pages are shared on social media platforms like:
- Facebook
- Twitter/X
- LinkedIn
- WhatsApp
- Telegram
- Slack
- And many more!

### Why They Matter

1. **Higher Click-Through Rates**: Attractive images get 2-3x more clicks
2. **Brand Recognition**: Consistent visuals build brand awareness
3. **Professional Appearance**: Shows attention to detail
4. **Better Engagement**: Visual content performs better on social media

---

## 📐 Image Specifications

### Required Dimensions:
- **Width**: 1200 pixels
- **Height**: 630 pixels
- **Aspect Ratio**: 1.91:1
- **File Format**: PNG or JPG
- **File Size**: Under 300KB (optimized)
- **Color Space**: RGB

### Why These Dimensions?
- Facebook's recommended size: 1200x630px
- Twitter's recommended size: 1200x675px (we use 630px for compatibility)
- LinkedIn's recommended size: 1200x627px
- This size works across all major platforms

---

## 🎨 Design Guidelines

### Brand Colors:
- **Background**: Dark (#090101 or #1a1a1a)
- **Accent**: Gold (#d78a00)
- **Text**: White (#ffffff)
- **Secondary Text**: Light Gray (#cccccc)

### Typography:
- **Font**: Inter (or similar sans-serif)
- **Logo**: Large, bold "ARISEGENIUS" in gold
- **Title**: 48-56px, bold, white
- **Description**: 24-28px, regular, light gray

### Layout:
- **Padding**: 60px on all sides
- **Logo**: Top left, 32px font
- **Title**: Below logo, prominent
- **Description**: Below title, 2-3 lines max
- **Accent Bar**: Bottom, 8px height, gold gradient

---

## 📋 Pages That Need OG Images

1. **Homepage** (`og-home.png`)
   - Title: "Leading African Tire Innovation"
   - Description: "Premium quality tires for all vehicles..."

2. **Products** (`og-products.png`)
   - Title: "Premium Tires for Every Vehicle"
   - Description: "Discover our complete range..."

3. **About** (`og-about.png`)
   - Title: "About Arisegenius"
   - Description: "Discover our mission, values..."

4. **Technology** (`og-technology.png`)
   - Title: "Innovation & Engineering"
   - Description: "Cutting-edge technology..."

5. **Sustainability** (`og-sustainability.png`)
   - Title: "Environmental Impact"
   - Description: "Responsible manufacturing practices..."

6. **News** (`og-news.png`)
   - Title: "News & Insights"
   - Description: "Stories from our innovation labs..."

7. **Contact** (`og-contact.png`)
   - Title: "Contact Us"
   - Description: "Get in touch with our regional teams..."

8. **Ventures** (`og-ventures.png`)
   - Title: "Digital Innovation & Brand Excellence"
   - Description: "Enterprise software solutions..."

9. **Payment** (`og-payment.png`)
   - Title: "Secure Payment"
   - Description: "Multiple secure payment options..."

---

## 🛠️ How to Create OG Images

### Method 1: Using the HTML Generator (Easiest)

1. **Open the Generator**
   - Open `og-image-generator.html` in your browser
   - Select the page you want to create an image for

2. **Capture the Image**
   - Right-click on the preview canvas
   - Select "Inspect" or "Inspect Element"
   - In DevTools, right-click the canvas div
   - Choose "Capture node screenshot"
   - Save as `og-[pagename].png`

3. **Optimize**
   - Use [TinyPNG](https://tinypng.com) or [Squoosh](https://squoosh.app)
   - Ensure file size is under 300KB
   - Keep quality at 85-90%

### Method 2: Using Design Software

**Tools:**
- **Figma** (Free, web-based)
- **Canva** (Free, templates available)
- **Adobe Photoshop** (Paid)
- **GIMP** (Free, open-source)

**Steps:**
1. Create new canvas: 1200x630px
2. Add dark background (#090101)
3. Add gold accent bar at bottom
4. Add logo text "ARISEGENIUS" in gold (#d78a00)
5. Add page title in white, bold
6. Add description in light gray
7. Export as PNG
8. Optimize file size

### Method 3: Using Online Tools

**Recommended Tools:**
- [OG Image Generator](https://www.opengraph.xyz/)
- [Social Share Preview](https://socialsharepreview.com/)
- [Canva OG Image Templates](https://www.canva.com/templates/)

---

## 📤 Uploading OG Images

1. **Save Images**
   - Save all OG images to `frontend/` directory
   - Name them: `og-home.png`, `og-products.png`, etc.

2. **Update HTML Files**
   - Update the `og:image` meta tag in each HTML file
   - Change from: `android-chrome-512x512.png`
   - To: `og-[pagename].png`

3. **Example Update:**
   ```html
   <!-- Before -->
   <meta property="og:image" content="https://arisegenius.com/android-chrome-512x512.png">
   
   <!-- After -->
   <meta property="og:image" content="https://arisegenius.com/og-home.png">
   ```

---

## ✅ Quality Checklist

Before finalizing your OG images, ensure:

- [ ] Dimensions are exactly 1200x630px
- [ ] File size is under 300KB
- [ ] Text is readable and not cut off
- [ ] Brand colors are consistent
- [ ] Logo is visible and clear
- [ ] Description fits on 2-3 lines
- [ ] Image looks good on dark and light backgrounds
- [ ] All text is legible at small sizes (mobile preview)

---

## 🧪 Testing OG Images

### Test Your Images:

1. **Facebook Debugger**
   - Visit: https://developers.facebook.com/tools/debug/
   - Enter your page URL
   - Click "Scrape Again" to see preview
   - Fix any issues shown

2. **Twitter Card Validator**
   - Visit: https://cards-dev.twitter.com/validator
   - Enter your page URL
   - See how it appears on Twitter

3. **LinkedIn Post Inspector**
   - Visit: https://www.linkedin.com/post-inspector/
   - Enter your page URL
   - See LinkedIn preview

4. **Open Graph Preview**
   - Visit: https://www.opengraph.xyz/
   - Enter your page URL
   - See preview across platforms

---

## 🎯 Best Practices

1. **Consistency**: Use same design style across all pages
2. **Branding**: Always include logo or brand name
3. **Readability**: Ensure text is large enough to read
4. **Contrast**: High contrast between text and background
5. **Relevance**: Image should match page content
6. **Optimization**: Always optimize file size
7. **Testing**: Test on multiple platforms before finalizing

---

## 📝 Quick Reference

**File Naming:**
- `og-home.png` - Homepage
- `og-products.png` - Products page
- `og-about.png` - About page
- `og-technology.png` - Technology page
- `og-sustainability.png` - Sustainability page
- `og-news.png` - News page
- `og-contact.png` - Contact page
- `og-ventures.png` - Ventures page
- `og-payment.png` - Payment page

**Meta Tag Format:**
```html
<meta property="og:image" content="https://arisegenius.com/og-[pagename].png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="[Page Title]">
```

---

## 🚀 Next Steps

1. **Create Images**: Use the generator or design software
2. **Optimize**: Compress to under 300KB
3. **Upload**: Place in `frontend/` directory
4. **Update HTML**: Update og:image meta tags
5. **Test**: Use Facebook Debugger and other tools
6. **Deploy**: Push to production
7. **Verify**: Check social media previews

---

**Need Help?** The `og-image-generator.html` file provides a visual template you can use as a starting point!

