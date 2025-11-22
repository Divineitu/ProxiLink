# Authentication Testing Guide

## Overview
Complete authentication system with protected routes, password reset, and role-based access control.

---

## Components Created

### 1. ProtectedRoute Component (`src/components/ProtectedRoute.tsx`)
- Session validation using Supabase Auth
- Role-based access control
- Automatic redirect to `/login` for unauthenticated users
- Loading spinner during auth checks
- Auth state listener for real-time session changes
- Toast notifications for access denied

### 2. Password Reset Flow
- **ForgotPassword.tsx** - Email input & reset link sending
- **ResetPassword.tsx** - Token validation & new password entry
- Forgot password link added to Login page

---

## Protected Routes Configuration

| Route | Access Level | Redirect |
|-------|-------------|----------|
| `/dashboard` | Any authenticated user | `/login` |
| `/vendor/dashboard` | Vendor role only | `/login` + toast |
| `/admin/dashboard` | Admin role only | `/login` + toast |
| `/service/create` | Vendor role only | `/login` + toast |
| `/profile` | Any authenticated user | `/login` |
| `/payments` | Any authenticated user | `/login` |
| `/orders` | Any authenticated user | `/login` |
| `/notifications` | Any authenticated user | `/login` |
| `/messages` | Any authenticated user | `/login` |

---

## Testing Checklist

### Test 1: Signup Flow
- [ ] Navigate to `/role-selection`
- [ ] Choose "User" role
- [ ] Fill signup form with valid data
- [ ] Verify profile created in Supabase
- [ ] Check redirect to `/dashboard`
- [ ] Repeat for "Vendor" role → redirect to `/vendor/dashboard`
- [ ] Repeat for "NGO" role → redirect to `/dashboard`

### Test 2: Login Flow
- [ ] Navigate to `/login`
- [ ] Enter valid credentials
- [ ] Test "Remember me" checkbox
- [ ] Verify role-based redirect:
  - User → `/dashboard`
  - Vendor → `/vendor/dashboard`
  - NGO → `/dashboard`
- [ ] Close browser and reopen (test session persistence)

### Test 3: Protected Routes
- [ ] Logout (or open incognito window)
- [ ] Try accessing `/dashboard` directly
- [ ] Verify redirect to `/login`
- [ ] Login as regular user
- [ ] Try accessing `/vendor/dashboard`
- [ ] Verify toast: "Access denied. Vendor role required."
- [ ] Try accessing `/admin/dashboard`
- [ ] Verify toast: "Access denied. Admin role required."

### Test 4: Password Reset Flow
- [ ] Navigate to `/login`
- [ ] Click "Forgot password?" link
- [ ] Enter email address
- [ ] Verify success message displayed
- [ ] Check email inbox for reset link
- [ ] Click reset link in email
- [ ] Enter new password (test validation):
  - Try password < 6 chars → error
  - Try password without uppercase → error
  - Try password without number → error
  - Enter valid password (6+ chars, upper/lower/number)
- [ ] Confirm password matches
- [ ] Submit form
- [ ] Verify redirect to `/login`
- [ ] Login with new password

### Test 5: Session Management
- [ ] Login with valid credentials
- [ ] Navigate to `/dashboard`
- [ ] Refresh page
- [ ] Verify no redirect (session persists)
- [ ] Open browser DevTools → Application → Local Storage
- [ ] Verify Supabase session tokens present
- [ ] Clear Local Storage
- [ ] Refresh page
- [ ] Verify redirect to `/login`

### Test 6: Role-Based Access
**As Regular User:**
- [ ] Login as user role
- [ ] Navigate to `/dashboard` → ✅ allowed
- [ ] Navigate to `/vendor/dashboard` → ❌ blocked
- [ ] Navigate to `/service/create` → ❌ blocked

**As Vendor:**
- [ ] Login as vendor role
- [ ] Navigate to `/vendor/dashboard` → ✅ allowed
- [ ] Navigate to `/service/create` → ✅ allowed
- [ ] Navigate to `/admin/dashboard` → ❌ blocked

**As Admin:**
- [ ] Login as admin role
- [ ] Navigate to `/admin/dashboard` → ✅ allowed
- [ ] Navigate to all other protected routes → ✅ allowed

---

## Manual Testing Commands

### Start Dev Server
```bash
npm run dev
```

### Build Production
```bash
npm run build
```

### Check Errors
```bash
npm run build
# Look for TypeScript/ESLint errors
```

---

## Supabase Verification

### Check User Profiles
```sql
-- View all profiles with roles
SELECT 
  p.id,
  p.email,
  p.full_name,
  ur.role
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id;
```

### Check Session Tokens
In browser DevTools:
1. Open Application tab
2. Navigate to Local Storage → `http://localhost:5173`
3. Look for keys starting with `sb-`
4. Verify `sb-[project-ref]-auth-token` exists

### Test Password Reset Manually
```bash
# In Supabase SQL Editor
SELECT * FROM auth.users WHERE email = 'your@email.com';
# Check email_confirmed_at, last_sign_in_at fields
```

---

## Known Limitations

### Email Verification
- **Status:** Not yet implemented
- **Impact:** Users can login without email confirmation
- **Future:** Add email_confirmed_at check in Login.tsx

### Admin Role Creation
- **Status:** No admin signup UI
- **Workaround:** Manually assign admin role in Supabase:
  ```sql
  INSERT INTO user_roles (user_id, role)
  VALUES ('user-uuid-here', 'admin');
  ```

### Session Refresh
- **Status:** Basic implementation via Supabase
- **Impact:** Long sessions may expire without warning
- **Future:** Add explicit refresh logic & expiration warnings

---

## Troubleshooting

### Issue: "Session not found" after login
**Solution:** Check Supabase RLS policies on profiles/user_roles tables

### Issue: Password reset email not received
**Solution:** 
1. Check spam folder
2. Verify Supabase email settings in project settings
3. Confirm email template configured

### Issue: Protected route allows access without auth
**Solution:** 
1. Verify route wrapped with `<ProtectedRoute>` in App.tsx
2. Check browser console for auth errors
3. Clear Local Storage and retry

### Issue: Role validation not working
**Solution:**
1. Check user_roles table has correct role entry
2. Verify role field matches exactly (case-sensitive)
3. Check console for ProtectedRoute errors

---

## Production Deployment Notes

### Environment Variables Required
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase Configuration
1. Enable email auth in Authentication settings
2. Configure email templates (password reset, confirmation)
3. Set site URL to production domain
4. Add redirect URLs for password reset

### Vercel Deployment
Auth routes are automatically handled by the frontend routing. No additional serverless functions needed for basic auth flows.

---

## Next Steps

1. **Test all flows** - Complete the testing checklist above
2. **Email Verification** - Implement email confirmation handling
3. **Admin Panel** - Build admin dashboard content
4. **Security Audit** - Review RLS policies and auth flows
5. **Production Deploy** - Push auth changes to Vercel

---

## Files Modified

- `src/components/ProtectedRoute.tsx` - New component
- `src/pages/ForgotPassword.tsx` - New page
- `src/pages/ResetPassword.tsx` - New page
- `src/pages/Login.tsx` - Added forgot password link
- `src/App.tsx` - Integrated protected routes
- `DEVELOPMENT_TRACKER.md` - Updated with auth completion

**Build Status:** ✅ Successful (no errors)
**Last Updated:** November 22, 2025 - 01:30 UTC
