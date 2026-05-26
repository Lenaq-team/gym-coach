import { PageWrapper } from '@/components/layout/PageWrapper'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'

export default function CoachRoutines() {
  return (
    <PageWrapper title="Rutinas">
      <div className="py-4">
        <EmptyState
          icon="📋"
          title="Rutinas de entrenamiento"
          description="Próximamente: gestión de rutinas y planes de entrenamiento"
          action={
            <Button>Crear rutina</Button>
          }
        />
      </div>
    </PageWrapper>
  )
}
