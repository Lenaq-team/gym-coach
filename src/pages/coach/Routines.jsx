import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { useAuthStore } from '@/stores/authStore'
import { useRoutines } from '@/hooks/useRoutines'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'

const DIFFICULTY_LABEL = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
}

const TABS = [
  { key: 'mine', label: 'Mis Rutinas' },
  { key: 'templates', label: 'Plantillas' },
]

export default function CoachRoutines() {
  const navigate = useNavigate()
  const coachId = useAuthStore((s) => s.coachId)
  const { data: routines, isLoading } = useRoutines(coachId)
  const [activeTab, setActiveTab] = useState('mine')

  const filtered = routines?.filter((r) =>
    activeTab === 'templates' ? r.is_template : !r.is_template
  )

  return (
    <PageWrapper title="Rutinas">
      <div className="py-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Rutinas</h2>
          <Button size="sm" onClick={() => navigate('/coach/routines/new')}>
            + Nueva Rutina
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-800 p-1 rounded-lg">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.key
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-400 hover:text-zinc-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {/* Empty state */}
        {!isLoading && filtered?.length === 0 && (
          <EmptyState
            icon="📋"
            title={activeTab === 'templates' ? 'Sin plantillas' : 'Sin rutinas'}
            description={
              activeTab === 'templates'
                ? 'Aún no tienes plantillas. Crea una rutina y márcala como plantilla.'
                : 'Crea tu primera rutina con el botón + Nueva Rutina.'
            }
            action={
              <Button size="sm" onClick={() => navigate('/coach/routines/new')}>
                + Nueva Rutina
              </Button>
            }
          />
        )}

        {/* Routine cards */}
        {!isLoading &&
          filtered?.map((routine) => (
            <Card
              key={routine.id}
              className="cursor-pointer hover:bg-zinc-800/50 transition-colors"
              onClick={() => navigate(`/coach/routines/${routine.id}`)}
            >
              <div className="space-y-2">
                <h3 className="font-semibold text-white">{routine.name}</h3>
                {routine.goal && (
                  <p className="text-sm text-zinc-400">{routine.goal}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {routine.difficulty_level && (
                    <Badge variant="default">
                      {DIFFICULTY_LABEL[routine.difficulty_level] ?? routine.difficulty_level}
                    </Badge>
                  )}
                  {routine.days_per_week && (
                    <Badge variant="default">{routine.days_per_week} días/sem</Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
      </div>
    </PageWrapper>
  )
}
