# ProxiLink - Quick Reference Card

## 🚀 Get Started in 30 Seconds

```bash
npm install                    # Install dependencies
# Then create .env.local with your Supabase keys
npm run dev                   # Start at http://localhost:8080
```

---

## 📖 Documentation Quick Links

| Document | Purpose | Read Time |
|----------|---------|-----------|
| **GETTING_STARTED.md** | Overview & next steps | 5 min |
| **SETUP_GUIDE.md** | Installation & troubleshooting | 10 min |
| **CODEBASE_ANALYSIS.md** | Architecture & codebase tour | 15 min |
| **FEATURE_ROADMAP.md** | Feature specs & implementation | 20 min |
| **DEVELOPMENT_TRACKER.md** | Sprint planning & status | 10 min |

---

## 🏗️ Project Structure (Essential Files)

```
src/
├── pages/
│   ├── Index.tsx           ✅ Landing (done)
│   ├── Login.tsx           🚧 Needs work
│   ├── Signup.tsx          🚧 Needs work
│   ├── RoleSelection.tsx   🚧 Needs work
│   ├── Dashboard.tsx       🚧 Needs map
│   ├── VendorDashboard.tsx ❌ Empty
│   ├── AdminDashboard.tsx  ❌ Empty
│   └── ServiceProfile.tsx  ❌ Empty
├── components/
│   ├── Map.tsx             🚧 Basic only
│   ├── ProfileMenu.tsx     ✅ Works
│   ├── ServiceProviderList.tsx ✅ Works
│   └── ui/                 ✅ 30+ components
├── integrations/
│   └── supabase/
│       ├── client.ts       ✅ Ready
│       └── types.ts        ✅ Ready
└── App.tsx                 ✅ All routes
```

**Legend:** ✅ Complete | 🚧 In Progress | ❌ Not Started

---

## 🗄️ Database Tables (Quick Reference)

### User Management
```sql
-- Create user: signup → auth.users → profiles → user_roles
-- Login: auth.users → profiles + user_roles
-- Roles: 'youth', 'vendor', 'ngo', 'admin'
```

### Business Data
```sql
-- Vendors: profiles + vendor_profiles + services
-- NGOs: profiles + ngo_profiles + events
-- Community: services + events + reviews + notifications
```

### Essential Queries
```typescript
// Get user with roles
const user = await supabase
  .from('profiles')
  .select('*, user_roles(*)')
  .eq('id', userId)
  .single();

// Get nearby services
const services = await supabase
  .from('services')
  .select('*')
  .eq('status', 'active')
  .order('created_at', { ascending: false });

// Create notification
await supabase.from('notifications').insert({
  user_id: userId,
  notification_type: 'service',
  title: 'Service nearby!',
  content: serviceDescription,
  related_id: serviceId,
});
```

---

## 🎯 Priority Tasks (First Week)

### Task 1: Setup & Verification (Day 1)
- [ ] npm install
- [ ] Create .env.local
- [ ] npm run dev
- [ ] Verify landing page loads
- [ ] Read CODEBASE_ANALYSIS.md

### Task 2: Signup Flow (Days 2-3)
```typescript
// File: src/pages/Signup.tsx
// TODO: Implement email/password registration
// 1. Form with React Hook Form + Zod
// 2. Call supabase.auth.signUp()
// 3. Create profile record
// 4. Redirect to /role-selection
```

### Task 3: Login Flow (Days 4-5)
```typescript
// File: src/pages/Login.tsx
// TODO: Implement email/password login
// 1. Form with email and password
// 2. Call supabase.auth.signInWithPassword()
// 3. Store session
// 4. Redirect based on user role
```

### Task 4: Role Selection (Days 6-7)
```typescript
// File: src/pages/RoleSelection.tsx
// TODO: Allow users to select roles
// 1. Display role options
// 2. Insert into user_roles table
// 3. Create role-specific profile
// 4. Redirect to dashboard
```

---

## 💻 Common Code Patterns

### Form with Validation
```typescript
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const MyForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      <button type="submit">Submit</button>
    </form>
  );
};
```

### Fetch Data from Supabase
```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const MyComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: result, error: err } = await supabase
          .from('services')
          .select('*')
          .limit(10);
        
        if (err) throw err;
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>{/* Display data */}</div>;
};
```

