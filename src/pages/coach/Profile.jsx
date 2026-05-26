import { useNavigate } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { useAuthStore } from '@/stores/authStore'
import { useCoachProfile } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { SkeletonCard } from '@/components/ui/Skeleton'

export default function CoachProfile() {
  const navigate = useNavigate()
  const { session, clearAuth } = useAuthStore()
  const { data: coach, isLoading } = useCoachProfile(session?.user?.id)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    clearAuth()
    navigate('/login')
  }

  if (isLoading) {
    return (
      <PageWrapper title="Perfil">
        <div className="py-4">
          <SkeletonCard />
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper title="Perfil">
      <div className="py-4 space-y-4">
        <Card>
          <div className="flex flex-col items-center text-center gap-4">
            <Avatar 
              src={coach?.avatar_url} 
              alt={coach?.full_name}
              size="xl"
            />
            <div>
              <h2 className="text-2xl font-bold">{coach?.full_name || 'Coach'}</h2>
              <p className="text-zinc-400">{session?.user?.email}</p>
            </div>
          </div>
        </Card>

        {coach?.bio && (
          <Card>
            <h3 className="font-semibold mb-2">Biografía</h3>
            <p className="text-zinc-400 text-sm">{coach.bio}</p>
          </Card>
        )}

        <Card>
          <h3 className="font-semibold mb-3">Información de la cuenta</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-zinc-800">
              <span className="text-zinc-400">Correo</span>
              <span>{session?.user?.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-800">
              <span className="text-zinc-400">Rol</span>
              <span className="capitalize">Coach</span>
            </div>
          </div>
        </Card>

        <Button 
          variant="danger" 
          size="lg" 
          className="w-full"
          onClick={handleLogout}
        >
          Cerrar Sesión
        </Button>
      </div>
    </PageWrapper>
  )
}
