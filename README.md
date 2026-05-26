# Gym Coach 🏋️

Modern web application for gym coaches and clients to manage workouts, track progress, and communicate effectively.

## 🚀 Tech Stack

- **Frontend:** React 19 + Vite
- **Styling:** Tailwind CSS 4
- **State Management:** Zustand
- **Data Fetching:** TanStack Query v5
- **Routing:** React Router v6
- **Forms:** React Hook Form + Zod
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Charts:** Recharts
- **Date Handling:** date-fns (Spanish locale)

## 📱 Features

### For Coaches
- **Dashboard:** Overview of clients and recent activity
- **Client Management:** View and manage client profiles
- **Client Details:** Track metrics, PRs, progress photos, and workout plans
- **Routines:** Create and manage workout plans (coming soon)
- **Messages:** Chat with clients (coming soon)

### For Clients
- **Today's Workout:** View and complete daily workouts
- **Weekly Plan:** See workout schedule for the week
- **Metrics:** Track body measurements and personal records
- **Progress Photos:** View progress photo gallery
- **Profile:** Manage personal information

## 🛠️ Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Lenaq-team/gym-coach.git
cd gym-coach
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173)

## 🗄️ Database Schema

The database includes 14 tables:
- `users` - User authentication and roles
- `coaches` - Coach profiles
- `clients` - Client profiles
- `exercises` - Exercise library
- `workout_plans` - Workout programs
- `workout_sessions` - Daily workout sessions
- `workout_exercises` - Exercises within sessions
- `completed_workouts` - Workout completions
- `completed_exercises` - Exercise completions
- `personal_records` - Personal bests
- `progress_measurements` - Body measurements
- `progress_photos` - Progress photos
- `messages` - Direct messages
- `notifications` - System notifications

See `/supabase/migrations/` for detailed schema.

## 🎨 Design System

### Colors
- **Background:** #0F0F0F
- **Cards:** #1A1A1A
- **Accent:** #C8F135 (lime green)
- **Text:** White / Zinc-400
- **Borders:** Zinc-800

### Layout
- Mobile-first design (max-width: 430px)
- Fixed top bar with notifications
- Fixed bottom navigation
- Safe area aware (iOS notch support)

## 📦 Project Structure

```
src/
├── components/
│   ├── layout/      # TopBar, BottomNav, PageWrapper
│   ├── ui/          # Reusable UI components
│   ├── charts/      # Chart components
│   └── forms/       # Form components
├── hooks/           # TanStack Query hooks
├── pages/
│   ├── coach/       # Coach pages
│   ├── client/      # Client pages
│   └── shared/      # Shared pages (Login, Notifications)
├── stores/          # Zustand stores
├── lib/             # Supabase client, Query client
├── utils/           # Utility functions
└── router/          # Route configuration
```

## 🔐 Authentication

The app uses Supabase Auth with role-based access:
- **Admin/Coach:** Access to coach dashboard and client management
- **User:** Access to client features and personal data

## 🚧 Roadmap

- [ ] Complete workout plan management
- [ ] Exercise library with videos
- [ ] Real-time messaging system
- [ ] Advanced progress charts
- [ ] Photo comparison tool
- [ ] Push notifications
- [ ] Export progress reports
- [ ] Mobile app (React Native)

## 📄 License

ISC

## 👥 Team

Built by Lena Q Team
