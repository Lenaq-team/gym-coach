import { PageWrapper } from '@/components/layout/PageWrapper'
import { EmptyState } from '@/components/ui/EmptyState'

export default function CoachMessages() {
  return (
    <PageWrapper title="Mensajes">
      <div className="py-4">
        <EmptyState
          icon="💬"
          title="Mensajes"
          description="Próximamente: sistema de mensajería con tus clientes"
        />
      </div>
    </PageWrapper>
  )
}
