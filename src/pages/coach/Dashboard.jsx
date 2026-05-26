import { PageWrapper } from '@/components/layout/PageWrapper'
import { useAuthStore } from '@/stores/authStore'
import { useClients } from '@/hooks/useAuth'
import { useCompletedWorkouts } from '@/hooks/useCompletedWorkouts'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { useNavigate } from 'react-router-dom'

export default function CoachDashboard() {
  const navigate = useNavigate()
  const coachId = useAuthStore((state) => state.coachId)
  const { data: clients, isLoading } = useClients(coachId)

  const totalClients = clients?.length || 0
  
  const thisWeekStart = new Date()
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay())
  
  return (
    <PageWrapper title="Dashboard">
      <div className="py-4 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <div className="text-3xl font-bold text-accent">{totalClients}</div>
            <div className="text-sm text-zinc-400 mt-1">Clientes Activos</div>
          </Card>
          
          <Card>
            <div className="text-3xl font-bold text-accent">-</div>
            <div className="text-sm text-zinc-400 mt-1">Entrenamientos</div>
          </Card>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Clientes Recientes</h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/coach/clients')}
            >
              Ver todos
            </Button>
          </div>

          {isLoading && (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          )}

          {!isLoading && clients?.length === 0 && (
            <EmptyState
              icon="👥"
              title="Sin clientes"
              description="Aún no tienes clientes asignados"
              action={
                <Button onClick={() => navigate('/coach/clients')}>
                  Ver clientes
                </Button>
              }
            />
          )}

          <div className="space-y-3">
            {clients?.slice(0, 5).map((client) => (
              <Card 
                key={client.id}
                className="cursor-pointer hover:bg-zinc-800/50 transition-colors"
                onClick={() => navigate(`/coach/client/${client.id}`)}
              >
                <div className="flex items-center gap-3">
                  <Avatar 
                    src={client.avatar_url} 
                    alt={client.full_name}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{client.full_name}</h3>
                    <p className="text-sm text-zinc-400">{client.goal || 'Sin objetivo'}</p>
                  </div>
                  {client.experience_level && (
                    <Badge variant="default">
                      {client.experience_level}
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
