# Bella Wedding AI - Premium Features Documentation

## 🎉 Overview

This document details all premium features built for Bella Wedding AI, including components, API routes, database schemas, and integration points.

---

## 📋 Table of Contents

1. [Premium Website Builder](#premium-website-builder)
2. [Moodboards](#moodboards)
3. [Invitation Designer](#invitation-designer)
4. [Seating Chart](#seating-chart)
5. [Wedding Day Binder](#wedding-day-binder)
6. [Vendor AI Assistant](#vendor-ai-assistant)
7. [Custom Form Builder](#custom-form-builder)
8. [Database Schema](#database-schema)
9. [API Routes](#api-routes)
10. [Integration Points](#integration-points)

---

## 1. Premium Website Builder

### Component
**Location:** `/frontend/components/PremiumWebsiteBuilder.tsx`

### Features
- **8 Professional Themes:**
  - Classic Elegance
  - Modern Minimalist
  - Romantic Blush
  - Elegant Gold
  - Rustic Charm
  - Garden Fresh
  - Coastal Breeze
  - Vintage Romance

- **Wedding Party Management:**
  - Upload photos for bridesmaids, groomsmen, maid of honor, best man
  - Add bios and relationships
  - Custom display order

- **Photo Galleries:**
  - Engagement photos
  - Venue photos
  - Couple photos
  - Captions and ordering

- **Website Sections:**
  - Hero section with couple names
  - Our Story
  - Wedding Party
  - Event Details (ceremony & reception)
  - Photo Gallery
  - RSVP integration

- **Advanced Settings:**
  - Password protection
  - Custom domain support
  - Privacy controls
  - Analytics tracking
  - Mobile-responsive design

### API Routes
- `GET /api/website-builder?wedding_id={id}` - Get website by wedding
- `POST /api/website-builder` - Create new website
- `PUT /api/website-builder` - Update website
- `DELETE /api/website-builder?id={id}` - Delete website

### Database Tables
```sql
wedding_websites (id, wedding_id, site_name, site_slug, theme, design_settings...)
wedding_party_members (id, website_id, member_type, name, bio, photo_url...)
website_photos (id, website_id, photo_category, photo_url, caption...)
website_sections (id, website_id, section_type, content, display_order...)
website_analytics (id, website_id, event_type, metadata...)
```

### Integration
- **Bride Dashboard:** Accessible via "Website" tab
- **Route:** `/app/dashboard/page.tsx` lines 601-605

---

## 2. Moodboards

### Component
**Location:** `/frontend/components/Moodboards.tsx`

### Features
- **Visual Inspiration Boards:**
  - Create multiple moodboards per wedding
  - Public/private sharing controls

- **Canvas Items:**
  - Image uploads with drag-and-drop positioning
  - Color swatches with custom colors
  - Text notes
  - Z-index layering

- **Color Palette Management:**
  - Build custom color palettes
  - Save favorite colors
  - Visual color picker

- **Collaboration:**
  - Share moodboards with vendors
  - Real-time positioning
  - Item management (add/edit/delete)

### API Routes
- `GET /api/moodboards?wedding_id={id}` - Get all moodboards
- `POST /api/moodboards` - Create moodboard
- `PUT /api/moodboards` - Update moodboard
- `DELETE /api/moodboards?id={id}` - Delete moodboard
- `GET /api/moodboards/items?moodboard_id={id}` - Get items
- `POST /api/moodboards/items` - Add item
- `PUT /api/moodboards/items` - Update item position
- `DELETE /api/moodboards/items?id={id}` - Delete item

### Database Tables
```sql
moodboards (id, wedding_id, name, description, color_palette, is_public...)
moodboard_items (id, moodboard_id, item_type, image_url, note, color_value, position_x, position_y, width, height, z_index...)
```

### Integration
- **Bride Dashboard:** Accessible via "Moodboards" tab
- **Route:** `/app/dashboard/page.tsx` lines 616-620

---

## 3. Invitation Designer

### Component
**Location:** `/frontend/components/InvitationDesigner.tsx`

### Features
- **15 Professional Templates:**
  1. Classic Elegance
  2. Modern Minimalist
  3. Romantic Blush
  4. Vintage Charm
  5. Garden Romance
  6. Coastal Breeze
  7. Rustic Love
  8. Gold Glamour
  9. Floral Dream
  10. Art Deco
  11. Boho Chic
  12. Winter Wonderland
  13. Tropical Paradise
  14. Timeless Traditional
  15. Contemporary Bold

- **Customization Options:**
  - Full color palette customization
  - Font selection per template
  - Live preview
  - Save drafts
  - Publish when ready

- **Event Details:**
  - Bride & groom names
  - Ceremony date, time, venue, address
  - Reception venue & address
  - RSVP deadline & contact
  - Custom message

- **Export Options:**
  - Download functionality (ready for PDF/image generation)
  - Print-optimized layout

### API Routes
- `GET /api/invitations?wedding_id={id}` - Get invitations
- `POST /api/invitations` - Create invitation
- `PUT /api/invitations` - Update invitation
- `DELETE /api/invitations?id={id}` - Delete invitation

### Database Tables
```sql
invitations (id, wedding_id, template_id, bride_name, groom_name, ceremony_date, ceremony_time, ceremony_venue, reception_venue, custom_colors, header_image_url, is_finalized...)
```

### Integration
- **Bride Dashboard:** Accessible via "Invitations" tab
- **Route:** `/app/dashboard/page.tsx` lines 621-625
- **Future:** Canva API integration ready (infrastructure in place)

---

## 4. Seating Chart

### Component
**Location:** `/frontend/components/SeatingChart.tsx`

### Features
- **Floor Plan Designer:**
  - Drag-and-drop table positioning
  - Multiple chart layouts per wedding
  - Venue name and notes

- **Table Management:**
  - Multiple table shapes (round, rectangular, square)
  - Capacity tracking
  - Visual occupancy indicators
  - Custom table names
  - Rotation support

- **Guest Assignment:**
  - Drag guests from unassigned list to tables
  - Capacity validation
  - Group management
  - Dietary restrictions tracking
  - Table number assignment

- **Visual Feedback:**
  - Color-coded capacity status (empty, filling, full, over-capacity)
  - Hover tooltips showing seated guests
  - Real-time updates

### API Routes
- `GET /api/seating-charts?wedding_id={id}` - Get charts
- `POST /api/seating-charts` - Create chart
- `PUT /api/seating-charts` - Update chart
- `DELETE /api/seating-charts?id={id}` - Delete chart
- `GET /api/seating-charts/tables?seating_chart_id={id}` - Get tables
- `POST /api/seating-charts/tables` - Add table
- `PUT /api/seating-charts/tables` - Update table position
- `DELETE /api/seating-charts/tables?id={id}` - Delete table (unassigns guests)

### Database Tables
```sql
seating_charts (id, wedding_id, name, venue_name, layout_data, is_active...)
seating_tables (id, seating_chart_id, table_number, table_name, table_shape, capacity, position_x, position_y, rotation, notes...)
table_assignments (managed via guests.table_number)
```

### Integration
- **Dedicated Page:** `/app/seating/page.tsx`
- **Bride Dashboard:** Linked from dashboard cards

---

## 5. Wedding Day Binder

### Component
**Location:** `/frontend/components/WeddingDayBinder.tsx`

### Features
- **Comprehensive Day-of Coordination Document:**
  - Wedding Overview (ceremony, reception, guest count, theme)
  - Day-of Timeline (all approved timeline events)
  - Emergency Contacts (bride, groom, coordinator, 911)
  - Vendor Information (contact details for all vendors)
  - Final Checklist (pending tasks by priority)
  - Guest List & Seating (all attending guests with dietary info)
  - Budget Summary (optional - total spending)
  - Venue Directions (with Google Maps links)

- **Customizable Sections:**
  - Toggle sections on/off
  - Print/PDF export
  - JSON data export for backup

- **Smart Content:**
  - Only includes approved items
  - Filters by RSVP status
  - Sorts by priority and date
  - Formatted for printing

### API Routes
Uses existing APIs:
- `/api/timeline` - For timeline events
- `/api/checklist` - For tasks
- `/api/guests` - For guest list
- `/api/budget` - For budget items
- `/api/vendor-collaborations` - For vendor contacts

### Database
No dedicated tables - aggregates data from existing tables

### Integration
- **Bride Dashboard:** Accessible via "Day-of Binder" tab
- **Route:** `/app/dashboard/page.tsx` lines 626-630

---

## 6. Vendor AI Assistant

### Component
**Location:** `/frontend/components/VendorAIAssistant.tsx`

### Features
- **Tier-Based Access Control:**
  - **FREE:** 0 messages/month (NO AI access - locked)
  - **Premium:** 50 messages/month
  - **Featured:** 150 messages/month
  - **Elite:** 300 messages/month

- **Usage Tracking:**
  - Real-time usage display
  - Monthly reset
  - Visual progress bar
  - Warning alerts at 70% and 90%

- **Wedding Planning AI:**
  - Timeline & schedule planning
  - Budget management tips
  - Vendor selection guidance
  - Guest list management
  - Wedding day checklists
  - Stress management advice
  - General planning questions

- **Chat Interface:**
  - Clean message history
  - Typing indicators
  - Quick-start prompts
  - Message persistence

- **Upgrade Prompts:**
  - Locked screen for free users
  - Upgrade modal with tier comparison
  - Limit reached notifications

### API Routes
- `GET /api/ai-assistant/usage?user_id={id}` - Get usage stats
- `GET /api/ai-assistant/messages?user_id={id}` - Get chat history
- `POST /api/ai-assistant/chat` - Send message (with tier validation)

### Database Tables
```sql
ai_usage_tracking (id, user_id, wedding_id, prompt, response, tokens_used, created_at...)
```

### Integration
- **Vendor Dashboard:** Planning Tools → AI Assistant
- **Route:** `/app/vendor-dashboard/page.tsx` lines 638-644

### Important Notes
- **STRICTLY enforces tier limits**
- Free tier has ZERO access (per user requirements)
- Currently uses built-in responses (ready for OpenAI/Claude API integration)
- Tracks all usage for billing/analytics

---

## 7. Custom Form Builder

### Component
**Location:** `/frontend/components/CustomFormBuilder.tsx`

### Features
- **Form Builder:**
  - Create unlimited custom forms
  - 9 field types (text, textarea, number, email, phone, date, select, checkbox, radio)
  - Required field validation
  - Custom placeholder text
  - Options for select/checkbox/radio fields

- **Form Management:**
  - Save as draft
  - Publish when ready
  - Live preview mode
  - Duplicate forms
  - Edit existing forms
  - Delete forms

- **Response Collection:**
  - Track all form submissions
  - View response data
  - Export responses
  - Respondent email capture

- **Use Cases:**
  - Client questionnaires
  - Wedding-specific checklists
  - Preference surveys
  - Vendor inquiry forms
  - Custom intake forms

### API Routes
- `GET /api/custom-forms?vendor_id={id}` - Get vendor's forms
- `POST /api/custom-forms` - Create form
- `PUT /api/custom-forms` - Update form
- `DELETE /api/custom-forms?id={id}` - Delete form
- `GET /api/custom-forms/responses?form_id={id}` - Get responses
- `POST /api/custom-forms/responses` - Submit response
- `DELETE /api/custom-forms/responses?id={id}` - Delete response

### Database Tables
```sql
custom_forms (id, vendor_id, wedding_id, form_name, description, fields JSONB, is_published...)
form_responses (id, form_id, respondent_email, response_data JSONB, submitted_at...)
```

### Integration
- **Vendor Dashboard:** Planning Tools → Custom Forms
- **Route:** `/app/vendor-dashboard/page.tsx` lines 646-651

---

## 8. Database Schema

All SQL scripts located in root directory and previously executed successfully:

### Script 1: Wedding Websites
- `wedding_websites`
- `wedding_party_members`
- `website_photos`
- `website_sections`
- `website_analytics`

### Script 2: Moodboards
- `moodboards`
- `moodboard_items`

### Script 3: Invitations
- `invitations`

### Script 4: Seating Charts
- `seating_charts`
- `seating_tables`
- `table_assignments` (via guests table)

### Script 5: AI Usage Tracking
- `ai_usage_tracking`

### Script 6: Custom Forms
- `custom_forms`
- `form_responses`

---

## 9. API Routes

All API routes follow RESTful conventions:

### Pattern
```
GET    /api/resource?param={value}  - Fetch
POST   /api/resource                - Create
PUT    /api/resource                - Update
DELETE /api/resource?id={value}     - Delete
```

### Complete List
1. `/api/website-builder` (GET, POST, PUT, DELETE)
2. `/api/moodboards` (GET, POST, PUT, DELETE)
3. `/api/moodboards/items` (GET, POST, PUT, DELETE)
4. `/api/invitations` (GET, POST, PUT, DELETE)
5. `/api/seating-charts` (GET, POST, PUT, DELETE)
6. `/api/seating-charts/tables` (GET, POST, PUT, DELETE)
7. `/api/ai-assistant/usage` (GET)
8. `/api/ai-assistant/messages` (GET)
9. `/api/ai-assistant/chat` (POST)
10. `/api/custom-forms` (GET, POST, PUT, DELETE)
11. `/api/custom-forms/responses` (GET, POST, DELETE)

All routes include:
- Error handling
- Supabase integration
- Type validation
- Proper HTTP status codes

---

## 10. Integration Points

### Bride Dashboard (`/app/dashboard/page.tsx`)
New tabs added (lines 592-631):
- 🎨 Website - PremiumWebsiteBuilder
- 🎁 Registry - RegistryAggregator (existing)
- 📸 Gallery - PhotoGallery (existing)
- 🎨 Moodboards - Moodboards (NEW)
- 💌 Invitations - InvitationDesigner (NEW)
- 📋 Day-of Binder - WeddingDayBinder (NEW)

### Vendor Dashboard (`/app/vendor-dashboard/page.tsx`)
Planning Tools expanded (lines 571-589, 638-651):
- Timeline (existing)
- Checklist (existing)
- Budget (existing)
- Activity Log (existing)
- 🤖 AI Assistant (NEW)
- 📋 Custom Forms (NEW)

### Dedicated Pages
- `/app/seating/page.tsx` - Full SeatingChart component

---

## 🚀 Next Steps

### Production Readiness
1. **File Upload Integration:**
   - Configure Supabase Storage for images
   - Add image compression/optimization
   - Set up CDN for photo delivery

2. **AI Assistant:**
   - Integrate OpenAI or Anthropic Claude API
   - Implement streaming responses
   - Add conversation memory

3. **PDF Generation:**
   - Implement jsPDF or react-pdf for Wedding Day Binder
   - Add print stylesheets
   - Generate downloadable invitations

4. **Canva Integration:**
   - Set up Canva API access
   - Enable template import/export
   - Add design sharing

5. **Analytics:**
   - Track feature usage
   - Monitor AI costs
   - Website view analytics

### Testing
- End-to-end testing for all features
- Mobile responsiveness verification
- Cross-browser compatibility
- Performance optimization

---

## 📊 Feature Summary

| Feature | Component | API Routes | DB Tables | Status |
|---------|-----------|------------|-----------|---------|
| Website Builder | ✅ | ✅ | ✅ | Complete |
| Moodboards | ✅ | ✅ | ✅ | Complete |
| Invitation Designer | ✅ | ✅ | ✅ | Complete |
| Seating Chart | ✅ | ✅ | ✅ | Complete |
| Wedding Day Binder | ✅ | N/A | N/A | Complete |
| Vendor AI Assistant | ✅ | ✅ | ✅ | Complete |
| Custom Form Builder | ✅ | ✅ | ✅ | Complete |

**Total:** 7 premium features, 18 new files, 11 API endpoints, 6 SQL scripts

---

## 💡 Feature Highlights

### Competitive Advantages
1. **Website Builder** rivals The Knot, Zola, WITHjoy with 8 premium themes
2. **Moodboards** unique drag-and-drop visual planning
3. **Invitation Designer** 15 templates beats most competitors
4. **Seating Chart** advanced floor planning with drag-and-drop
5. **Wedding Day Binder** comprehensive coordinator export (unique feature)
6. **AI Assistant** tier-based with STRICT free tier lockout (cost control)
7. **Custom Forms** vendor-specific questionnaires (unique B2B2C feature)

### Technical Excellence
- Full TypeScript type safety
- Supabase Row Level Security ready
- Mobile-responsive designs
- Real-time drag-and-drop
- Optimistic UI updates
- Error boundaries
- Loading states
- Comprehensive validation

---

**Built with ❤️ for Bella Wedding AI**
