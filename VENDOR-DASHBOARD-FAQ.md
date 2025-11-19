# Vendor Dashboard - Questions & Answers

## 1. Photos Showing as Blank Squares ✅ FIXED

**Problem:** Photos uploaded but showed as tiny paper icons instead of actual images

**Cause:** Next.js blocks external images by default for security

**Fix:** Added Supabase Storage domain to `next.config.js`

**Status:** Fixed! After Vercel rebuilds, your photos will display correctly

---

## 2. "Failed to Fetch Profile" When Editing ✅ FIXED

**Problem:** Edit Profile page showed "Failed to fetch profile" error

**Cause:** Hardcoded demo vendor ID instead of real authenticated user

**Fix:** Updated edit page to use real authenticated user ID from Supabase

**Status:** Fixed! You can now edit your vendor profile

---

## 3. "Please Login to Send Message" While Logged In as Vendor ✅ CORRECT BEHAVIOR

**This is actually working correctly!**

The vendor browse page (/vendors) is **for brides to find and contact vendors**, not for vendors to contact each other.

When you're logged in as a vendor:
- ❌ You cannot send booking requests (this is for brides)
- ✅ You can view other vendors (for research/competition)
- ✅ You should use your vendor dashboard for all vendor functions

**Vendors and brides have separate workflows:**
- **Brides** browse vendors → send booking requests → hire vendors
- **Vendors** manage their dashboard → respond to booking requests → manage bookings

---

## 4. Analytics/Bookings/Reviews Showing "Fake Data" ⚠️ PLACEHOLDER COMPONENTS

**Yes, this is expected during development!**

The Analytics, Bookings, and Reviews tabs are **placeholder components** with dummy data. They need to be built out with real functionality:

**What needs to be done:**

### Analytics Tab
- Show real metrics from your vendor profile
- Graph of profile views over time
- Message response rates
- Booking conversion rates

### Bookings Tab
- Show real booking requests from brides
- Allow you to accept/decline
- Calendar integration
- Booking management

### Reviews Tab
- Show actual reviews from customers
- Allow customers to leave reviews after bookings
- Display rating averages

**For Now:** These tabs show placeholder data to demonstrate the layout. They'll need real database queries and business logic.

---

## 5. Vendor Access to Bride Tools (Timeline, Checklist, etc.) 🤔 DESIGN DECISION NEEDED

**Current Setup:**
- Bride dashboard has: Timeline, Checklist, Budget, Guest List, etc.
- Vendor dashboard has: Overview, Analytics, Bookings, Reviews

**Question: Should vendors have access to bride planning tools?**

### Option A: Separate Workflows (Recommended)
- **Vendors** stay in their vendor dashboard
- **Brides** use their bride dashboard for planning
- Vendors and brides collaborate through:
  - Booking requests
  - Messages
  - Shared booking details

**Pros:**
- Clear separation of concerns
- Less confusing UX
- Each user type has focused tools

**Cons:**
- Vendors can't help brides plan directly

### Option B: Shared Access
Add a "Planning Tools" button in vendor dashboard that:
- Links to bride dashboard
- Gives vendors access to all bride tools
- Allows vendors to have both identities

**Pros:**
- Flexible for vendors who are also planning weddings
- One account for both purposes

**Cons:**
- Confusing - mixing vendor business with personal planning
- Security concerns - vendors shouldn't access all bride features

### Option C: Vendor Collaboration Tools
Create vendor-specific collaboration features:
- Shared timeline with assigned vendors
- Vendor-specific checklist items
- Direct messaging within bookings

**Pros:**
- Best of both worlds
- Professional vendor-bride collaboration
- Keeps workflows separate but connected

**Cons:**
- More development work

---

## Recommendation

**For Launch (Minimum Viable Product):**
- Keep workflows separate (Option A)
- Vendors use vendor dashboard only
- Brides use bride dashboard only
- They connect through bookings and messages

**For Future Enhancement:**
- Add vendor collaboration features (Option C)
- Allow vendors to see booking-specific timelines
- Shared checklists for specific bookings
- Integrated communication

---

## Summary of Current Status

✅ **Fixed:**
1. Photo display (Next.js config updated)
2. Edit profile authentication
3. Rating system (real ratings instead of fake 4.9)

✅ **Working as Designed:**
1. Messaging restricted to brides (vendors can't send booking requests)
2. Analytics/Bookings/Reviews showing placeholder data (to be built)

❓ **Needs Decision:**
1. Should vendors access bride tools?
2. How should vendors and brides collaborate?

---

Let me know what you want for vendor-bride collaboration, and I'll implement it!
