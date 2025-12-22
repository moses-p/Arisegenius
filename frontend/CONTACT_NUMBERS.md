# Contact Numbers Configuration

## Mobile Money Payment Numbers

These numbers are used consistently across the entire site for MTN and Airtel mobile money payments:

### MTN Mobile Money
- **Display Format**: +256 775 538 145
- **Raw Format**: 256775538145
- **Link**: tel:+256775538145
- **Usage**: Primary contact for MTN Mobile Money payments via Pesapal

### Airtel Money
- **Display Format**: +256 743 232 445
- **Raw Format**: 256743232445
- **Link**: tel:+256743232445
- **Usage**: Primary contact for Airtel Money payments via Pesapal

## Where These Numbers Are Used

1. **Contact Page** (`contact.html`)
   - Displayed in the "Call Us" section
   - Clickable phone links

2. **Ventures Page** (`ventures.html`)
   - Displayed in the contact section
   - Clickable phone links

3. **Payment Page** (`payment.html`)
   - Shown in mobile money payment options
   - Displayed in payment support info box
   - Visible when selecting MTN or Airtel payment methods

4. **Payment Receipt** (`payment.js`)
   - Included in payment receipt/confirmation emails

5. **Backend Payment Service** (`backend/src/services/paymentService.ts`)
   - Used as default phone numbers when processing Pesapal payments
   - Automatically applied if no phone number is provided in payment request

## Configuration File

All contact numbers are centralized in:
- `frontend/config/contacts.js` - Frontend configuration
- `backend/.env` - Backend environment variables:
  - `MTN_DEFAULT_PHONE=256775538145`
  - `AIRTEL_DEFAULT_PHONE=256743232445`

## Consistency

These numbers are used:
- ✅ In Pesapal payment processing (backend)
- ✅ On all contact pages (frontend)
- ✅ In payment pages (frontend)
- ✅ In support documentation
- ✅ As default values when no phone is provided

---

**Last Updated**: All contact numbers are now consistent across the site.

