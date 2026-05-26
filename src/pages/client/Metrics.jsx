import { useState } from 'react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { useAuthStore } from '@/stores/authStore'
import { useProgressMeasurements, usePersonalRecords } from '@/hooks/useProgress'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate } from '@/utils/formatDate'
import { formatUnit } from '@/utils/formatUnit'

const TABS = ['Cuerpo', 'PRs']

export default function ClientMetrics() {
  const profileId = useAuthStore((state) => state.profileId)
  const [activeTab, setActiveTab] = useState('Cuerpo')
  const { data: measurements, isLoading: loadingMeasurements } = useProgressMeasurements(profileId)
  const { data: records, isLoading: loadingRecords } = usePersonalRecords(profileId)

  return (
    <PageWrapper title="Métricas">
      <div className="py-4 space-y-4">
        <div className="flex gap-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab
                  ? 'bg-accent text-black font-semibold'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Cuerpo' && (
          <BodyTab 
            measurements={measurements} 
            isLoading={loadingMeasurements}
          />
        )}

        {activeTab === 'PRs' && (
          <PRsTab 
            records={records} 
            isLoading={loadingRecords}
          />
        )}
      </div>
    </PageWrapper>
  )
}

function BodyTab({ measurements, isLoading }) {
  if (isLoading) return <SkeletonCard />

  const latest = measurements?.[0]

  if (!latest) {
    return (
      <EmptyState
        icon="📊"
        title="Sin mediciones"
        description="Aún no tienes mediciones registradas. Tu coach las añadirá pronto."
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <div className="text-3xl font-bold text-accent">{latest.weight_kg || '-'}</div>
          <div className="text-sm text-zinc-400">Peso (kg)</div>
        </Card>
        <Card>
          <div className="text-3xl font-bold text-accent">{latest.body_fat_pct || '-'}</div>
          <div className="text-sm text-zinc-400">Grasa (%)</div>
        </Card>
        <Card>
          <div className="text-3xl font-bold text-accent">{latest.waist_cm || '-'}</div>
          <div className="text-sm text-zinc-400">Cintura (cm)</div>
        </Card>
        <Card>
          <div className="text-3xl font-bold text-accent">{latest.chest_cm || '-'}</div>
          <div className="text-sm text-zinc-400">Pecho (cm)</div>
        </Card>
      </div>

      <h3 className="text-lg font-semibold mt-6">Historial</h3>
      <div className="space-y-3">
        {measurements.slice(0, 10).map((m) => (
          <Card key={m.id}>
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold">{formatDate(m.recorded_at)}</div>
                <div className="text-sm text-zinc-400">
                  {m.weight_kg && `Peso: ${m.weight_kg} kg`}
                  {m.weight_kg && m.body_fat_pct && ' • '}
                  {m.body_fat_pct && `Grasa: ${m.body_fat_pct}%`}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function PRsTab({ records, isLoading }) {
  if (isLoading) return <SkeletonCard />

  if (!records?.length) {
    return (
      <EmptyState
        icon="🏆"
        title="Sin récords personales"
        description="Aún no tienes récords registrados. ¡Sigue entrenando!"
      />
    )
  }

  const isRecent = (date) => {
    const recordDate = new Date(date)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return recordDate > sevenDaysAgo
  }

  return (
    <div className="space-y-3">
      {records.map((record) => (
        <Card key={record.id}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-semibold">{record.exercise?.name || 'Ejercicio'}</div>
              <div className="text-sm text-zinc-400">
                {formatDate(record.recorded_at)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-accent">
                {formatUnit(record.value, record.unit)}
              </div>
              {isRecent(record.recorded_at) && (
                <Badge variant="success">🏆 Nuevo</Badge>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
