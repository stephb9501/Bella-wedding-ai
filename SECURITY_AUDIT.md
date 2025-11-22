# Security & Bug Audit Report
**Date:** 2025-11-21
**Project:** Bella Wedding AI - Premium Features
**Scope:** All 7 premium features + API routes

---

## 🚨 CRITICAL SECURITY ISSUES

### 1. **NO AUTHENTICATION - SEVERITY: CRITICAL**

**Location:** ALL API routes
**Files:**
- `/app/api/website-builder/route.ts`
- `/app/api/moodboards/route.ts`
- `/app/api/moodboards/items/route.ts`
- `/app/api/invitations/route.ts`
- `/app/api/seating-charts/route.ts`
- `/app/api/seating-charts/tables/route.ts`
- `/app/api/custom-forms/route.ts`
- `/app/api/custom-forms/responses/route.ts`
- `/app/api/ai-assistant/chat/route.ts`
- `/app/api/ai-assistant/usage/route.ts`
- `/app/api/ai-assistant/messages/route.ts`

**Issue:**
None of the premium feature API routes verify user authentication. Any anonymous user can:
- Access ANY wedding's data by passing a `wedding_id`
- Create, read, update, or delete resources for ANY user
- Bypass all access controls

**Impact:**
- Complete data breach - all wedding data exposed
- Data modification/deletion by unauthorized users
- Account takeover possible
- Privacy violations

**Recommendation:**
```typescript
// Add authentication middleware to ALL API routes
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ... rest of route logic
}
```

---

### 2. **NO AUTHORIZATION - SEVERITY: CRITICAL**

**Location:** ALL API routes
**Files:** Same as above

**Issue:**
Even if authentication was added, there's no verification that the user owns the resource they're accessing.

**Examples:**
- `GET /api/website-builder?wedding_id=123` - No check that user owns wedding #123
- `PUT /api/moodboards` with `id: 456` - No check that user owns moodboard #456
- `DELETE /api/seating-charts?id=789` - Anyone can delete any seating chart

**Impact:**
- Horizontal privilege escalation
- Users can access/modify other users' data
- IDOR (Insecure Direct Object Reference) vulnerabilities

**Recommendation:**
```typescript
// After authentication, verify ownership
const { data: wedding, error } = await supabase
  .from('weddings')
  .select('id')
  .eq('id', weddingId)
  .eq('bride_id', session.user.id)  // or groom_id
  .single();

if (!wedding) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

---

### 3. **DANGEROUS USE OF SERVICE ROLE KEY - SEVERITY: CRITICAL**

**Location:** ALL API routes
**Code:**
```typescript
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);
```

**Issue:**
Using the service role key **BYPASSES ALL ROW LEVEL SECURITY (RLS) POLICIES** in the database. This defeats the entire purpose of database-level security.

**Impact:**
- All RLS policies are ignored
- API can access ANY row in ANY table
- Database security layer completely bypassed

**Recommendation:**
```typescript
// Use the user's session token instead
const supabase = createRouteHandlerClient({ cookies });
// This respects RLS policies and only allows access to user's own data
```

---

### 4. **MASS ASSIGNMENT VULNERABILITY - SEVERITY: HIGH**

**Location:**
- `/app/api/website-builder/route.ts` line 113
- `/app/api/moodboards/route.ts` line 90
- Similar pattern in all PUT endpoints

**Code:**
```typescript
export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, ...updates } = body;  // ❌ DANGEROUS!

  await supabaseServer
    .from('wedding_websites')
    .update(updates)  // ❌ Allows updating ANY field!
    .eq('id', id);
}
```

**Issue:**
Clients can send ANY field in the request body and it will be updated in the database.

**Attack Example:**
```javascript
// Attacker can manipulate any field:
fetch('/api/website-builder', {
  method: 'PUT',
  body: JSON.stringify({
    id: '123',
    is_published: true,  // Force publish
    view_count: 999999,  // Manipulate metrics
    wedding_id: 'attacker_id'  // Hijack website
  })
});
```

**Recommendation:**
```typescript
// Whitelist allowed fields
const allowedUpdates = {
  site_name: body.site_name,
  bride_name: body.bride_name,
  groom_name: body.groom_name,
  theme: body.theme,
  // ... only allowed fields
};

// Filter out undefined values
const updates = Object.fromEntries(
  Object.entries(allowedUpdates).filter(([_, v]) => v !== undefined)
);

