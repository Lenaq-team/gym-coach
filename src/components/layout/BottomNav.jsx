import { NavLink } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export const BottomNav = () => {
  const role = useAuthStore((state) => state.role)
  const isCoach = role === 'coach' || role === 'admin'
  
  const coachNavItems = [
    { path: '/coach/dashboard', label: 'Inicio', icon: '🏠' },
    { path: '/coach/clients', label: 'Clientes', icon: '👥' },
    { path: '/coach/routines', label: 'Rutinas', icon: '📋' },
    { path: '/coach/messages', label: 'Mensajes', icon: '💬' },
    { path: '/coach/profile', label: 'Perfil', icon: '👤' },
  ]
  
  const clientNavItems = [
    { path: '/client/home', label: 'Hoy', icon: '🏋️' },
    { path: '/client/plan', label: 'Mi Plan', icon: '📅' },
    { path: '/client/metrics', label: 'Métricas', icon: '📊' },
    { path: '/client/messages', label: 'Mensajes', icon: '💬' },
    { path: '/client/profile', label: 'Perfil', icon: '👤' },
  ]
  
  const navItems = isCoach ? coachNavItems : clientNavItems
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#1A1A1A] border-t border-zinc-800 safe-bottom">
      <div className="max-w-mobile mx-auto flex justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-2 px-3 min-h-[48px] flex-1 ${
                isActive ? 'text-accent' : 'text-zinc-400'
              }`
            }
          >
            <span className="text-xl mb-0.5">{item.icon}</span>
            <span className="text-xs">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
