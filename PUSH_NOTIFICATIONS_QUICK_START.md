# Push Notifications: Quick Start

## What Just Happened

✅ **Push Notifications Infrastructure Complete**

You now have:
1. Service Worker in place (`public/service-worker.js`)
2. Subscription management hook (`src/hooks/usePushNotifications.ts`)
3. UI toggle buttons in Dashboard and VendorDashboard
4. Database migration ready (`supabase/migrations/20251113140000_create_push_subscriptions.sql`)

## 3-Step Quick Setup

### 1. Generate VAPID Keys (2 minutes)

**Option A: CLI** (Recommended)
```bash
npm install -g web-push
web-push generate-vapid-keys
```

**Option B: Online**
Visit: https://web-push-codelab.glitch.me/

Copy the **Public Key** (you'll need it now) and **Private Key** (save for later)

### 2. Update `.env.local` (1 minute)

Add this line to your `.env.local`:
```
VITE_VAPID_PUBLIC_KEY=YOUR_PUBLIC_KEY_HERE
```

Then restart your dev server:
```bash
npm run dev
```

### 3. Apply Database Migration (1 minute)

1. Go to: https://app.supabase.com
2. Open your project
3. Click: **SQL Editor** → **New Query**
4. Copy contents of: `supabase/migrations/20251113140000_create_push_subscriptions.sql`
5. Paste and click **Run**

## Test It

1. Open Dashboard or VendorDashboard in browser
2. Click **"🔕 Off"** button in top right
3. Browser asks for permission → Click **"Allow"**
4. Button changes to **"🔔 On"**
5. ✅ Done! Subscription saved to database

## What's Next

To actually **send** push notifications:

1. Create Supabase Edge Function (or Node.js API endpoint)
2. Update review/event triggers to call it
3. Edge Function sends push to subscribed users

See: `SPRINT_4_PUSH_SETUP.md` → **Step 6** for details

## File Reference

| File | Purpose | Status |
|------|---------|--------|
| `public/service-worker.js` | Receive push events | ✅ Ready |
| `src/hooks/usePushNotifications.ts` | Subscribe/unsubscribe | ✅ Ready |
| `src/pages/Dashboard.tsx` | Toggle button | ✅ Ready |
| `src/pages/VendorDashboard.tsx` | Toggle button | ✅ Ready |
| `supabase/migrations/20251113140000...sql` | Database table | ⏳ Need to apply |
| `.env.local` | VAPID public key | ⏳ Need to add |

## Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Generate VAPID keys
web-push generate-vapid-keys

# Later: Regenerate Supabase types (after migration applied)
npx supabase gen types typescript > src/integrations/supabase/types.ts
```

## Troubleshooting

**Service Worker not registering?**
- Restart dev server
- Check browser DevTools → Application → Service Workers

**"VAPID key not configured"?**
- Add `VITE_VAPID_PUBLIC_KEY` to `.env.local`
- Restart dev server

**Permission denied?**
- Click "Allow" when browser asks
- Click button again to retry

**Subscription not in database?**
- Check user is logged in
- Verify RLS policies: Supabase Dashboard → Tables → push_subscriptions → Policies

## Timeline

- ✅ Infrastructure ready: Now
- ⏳ VAPID keys: 5 minutes
- ⏳ Database migration: 5 minutes
- ⏳ Edge Function: 15-30 minutes
- ⏳ Triggers setup: 10-15 minutes

**Total**: ~1 hour for complete push notification system

---

**Status**: Ready to test locally! 🎉

Next: Follow steps above, then see `SPRINT_4_PUSH_SETUP.md` for Edge Function setup.
