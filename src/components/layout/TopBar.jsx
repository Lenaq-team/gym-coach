import { useNavigate } from 'react-router-dom'
import { useNotifications } from '@/hooks/useMessages'
import { useAuthStore } from '@/stores/authStore'

export const TopBar = ({ title }) => {
  const navigate = useNavigate()
  const profileId = useAuthStore((state) => state.profileId)
  const { data: notifications } = useNotifications(profileId)
  
  const unreadCount = notifications?.filter(n => !n.read_at).length || 0
  
  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-[#0F0F0F] border-b border-zinc-800 safe-top">
      <div className="max-w-mobile mx-auto px-4 h-14 flex items-center justify-between">
        <div className="text-xl font-bold text-accent">GymCoach</div>
        <h1 className="text-lg font-semibold absolute left-1/2 -translate-x-1/2">{title}</h1>
        <button 
          onClick={() => navigate('/notifications')}
          className="relative p-2"
        >
          🔔
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>
      </div>
    </div>
  )
}
