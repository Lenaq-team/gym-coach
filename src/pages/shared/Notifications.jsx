import { PageWrapper } from '@/components/layout/PageWrapper'
import { useNotifications, useMarkNotificationsRead } from '@/hooks/useMessages'
import { useAuthStore } from '@/stores/authStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDateRelative } from '@/utils/formatDate'

export default function Notifications() {
  const profileId = useAuthStore((state) => state.profileId)
  const { data: notifications, isLoading } = useNotifications(profileId)
  const markAsRead = useMarkNotificationsRead()

  const handleMarkAllRead = () => {
    markAsRead.mutate(profileId)
  }

  return (
    <PageWrapper title="Notificaciones" showNav={false}>
      <div className="py-4 space-y-4">
        {notifications?.some(n => !n.read_at) && (
          <Button 
            variant="secondary" 
            size="sm"
            onClick={handleMarkAllRead}
            disabled={markAsRead.isPending}
          >
            Marcar todas como leídas
          </Button>
        )}

        {isLoading && (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {!isLoading && notifications?.length === 0 && (
          <EmptyState
            icon="🔔"
            title="Sin notificaciones"
            description="No tienes notificaciones en este momento"
          />
        )}

        {notifications?.map((notification) => (
          <Card 
            key={notification.id}
            className={notification.read_at ? 'opacity-60' : ''}
          >
            <div className="flex gap-3">
              {!notification.read_at && (
                <div className="w-2 h-2 mt-2 bg-accent rounded-full flex-shrink-0" />
              )}
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{notification.title}</h3>
                <p className="text-sm text-zinc-400 mb-2">{notification.message}</p>
                <p className="text-xs text-zinc-500">
                  {formatDateRelative(notification.created_at)}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </PageWrapper>
  )
}
