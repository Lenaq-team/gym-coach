import { useNavigate } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { useAuthStore } from '@/stores/authStore'
import { useClient } from '@/hooks/useAuth'
import { useProgressPhotos } from '@/hooks/useProgress'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { formatDate } from '@/utils/formatDate'

export default function ClientProfile() {
  const navigate = useNavigate()
  const profileId = useAuthStore((state) => state.profileId)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const session = useAuthStore((state) => state.session)
  const { data: client, isLoading } = useClient(profileId)
  const { data: photos } = useProgressPhotos(profileId)

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
              src={client?.avatar_url} 
              alt={client?.full_name}
              size="xl"
            />
            <div>
              <h2 className="text-2xl font-bold">{client?.full_name || 'Usuario'}</h2>
              <p className="text-zinc-400">{session?.user?.email}</p>
              {client?.experience_level && (
                <Badge variant="success" className="mt-2">
                  {client.experience_level}
                </Badge>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-3">Información Personal</h3>
          <div className="space-y-2 text-sm">
            {client?.age && (
              <div className="flex justify-between py-2 border-b border-zinc-800">
                <span className="text-zinc-400">Edad</span>
                <span>{client.age} años</span>
              </div>
            )}
            {client?.weight_kg && (
              <div className="flex justify-between py-2 border-b border-zinc-800">
                <span className="text-zinc-400">Peso</span>
                <span>{client.weight_kg} kg</span>
              </div>
            )}
            {client?.height_cm && (
              <div className="flex justify-between py-2 border-b border-zinc-800">
                <span className="text-zinc-400">Altura</span>
                <span>{client.height_cm} cm</span>
              </div>
            )}
            {client?.goal && (
              <div className="flex justify-between py-2 border-b border-zinc-800">
                <span className="text-zinc-400">Objetivo</span>
                <span>{client.goal}</span>
              </div>
            )}
            {client?.injuries && (
              <div className="flex justify-between py-2">
                <span className="text-zinc-400">Lesiones</span>
                <span>{client.injuries}</span>
              </div>
            )}
          </div>
        </Card>

        {photos && photos.length > 0 && (
          <Card>
            <h3 className="font-semibold mb-3">Fotos de Progreso</h3>
            <div className="grid grid-cols-3 gap-2">
              {photos.slice(0, 6).map((photo) => (
                <div key={photo.id} className="relative aspect-square">
                  <img
                    src={photo.photo_url}
                    alt="Progreso"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
            {photos.length > 6 && (
              <p className="text-sm text-zinc-400 mt-2 text-center">
                +{photos.length - 6} más
              </p>
            )}
          </Card>
        )}

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
