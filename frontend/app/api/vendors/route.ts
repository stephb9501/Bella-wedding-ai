import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';

function generateVendorId(): string {
  return `vendor_${randomBytes(12).toString('hex')}`;
}

// Helper function to get tier pricing
function getTierPricing(tier: string): string {
  const pricing: { [key: string]: string } = {
    free: 'Free (10% commission)',
    premium: '$34.99/mo (5% commission)',
    featured: '$49.99/mo (2% commission)',
    elite: '$79.99/mo (0% commission)'
  };
  return pricing[tier] || 'Free';
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const category = searchParams.get('category');
    const city = searchParams.get('city');

    let query = supabaseServer.from('vendors').select('*');

    if (id) {
      query = query.eq('id', id);
      const { data, error } = await query.single();
      if (error) throw error;
      return NextResponse.json(data);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (city) {
      query = query.ilike('city', `%${city}%`);
    }

    // Order by tier (elite > featured > premium > free)
    query = query.order('tier', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Vendors GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, email, password, phone, categories, city, state, description, tier } = body;

    // Support both single category (old) and multiple categories (new)
    const categoryValue = categories || body.category;

    if (!businessName || !email || !password || !categoryValue) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const vendorId = generateVendorId();

    // Hash password before storing (10 rounds for security)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Convert categories array to comma-separated string for storage
    const categoryString = Array.isArray(categoryValue) ? categoryValue.join(', ') : categoryValue;

    const { data, error } = await supabaseServer
      .from('vendors')
      .insert({
        id: vendorId,
        business_name: businessName,
        email,
        password: hashedPassword,
        phone: phone || '',
        category: categoryString,
        city: city || '',
        state: state || '',
        description: description || '',
        tier: tier || 'free',
        photo_count: 0,
        message_count_this_month: 0,
        booking_requests: 0,
        profile_views: 0,
        is_featured: tier === 'featured' || tier === 'elite',
      })
      .select();

    if (error) throw error;

    // Send admin notification email
    try {
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail && process.env.RESEND_API_KEY) {
        const location = city && state ? `${city}, ${state}` : city || state || 'Not specified';
        const resend = new Resend(process.env.RESEND_API_KEY);

        await resend.emails.send({
          from: 'Bella Wedding AI <onboarding@resend.dev>',
          to: adminEmail,
          subject: `🎉 New Vendor Registration - ${businessName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #E11D48;">New Vendor Signup!</h2>
              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Business Name:</strong> ${businessName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                <p><strong>Categories:</strong> ${categoryString}</p>
                <p><strong>Location:</strong> ${location}</p>
                <p><strong>Tier:</strong> ${tier || 'free'} (${getTierPricing(tier || 'free')})</p>
                <p><strong>Description:</strong> ${description || 'None provided'}</p>
              </div>
              <p><a href="https://bellaweddingai.com/admin/dashboard" style="background: #E11D48; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View in Admin Dashboard</a></p>
              <p style="color: #666; font-size: 12px; margin-top: 20px;">Vendor ID: ${vendorId}</p>
            </div>
          `,
        });
      }
    } catch (emailError) {
      // Log error but don't fail the registration
      console.error('Failed to send vendor notification email:', emailError);
    }

    return NextResponse.json(data?.[0] || {}, { status: 201 });
  } catch (error) {
    console.error('Vendors POST error:', error);
    return NextResponse.json({ error: 'Failed to create vendor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) return NextResponse.json({ error: 'Missing vendor id' }, { status: 400 });

    const { data, error } = await supabaseServer
      .from('vendors')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;
    return NextResponse.json(data?.[0] || {});
  } catch (error) {
    console.error('Vendors PUT error:', error);
    return NextResponse.json({ error: 'Failed to update vendor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing vendor id' }, { status: 400 });

    const { error } = await supabaseServer
      .from('vendors')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Vendors DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete vendor' }, { status: 500 });
  }
}