await supabaseServer.from('wedding_websites').update(updates).eq('id', id);
```

---

### 5. **CLIENT-SIDE TIER BYPASS - SEVERITY: HIGH**

**Location:** `/app/api/ai-assistant/chat/route.ts` line 216, 223
**Component:** `/components/VendorAIAssistant.tsx`

**Issue:**
The client passes the `tier` value to the API, which the API trusts without verification.

**Code:**
```typescript
// Client can pass any tier value
const response = await fetch('/api/ai-assistant/chat', {
  method: 'POST',
  body: JSON.stringify({
    user_id: userId,
    tier: 'elite',  // ❌ Client controls this!
    message: inputMessage
  })
});
```

```typescript
// API trusts client-provided tier
const { user_id, wedding_id, message, tier } = body;

// Check tier access
if (tier === 'free') {  // ❌ Easy to bypass!
  return NextResponse.json({ error: '...' }, { status: 403 });
}

const monthlyLimit = TIER_LIMITS[tier];  // ❌ Uses client value!
```

**Attack:**
User on free tier can bypass limits by sending `tier: 'elite'` in request.

**Recommendation:**
```typescript
// Look up user's ACTUAL tier from database
const { data: vendor } = await supabase
  .from('vendor_profiles')
  .select('tier')
  .eq('user_id', session.user.id)
  .single();

const actualTier = vendor?.tier || 'free';
const monthlyLimit = TIER_LIMITS[actualTier];
```

---

### 6. **XSS VULNERABILITIES - SEVERITY: MEDIUM-HIGH**

**Location:** All component files
**Files:**
- `/components/InvitationDesigner.tsx` lines 756-757, 774-820
- `/components/CustomFormBuilder.tsx` lines 500-586
- `/components/WeddingDayBinder.tsx` lines 208-220, 237-268

**Issue:**
User input is rendered directly in the DOM without sanitization in several preview components.

**Examples:**

**InvitationDesigner.tsx (Line 756-757):**
```typescript
<h1 className="text-5xl font-bold mb-2">
  {currentInvitation.bride_name || 'Bride Name'}  // ❌ Unescaped
</h1>
```

**CustomFormBuilder.tsx (Line 500):**
```typescript
<label className="block text-sm font-medium">
  {field.label}  // ❌ Unescaped
</label>
```

**Attack Example:**
```javascript
bride_name: '<img src=x onerror=alert(document.cookie)>'
```

**Recommendation:**
React escapes text by default, but be cautious with:
- `dangerouslySetInnerHTML` (avoid)
- URL construction
- Style attributes with user input

Use DOMPurify for rich text:
```typescript
import DOMPurify from 'dompurify';

<div dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(userInput)
}} />
```

---

### 7. **QUERY PARAMETER INJECTION - SEVERITY: MEDIUM**

**Location:** ALL components
**Files:** All 7 premium feature components

**Issue:**
URL query parameters are constructed without encoding.

**Examples:**

`PremiumWebsiteBuilder.tsx` line 110:
```typescript
const response = await fetch(`/api/website-builder?wedding_id=${weddingId}`);
```

`Moodboards.tsx` line 70:
```typescript
const response = await fetch(`/api/moodboards?wedding_id=${weddingId}`);
```

**Attack:**
If `weddingId` contains special characters like `&`, `?`, `=`, it could break the query string.

**Recommendation:**
```typescript
const params = new URLSearchParams({ wedding_id: weddingId });
const response = await fetch(`/api/moodboards?${params.toString()}`);
```

---

### 8. **FILE UPLOAD VULNERABILITIES - SEVERITY: MEDIUM**

**Location:** `/components/Moodboards.tsx` lines 157-169

**Code:**
```typescript
const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file || !selectedBoard?.id) return;

  // No file type validation!
  // No file size limit!
  const reader = new FileReader();
  reader.onload = async (event) => {
    const imageUrl = event.target?.result as string;
    await addImage(imageUrl, 100, 100);
  };
  reader.readAsDataURL(file);
};
```

**Issues:**
1. **No file type validation** - Users can upload any file (malware, scripts, etc.)
2. **No file size limit** - Can cause DoS with huge files
3. **Memory issues** - Converting large files to data URLs can crash browser
4. **No virus scanning**

**Recommendation:**
```typescript
const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    setError('Only image files are allowed');
    return;
  }

  // Validate file size (e.g., 5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    setError('File size must be less than 5MB');
    return;
  }

  // Upload to secure storage (Supabase Storage) instead of data URLs
  const { data, error } = await supabase.storage
    .from('moodboard-images')
    .upload(`${userId}/${Date.now()}-${file.name}`, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('moodboard-images')
    .getPublicUrl(data.path);

  await addImage(publicUrl, 100, 100);
};
```

---

### 9. **INFORMATION DISCLOSURE - SEVERITY: LOW-MEDIUM**

**Location:** ALL API routes

**Code:**
```typescript
} catch (error: any) {
  console.error('Website GET error:', error);
  return NextResponse.json({ error: error.message }, { status: 500 });
}
```

**Issue:**
Returning raw error messages can expose:
- Database structure
- Internal implementation details
- Stack traces
- File paths

**Recommendation:**
```typescript
} catch (error: any) {
  console.error('Website GET error:', error);

  // Return generic error to client
  return NextResponse.json(
    { error: 'An error occurred processing your request' },
    { status: 500 }
  );
}
```

---

## 🐛 BUG ISSUES

### 1. **useEffect Infinite Loop Warning**

**Location:** `/components/PremiumWebsiteBuilder.tsx` line 104-106

**Code:**
```typescript
useEffect(() => {
  loadWebsite();
}, [weddingId]);  // ❌ loadWebsite not in deps, weddingId can change
```

**Issue:**
Missing dependency or missing useCallback wrapper.

**Fix:**
```typescript
const loadWebsite = useCallback(async () => {
  // ... function body
}, [weddingId]);

