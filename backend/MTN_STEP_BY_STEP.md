# MTN Mobile Money - Step-by-Step Guide

## 📱 Complete Walkthrough to Get Your Subscription Key

### Step 1: Access MTN Developer Portal

1. **Open your browser** and go to: **https://momodeveloper.mtn.com**
2. You'll see the MTN Mobile Money Developer Portal homepage

### Step 2: Sign Up / Login

**If you're NEW:**
1. Click **"Sign Up"** or **"Register"** button (usually top right)
2. Fill in the registration form:
   - Email address
   - Password
   - Phone number
   - Country
   - Accept terms and conditions
3. Verify your email (check your inbox)
4. Complete any additional verification steps

**If you already have an account:**
1. Click **"Login"** or **"Sign In"**
2. Enter your email and password
3. Complete 2FA if enabled

### Step 3: Navigate to Products

Once logged in:
1. Look for **"Products"** in the main navigation menu (usually top or sidebar)
2. Click on **"Products"** or **"My Products"**
3. You may see options like:
   - **Collection** (for receiving payments)
   - **Disbursement** (for sending payments)
   - **Remittance** (for transfers)

### Step 4: Create a Product

**Option A: Create New Product**
1. Click **"Create Product"** or **"Add Product"** button
2. Select product type:
   - For receiving payments: Choose **"Collection"**
   - For sending payments: Choose **"Disbursement"**
3. Fill in product details:
   - Product name (e.g., "Arisegenius Payments")
   - Description
   - Environment: Select **"Sandbox"** for testing
4. Submit the form

**Option B: Use Existing Product**
1. If you already have a product, click on it from the list
2. Go to the product dashboard

### Step 5: Get Your Subscription Key

Once you're in your product dashboard:

1. **Look for "API Keys" or "Subscription Key" section**
   - This might be in:
     - Product settings
     - API credentials
     - Security settings
     - Developer tools

2. **Find the Subscription Key:**
   - It's usually labeled as:
     - "Subscription Key"
     - "Primary Key"
     - "API Key"
     - "Ocp-Apim-Subscription-Key"
   - It's typically a long alphanumeric string
   - May look like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

3. **Copy the key:**
   - Click the "Copy" button if available
   - Or select and copy the entire key
   - Make sure you copy the complete key (no truncation)

### Step 6: Verify Environment

Make sure you're using:
- **Sandbox** for testing (recommended first)
- **Production** only when ready for live payments

### Step 7: Common Locations in Dashboard

If you can't find the Subscription Key, check these areas:

1. **Product Overview/Dashboard**
   - Main product page
   - Look for "Credentials" or "API Information"

2. **Settings Tab**
   - Product settings
   - API settings
   - Security settings

3. **Developer Tools**
   - API documentation section
   - Integration guides
   - Credentials section

4. **Account Settings**
   - Sometimes keys are in account-level settings

### Step 8: Troubleshooting

**If you can't find the Subscription Key:**

1. **Check if product is approved:**
   - Some portals require product approval first
   - Check for "Pending" or "Approval" status

2. **Contact Support:**
   - Use the support/help section
   - MTN Developer Portal usually has a help desk

3. **Check Documentation:**
   - Look for "Getting Started" guides
   - Review API documentation

### Step 9: Security Notes

⚠️ **Important:**
- Keep your Subscription Key **SECRET**
- Never share it publicly
- Don't commit it to git
- Use different keys for sandbox and production

---

## ✅ After Getting Your Key

Once you have your Subscription Key:

1. **Share it with me** and I'll add it to your `.env` file
2. **OR** run: `node backend/setup-mtn.js` and enter it
3. **OR** manually edit `backend/.env`:
   ```env
   MTN_SUBSCRIPTION_KEY="your_key_here"
   MTN_ENVIRONMENT="sandbox"
   ```

4. **Restart your backend** to see:
   ```
   ✅ Payment services initialized
     - MTN Mobile Money: ✅ Configured
   ```

---

## 🆘 Need Help?

If you encounter any issues:
- Check the MTN Developer Portal help section
- Review their API documentation
- Contact MTN Developer Support

