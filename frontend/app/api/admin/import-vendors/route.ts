import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

interface VendorData {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  contact?: string;
  email?: string;
  phone?: string;
  website?: string;
  specialties?: string;
  packages?: string;
  serviceArea?: string;
  socialMedia?: string;
  hours?: string;
  certifications?: string;
  capacity?: string;
  amenities?: string;
  equipment?: string;
  menu?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Create Supabase admin client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current user for admin check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const adminEmails = [
      process.env.NEXT_PUBLIC_ADMIN_EMAIL,
      'stephb9501@gmail.com',
    ];

    if (!adminEmails.includes(user.email || '')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { vendors, category } = await request.json();

    if (!vendors || !Array.isArray(vendors)) {
      return NextResponse.json({ error: 'vendors array required' }, { status: 400 });
    }

    if (!category) {
      return NextResponse.json({ error: 'category required' }, { status: 400 });
    }

    const results = [];
    const errors = [];

    for (const vendor of vendors as VendorData[]) {
      try {
        // Validate required fields
        if (!vendor.name) {
          errors.push({ vendor: 'Unknown', error: 'Missing vendor name' });
          continue;
        }

        // Extract or generate email
        let email = vendor.email;
        if (!email) {
          const emailMatch = vendor.contact?.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
          email = emailMatch ? emailMatch[1] : `${vendor.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@vendor.placeholder`;
        }

        // Extract phone from phone field or contact field
        let phone = vendor.phone || '';
        if (!phone && vendor.contact) {
          const phoneMatch = vendor.contact.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
          phone = phoneMatch ? phoneMatch[0] : '';
        }

        // Clean website URL
        const website = vendor.website || '';

        // Build description from various fields
        const descriptionParts = [];

        if (vendor.specialties) {
          descriptionParts.push(vendor.specialties);
        }

        if (vendor.packages) {
          descriptionParts.push(`Packages: ${vendor.packages}`);
        }

        if (vendor.serviceArea) {
          descriptionParts.push(`Service Area: ${vendor.serviceArea}`);
        }

        if (vendor.capacity) {
          descriptionParts.push(`Capacity: ${vendor.capacity}`);
        }

        if (vendor.menu) {
          descriptionParts.push(`Menu: ${vendor.menu}`);
        }

        if (vendor.equipment) {
          descriptionParts.push(`Equipment: ${vendor.equipment}`);
        }

        if (vendor.amenities) {
          descriptionParts.push(`Amenities: ${vendor.amenities}`);
        }

        if (vendor.certifications) {
          descriptionParts.push(`Certifications: ${vendor.certifications}`);
        }

        if (vendor.hours) {
          descriptionParts.push(`Hours: ${vendor.hours}`);
        }

        if (vendor.socialMedia) {
          descriptionParts.push(`Social Media: ${vendor.socialMedia}`);
        }

        // Default description if nothing else available
        const defaultDescription = `Professional ${category.toLowerCase()} service in ${vendor.city || 'Alabama'}.`;
        const description = descriptionParts.length > 0
          ? descriptionParts.join(' • ')
          : defaultDescription;

        // Prepare vendor data for database
        const vendorData: any = {
          business_name: vendor.name,
          email: email,
          password: '', // No password - admin created
          phone: phone,
          category: category,
          city: vendor.city || '',
          state: vendor.state || 'AL',
          description: description,
          tier: 'free',
          website: website,
        };

        // Add address if available
        if (vendor.address) {
          vendorData.address = vendor.address;
        }

        // Create vendor entry
        const { data, error } = await supabase
          .from('vendors')
          .insert(vendorData)
          .select()
          .single();

        if (error) {
          // Check if it's a duplicate error
          if (error.message?.includes('duplicate') || error.code === '23505') {
            errors.push({
              vendor: vendor.name,
              error: 'Vendor with this email already exists',
              type: 'duplicate'
            });
          } else {
            errors.push({ vendor: vendor.name, error: error.message });
          }
        } else {
          results.push(data);
        }
      } catch (err) {
        errors.push({
          vendor: vendor.name || 'Unknown',
          error: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      imported: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Vendor import error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
