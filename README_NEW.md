# ProxiLink - Proximity-Based Community Platform

A modern platform connecting youth, businesses, and communities across Africa through real-time proximity-based connections.

## Getting Started

### Prerequisites

- Node.js v18+ (LTS recommended)
- npm v9+ or Bun v1.0+
- Git

### Installation

```sh
# Clone the repository
git clone https://github.com/DiviTech01/smart-build-prototype.git
cd smart-build-prototype

# Install dependencies
npm install

# Start development server
npm run dev
```

The development server runs on `http://localhost:8080` with hot reload enabled.

### Setup Environment

Create a `.env.local` file in the project root with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://nuqzhlzhtzjfzpqgcogd.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-key-here
```

## What Technologies Are Used?

This project is built with:

- **Frontend:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS + shadcn-ui
- **Backend:** Supabase (PostgreSQL)
- **Forms:** React Hook Form + Zod
- **Routing:** React Router v6
- **Package Manager:** Bun/npm

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

## Project Structure

```
src/
├── pages/          # Page components for routes
├── components/     # Reusable UI components
├── hooks/          # Custom React hooks
├── integrations/   # External service integrations
├── lib/            # Utility functions
└── App.tsx         # Main app with routing
```

## Deployment

Build for production:

```bash
npm run build
```

Deploy the `dist/` folder to:
- **Vercel:** `vercel deploy`
- **Netlify:** `netlify deploy`
- **GitHub Pages:** Push `dist/` to gh-pages branch

## Documentation

For detailed information, see:

- `GETTING_STARTED.md` - Quick start guide
- `SETUP_GUIDE.md` - Detailed setup instructions
- `CODEBASE_ANALYSIS.md` - Architecture overview
- `FEATURE_ROADMAP.md` - Feature specifications
- `DEVELOPMENT_TRACKER.md` - Progress tracking
- `QUICK_REFERENCE.md` - Quick command reference

## Contributing

1. Create a branch for your feature
2. Make your changes
3. Commit with clear messages
4. Push and create a pull request

## License

Licensed under MIT. See LICENSE file for details.

## Support

For questions or issues, check the documentation or create a GitHub issue.

---

**Made independently with ❤️ by DiviTech01**
