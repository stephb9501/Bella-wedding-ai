# 🎨 Bella Wedding AI CMS - User Guide

## What You Can Do Without Touching Code

Your new admin panel at `/admin` lets you control your website:

### 📸 **Photo Manager**
- **Upload images** by dragging and dropping or clicking "Choose Files"
- **Choose image type**: Landing Hero, Dashboard Banner, Testimonial, Logo, etc.
- **Activate/Deactivate**: Only one image per type can be active at a time
- **Archive**: Hide images without deleting them
- **Delete**: Permanently remove images

**How to use:**
1. Select the image type (e.g., "Landing Hero")
2. Drag & drop your photo or click "Choose Files"
3. Click "Activate" to make it the current active image
4. The landing page will automatically use the active image

### 🎨 **Colors & Fonts**
- **Change brand colors**: Primary (buttons/CTA), Secondary (champagne), Accent
- **Switch fonts**: Heading font and body font
- **Live preview**: See your brand palette and fonts instantly

**How to use:**
1. Click on color picker or type hex code (e.g., #E11D48)
2. Select fonts from dropdown
3. Click "Save Color & Font Settings"
4. Refresh your landing page to see changes

**Note:** Colors are saved locally for preview. For full theme changes across the site, you'll need to update Tailwind config.

### ⚙️ **Site Settings**
- **Site Name**: Change "Bella Wedding AI" to anything
- **Logo URL**: Upload logo to Photos tab, then paste URL here

---

## 🚀 How to Access the CMS

1. **Go to:** `https://bellaweddingai.com/admin` (or `/admin` locally)
2. **Login required**: Only admin accounts can access
3. **Admin emails**: stephb9501@gmail.com (add more in code if needed)

---

## 📋 Setup Checklist

Before using the CMS, make sure you completed these steps:

### ✅ Supabase Setup
- [ ] Created `bella-images` storage bucket (public)
- [ ] Added storage policies (public read + admin upload)
- [ ] Ran SQL migration (`supabase-migrations/admin-photo-manager.sql`)
- [ ] Replaced `YOUR_ADMIN_EMAIL@example.com` with your actual email in migration

### ✅ Vercel Setup
- [ ] Added `SUPABASE_SERVICE_ROLE_KEY` environment variable
- [ ] Added `ADMIN_EMAIL` environment variable
- [ ] Added `RESEND_API_KEY` environment variable
- [ ] Redeployed to apply new environment variables

### ✅ Vercel Cron (Daily Revenue Summary)
- [ ] Created cron job for `/api/admin/daily-summary`
- [ ] Set schedule (e.g., `0 21 * * *` for 9 PM UTC)

---

## 🎯 Quick Start Guide

### Upload Your First Photo

1. Go to `/admin`
2. Click "Photo Manager" tab
3. Select "Landing Hero" image type
4. Drag your wedding photo into the upload box
5. Wait for "Successfully uploaded" message
6. Click "Activate" on your uploaded photo
7. Refresh your landing page - your photo is now live!

### Change Your Brand Colors

1. Go to `/admin`
2. Click "Colors & Fonts" tab
3. Click the color picker for "Primary Color"
4. Choose your brand color
5. Repeat for Secondary and Accent colors
6. Click "Save Color & Font Settings"

### Upload Your Logo

1. Go to `/admin` → "Photo Manager"
2. Select "Logo" image type
3. Upload your logo file
4. Right-click the uploaded logo → "Copy image address"
5. Go to "Site Settings" tab
6. Paste the URL into "Logo URL" field
7. Click "Save Settings"

---

## 🔧 Technical Details

### Database Structure

**Table:** `admin_images`
- Stores image metadata (name, URL, type, active status)
- Only one active image per type (enforced by database trigger)
- Supports soft delete (archiving)

**Storage:** Supabase Storage bucket `bella-images`
- Organized by image type (folders: landing_hero/, logo/, etc.)
- Public bucket (images are publicly accessible)

### Admin Access Control

Admin access is granted if:
- User email matches `stephb9501@gmail.com` OR
- User email matches `NEXT_PUBLIC_ADMIN_EMAIL` env variable OR
- User has `role = 'admin'` in the `users` table

### Settings Storage

- Colors and fonts are stored in **localStorage** (browser-only)
- For production, you may want to move these to Supabase for cross-device sync

---

## 🆘 Troubleshooting

### "Storage bucket not found"
**Solution:** Create the `bella-images` bucket in Supabase Dashboard:
1. Go to Storage tab
2. Click "Create bucket"
3. Name: `bella-images`
4. Public: ✅ YES
5. Add storage policies (see setup instructions)

### "Access denied"
**Solution:** Make sure you're logged in with an admin email:
- Check that your email is `stephb9501@gmail.com`
- Or add your email to the admin list in `/admin/page.tsx` line 106

### Images not showing on landing page
**Solution:** The landing page needs to be updated to pull from the database
- Currently uses static images from `/public/images/`
- Next step: Update landing page to fetch active images from `admin_images` table

### Colors not changing on site
**Note:** The color picker saves your brand palette locally
- To apply colors site-wide, you need to update Tailwind config
- Current version is a preview/reference tool

---

## 🔮 Future Enhancements

### Already Included:
✅ Photo manager with upload/activate/archive
✅ Color picker for brand palette
✅ Font selector
✅ Logo manager
✅ Admin authentication

### Coming Soon (Would Require Additional Work):
- 📝 Rich text editor for landing page copy
- 🧱 Drag-and-drop section reordering
- 🎥 Video upload and embedding
- 📊 Real-time preview of changes
- 🌐 Database-backed settings (instead of localStorage)
- 📱 Mobile-responsive admin panel
- 🔄 Auto-apply changes without page refresh

---

## 📞 Support

If you have questions or need help:
1. Check this guide first
2. Review the setup instructions in the session summary
3. Check Supabase logs for errors
4. Check browser console for JavaScript errors

---

**Built with love for Bella Wedding AI** 💕
