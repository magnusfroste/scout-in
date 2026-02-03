# LazyJames Research 🔬

Research project exploring AI and machine learning concepts. Experimental codebase for testing new ideas and technologies.

## Features

- **AI Experiments**: Test various AI models and approaches
- **Machine Learning**: Explore ML algorithms and techniques
- **Research Tools**: Utilities for data analysis and visualization
- **Responsive Design**: Works on desktop and mobile

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account (for self-hosting)

### Installation

```bash
npm install
```

### Run Locally

```bash
# Set your Supabase credentials in .env.local
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

npm run dev
```

### Self-Hosted Setup

If you want to self-host this application, you'll need:

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Get your project URL and anon key

2. **Set Environment Variables**
   ```bash
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run the Application**
   ```bash
   npm run dev
   ```

### Build for Production

```bash
npm run build
```

## Tech Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Supabase** - Backend & Auth
- **shadcn/ui** - Components
- **Tailwind CSS** - Styling

## License

MIT
