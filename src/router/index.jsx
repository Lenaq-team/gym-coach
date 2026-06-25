import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

import Login from '@/pages/shared/Login'
import Notifications from '@/pages/shared/Notifications'

import CoachDashboard from '@/pages/coach/Dashboard'
import CoachClients from '@/pages/coach/Clients'
import CoachClientDetail from '@/pages/coach/ClientDetail'
import CoachRoutines from '@/pages/coach/Routines'
import CreateRoutine from '@/pages/coach/CreateRoutine'
import RoutineEditor from '@/pages/coach/RoutineEditor'
import CoachMessages from '@/pages/coach/Messages'
import CoachProfile from '@/pages/coach/Profile'

import ClientHome from '@/pages/client/Home'
import ClientPlan from '@/pages/client/Plan'
import ClientMetrics from '@/pages/client/Metrics'
import ClientMessages from '@/pages/client/Messages'
import ClientProfile from '@/pages/client/Profile'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { session, role } = useAuthStore()
  
  if (!session) {
    return <Navigate to="/login" replace />
  }
  
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />
  }
  
  return children
}

const RootRedirect = () => {
  const { session, role } = useAuthStore()
  
  if (!session) {
    return <Navigate to="/login" replace />
  }
  
  if (role === 'coach' || role === 'admin') {
    return <Navigate to="/coach/dashboard" replace />
  }
  
  return <Navigate to="/client/home" replace />
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/notifications',
    element: (
      <ProtectedRoute>
        <Notifications />
      </ProtectedRoute>
    ),
  },
  {
    path: '/coach/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['coach', 'admin']}>
        <CoachDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/coach/clients',
    element: (
      <ProtectedRoute allowedRoles={['coach', 'admin']}>
        <CoachClients />
      </ProtectedRoute>
    ),
  },
  {
    path: '/coach/client/:id',
    element: (
      <ProtectedRoute allowedRoles={['coach', 'admin']}>
        <CoachClientDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: '/coach/routines',
    element: (
      <ProtectedRoute allowedRoles={['coach', 'admin']}>
        <CoachRoutines />
      </ProtectedRoute>
    ),
  },
  {
    path: '/coach/routines/new',
    element: (
      <ProtectedRoute allowedRoles={['coach', 'admin']}>
        <CreateRoutine />
      </ProtectedRoute>
    ),
  },
  {
    path: '/coach/routines/:routineId',
    element: (
      <ProtectedRoute allowedRoles={['coach', 'admin']}>
        <RoutineEditor />
      </ProtectedRoute>
    ),
  },
  {
    path: '/coach/messages',
    element: (
      <ProtectedRoute allowedRoles={['coach', 'admin']}>
        <CoachMessages />
      </ProtectedRoute>
    ),
  },
  {
    path: '/coach/profile',
    element: (
      <ProtectedRoute allowedRoles={['coach', 'admin']}>
        <CoachProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: '/client/home',
    element: (
      <ProtectedRoute allowedRoles={['user']}>
        <ClientHome />
      </ProtectedRoute>
    ),
  },
  {
    path: '/client/plan',
    element: (
      <ProtectedRoute allowedRoles={['user']}>
        <ClientPlan />
      </ProtectedRoute>
    ),
  },
  {
    path: '/client/metrics',
    element: (
      <ProtectedRoute allowedRoles={['user']}>
        <ClientMetrics />
      </ProtectedRoute>
    ),
  },
  {
    path: '/client/messages',
    element: (
      <ProtectedRoute allowedRoles={['user']}>
        <ClientMessages />
      </ProtectedRoute>
    ),
  },
  {
    path: '/client/profile',
    element: (
      <ProtectedRoute allowedRoles={['user']}>
        <ClientProfile />
      </ProtectedRoute>
    ),
  },
])
