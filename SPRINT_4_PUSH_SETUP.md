# Sprint 4: Push Notifications Setup Guide

## Current Status

Push notification infrastructure has been successfully created:

✅ **Completed**:
- Service Worker created (`public/service-worker.js`) with push event handling
- Push notification hook created (`src/hooks/usePushNotifications.ts`) with subscription management
- UI toggle buttons added to Dashboard and VendorDashboard headers
- Database migration created (`supabase/migrations/20251113140000_create_push_subscriptions.sql`)

⏳ **Next Steps**:

## Step 1: Generate VAPID Keys

VAPID (Voluntary Application Server Identification) keys are required for web push notifications. You have two options:

### Option A: Using web-push CLI (Recommended)

1. Install web-push globally:
```bash
npm install -g web-push
```

2. Generate VAPID keys:
```bash
web-push generate-vapid-keys
```

3. You'll receive output like:
```
Public Key: BGZaTfWavk3w...
Private Key: abc123def456...
```

### Option B: Online VAPID Generator

Visit: https://web-push-codelab.glitch.me/
- Click "Generate Keys"
- Copy the public and private keys

## Step 2: Configure Environment Variables

1. Open `.env.local` in the root of your project

2. Add the VAPID public key:
```
VITE_VAPID_PUBLIC_KEY=BGZaTfWavk3w...
```

3. **Important**: Store the PRIVATE key securely (you'll need it for the Edge Function later)
   - DO NOT add private key to `.env.local` or commit it to git
   - Save it in a secure location for Edge Function deployment

## Step 3: Apply Database Migration

1. Open Supabase Dashboard: https://app.supabase.com

2. Navigate to your project → SQL Editor

3. Create a new query and paste the contents of:
   - `supabase/migrations/20251113140000_create_push_subscriptions.sql`

4. Execute the migration

5. Verify the table was created:
   - Go to Database → Tables
   - You should see `push_subscriptions` table with columns: id, user_id, subscription, is_active, created_at, updated_at

## Step 4: Regenerate Supabase TypeScript Types

After the migration is applied, regenerate types so `push_subscriptions` appears in the Supabase client types:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID --db-url YOUR_DB_CONNECTION_STRING > src/integrations/supabase/types.ts
```

Or use the Supabase CLI:
```bash
supabase gen types typescript > src/integrations/supabase/types.ts
```

This will resolve the TypeScript compilation error about `push_subscriptions` table not being found.

## Step 5: Test Push Notifications Locally

1. Start the dev server:
```bash
npm run dev
```

2. Navigate to Dashboard or VendorDashboard

3. Click the **"🔕 Off"** button in the header to enable push notifications

4. Browser will request permission to send notifications → **Click "Allow"**

5. Button should change to **"🔔 On"**

6. Verify subscription was saved to database:
   - Supabase Dashboard → Table Editor
   - Open `push_subscriptions` table
   - You should see a row with your user's subscription

## Step 6: Setup Edge Function for Push Delivery

Push notifications need to be sent from the server side using the Web Push protocol. Create a Supabase Edge Function:

### Create the Function

1. In Supabase Dashboard, go to **Functions** → **Create a new function**

2. Name it: `send-push-notification`

3. Add this TypeScript code:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as base64 from "https://deno.land/std@0.168.0/encoding/base64.ts";

const PRIVATE_VAPID_KEY = Deno.env.get("PRIVATE_VAPID_KEY") || "";
const PUBLIC_VAPID_KEY = Deno.env.get("PUBLIC_VAPID_KEY") || "";

// Generate VAPID header using private key
function generateVAPIDHeader(endpoint: string) {
  // This requires web-push library or custom implementation
  // For now, use a simpler approach with the Web Push API
  // Production: use web-push npm package or equivalent Deno module
  return "";
}

serve(async (req) => {
  if (req.method === "POST") {
    try {
      const { userId, title, body, icon } = await req.json();

      // Query user's push subscriptions from Supabase
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") || "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
      );

      const { data: subscriptions, error } = await supabaseClient
        .from("push_subscriptions")
        .select("subscription")
        .eq("user_id", userId)
        .eq("is_active", true);

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
        });
      }

      // Send push to each subscription
      for (const sub of subscriptions || []) {
        const subscription = sub.subscription;
        
        // Use Web Push protocol to send notification
        // This requires proper VAPID signing
        // Recommended: use web-push library in a Node.js function instead
      }

      return new Response(JSON.stringify({ sent: (subscriptions || []).length }), {
        status: 200,
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }
  }

  return new Response("Method not allowed", { status: 405 });
});
```

### Alternative: Use web-push Package in API Route

For easier implementation, you could create a Node.js API endpoint instead of Edge Function:

**Backend (Node.js/Express)**:
```javascript
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:example@yourdomain.com',
  process.env.PUBLIC_VAPID_KEY,
  process.env.PRIVATE_VAPID_KEY
);

app.post('/api/push/send', async (req, res) => {
  const { userId, title, body } = req.body;
  
  // Query subscriptions for user
  const subscriptions = await db.query(
    'SELECT subscription FROM push_subscriptions WHERE user_id = ? AND is_active = true',
    [userId]
  );

  // Send to each
  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(sub.subscription, JSON.stringify({
        title,
        body,
        icon: '/icon-192x192.png'
      }));
    } catch (err) {
      console.error('Push failed:', err);
    }
  }

  res.json({ sent: subscriptions.length });
});
```

## Step 7: Trigger Push Notifications

Create database triggers or scheduled jobs to send push notifications when:

1. **Review submitted** → Send push to vendor
   - Update trigger: `20251112131000_create_review_notification_trigger.sql`

2. **Proximity alert** → Send push to nearby user
   - Call via scheduled function or cron job

3. **Event created** → Send push to subscribed users
   - Add trigger to events table insert

## Testing with Postman

Once Edge Function is deployed:

1. Get your Edge Function URL from Supabase Dashboard

2. In Postman, POST to: `https://YOUR_PROJECT.supabase.co/functions/v1/send-push-notification`

3. Add Header:
   - Key: `Authorization`
   - Value: `Bearer YOUR_ANON_KEY`

4. Body (JSON):
```json
{
  "userId": "your-user-id",
  "title": "Test Notification",
  "body": "This is a test push notification"
}
```

5. Send and check your device for notification

## Troubleshooting

### "Service Worker failed to register"
- Check that `/service-worker.js` exists in the public folder
- Verify server is serving static files from public folder

### "Permission denied for notifications"
- User rejected notification permission
- Click the button again to re-request permission

### "VAPID key not configured"
- Verify `VITE_VAPID_PUBLIC_KEY` is set in `.env.local`
- Restart dev server after changing .env

### Subscription saved but no notifications received
- Private VAPID key needed for Edge Function
- Verify Edge Function has both PUBLIC_VAPID_KEY and PRIVATE_VAPID_KEY
- Check browser console for push event errors

### Push subscriptions not appearing in database
- Check RLS policies on `push_subscriptions` table
- Verify user is authenticated when subscribing
- Check browser DevTools Network tab for INSERT request status

## Next: Configure Triggers

After Edge Function is deployed, update these migrations to call the function:

- `20251112131000_create_review_notification_trigger.sql` - Add web push trigger
- Create new trigger for event proximity alerts
- Create new trigger for event creation notifications

See: `SPRINT_4_PUSH_TRIGGERS.md` (coming next)
