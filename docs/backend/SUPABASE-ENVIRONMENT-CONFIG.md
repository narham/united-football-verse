# Supabase Environment Configuration

This document describes the environment variables required for Supabase integration.

## Browser-Safe Variables (VITE_)

These variables are embedded in the browser bundle and are considered public.

### VITE_SUPABASE_URL
**Required:** Yes  
**Type:** String  
**Example:** `https://your-project.supabase.co`  
**Description:** Your Supabase project URL (publicly safe)

### VITE_SUPABASE_ANON_KEY
**Required:** Yes  
**Type:** String  
**Example:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`  
**Description:** Supabase anonymous key (publicly safe - RLS enforces auth)

## Setup Instructions

### 1. Get Your Credentials

1. Log in to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings → API**
4. Copy:
   - Project URL → `VITE_SUPABASE_URL`
   - Anon Public Key → `VITE_SUPABASE_ANON_KEY`

### 2. Create .env.local

```bash
# .env.local (LOCAL DEVELOPMENT ONLY - DO NOT COMMIT)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Verify Configuration

```bash
# Check that environment variables are loaded
npm run dev
```

Open browser console and verify no errors about missing Supabase config.

## Security Guidelines

### ✅ Safe to Expose
- `VITE_SUPABASE_URL` (project identifier)
- `VITE_SUPABASE_ANON_KEY` (public key)
- RLS policies protect data access

### ❌ NEVER Expose
- `SUPABASE_SERVICE_ROLE_KEY` (kept server-side only)
- Database password
- JWT secrets
- User session tokens

### ✅ .gitignore Rules

```gitignore
# Environment variables (NEVER commit)
.env
.env.local
.env.*.local

# Credentials and secrets
*-credentials.json
*.pem
*.key
.aws-credentials
```

## Testing Configuration

To test if Supabase is properly configured:

```typescript
import { isSupabaseConfigured, tryGetSupabaseClient } from "@/lib/supabase/client";

// Check configuration
if (isSupabaseConfigured()) {
  console.log("✅ Supabase is configured");
  const client = tryGetSupabaseClient();
  // Use client...
} else {
  console.log("⚠️ Supabase not configured - using demo mode");
}
```

## Fallback Behavior

If Supabase is not configured:
1. `tryGetSupabaseClient()` returns `null`
2. Repository factory switches to demo mode
3. Application continues with localStorage persistence
4. No errors or crashes

## Deployment

### Vercel / Netlify

Set environment variables in platform settings:

**Vercel:**
1. Go to Project Settings → Environment Variables
2. Add both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Redeploy

**Netlify:**
1. Go to Site Settings → Build & Deploy → Environment
2. Add both variables
3. Trigger new deployment

### Custom Servers

Create `.env.production` with actual credentials:

```bash
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**DO NOT commit this file.**

## Troubleshooting

### "VITE_SUPABASE_URL environment variable is not set"
- Verify `.env.local` exists in project root
- Verify variable name is exactly `VITE_SUPABASE_URL` (case-sensitive)
- Restart dev server after adding variables

### "Failed to connect to Supabase"
- Verify URL is correct (check for typos)
- Verify network connectivity
- Check browser console for CORS errors
- Verify RLS policies are not blocking (for authenticated queries)

### "createClient is not a function"
- Verify `@supabase/supabase-js` is installed: `npm list @supabase/supabase-js`
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

## Next Steps

1. Create database migration (STEP 5)
2. Implement Supabase repositories (STEP 8)
3. Integrate with TanStack Query hooks (STEP 9)