useEffect(() => {
  loadWebsite();
}, [loadWebsite]);
```

---

### 2. **State Synchronization Bug**

**Location:** `/components/VendorAIAssistant.tsx` lines 160-164, 171

**Code:**
```typescript
const sendMessage = async () => {
  // ...
  setMessages([...messages, userMessage]);

  try {
    const data = await response.json();

    setMessages([...messages, userMessage, {  // ❌ BUG: messages is stale
      role: 'assistant',
      content: data.response,
    }]);
  } catch (err) {
    setMessages(messages);  // ❌ BUG: doesn't actually remove user message
  }
}
```

**Issue:**
State closure issue - `messages` reference is stale inside async callbacks.

**Fix:**
```typescript
const sendMessage = async () => {
  const userMessage: Message = {
    role: 'user',
    content: inputMessage
  };

  setMessages(prev => [...prev, userMessage]);

  try {
    const data = await response.json();
    const assistantMessage: Message = {
      role: 'assistant',
      content: data.response
    };

    setMessages(prev => [...prev, assistantMessage]);
  } catch (err) {
    // Remove the last message (user message)
    setMessages(prev => prev.slice(0, -1));
  }
}
```

---

### 3. **Race Condition in SeatingChart**

**Location:** `/components/SeatingChart.tsx` lines 111-116

**Code:**
```typescript
const fetchTables = async (chartId: string) => {
  const data = await fetch(/*...*/);

  const tablesWithGuests = await Promise.all(
    data.map(async (table: SeatingTable) => {
      const assignedGuests = guests.filter(/*...*/);  // ❌ guests might not be loaded yet
      return { ...table, assigned_guests: assignedGuests };
    })
  );
};
```

**Issue:**
`guests` might be empty when `fetchTables` runs because `fetchGuests` hasn't completed.

**Fix:**
```typescript
// Ensure guests are loaded before fetching tables
useEffect(() => {
  const loadData = async () => {
    await fetchCharts();
    await fetchGuests();
  };
  loadData();
}, [weddingId]);

