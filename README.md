# ProxiLink - Connect to Opportunities Around You

![ProxiLink Logo](public/ProxiLink%20Logo.png)

ProxiLink is a proximity-based digital ecosystem empowering African youth and MSMEs through location-based connections. Find nearby services, connect with vendors, and access opportunities in your community.

**Repository**: https://github.com/DiviTech01/ProxiLink

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Project](#running-the-project)
- [Building for Production](#building-for-production)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

---

## ✨ Features

- 🗺️ **Location-based service discovery** with interactive maps
- 👤 **Multi-role authentication** (User, Vendor, Admin)
- 💬 **Real-time messaging** between users and vendors
- ⭐ **Reviews and ratings** system
- 📱 **Push notifications** support
- 🔍 **Advanced filtering** by distance, category, and price
- 📊 **Vendor analytics dashboard**
- 🌙 **Dark mode** support
- 📱 **Fully responsive** mobile-first design

---

## 🛠️ Tech Stack

- **Frontend**: React 18.3.1 + TypeScript
- **Build Tool**: Vite 5.4.19
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Maps**: Leaflet + OpenStreetMap / Google Maps API (backend)
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Deployment**: Vercel

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (v9 or higher) - comes with Node.js
- **Git** - [Download](https://git-scm.com/)
- **Supabase Account** - [Sign up](https://supabase.com/)
- **Google Maps API Key** (optional, for maps) - [Get API Key](https://developers.google.com/maps/documentation/javascript/get-api-key)

---

## 🚀 Installation & Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/DiviTech01/ProxiLink.git
cd ProxiLink
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy the example environment file
cp .env.example .env
```

Or create `.env` manually with the following content:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# Google Maps API (Optional - for map features)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Demo Mode (set to 'false' when you have real users)
VITE_USE_DEMO_VENDORS=true

# Vercel (for push notifications)
VITE_VERCEL_PROJECT_ID=your_vercel_project_id
```

### Step 4: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select your existing project
3. Navigate to **Settings** → **API**
4. Copy the following values:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_PUBLISHABLE_KEY`

### Step 5: Set Up Database

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the following migrations in order:

**Migration 1: Create messaging tables** (`supabase/migrations/20251126000001_create_messaging_tables.sql`)

```sql
-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, vendor_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_vendor_id ON public.conversations(vendor_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

-- Enable Row Level Security
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view their own conversations" ON public.conversations
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = vendor_id);

CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE id = messages.conversation_id 
      AND (user_id = auth.uid() OR vendor_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own messages" ON public.messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE id = messages.conversation_id 
      AND (user_id = auth.uid() OR vendor_id = auth.uid())
    )
  );

-- Function to get unread message count
CREATE OR REPLACE FUNCTION get_unread_count(p_conversation_id UUID, p_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER 
  FROM public.messages 
  WHERE conversation_id = p_conversation_id 
    AND sender_id != p_user_id 
    AND is_read = false;
$$ LANGUAGE SQL SECURITY DEFINER;
```

**Migration 2: Add vendor active status** (`supabase/migrations/20251126000002_add_vendor_active_status.sql`)

```sql
-- Add is_active column to vendor_profiles
ALTER TABLE public.vendor_profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_is_active 
ON public.vendor_profiles(is_active);

-- Update RLS policy to hide inactive vendors from public
DROP POLICY IF EXISTS "Anyone can view vendor profiles" ON public.vendor_profiles;

CREATE POLICY "Anyone can view active vendor profiles" 
ON public.vendor_profiles 
FOR SELECT 
USING (is_active = true OR auth.uid() = user_id);
```

#### Option B: Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

---

## 🔐 Environment Variables Explained

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | ✅ Yes | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | ✅ Yes | Supabase anon/public key |
| `VITE_GOOGLE_MAPS_API_KEY` | ⚠️ Optional | Google Maps JavaScript API key (maps work without it using Leaflet) |
| `VITE_USE_DEMO_VENDORS` | ⚠️ Optional | Set to `true` to use demo vendors, `false` for real database vendors (default: `true`) |
| `VITE_VERCEL_PROJECT_ID` | ⚠️ Optional | Vercel project ID for push notifications |

---

## 🏃 Running the Project

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:8080`

### Development with Preview

```bash
npm run preview
```

---

## 🏗️ Building for Production

```bash
# Build the project
npm run build

# Preview production build locally
npm run preview
```

The build output will be in the `dist/` directory.

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)

#### Option 1: Using Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure environment variables:
   - Add all variables from your `.env` file
5. Click **"Deploy"**

#### Option 2: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Deploy to Other Platforms

#### Netlify

```bash
# Build command
npm run build

# Publish directory
dist
```

#### GitHub Pages

```bash
# Install gh-pages
npm install -g gh-pages

# Deploy
npm run build
gh-pages -d dist
```

---

## 📁 Project Structure

```
ProxiLink/
├── public/                 # Static assets
│   ├── ProxiLink Logo.png
│   ├── robots.txt
│   └── service-worker.js
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── Map.tsx       # Map component
│   │   ├── Messages.tsx  # Messaging interface
│   │   └── ...
│   ├── pages/            # Page components
│   │   ├── Dashboard.tsx
│   │   ├── VendorDashboard.tsx
│   │   ├── ServiceList.tsx
│   │   └── ...
│   ├── hooks/            # Custom React hooks
│   │   ├── useGeolocation.ts
│   │   ├── useNotifications.tsx
│   │   └── usePushNotifications.ts
│   ├── integrations/     # Third-party integrations
│   │   └── supabase/
│   │       ├── client.ts
│   │       └── types.ts
│   ├── lib/              # Utility functions
│   ├── data/             # Demo data (when VITE_USE_DEMO_VENDORS=true)
│   ├── App.tsx           # Main app component
│   └── main.tsx          # App entry point
├── supabase/
│   ├── migrations/       # Database migrations
│   └── config.toml
├── .env                  # Environment variables (create this)
├── package.json
├── vite.config.ts
└── README.md
```

---

## 🧪 Testing Account

For testing purposes, you can create an account with any email or use:

```
Email: test@proxilink.com
Password: Test@123
```

**Note**: This is a demo account. In production, implement proper authentication security.

---

## 🎯 Key Features Setup

### Enable Push Notifications

1. Service worker is already configured in `public/service-worker.js`
2. Set `VITE_VERCEL_PROJECT_ID` in your `.env`
3. Push notifications will work automatically on supported browsers

### Enable Google Maps

1. Get a Google Maps JavaScript API key
2. Add it to `.env` as `VITE_GOOGLE_MAPS_API_KEY`
3. Enable the following APIs in Google Cloud Console:
   - Maps JavaScript API
   - Places API
   - Geocoding API

**Note**: Maps work without Google Maps API using OpenStreetMap via Leaflet

### Switch to Real Vendors

Once you have real vendor data in your database:

1. Change `.env`:
   ```env
   VITE_USE_DEMO_VENDORS=false
   ```
2. Restart the development server

---

## 👥 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request


## 📧 Support

- **Email**: divineokonitu01@gmail.com
- **GitHub Issues**: [Create an issue](https://github.com/DiviTech01/ProxiLink/issues)
- **Documentation**: See `DOCUMENTATION_INDEX.md` for detailed guides

---

**Made with ❤️ for African communities**
