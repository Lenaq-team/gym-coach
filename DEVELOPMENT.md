# Development Guide 🚀

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create `.env.local` file:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   App will run at http://localhost:5173

4. **Build for production:**
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── TopBar.jsx         # Top navigation bar
│   │   ├── BottomNav.jsx      # Bottom navigation
│   │   └── PageWrapper.jsx    # Page layout wrapper
│   ├── ui/                     # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   ├── Badge.jsx
│   │   ├── Avatar.jsx
│   │   ├── Skeleton.jsx
│   │   ├── Modal.jsx
│   │   └── EmptyState.jsx
│   ├── charts/                 # Chart components (TBD)
│   └── forms/                  # Form components (TBD)
├── hooks/                      # TanStack Query hooks
│   ├── useAuth.js              # Auth and user management
│   ├── useWorkouts.js          # Workout plans and sessions
│   ├── useCompletedWorkouts.js # Completed workouts
│   ├── useProgress.js          # Measurements, PRs, photos
│   ├── useExercises.js         # Exercise library
│   └── useMessages.js          # Messages and notifications
├── pages/
│   ├── coach/                  # Coach pages
│   │   ├── Dashboard.jsx
│   │   ├── Clients.jsx
│   │   ├── ClientDetail.jsx
│   │   ├── Routines.jsx
│   │   ├── Messages.jsx
│   │   └── Profile.jsx
│   ├── client/                 # Client pages
│   │   ├── Home.jsx
│   │   ├── Plan.jsx
│   │   ├── Metrics.jsx
│   │   ├── Messages.jsx
│   │   └── Profile.jsx
│   └── shared/                 # Shared pages
│       ├── Login.jsx
│       └── Notifications.jsx
├── stores/                     # Zustand stores
│   ├── authStore.js            # Authentication state
│   └── uiStore.js              # UI state
├── lib/                        # Core setup
│   ├── supabase.js             # Supabase client
│   └── queryClient.js          # React Query client
├── utils/                      # Utility functions
│   ├── formatDate.js           # Date formatting
│   └── formatUnit.js           # Unit formatting
└── router/
    └── index.jsx               # Route configuration
```

## Key Technologies

### State Management
- **Zustand** for global state (auth, UI)
- **TanStack Query** for server state

### Data Fetching Pattern
All data fetching uses TanStack Query hooks:
```javascript
// Example: Fetch clients
const { data: clients, isLoading, error } = useClients(coachId)

// Example: Mutation
const updateClient = useUpdateClient()
await updateClient.mutateAsync({ clientId, updates })
```

### Routing
Protected routes with role-based access:
```javascript
<ProtectedRoute allowedRoles={['coach', 'admin']}>
  <CoachDashboard />
</ProtectedRoute>
```

### Forms
React Hook Form + Zod validation:
```javascript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  email: z.string().email('Email inválido'),
})

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema)
})
```

## Styling

### Tailwind Classes
- Background: `bg-[#0F0F0F]`
- Cards: `bg-[#1A1A1A]`
- Accent: `bg-accent` (#C8F135)
- Text: `text-white` / `text-zinc-400`
- Borders: `border-zinc-800`

### Responsive Design
Mobile-first with max-width container:
```jsx
<div className="max-w-mobile mx-auto">
  {/* Content */}
</div>
```

## Database Queries

### Query Keys Convention
```javascript
['clients', coachId]           // List of clients
['client', clientId]           // Single client
['workoutPlans', clientId]     // Client's workout plans
['progressMeasurements', clientId]
```

### Invalidation
After mutations, invalidate relevant queries:
```javascript
onSuccess: (data) => {
  queryClient.invalidateQueries({ queryKey: ['client', data.id] })
  queryClient.invalidateQueries({ queryKey: ['clients'] })
}
```

## Authentication Flow

1. User logs in with email/password
2. Fetch user data from `users` table
3. Store session, role, profileId, accountId in Zustand
4. Redirect based on role:
   - coach/admin → `/coach/dashboard`
   - user → `/client/home`

## Adding New Features

### 1. Add Database Query Hook
Create hook in `/src/hooks/`:
```javascript
export const useNewFeature = (id) => {
  return useQuery({
    queryKey: ['feature', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('table_name')
        .select('*')
        .eq('id', id)
      
      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}
```

### 2. Create Page Component
Add page in `/src/pages/coach/` or `/src/pages/client/`:
```javascript
import { PageWrapper } from '@/components/layout/PageWrapper'

export default function NewPage() {
  return (
    <PageWrapper title="Page Title">
      <div className="py-4 space-y-4">
        {/* Content */}
      </div>
    </PageWrapper>
  )
}
```

### 3. Add Route
Update `/src/router/index.jsx`:
```javascript
{
  path: '/coach/new-page',
  element: (
    <ProtectedRoute allowedRoles={['coach', 'admin']}>
      <NewPage />
    </ProtectedRoute>
  ),
}
```

## Common Tasks

### Add Loading State
```jsx
if (isLoading) {
  return <SkeletonCard />
}
```

### Add Empty State
```jsx
if (!data?.length) {
  return (
    <EmptyState
      icon="📋"
      title="Sin datos"
      description="No hay información disponible"
      action={<Button>Agregar</Button>}
    />
  )
}
```

### Add Toast Notification
```javascript
// TODO: Implement toast system
```

## Testing

### Test User Login
1. Create test users in Supabase Auth
2. Assign roles in `users` table
3. Link to coach/client in respective tables

### Test Queries
Check browser DevTools → Network → Filter by "supabase"

## Deployment

### Vercel (Recommended)
1. Connect GitHub repository
2. Add environment variables
3. Deploy

### Environment Variables Required
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Troubleshooting

### Build Errors
- Check that all imports use `.jsx` extension
- Verify all environment variables are set
- Run `npm run build` locally first

### Database Errors
- Check RLS policies in Supabase
- Verify user has correct role
- Check foreign key relationships

### Authentication Issues
- Clear browser localStorage
- Check Supabase Auth settings
- Verify email confirmation is disabled (for testing)

## Best Practices

1. **Always use TanStack Query** for data fetching
2. **Use Zustand sparingly** - only for global UI state
3. **Mobile-first** - design for 430px width first
4. **All text in Spanish** - UI labels, errors, etc.
5. **Loading states everywhere** - never show empty screens
6. **Error handling** - always catch and display errors
7. **Optimistic updates** - for better UX on mutations

## Next Steps

Priority features to implement:
1. ✅ Basic auth and navigation
2. ✅ Client list and details
3. ✅ Progress tracking views
4. ⏳ Workout plan creation
5. ⏳ Exercise library management
6. ⏳ Real-time messaging
7. ⏳ Push notifications
8. ⏳ Advanced charts

## Support

For questions or issues, contact the Lena Q Team.
