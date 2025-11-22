# Wedding Vendor Sample Data

This directory contains sample data files for importing various types of wedding vendors into the Bella Wedding AI system.

## Available Sample Files

- **photographers.txt** - Wedding photography services
- **caterers.txt** - Wedding catering and food services
- **djs.txt** - DJs, bands, and entertainment services
- **florists.txt** - Floral designers and arrangements
- **venues.txt** - Wedding venue locations

## How to Use

1. Navigate to the admin import tool at `/admin/import-venues`
2. Select the vendor category from the dropdown
3. Copy the contents of the corresponding sample file
4. Paste into the import textarea
5. Click "Preview Import" to review parsed data
6. Make any necessary edits
7. Click "Import Vendors" to complete the import

## Data Format

Each vendor entry should include:

### Required Fields
- **Business Name** - The vendor's business name
- **Contact Info** - Phone number and/or email address
- **City/State** - Location information

### Optional Fields (Category-Specific)
- **Address** - Full street address
- **Website** - Business website URL
- **Specialties** - What they specialize in
- **Packages** - Pricing packages or service levels
- **Service Area** - Geographic coverage
- **Social Media** - Instagram, Facebook, etc.
- **Hours** - Business hours
- **Certifications** - Professional certifications
- **Capacity** - For venues
- **Menu Options** - For caterers
- **Equipment** - For DJs/bands
- **Popular Flowers** - For florists

## Format Tips

1. **Flexible Parsing**: The parser intelligently detects different types of information
2. **Line Breaks**: Separate different pieces of information on new lines
3. **Blank Lines**: Optional between vendors for readability
4. **Comments**: Lines starting with `#` are ignored
5. **Numbers**: Numbered lists (1., 2., etc.) are automatically handled

## Example Entry

```
Captured Moments Photography
123 Main Street, Huntsville, AL 35801
(256) 555-1234 • info@capturedmoments.com
www.capturedmomentsphoto.com
Specializes in: Outdoor weddings, Engagement shoots
Packages: Full Day ($2,500), Half Day ($1,500)
Service Area: North Alabama
Social Media: Instagram @capturedmoments
```

## Parser Intelligence

The import tool automatically detects:
- Phone numbers in various formats: (256) 555-1234, 256-555-1234, 256.555.1234
- Email addresses
- Websites (with or without http://, www.)
- Addresses with street numbers and city/state
- Package pricing information
- Specialties and service descriptions
- Social media handles

## Validation

Before importing, the preview mode will show:
- ✓ All successfully parsed fields
- ⚠️ Missing required fields
- ⚠️ Potential duplicates
- ⚠️ Invalid email or phone formats

## Support

For questions or issues with the import tool, contact your system administrator.
