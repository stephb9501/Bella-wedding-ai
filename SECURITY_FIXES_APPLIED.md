# Security Fixes Applied

**Date:** 2025-11-21
**Scope:** Premium Features Security Audit Response
**Status:** ✅ Critical Issues Fixed (In Progress - Part 1/3)

---

## 📊 PROGRESS SUMMARY

### Fixed (3/11 API Routes):
- ✅ `/api/website-builder/route.ts` - Fully secured
- ✅ `/api/moodboards/route.ts` - Fully secured
- ✅ `/api/ai-assistant/chat/route.ts` - Fully secured + tier bypass fixed

### Remaining (8/11 API Routes):
- ⏳ `/api/invitations/route.ts`
- ⏳ `/api/seating-charts/route.ts`
- ⏳ `/api/seating-charts/tables/route.ts`
- ⏳ `/api/moodboards/items/route.ts`
- ⏳ `/api/custom-forms/route.ts`
- ⏳ `/api/custom-forms/responses/route.ts`
- ⏳ `/api/ai-assistant/usage/route.ts`
- ⏳ `/api/ai-assistant/messages/route.ts`

---

## 🛡️ SECURITY IMPROVEMENTS APPLIED

### 1. Authentication (CRITICAL - Fixed)

**Before:**
```typescript
// NO authentication - anyone could access
export async function GET(request: NextRequest) {
  const supabaseServer = createClient(url, SERVICE_ROLE_KEY); // Bypasses RLS!
  const { data } = await supabaseServer
    .from('wedding_websites')
    .select('*')
    .eq('wedding_id', weddingId); // No ownership check!

  return NextResponse.json(data);
}
```

**After:**
```typescript
// Authentication required
export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  // Authentication check
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ... rest of secure logic
}
```

**Impact:** Prevents all anonymous access to premium features.

---

### 2. Authorization (CRITICAL - Fixed)

**Before:**
```typescript
// User could access ANY wedding's data
const { data } = await supabase
  .from('wedding_websites')
  .select('*')
  .eq('wedding_id', weddingId); // No ownership verification!
```

**After:**
```typescript
// Verify ownership before allowing access
const isOwner = await verifyWeddingOwnership(supabase, weddingId, session.user.id);
if (!isOwner) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// Helper function
async function verifyWeddingOwnership(supabase: any, weddingId: string, userId: string) {
  const { data } = await supabase
    .from('weddings')
    .select('id, bride_id, groom_id')
    .eq('id', weddingId)
    .single();

  if (!data) return false;

  return data.bride_id === userId || data.groom_id === userId;
}
```

**Impact:** Prevents horizontal privilege escalation and IDOR vulnerabilities.

---

### 3. Service Role Key Replacement (CRITICAL - Fixed)

**Before:**
```typescript
// DANGEROUS - Bypasses ALL Row Level Security policies!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);
```

**After:**
```typescript
// Respects RLS policies and user permissions
const supabase = createRouteHandlerClient({ cookies });
// Uses the user's JWT token automatically
```

**Impact:** Database security policies now enforced properly.

---

### 4. Mass Assignment Fix (HIGH - Fixed)

**Before:**
```typescript
// DANGEROUS - Client can update ANY field including sensitive ones
export async function PUT(request: NextRequest) {
  const { id, ...updates } = await request.json();

  await supabase
    .from('wedding_websites')
    .update(updates) // ❌ No field validation!
    .eq('id', id);
}
```

**After:**
```typescript
// Whitelist allowed fields
export async function PUT(request: NextRequest) {
  const { id, ...rawUpdates } = await request.json();

  // Whitelist allowed update fields
  const allowedFields = [
    'site_name',
    'bride_name',
    'groom_name',
    'theme',
    'ceremony_date',
    // ... only allowed fields
  ];

  const updates: Record<string, any> = {};
  for (const field of allowedFields) {
    if (rawUpdates[field] !== undefined) {
      updates[field] = rawUpdates[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  await supabase
    .from('wedding_websites')
    .update(updates)
    .eq('id', id);
}
```

**Impact:** Prevents malicious field manipulation (e.g., changing view_count, is_published, wedding_id).

---

### 5. Client-Side Tier Bypass Fix (HIGH - Fixed)

**Before (AI Assistant):**
```typescript
// Client passes tier - can be manipulated!
const { user_id, tier, message } = await request.json();

// Trusts client-provided tier
if (tier === 'free') {
  return NextResponse.json({ error: 'Not available' }, { status: 403 });
}

const monthlyLimit = TIER_LIMITS[tier]; // Uses client value!
```

**After:**
```typescript
// SERVER-SIDE tier validation
const { wedding_id, message } = await request.json();

// Fetch ACTUAL tier from database
const { data: vendorProfile } = await supabase
  .from('vendor_profiles')
  .select('tier')
  .eq('user_id', session.user.id)
  .single();

const actualTier = vendorProfile?.tier || 'free';

// Use actual tier for validation
if (actualTier === 'free') {
  return NextResponse.json({ error: 'Not available' }, { status: 403 });
}

const monthlyLimit = TIER_LIMITS[actualTier]; // Uses database value!
```

**Impact:** Free users can no longer bypass limits by modifying client requests.

---

### 6. Error Message Sanitization (MEDIUM - Fixed)

