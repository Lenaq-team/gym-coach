import { PageWrapper } from '@/components/layout/PageWrapper'
import { useAuthStore } from '@/stores/authStore'
import { useClient } from '@/hooks/useAuth'
import { useTodaySession } from '@/hooks/useWorkouts'
import { useCompleteWorkout } from '@/hooks/useCompletedWorkouts'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'

export default function ClientHome() {
  const profileId = useAuthStore((state) => state.profileId)
  const { data: client } = useClient(profileId)
  const { data: todaySession, isLoading } = useTodaySession(profileId)
  const completeWorkout = useCompleteWorkout()

  const handleComplete = async () => {
    if (!todaySession) return
    
    await completeWorkout.mutateAsync({
      client_id: profileId,
      workout_session_id: todaySession.id,
      completed_at: new Date().toISOString(),
      duration_minutes: null,
      notes: null,
    })
  }

  return (
    <PageWrapper title="Hoy">
      <div className="py-4 space-y-4">
        <Card>
          <h2 className="text-2xl font-bold mb-1">
            Hola, {client?.full_name?.split(' ')[0] || 'Atleta'} 💪
          </h2>
          <p className="text-zinc-400">
            ¡Es momento de entrenar!
          </p>
        </Card>

        {isLoading && <SkeletonCard />}

        {!isLoading && !todaySession && (
          <EmptyState
            icon="✅"
            title="Sin entrenamientos hoy"
            description="No tienes entrenamientos programados para hoy. ¡Descansa o revisa tu plan semanal!"
          />
        )}

        {todaySession && (
          <Card>
            <div className="mb-4">
              <h3 className="text-xl font-bold mb-2">{todaySession.routine_id || 'Entrenamiento del día'}</h3>
              <Badge variant="success">
                {todaySession.workout_exercises?.length || 0} ejercicios
              </Badge>
            </div>

            <div className="space-y-3 mb-4">
              {todaySession.workout_exercises?.map((we, idx) => (
                <div 
                  key={we.id}
                  className="flex items-start gap-3 p-3 bg-zinc-900 rounded-lg"
                >
                  <div className="w-8 h-8 rounded-full bg-accent text-black flex items-center justify-center font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{we.exercise?.name || 'Ejercicio'}</div>
                    <div className="text-sm text-zinc-400">
                      {we.sets} series × {we.reps} reps
                      {we.rest_seconds && ` • ${we.rest_seconds}s descanso`}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button 
              size="lg" 
              className="w-full"
              onClick={handleComplete}
              disabled={completeWorkout.isPending}
            >
              {completeWorkout.isPending ? 'Guardando...' : 'Marcar como completado'}
            </Button>
          </Card>
        )}
      </div>
    </PageWrapper>
  )
}