useEffect(() => {
  if (selectedChart?.id && guests.length > 0) {
    fetchTables(selectedChart.id);
  }
}, [selectedChart, guests]);
```

---

### 4. **Missing Data Validation**

**Location:** `/components/InvitationDesigner.tsx` lines 774-780

**Code:**
```typescript
{currentInvitation.ceremony_date
  ? new Date(currentInvitation.ceremony_date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  : 'Wedding Date'}
```

**Issue:**
If `ceremony_date` is an invalid date string, `new Date()` returns Invalid Date, causing rendering issues.

**Fix:**
```typescript
const formatDate = (dateString: string) => {
  if (!dateString) return 'Wedding Date';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Wedding Date';

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

{formatDate(currentInvitation.ceremony_date)}
```

---

### 5. **Performance Issue - Sequential API Calls**

**Location:** `/components/WeddingDayBinder.tsx` lines 44-94

**Code:**
```typescript
const fetchAllData = async () => {
  const weddingRes = await fetch(`/api/weddings?id=${weddingId}`);
  // ...

  const timelineRes = await fetch(`/api/timeline?wedding_id=${weddingId}`);
  // ...

  const checklistRes = await fetch(`/api/checklist?wedding_id=${weddingId}`);
  // ... (6 sequential API calls!)
}
```

**Issue:**
All API calls are sequential, causing slow load times.

**Fix:**
```typescript
const fetchAllData = async () => {
  setLoading(true);

  try {
    const [
      weddingData,
      timelineData,
      checklistData,
      guestsData,
      vendorsData,
      budgetData
    ] = await Promise.all([
      fetch(`/api/weddings?id=${weddingId}`).then(r => r.json()),
      fetch(`/api/timeline?wedding_id=${weddingId}`).then(r => r.json()),
      fetch(`/api/checklist?wedding_id=${weddingId}`).then(r => r.json()),
      fetch(`/api/guests?wedding_id=${weddingId}`).then(r => r.json()),
      fetch(`/api/vendor-collaborations?wedding_id=${weddingId}`).then(r => r.json()),
      fetch(`/api/budget?wedding_id=${weddingId}`).then(r => r.json())
    ]);

    setWeddingData(weddingData);
    setTimelineEvents(timelineData.filter((e: any) => e.approval_status === 'approved'));
    // ...
  } finally {
    setLoading(false);
  }
};
```

---

### 6. **Memory Leak Risk**

**Location:** `/components/Moodboards.tsx` lines 157-169

**Issue:**
FileReader not cleaned up if component unmounts during file read.

**Fix:**
```typescript
useEffect(() => {
  let isMounted = true;

  return () => {
    isMounted = false;
  };
}, []);

const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (event) => {
    if (!isMounted) return;  // Prevent state updates after unmount

    const imageUrl = event.target?.result as string;
    await addImage(imageUrl, 100, 100);
  };
  reader.readAsDataURL(file);
};
```

---

### 7. **Shallow Copy Bug**

**Location:** `/components/CustomFormBuilder.tsx` line 229

**Code:**
```typescript
const duplicateForm = async (form: CustomForm) => {
  const duplicate: CustomForm = {
    vendor_id: vendorId,
    wedding_id: weddingId,
    form_name: `${form.form_name} (Copy)`,
    description: form.description,
    fields: form.fields,  // ❌ Shallow copy - modifications will affect original
    is_published: false,
  };
};
```

**Fix:**
```typescript
const duplicate: CustomForm = {
  vendor_id: vendorId,
  wedding_id: weddingId,
  form_name: `${form.form_name} (Copy)`,
  description: form.description,
  fields: JSON.parse(JSON.stringify(form.fields)),  // Deep copy
  is_published: false,
};
```

---

## 📋 SUMMARY

### Critical Issues (Fix Immediately):
1. ✅ Add authentication to ALL API routes
2. ✅ Add authorization checks (verify ownership)
3. ✅ Stop using service role key - use user JWT tokens
4. ✅ Fix mass assignment vulnerabilities
5. ✅ Server-side tier validation

### High Priority:
6. ✅ Add file upload validation and limits
7. ✅ Encode URL query parameters
8. ✅ Fix state synchronization bugs
9. ✅ Sanitize error messages

### Medium Priority:
10. ✅ Fix XSS vulnerabilities in previews
11. ✅ Fix race conditions
12. ✅ Optimize parallel API calls
13. ✅ Add input validation

### Low Priority:
14. ✅ Fix useEffect warnings
15. ✅ Add date validation
16. ✅ Fix memory leak risks

---

## 🛡️ SECURITY BEST PRACTICES TO IMPLEMENT

1. **Enable Row Level Security (RLS)** on all Supabase tables
2. **Use Supabase Auth Helpers** for authentication
3. **Implement CSRF protection** with tokens
4. **Add rate limiting** (use middleware or edge functions)
5. **Input validation** on both client and server
6. **Content Security Policy** headers
7. **Helmet.js** for additional security headers
8. **Logging and monitoring** for security events
9. **Regular security audits** and dependency updates
10. **Environment variable validation** on startup

---

**Auditor Notes:**
This audit found several CRITICAL security vulnerabilities that must be addressed before deployment. The lack of authentication and authorization in API routes is particularly concerning as it allows complete unauthorized access to all wedding data.

Priority should be given to implementing authentication, authorization, and proper use of Supabase RLS policies.
