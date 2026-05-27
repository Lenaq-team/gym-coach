import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { useClient, useUpdateClient } from '@/hooks/useAuth'
import { useProgressMeasurements, usePersonalRecords, useProgressPhotos } from '@/hooks/useProgress'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { formatDate } from '@/utils/formatDate'
import { formatUnit } from '@/utils/formatUnit'

const TABS = ['Info', 'Métricas', 'Plan', 'PRs', 'Fotos']

export default function CoachClientDetail() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('Info')
  const { data: client, isLoading } = useClient(id)

  if (isLoading) {
    return (
      <PageWrapper title="Cliente">
        <div className="py-4 space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </PageWrapper>
    )
  }

  if (!client) {
    return (
      <PageWrapper title="Cliente">
        <EmptyState
          icon="❌"
          title="Cliente no encontrado"
          description="No se pudo cargar la información del cliente"
        />
      </PageWrapper>
    )
  }

  return (
    <PageWrapper title={client.full_name}>
      <div className="py-4 space-y-4">
        <Card>
          <div className="flex items-center gap-4">
            <Avatar 
              src={client.avatar_url} 
              alt={client.full_name || 'Cliente'}
              size="xl"
            />
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{client.full_name || 'Sin nombre'}</h2>
              <p className="text-zinc-400">
                {Array.isArray(client.goals) && client.goals.length > 0 
                  ? client.goals.join(', ') 
                  : 'Sin objetivos'}
              </p>
              <div className="flex gap-2 mt-2">
                {client.fitness_level && (
                  <Badge>{
                    client.fitness_level === 'beginner' ? 'Principiante' :
                    client.fitness_level === 'intermediate' ? 'Intermedio' :
                    client.fitness_level === 'advanced' ? 'Avanzado' : client.fitness_level
                  }</Badge>
                )}
              </div>
            </div>
          </div>
        </Card>

        <div className="flex overflow-x-auto gap-2 pb-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-accent text-black font-semibold'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Info' && <InfoTab client={client} />}
        {activeTab === 'Métricas' && <MetricsTab clientId={id} />}
        {activeTab === 'Plan' && <PlanTab clientId={id} />}
        {activeTab === 'PRs' && <PRsTab clientId={id} />}
        {activeTab === 'Fotos' && <PhotosTab clientId={id} />}
      </div>
    </PageWrapper>
  )
}

