import { useState } from 'react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { useAuthStore } from '@/stores/authStore'
import { useWeekSessions } from '@/hooks/useWorkouts'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate } from '@/utils/formatDate'

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export default function ClientPlan() {
  const profileId = useAuthStore((state) => state.profileId)
  const [weekOffset, setWeekOffset] = useState(0)
  
  const getWeekStart = (offset) => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
    const monday = new Date(today.setDate(diff))
    monday.setDate(monday.getDate() + (offset * 7))
    return monday.toISOString().split('T')[0]
  }
  
  const weekStart = getWeekStart(weekOffset)
  const { data: sessions, isLoading } = useWeekSessions(profileId, weekStart)

  const getSessionForDay = (dayIndex) => {
    return sessions?.find(s => {
      const sessionDate = new Date(s.scheduled_date)
      return sessionDate.getDay() === (dayIndex === 6 ? 0 : dayIndex + 1)
    })
  }

  return (
    <PageWrapper title="Mi Plan">
      <div className="py-4 space-y-4">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setWeekOffset(weekOffset - 1)}
          >
            ← Anterior
          </Button>
          <span className="font-semibold">
            {weekOffset === 0 ? 'Esta semana' : `Semana ${weekOffset > 0 ? '+' : ''}${weekOffset}`}
          </span>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setWeekOffset(weekOffset + 1)}
          >
            Siguiente →
          </Button>
        </div>

        {isLoading && (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {!isLoading && (
          <div className="space-y-3">
            {DAYS_OF_WEEK.map((day, idx) => {
              const session = getSessionForDay(idx)
              
              return (
                <Card key={day}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold">{day}</div>
                      {session ? (
                        <>
                          <div className="text-sm text-zinc-400 mt-1">
                            {session.routine_id || 'Entrenamiento'}
                          </div>
                          <Badge variant="success" className="mt-2">
                            {session.workout_exercises?.length || 0} ejercicios
                          </Badge>
                        </>
                      ) : (
                        <div className="text-sm text-zinc-500 mt-1">Descanso</div>
                      )}
                    </div>
                    {session?.status === 'completed' && (
                      <div className="text-2xl">✅</div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {!isLoading && !sessions?.length && (
          <EmptyState
            icon="📅"
            title="Sin plan esta semana"
            description="Tu coach aún no ha asignado entrenamientos para esta semana"
          />
        )}
      </div>
    </PageWrapper>
  )
}
