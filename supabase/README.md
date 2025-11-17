# Supabase Database Security

## Row Level Security (RLS)

This project uses Supabase Row Level Security (RLS) to protect database tables from unauthorized access.

### What is RLS?

Row Level Security ensures that users can only access data they're authorized to see. Without RLS, anyone with your API credentials could read/write all data in public tables.

### How to Apply the Security Migration

1. **Via Supabase Dashboard:**
   - Go to your Supabase project dashboard
   - Navigate to **SQL Editor**
   - Open `migrations/20250116_enable_rls_security.sql`
   - Copy and paste the entire SQL content
   - Click **Run** to execute

2. **Via Supabase CLI:**
   ```bash
   supabase db push
   ```

### Security Policies Summary

| Table | Service Role | Public Access | Authenticated Access |
|-------|--------------|---------------|---------------------|
| `emergency_items_template` | Full access | Read-only | Read-only |
| `vendors` | Full access | Read-only | Own profile (full) |
| `guests` | Full access | View via token | View via token |
| `galleries` | Full access | Public galleries | Public galleries |
| `gallery_photos` | Full access | Public gallery photos | Public gallery photos |
| `messages` | Full access | None | None |
| `vendor_bookings` | Full access | None | None |
| `registry_links` | Full access | Active registries | Active registries |
| `brides` | Full access | None | Own profile |
| `vendor_photos` | Full access | Read-only | Read-only |
| `couples` | Full access | None | Own data |

### Key Concepts

- **Service Role**: Your backend server API routes using `SUPABASE_SERVICE_ROLE_KEY`
- **Authenticated**: Users who are logged in
- **Anon**: Unauthenticated public users using `SUPABASE_ANON_KEY`

### Verification

After running the migration, verify RLS is enabled:

```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

All tables should show `rowsecurity = true`.

### Important Security Notes

1. **Never expose service role key in client-side code** - only use it in server-side API routes
2. **Use anon key for client-side operations** - it has limited permissions
3. **All API routes use the shared supabaseServer client** which uses the service role key
4. **RLS policies are enforced even for authenticated users** - this prevents privilege escalation

### Troubleshooting

If you see "row-level security policy" errors:
- Check that the table has RLS enabled
- Verify the correct role is being used (service_role vs anon)
- Review the policy conditions in the migration file

## Database Connection Security

The project uses a **singleton Supabase client** pattern to prevent connection pool exhaustion:
- Server-side: `lib/supabase-server.ts` (uses service role key)
- Client-side: `lib/supabase.ts` (uses anon key)

This prevents the "too many connections" error by sharing a single connection pool.
