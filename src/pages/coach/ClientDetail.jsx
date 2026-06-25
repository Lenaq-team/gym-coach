import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { useClient, useUpdateClient } from '@/hooks/useAuth'
import { useProgressMeasurements, usePersonalRecords, useProgressPhotos, useUploadProgressMedia } from '@/hooks/useProgress'
import { useClientRoutines, useRoutine, useUpdateClientRoutine } from '@/hooks/useRoutines'
import { useAuthStore } from '@/stores/authStore'
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
import { AssignRoutineModal } from '@/components/coach/AssignRoutineModal'
import {
  GENDER_OPTIONS,
  FITNESS_LEVEL_OPTIONS,
  GENDER_LABEL,
  FITNESS_LEVEL_LABEL,
} from '@/constants/client.const'

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
                  <Badge>{FITNESS_LEVEL_LABEL[client.fitness_level] ?? client.fitness_level}</Badge>
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
    gender: client.gender || '',
    weight_kg: client.weight_kg || '',
    height_cm: client.height_cm || '',
    fitness_level: client.fitness_level || '',
    goals: Array.isArray(client.goals) ? client.goals.join(', ') : '',
    injuries: Array.isArray(client.injuries) ? client.injuries.join(', ') : '',
    medical_conditions: Array.isArray(client.medical_conditions) ? client.medical_conditions.join(', ') : '',
  })
  const updateClient = useUpdateClient()

  const handleSave = async () => {
    const updates = {
      ...formData,
      goals: formData.goals ? formData.goals.split(',').map(g => g.trim()).filter(Boolean) : [],
      injuries: formData.injuries ? formData.injuries.split(',').map(i => i.trim()).filter(Boolean) : [],
      medical_conditions: formData.medical_conditions ? formData.medical_conditions.split(',').map(m => m.trim()).filter(Boolean) : [],
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
  const displayGoals = Array.isArray(client.goals) && client.goals.length > 0 ? client.goals.join(', ') : '-'
  const displayInjuries = Array.isArray(client.injuries) && client.injuries.length > 0
    ? client.injuries.join(', ')
    : 'Ninguna'
  const displayMedical = Array.isArray(client.medical_conditions) && client.medical_conditions.length > 0
    ? client.medical_conditions.join(', ')
    : 'Ninguna'
  const displayGender = GENDER_LABEL[client.gender] ?? '-'

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
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Género
            </label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({...formData, gender: e.target.value})}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">Seleccionar...</option>
              {GENDER_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
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
              {FITNESS_LEVEL_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
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
          <Input
            label="Condiciones médicas (separados por coma)"
            value={formData.medical_conditions}
            onChange={(e) => setFormData({...formData, medical_conditions: e.target.value})}
            placeholder="Ninguna o lista de condiciones"
          />
        </Card>
      ) : (
        <Card className="space-y-3">
          {displayAge && <InfoRow label="Edad" value={`${displayAge} años`} />}
          <InfoRow label="Género" value={displayGender} />
          <InfoRow label="Peso" value={client.weight_kg ? `${client.weight_kg} kg` : '-'} />
          <InfoRow label="Altura" value={client.height_cm ? `${client.height_cm} cm` : '-'} />
          <InfoRow label="Nivel" value={FITNESS_LEVEL_LABEL[client.fitness_level] ?? '-'} />
          <InfoRow label="Objetivos" value={displayGoals} />
          <InfoRow label="Lesiones" value={displayInjuries} />
          <InfoRow label="Condiciones médicas" value={displayMedical} />
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
  const coachId = useAuthStore((s) => s.coachId)
  const [isAssignOpen, setIsAssignOpen] = useState(false)
  const { data: clientRoutines, isLoading } = useClientRoutines(clientId)
  const updateClientRoutine = useUpdateClientRoutine()

  const activeRoutine = clientRoutines?.find((cr) => cr.is_active)
  const pastRoutines = clientRoutines?.filter((cr) => !cr.is_active) ?? []

  const handleDeactivate = (clientRoutineId) => {
    updateClientRoutine.mutate({ clientRoutineId, updates: { is_active: false }, clientId })
  }

  if (isLoading) return <SkeletonCard />

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setIsAssignOpen(true)}>
          + Asignar rutina
        </Button>
      </div>

      {activeRoutine ? (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Rutina activa</h3>
          <ActiveRoutineCard routine={activeRoutine} onDeactivate={() => handleDeactivate(activeRoutine.id)} />
        </div>
      ) : (
        <EmptyState
          icon="📋"
          title="Sin rutina activa"
          description="Asigna una rutina a este cliente para que pueda ver su plan"
        />
      )}

      {pastRoutines.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Historial</h3>
          {pastRoutines.map((cr) => (
            <Card key={cr.id}>
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold text-zinc-300">{cr.routine?.name}</div>
                  {cr.start_date && (
                    <div className="text-xs text-zinc-500 mt-1">{formatDate(cr.start_date)}</div>
                  )}
                </div>
                <Badge variant="secondary">Inactiva</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AssignRoutineModal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        clientId={clientId}
        coachId={coachId}
      />
    </div>
  )
}

function ActiveRoutineCard({ routine, onDeactivate }) {
  const { data: fullRoutine } = useRoutine(routine.routine_id)

  const totalExercises = fullRoutine?.routine_days?.reduce((acc, day) =>
    acc + day.routine_day_sections?.reduce((a, s) =>
      a + (s.routine_day_exercises?.length ?? 0), 0) ?? 0, 0) ?? 0

  return (
    <Card>
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="font-semibold text-lg">{routine.routine?.name}</div>
            {routine.routine?.goal && (
              <div className="text-sm text-zinc-400">{routine.routine.goal}</div>
            )}
          </div>
          <Badge variant="success">Activa</Badge>
        </div>
        <div className="flex gap-2 flex-wrap">
          {fullRoutine?.days_per_week && (
            <Badge>{fullRoutine.days_per_week} días/sem</Badge>
          )}
          {totalExercises > 0 && (
            <Badge>{totalExercises} ejercicios</Badge>
          )}
        </div>
        {routine.start_date && (
          <div className="text-xs text-zinc-500">Desde {formatDate(routine.start_date)}</div>
        )}
        {routine.notes && (
          <div className="text-sm text-zinc-400 bg-zinc-800 rounded-lg px-3 py-2">{routine.notes}</div>
        )}
        <div className="pt-1">
          <button
            onClick={onDeactivate}
            className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
          >
            Desactivar rutina
          </button>
        </div>
      </div>
    </Card>
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
  const { data: media, isLoading } = useProgressPhotos(clientId)
  const uploadMedia = useUploadProgressMedia()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [notes, setNotes] = useState('')
  const [photoDate, setPhotoDate] = useState(new Date().toISOString().split('T')[0])
  const [uploadError, setUploadError] = useState(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setSelectedFile(file)
    setUploadError(null)
    const url = URL.createObjectURL(file)
    setPreviewUrl({ url, isVideo: file.type.startsWith('video/') })
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedFile(null)
    if (previewUrl?.url) URL.revokeObjectURL(previewUrl.url)
    setPreviewUrl(null)
    setNotes('')
    setPhotoDate(new Date().toISOString().split('T')[0])
    setUploadError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedFile || !photoDate) return
    setUploadError(null)

    try {
      await uploadMedia.mutateAsync({ clientId, file: selectedFile, notes, photoDate })
      handleCloseModal()
    } catch (err) {
      setUploadError(err.message)
    }
  }

  if (isLoading) return <SkeletonCard />

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setIsModalOpen(true)}>
          + Subir archivo
        </Button>
      </div>

      {!media?.length ? (
        <EmptyState
          icon="📸"
          title="Sin multimedia de progreso"
          description="Aún no hay fotos ni videos registrados"
        />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {media.map((item) => (
            <MediaItem key={item.id} item={item} />
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Subir foto o video">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Archivo <span className="text-red-400">*</span>
            </label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              required
              className="w-full text-sm text-zinc-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-zinc-700 file:text-white hover:file:bg-zinc-600 cursor-pointer"
            />
            <p className="text-xs text-zinc-500 mt-1">
              Imágenes o videos (máx. 60 segundos)
            </p>
          </div>

          {previewUrl && (
            <div className="rounded-lg overflow-hidden bg-zinc-900">
              {previewUrl.isVideo ? (
                <video
                  src={previewUrl.url}
                  controls
                  className="w-full max-h-48 object-contain"
                />
              ) : (
                <img
                  src={previewUrl.url}
                  alt="Vista previa"
                  className="w-full max-h-48 object-contain"
                />
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Fecha <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={photoDate}
              onChange={(e) => setPhotoDate(e.target.value)}
              required
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Notas
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observaciones, ángulo, contexto..."
              rows={3}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent resize-none"
            />
          </div>

          {uploadError && (
            <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2">
              {uploadError}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={handleCloseModal}
              disabled={uploadMedia.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!selectedFile || !photoDate || uploadMedia.isPending}
            >
              {uploadMedia.isPending ? 'Subiendo...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function MediaItem({ item }) {
  const isVideo = item.media_type === 'video'

  return (
    <div className="relative rounded-lg overflow-hidden bg-zinc-900 aspect-square">
      {isVideo ? (
        <video
          src={item.photo_url}
          className="w-full h-full object-cover"
          controls
          preload="metadata"
        />
      ) : (
        <img
          src={item.photo_url}
          alt="Progreso"
          className="w-full h-full object-cover"
        />
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1">
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs text-zinc-300">{formatDate(item.photo_date)}</span>
          {isVideo && <span className="text-xs">🎥</span>}
        </div>
        {item.notes && (
          <p className="text-xs text-zinc-400 truncate">{item.notes}</p>
        )}
      </div>
    </div>
  )
}
