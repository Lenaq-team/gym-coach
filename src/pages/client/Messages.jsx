import { PageWrapper } from '@/components/layout/PageWrapper'
import { EmptyState } from '@/components/ui/EmptyState'

export default function ClientMessages() {
  return (
    <PageWrapper title="Mensajes">
      <div className="py-4">
        <EmptyState
          icon="💬"
          title="Mensajes"
          description="Próximamente: chat con tu coach"
        />
      </div>
    </PageWrapper>
  )
}