function InfoTab({ client }) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: client.full_name || '',
    date_of_birth: client.date_of_birth || '',
    weight_kg: client.weight_kg || '',
    height_cm: client.height_cm || '',
    goals: Array.isArray(client.goals) ? client.goals.join(', ') : '',
    injuries: Array.isArray(client.injuries) ? client.injuries.join(', ') : '',
    fitness_level: client.fitness_level || '',
  })
  const updateClient = useUpdateClient()

  const handleSave = async () => {
    const updates = {
      ...formData,
      goals: formData.goals ? formData.goals.split(',').map(g => g.trim()) : [],
      injuries: formData.injuries ? formData.injuries.split(',').map(i => i.trim()) : [],
    }
    
    await updateClient.mutateAsync({
      clientId: client.id,
      updates: updates,
    })
    setIsEditing(false)
  }

  // Calculate age from date_of_birth
  const calculateAge = (dob) => {
    if (!dob) return null
    const today = new Date()
    const birthDate = new Date(dob)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const displayAge = calculateAge(client.date_of_birth)
  const displayGoals = Array.isArray(client.goals) ? client.goals.join(', ') : client.goals || '-'
  const displayInjuries = Array.isArray(client.injuries) && client.injuries.length > 0 
    ? client.injuries.join(', ') 
    : 'Ninguna'

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={updateClient.isPending}
        >
          {isEditing ? 'Guardar' : 'Editar'}
        </Button>
      </div>

      {isEditing ? (
        <Card className="space-y-3">
          <Input
            label="Nombre completo"
            value={formData.full_name}
            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
          />
          <Input
            label="Fecha de nacimiento"
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
          />
          <Input
            label="Peso (kg)"
            type="number"
            step="0.1"
            value={formData.weight_kg}
            onChange={(e) => setFormData({...formData, weight_kg: e.target.value})}
          />
          <Input
            label="Altura (cm)"
            type="number"
            step="0.1"
            value={formData.height_cm}
            onChange={(e) => setFormData({...formData, height_cm: e.target.value})}
          />
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Nivel de fitness
            </label>
            <select
              value={formData.fitness_level}
              onChange={(e) => setFormData({...formData, fitness_level: e.target.value})}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">Seleccionar...</option>
              <option value="beginner">Principiante</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzado</option>
            </select>
          </div>
          <Input
            label="Objetivos (separados por coma)"
            value={formData.goals}
            onChange={(e) => setFormData({...formData, goals: e.target.value})}
            placeholder="Ganar masa muscular, Mejorar resistencia"
          />
          <Input
            label="Lesiones (separados por coma)"
            value={formData.injuries}
            onChange={(e) => setFormData({...formData, injuries: e.target.value})}
            placeholder="Ninguna o lista de lesiones"
          />
        </Card>
      ) : (
        <Card className="space-y-3">
          {displayAge && <InfoRow label="Edad" value={`${displayAge} años`} />}
          <InfoRow label="Peso" value={client.weight_kg ? `${client.weight_kg} kg` : '-'} />
          <InfoRow label="Altura" value={client.height_cm ? `${client.height_cm} cm` : '-'} />
          <InfoRow label="Nivel" value={
            client.fitness_level === 'beginner' ? 'Principiante' :
            client.fitness_level === 'intermediate' ? 'Intermedio' :
            client.fitness_level === 'advanced' ? 'Avanzado' : '-'
          } />
          <InfoRow label="Objetivos" value={displayGoals} />
          <InfoRow label="Lesiones" value={displayInjuries} />
        </Card>
      )}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b border-zinc-800 last:border-0">
      <span className="text-zinc-400">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

function MetricsTab({ clientId }) {
  const { data: measurements, isLoading } = useProgressMeasurements(clientId)

  if (isLoading) return <SkeletonCard />

  const latest = measurements?.[0]

  return (
    <div className="space-y-4">
      {latest ? (
        <>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <div className="text-2xl font-bold text-accent">{latest.weight_kg || '-'}</div>
              <div className="text-sm text-zinc-400">Peso (kg)</div>
            </Card>
            <Card>
              <div className="text-2xl font-bold text-accent">{latest.body_fat_pct || '-'}</div>
              <div className="text-sm text-zinc-400">Grasa (%)</div>
            </Card>
            <Card>
              <div className="text-2xl font-bold text-accent">{latest.waist_cm || '-'}</div>
              <div className="text-sm text-zinc-400">Cintura (cm)</div>
            </Card>
            <Card>
              <div className="text-2xl font-bold text-accent">{latest.chest_cm || '-'}</div>
              <div className="text-sm text-zinc-400">Pecho (cm)</div>
            </Card>
          </div>

          <h3 className="text-lg font-semibold mt-6">Historial</h3>
          {measurements.map((m) => (
            <Card key={m.id}>
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">{formatDate(m.recorded_at)}</div>
                  <div className="text-sm text-zinc-400">
                    Peso: {m.weight_kg || '-'} kg • Grasa: {m.body_fat_pct || '-'}%
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </>
      ) : (
        <EmptyState
          icon="📊"
          title="Sin mediciones"
          description="Aún no hay mediciones registradas"
        />
      )}
    </div>
  )
}

function PlanTab({ clientId }) {
  return (
    <EmptyState
      icon="📅"
      title="Plan de entrenamiento"
      description="Próximamente: vista del plan semanal"
    />
  )
}

function PRsTab({ clientId }) {
  const { data: records, isLoading } = usePersonalRecords(clientId)

  if (isLoading) return <SkeletonCard />

  if (!records?.length) {
    return (
      <EmptyState
        icon="🏆"
        title="Sin récords personales"
        description="Aún no hay récords registrados"
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
              <div className="text-xl font-bold text-accent">
                {formatUnit(record.value, record.unit)}
              </div>
              {isRecent(record.recorded_at) && (
                <Badge variant="success">🏆 Nuevo PR</Badge>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

function PhotosTab({ clientId }) {
  const { data: photos, isLoading } = useProgressPhotos(clientId)

  if (isLoading) return <SkeletonCard />

  if (!photos?.length) {
    return (
      <EmptyState
        icon="📸"
        title="Sin fotos de progreso"
        description="Aún no hay fotos registradas"
      />
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {photos.map((photo) => (
        <div key={photo.id} className="relative aspect-square">
          <img
            src={photo.photo_url}
            alt="Progreso"
            className="w-full h-full object-cover rounded-lg"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1 text-xs rounded-b-lg">
            {formatDate(photo.recorded_at)}
          </div>
        </div>
      ))}
    </div>
  )
}
