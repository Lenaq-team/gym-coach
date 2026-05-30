import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { useAuthStore } from '@/stores/authStore'
import { useClients } from '@/hooks/useAuth'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { AddClientModal } from '@/components/coach/AddClientModal'
import { FITNESS_LEVEL_LABEL } from '@/constants/client.const'

export default function CoachClients() {
  const navigate = useNavigate()
  const coachId = useAuthStore((state) => state.coachId)
  const { data: clients, isLoading } = useClients(coachId)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredClients = clients?.filter(client =>
    client.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <PageWrapper title="Clientes">
      <div className="py-4 space-y-4">
        <div className="flex gap-3">
          <Input
            type="search"
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={() => setIsModalOpen(true)}
            size="md"
            aria-label="Agregar cliente"
          >
            + Agregar
          </Button>
        </div>

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
            description={
              searchTerm
                ? 'No se encontraron clientes con ese nombre'
                : 'Agrega tu primer cliente con el botón + Agregar'
            }
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
                alt={client.full_name || 'Cliente'}
                size="lg"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">
                  {client.full_name || 'Sin nombre'}
                </h3>
                <p className="text-sm text-zinc-400 mb-1 truncate">
                  {Array.isArray(client.goals) && client.goals.length > 0
                    ? client.goals[0]
                    : 'Sin objetivos'}
                </p>
                <div className="flex gap-2">
                  {client.fitness_level && (
                    <Badge variant="default">
                      {FITNESS_LEVEL_LABEL[client.fitness_level] ?? client.fitness_level}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-right text-sm text-zinc-400 shrink-0">
                <div>{client.weight_kg ? `${client.weight_kg} kg` : '-'}</div>
                <div>{client.height_cm ? `${client.height_cm} cm` : '-'}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <AddClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </PageWrapper>
  )
}
