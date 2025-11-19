# 📦 Setup Supabase Storage for Vendor Photos

## Why This Is Needed

Vercel's serverless functions can't write to the local filesystem. We need to use Supabase Storage to store vendor portfolio photos.

---

## Step 1: Create Storage Bucket

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/cksukpgjkuarktbohseh/storage/buckets

2. Click **"New bucket"**

3. Fill in:
   - **Name:** `vendor-photos`
   - **Public bucket:** ✅ Check this (so photos can be viewed publicly)

4. Click **"Create bucket"**

---

## Step 2: Set Up Storage Policies (Optional - for extra security)

If you want vendors to only be able to delete their own photos:

1. Go to Storage Policies: https://supabase.com/dashboard/project/cksukpgjkuarktbohseh/storage/policies

2. Select the `vendor-photos` bucket

3. Add these policies:

### Policy 1: Anyone can view photos
```sql
CREATE POLICY "Public can view vendor photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'vendor-photos');
```

### Policy 2: Authenticated users can upload
```sql
CREATE POLICY "Vendors can upload photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'vendor-photos'
  AND auth.role() = 'authenticated'
);
```

### Policy 3: Vendors can delete their own photos
```sql
CREATE POLICY "Vendors can delete own photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'vendor-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## Step 3: Test Upload

After creating the bucket:

1. Refresh your vendor dashboard
2. Click **"Upload Photos"**
3. Select an image
4. It should upload successfully!

---

## How It Works

- **Files are stored in:** `/vendor-photos/{vendorId}/{timestamp}.{ext}`
- **Public URL format:** `https://cksukpgjkuarktbohseh.supabase.co/storage/v1/object/public/vendor-photos/{vendorId}/{timestamp}.{ext}`
- **Database stores:** The public URL in the `vendor_photos` table
- **Limits enforced:** By your tier (Free=1, Premium=25, Featured=50, Elite=999)

---

## Done!

Once you create the `vendor-photos` bucket with **Public bucket** enabled, photo uploads will work!