**Before:**
```typescript
} catch (error: any) {
  // Exposes internal details!
  return NextResponse.json({ error: error.message }, { status: 500 });
}
```

**After:**
```typescript
} catch (error: any) {
  console.error('Operation error:', error); // Log for debugging

  // Return generic error to client
  return NextResponse.json(
    { error: 'An error occurred' },
    { status: 500 }
  );
}
```

**Impact:** Prevents information leakage about database structure and implementation.

---

## 🔧 IMPLEMENTATION PATTERN

For all remaining routes, apply this pattern:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Helper function (reusable across routes)
async function verifyWeddingOwnership(supabase: any, weddingId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('weddings')
    .select('id, bride_id, groom_id')
    .eq('id', weddingId)
    .single();

  if (error || !data) return false;

  return data.bride_id === userId || data.groom_id === userId;
}

export async function GET(request: NextRequest) {
  try {
    // 1. Create authenticated Supabase client
    const supabase = createRouteHandlerClient({ cookies });

    // 2. Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 3. Parse request parameters
    const { searchParams } = new URL(request.url);
    const weddingId = searchParams.get('wedding_id');
    const id = searchParams.get('id');

    // 4. Check authorization (verify ownership)
    if (weddingId) {
      const isOwner = await verifyWeddingOwnership(supabase, weddingId, session.user.id);
      if (!isOwner) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // 5. Perform database operation
    // RLS policies are now respected!
    const { data, error } = await supabase
      .from('your_table')
      .select('*')
      .eq('wedding_id', weddingId);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Route error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { wedding_id, /* other fields */ } = body;

    // Validation
    if (!wedding_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Authorization
    const isOwner = await verifyWeddingOwnership(supabase, wedding_id, session.user.id);
    if (!isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Whitelist allowed fields (prevent mass assignment)
    const insertData = {
      wedding_id,
      field1: body.field1,
      field2: body.field2,
      // Only explicitly allowed fields
    };

    const { data, error } = await supabase
      .from('your_table')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({ error: 'Failed to create resource' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Route error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...rawUpdates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing resource id' }, { status: 400 });
    }

    // Fetch resource and verify ownership
    const { data: resource, error: fetchError } = await supabase
      .from('your_table')
      .select('wedding_id, weddings!inner(bride_id, groom_id)')
      .eq('id', id)
      .single();

    if (fetchError || !resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    // Authorization check
    const isOwner = resource.weddings.bride_id === session.user.id ||
                    resource.weddings.groom_id === session.user.id;

    if (!isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Whitelist allowed update fields
    const allowedFields = ['field1', 'field2', 'field3'];
    const updates: Record<string, any> = {};

    for (const field of allowedFields) {
      if (rawUpdates[field] !== undefined) {
        updates[field] = rawUpdates[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('your_table')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json({ error: 'Failed to update resource' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Route error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing resource id' }, { status: 400 });
    }

    // Verify ownership before delete
    const { data: resource, error: fetchError } = await supabase
      .from('your_table')
      .select('wedding_id, weddings!inner(bride_id, groom_id)')
      .eq('id', id)
      .single();

    if (fetchError || !resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    // Authorization check
    const isOwner = resource.weddings.bride_id === session.user.id ||
                    resource.weddings.groom_id === session.user.id;

    if (!isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabase
      .from('your_table')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json({ error: 'Failed to delete resource' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Route error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
```

---

## 📋 NEXT STEPS

### Immediate (Apply to remaining 8 routes):
1. Copy the pattern above
2. Replace `your_table` with actual table name
3. Update `allowedFields` whitelist for each route
4. Adjust ownership verification if needed (vendor vs wedding ownership)
5. Test each route thoroughly

### Component Fixes Still Needed:
- [ ] File upload validation in Moodboards
- [ ] URL parameter encoding in all components
- [ ] State synchronization bug in VendorAIAssistant
- [ ] Race condition in SeatingChart
- [ ] Parallel API calls in WeddingDayBinder
- [ ] Date validation in InvitationDesigner
- [ ] Memory leak prevention in Moodboards
- [ ] Shallow copy fix in CustomFormBuilder
- [ ] useEffect dependency warnings

See `SECURITY_AUDIT.md` for full details on each issue.

---

## ✅ VERIFICATION CHECKLIST

For each secured route, verify:

- [x] Authentication required (401 if no session)
- [x] Authorization checked (403 if not owner)
- [x] Service role key removed
- [x] User JWT token used (RLS respected)
- [x] Mass assignment prevented (whitelisted fields)
- [x] Error messages sanitized
- [x] No information leakage
- [x] Proper HTTP status codes used

---

## 🎯 DEPLOYMENT READINESS

**Status:**  🟡 Partial - Critical auth/authz fixed, remaining routes need updates

**Before Production:**
1. Apply security pattern to ALL 8 remaining API routes
2. Fix component-level vulnerabilities
3. Add input validation throughout
4. Enable RLS policies on all tables
5. Add rate limiting
6. Security penetration testing
7. Code review

**Estimated Time:** 4-6 hours to complete all remaining fixes

---

**See Also:**
- `SECURITY_AUDIT.md` - Full vulnerability audit report
- Commits: e0e89bf - Part 1/3 security fixes
