# ProxiLink - Setup & Installation Guide

## Prerequisites

- **Node.js:** v18+ (LTS recommended)
- **npm:** v9+ or **Bun:** v1.0+
- **Git:** for version control
- **Supabase Account:** Free tier available at https://supabase.com

---

## Step 1: Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/DiviTech01/smart-build-prototype.git
cd smart-build-prototype

# Install dependencies (choose one)
npm install              # If using npm
# OR
bun install              # If using Bun (faster)
```

---

## Step 2: Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://nuqzhlzhtzjfzpqgcogd.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<YOUR_SUPABASE_ANON_KEY>

# Optional: Add other services
# VITE_GOOGLE_MAPS_API_KEY=<YOUR_KEY>
# VITE_MAPBOX_API_KEY=<YOUR_KEY>
```

### Getting Supabase Keys

1. Go to https://app.supabase.com
2. Select the project: `nuqzhlzhtzjfzpqgcogd`
3. Navigate to **Settings → API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Anon Public Key** → `VITE_SUPABASE_PUBLISHABLE_KEY`

---

## Step 3: Verify Database Setup

### Check if migrations are applied:

```bash
# Using Supabase CLI
supabase db list

# Or check the Supabase Dashboard:
# 1. Go to Dashboard → SQL Editor
# 2. Run: SELECT table_name FROM information_schema.tables WHERE table_schema='public';
```

### Tables should exist:
- `profiles`
- `user_roles`
- `vendor_profiles`
- `ngo_profiles`
- `services`
- `events`
- `notifications`
- `reviews`

If tables don't exist, apply migrations:
```bash
supabase migration up
```

---

## Step 4: Start Development Server

```bash
# Start the dev server
npm run dev

# The app will be available at:
# http://localhost:8080

# With auto-reload on file changes
```

---

## Step 5: Build for Production

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

---

## Development Commands

```bash
npm run dev              # Start dev server (with hot reload)
npm run build            # Production build
npm run build:dev        # Dev mode build (for debugging)
npm run lint             # Run ESLint
npm run preview          # Preview production build
```

---

## Project Structure Quick Reference

```
smart-build-prototype/
├── src/
│   ├── components/       # React components (UI + Map, Lists, etc.)
│   ├── pages/            # Page components (routes)
│   ├── hooks/            # Custom React hooks
│   ├── integrations/     # External service integrations (Supabase)
│   ├── lib/              # Utility functions
│   ├── App.tsx           # Main app with routing
│   ├── main.tsx          # React DOM entry point
│   └── index.css         # Global styles
├── supabase/
│   ├── config.toml       # Supabase configuration
│   └── migrations/       # Database migration files
├── public/               # Static assets
├── vite.config.ts        # Vite configuration
├── tailwind.config.ts    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies
```

---

## Troubleshooting

### Issue: "Cannot find module '@/...'"

**Solution:** The `@` alias should resolve to `src/`. Verify `vite.config.ts`:
```typescript
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./src"),
  },
},
```

### Issue: "Supabase connection failed"

**Solution:** 
1. Check `.env.local` exists with correct keys
2. Verify internet connection
3. Confirm Supabase project is active
4. Check for CORS issues (should be configured in Supabase)

### Issue: "Port 8080 already in use"

**Solution:** 
```bash
# Change port in vite.config.ts or use:
PORT=3000 npm run dev
```

### Issue: Database tables don't exist

**Solution:**
```bash
# Apply migrations
npx supabase migration up

# Or manually run the SQL from:
# supabase/migrations/20251106195456_*.sql
```

### Issue: TypeScript errors in components

**Solution:**
1. Run: `npm install` to ensure types are installed
2. Run: `npm run lint -- --fix` to auto-fix issues
3. Restart IDE/editor

---

## Next Steps

1. **Complete Authentication Flows:**
   - Implement signup with email verification
   - Implement login with error handling
   - Add password reset functionality

2. **Add Geolocation:**
   - Request user location permission
   - Store and update location in database
   - Implement proximity-based queries

3. **Build Service Management:**
   - Create service posting form for vendors
   - Implement service listing/search
   - Add filtering and sorting

4. **Set Up Real-time Features:**
   - Subscribe to service updates
   - Implement live notifications
   - Add real-time map updates

---

## Performance Optimization Tips

1. **Code Splitting:** Use lazy loading for routes
   ```typescript
   const Dashboard = lazy(() => import('@/pages/Dashboard'));
   ```

2. **Image Optimization:** Use next-gen formats (WebP, AVIF)

3. **Bundle Analysis:** 
   ```bash
   npm install --save-dev rollup-plugin-visualizer
   ```

4. **Caching:** Configure Supabase query caching

5. **Database Indexes:** Already configured for geospatial queries

---

## Deployment Options

### Option 1: Vercel (Recommended)
```bash
npm install -g vercel
vercel
# Follow prompts
```

### Option 2: Netlify
```bash
npm install -g netlify-cli
netlify deploy
```

### Option 3: GitHub Pages
```bash
npm run build
# Deploy dist/ folder
```

---

## Monitoring & Debugging

### Browser DevTools
- React DevTools: Inspect component hierarchy
- Redux DevTools: Monitor state (if added)
- Network tab: Check API calls
- Performance tab: Measure load times

### Supabase Logs
```sql
-- Check recent errors
SELECT * FROM pg_stat_statements ORDER BY query_start DESC LIMIT 10;
```

### Application Logs
```typescript
// Add debugging in components
console.log('Debug:', variableName);
// Remove before production
```

---

## Additional Resources

- 📚 [Vite Documentation](https://vitejs.dev/)
- 🎨 [Tailwind CSS](https://tailwindcss.com/docs)
- 📦 [shadcn-ui Components](https://ui.shadcn.com/)
- 🔌 [Supabase Docs](https://supabase.com/docs)
- ⚛️ [React Documentation](https://react.dev)
- 🛣️ [React Router](https://reactrouter.com/)

---

## Support & Contact

- **Issues:** Create GitHub issue
- **Questions:** Check documentation
- **Contributing:** Submit pull requests to main branch

---

**Setup Complete!** 🎉

You're ready to start building. Begin with:
```bash
npm run dev
```

Visit `http://localhost:8080` in your browser.

---

**Last Updated:** November 12, 2025
