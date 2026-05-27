import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { useAuthStore } from '@/stores/authStore'
import { useClients } from '@/hooks/useAuth'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'

export default function CoachClients() {
  const navigate = useNavigate()
  const coachId = useAuthStore((state) => state.coachId)
  const { data: clients, isLoading } = useClients(coachId)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredClients = clients?.filter(client =>
    client.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <PageWrapper title="Clientes">
      <div className="py-4 space-y-4">
        <Input
          type="search"
          placeholder="Buscar cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {isLoading && (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {!isLoading && filteredClients?.length === 0 && (
          <EmptyState
            icon="👥"
            title={searchTerm ? 'Sin resultados' : 'Sin clientes'}
            description={searchTerm ? 'No se encontraron clientes' : 'Aún no tienes clientes asignados'}
          />
        )}

        {filteredClients?.map((client) => (
          <Card 
            key={client.id}
            className="cursor-pointer hover:bg-zinc-800/50 transition-colors"
            onClick={() => navigate(`/coach/client/${client.id}`)}
          >
            <div className="flex items-center gap-3">
              <Avatar 
                src={client.avatar_url} 
                alt={client.full_name}
                size="lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{client.full_name}</h3>
                <p className="text-sm text-zinc-400 mb-1">
                  {Array.isArray(client.goals) && client.goals.length > 0 
                    ? client.goals[0] 
                    : 'Sin objetivos'}
                </p>
                <div className="flex gap-2">
                  {client.fitness_level && (
                    <Badge variant="default">{
                      client.fitness_level === 'beginner' ? 'Principiante' :
                      client.fitness_level === 'intermediate' ? 'Intermedio' :
                      client.fitness_level === 'advanced' ? 'Avanzado' : client.fitness_level
                    }</Badge>
                  )}
                </div>
              </div>
              <div className="text-right text-sm text-zinc-400">
                <div>{client.weight_kg ? `${client.weight_kg} kg` : '-'}</div>
                <div>{client.height_cm ? `${client.height_cm} cm` : '-'}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </PageWrapper>
  )
}