### UI Component with shadcn-ui
```typescript
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export const MyCard = () => (
  <Card className="p-6">
    <h2 className="text-2xl font-bold mb-4">Title</h2>
    <Input placeholder="Enter text" />
    <Button onClick={() => console.log('clicked')}>
      Click Me
    </Button>
  </Card>
);
```

---

## 🔑 Environment Variables

Create `.env.local` in project root:

```env
# Required
VITE_SUPABASE_URL=https://nuqzhlzhtzjfzpqgcogd.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-key-here

# Optional (add later)
VITE_GOOGLE_MAPS_API_KEY=optional
VITE_MAPBOX_API_KEY=optional
```

**Get keys from:** https://app.supabase.com → Settings → API

---

## 🛠️ Development Commands

```bash
npm run dev              # Start dev server (port 8080)
npm run build            # Production build
npm run lint             # Run linter
npm run preview          # Preview production build
npm install              # Install dependencies
npm install [package]    # Add new package
npm uninstall [package]  # Remove package
```

---

## 🐛 Debugging Tips

### Console Logging
```typescript
console.log('Debug:', value);
console.table(arrayOfObjects);
console.error('Error:', error);
```

### React DevTools
- Install "React Developer Tools" browser extension
- Inspect component tree and props

### Network Requests
- Open DevTools → Network tab
- Check Supabase API calls
- Verify response data

### TypeScript Errors
- Hover over error in VS Code
- Check type definitions
- Use `unknown` if needed temporarily

---

## 📦 Key Dependencies

| Package | Purpose | Docs |
|---------|---------|------|
| `react` | UI framework | react.dev |
| `react-router-dom` | Routing | reactrouter.com |
| `@supabase/supabase-js` | Backend | supabase.com/docs |
| `react-hook-form` | Forms | react-hook-form.com |
| `zod` | Validation | zod.dev |
| `tailwindcss` | Styling | tailwindcss.com |
| `shadcn-ui` | Components | ui.shadcn.com |
| `@tanstack/react-query` | Data fetching | tanstack.com/query |

---

## 🚀 Build & Deploy

### Build for Production
```bash
npm run build
# Creates optimized dist/ folder
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
# Follow prompts
```

### Deploy to Netlify
```bash
npm install -g netlify-cli
netlify deploy
```

---

## 🔐 Security Checklist

Before deployment:
- [ ] All environment variables set
- [ ] No API keys in code
- [ ] Supabase RLS policies verified
- [ ] CORS configured
- [ ] Authentication flows tested
- [ ] Input validation working
- [ ] Error messages don't expose sensitive data

---

## 📊 Current Status

```
Project: ProxiLink
Codebase: ✅ Well-structured
Database: ✅ Schema ready
Landing: ✅ Complete
Auth: 🚧 In progress
Maps: 🚧 In progress
Services: ❌ Not started
Admin: ❌ Not started

Estimated MVP: 6-8 weeks
Current Phase: Phase 1 (Auth)
```

---

## 📞 Quick Help

**Problem: Port 8080 in use**
```bash
PORT=3000 npm run dev
```

**Problem: Dependencies fail**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Problem: Supabase keys missing**
1. Go to https://app.supabase.com
2. Select project (nuqzhlzhtzjfzpqgcogd)
3. Settings → API
4. Copy keys to .env.local

**Problem: TypeScript errors**
```bash
npm run lint -- --fix
```

---

## 📚 Learning Resources

1. **React:** https://react.dev/learn
2. **TypeScript:** https://www.typescriptlang.org/docs/handbook
3. **Supabase:** https://supabase.com/docs
4. **Tailwind:** https://tailwindcss.com/docs/installation
5. **shadcn-ui:** https://ui.shadcn.com/

---

## 🎯 One Month Goals

**Week 1:** Authentication ✅
**Week 2:** Geolocation 🎯
**Week 3:** Services Management 🎯
**Week 4:** Notifications & Ratings 🎯

---

## 📝 Notes

- All routes defined in `src/App.tsx`
- Database type defs auto-generated in `src/integrations/supabase/types.ts`
- Components use `cn()` utility for class merging
- Prefer `@` imports for src/ files
- All RLS policies already configured

---

**Last Updated:** November 12, 2025
**Next Review:** After completing Phase 1
**Questions?** Check documentation files or Supabase docs
