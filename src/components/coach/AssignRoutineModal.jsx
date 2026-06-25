import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { SkeletonCard } from '@/components/ui/Skeleton'
import {
  useRoutines,
  useRoutine,
  useAssignRoutine,
  useUpsertExerciseConfig,
} from '@/hooks/useRoutines'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

function SectionTitle({ children }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 pt-1 pb-2">
      {children}
    </h3>
  )
}

// ─── Step 1: Select routine ───────────────────────────────────────────────────

function StepSelectRoutine({ coachId, onSelect }) {
  const { data: routines, isLoading } = useRoutines(coachId)

  if (isLoading) {
    return (
      <div className="space-y-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  if (!routines?.length) {
    return (
      <div className="py-8 text-center text-zinc-500 text-sm">
        No tienes rutinas creadas aún.
      </div>
    )
  }

  return (
    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
      {routines.map((routine) => (
        <button
          key={routine.id}
          className="w-full text-left"
          onClick={() => onSelect(routine)}
        >
          <Card className="hover:border-accent/50 transition-colors cursor-pointer active:scale-[0.99]">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{routine.name}</p>
                {routine.goal ? (
                  <p className="text-sm text-zinc-400 mt-0.5 truncate">{routine.goal}</p>
                ) : null}
              </div>
              {routine.days_per_week ? (
                <Badge variant="default" className="shrink-0">
                  {routine.days_per_week}d/sem
                </Badge>
              ) : null}
            </div>
          </Card>
        </button>
      ))}
    </div>
  )
}

// ─── Step 2: Configure assignment ─────────────────────────────────────────────

function ExerciseConfigRow({ rde, sectionName, value, onChange }) {
  const exercise = rde.exercise
  const hasIntensity = rde.intensity_min != null || rde.intensity_max != null

  return (
    <div className="py-3 border-b border-zinc-800/60 last:border-b-0">
      <div className="mb-2">
        <p className="text-sm font-medium text-white">{exercise?.name ?? '—'}</p>
        <p className="text-xs text-zinc-500">{sectionName}</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="flex-1 min-w-[80px]">
          <label className="block text-xs text-zinc-500 mb-1">Peso (kg)</label>
          <input
            type="number"
            min="0"
            step="0.5"
            placeholder="kg"
            value={value?.weight_kg ?? ''}
            onChange={(e) =>
              onChange({
                ...value,
                weight_kg: e.target.value === '' ? undefined : Number(e.target.value),
              })
            }
            className="w-full px-2 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {hasIntensity && (
          <>
            <div className="flex-1 min-w-[80px]">
              <label className="block text-xs text-zinc-500 mb-1">RPE % mín</label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="—"
                value={value?.intensity_min ?? ''}
                onChange={(e) =>
                  onChange({
                    ...value,
                    intensity_min:
                      e.target.value === '' ? undefined : Number(e.target.value),
                  })
                }
                className="w-full px-2 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div className="flex-1 min-w-[80px]">
              <label className="block text-xs text-zinc-500 mb-1">RPE % máx</label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="—"
                value={value?.intensity_max ?? ''}
                onChange={(e) =>
                  onChange({
                    ...value,
                    intensity_max:
                      e.target.value === '' ? undefined : Number(e.target.value),
                  })
                }
                className="w-full px-2 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function StepConfigure({ selectedRoutine, clientId, coachId, onBack, onClose }) {
  const [startDate, setStartDate] = useState(todayISO())
  const [notes, setNotes] = useState('')
  const [exerciseConfigs, setExerciseConfigs] = useState({})
  const [error, setError] = useState('')

  const { data: routine, isLoading: routineLoading } = useRoutine(selectedRoutine.id)
  const assignRoutine = useAssignRoutine()
  const upsertConfig = useUpsertExerciseConfig()

  const isPending = assignRoutine.isPending || upsertConfig.isPending

  // Flatten exercises across all days and sections
  const allExercises = []
  const days = [...(routine?.routine_days ?? [])].sort(
    (a, b) => a.order_index - b.order_index
  )
  days.forEach((day) => {
    const sections = [...(day.routine_day_sections ?? [])].sort(
      (a, b) => a.order_index - b.order_index
    )
    sections.forEach((section) => {
      const exercises = [...(section.routine_day_exercises ?? [])].sort(
        (a, b) => a.order_index - b.order_index
      )
      exercises.forEach((rde) => {
        allExercises.push({ rde, sectionName: section.name, dayName: day.name })
      })
    })
  })

  const handleConfigChange = (rdeId, value) => {
    setExerciseConfigs((prev) => ({ ...prev, [rdeId]: value }))
  }

  const handleSubmit = async () => {
    setError('')
    if (!startDate) {
      setError('La fecha de inicio es obligatoria')
      return
    }

    try {
      const assignment = await assignRoutine.mutateAsync({
        client_id: clientId,
        coach_id: coachId,
        routine_id: selectedRoutine.id,
        start_date: startDate,
        notes: notes.trim() || null,
      })

      const configEntries = Object.entries(exerciseConfigs).filter(
        ([, cfg]) => cfg?.weight_kg != null
      )

      await Promise.all(
        configEntries.map(([rdeId, cfg]) =>
          upsertConfig.mutateAsync({
            client_routine_id: assignment.id,
            routine_day_exercise_id: rdeId,
            weight_kg: cfg.weight_kg ?? null,
            intensity_min: cfg.intensity_min ?? null,
            intensity_max: cfg.intensity_max ?? null,
          })
        )
      )

      onClose()
    } catch (err) {
      setError(err.message || 'Error al asignar la rutina')
    }
  }

  return (
    <div className="space-y-4">
      {/* Selected routine summary */}
      <div className="flex items-center gap-2 p-3 bg-zinc-800/50 rounded-lg">
        <span className="text-accent text-lg">📋</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate">{selectedRoutine.name}</p>
          {selectedRoutine.goal ? (
            <p className="text-xs text-zinc-400">{selectedRoutine.goal}</p>
          ) : null}
        </div>
        <button
          onClick={onBack}
          className="text-xs text-zinc-500 hover:text-white transition-colors shrink-0"
        >
          Cambiar
        </button>
      </div>

      {/* Assignment settings */}
      <SectionTitle>Configurar asignación</SectionTitle>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">
          Fecha de inicio <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">
          Notas para esta asignación
        </label>
        <textarea
          rows={2}
          placeholder="Notas para esta asignación"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
        />
      </div>

      {/* Per-exercise weights */}
      <SectionTitle>Configurar pesos por ejercicio (opcional)</SectionTitle>

      {routineLoading ? (
        <div className="space-y-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : allExercises.length > 0 ? (
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 px-3">
          {allExercises.map(({ rde, sectionName }) => (
            <ExerciseConfigRow
              key={rde.id}
              rde={rde}
              sectionName={sectionName}
              value={exerciseConfigs[rde.id]}
              onChange={(val) => handleConfigChange(rde.id, val)}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-500 text-center py-4">
          No hay ejercicios en esta rutina
        </p>
      )}

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={onBack}
          disabled={isPending}
        >
          ← Volver
        </Button>
        <Button
          type="button"
          className="flex-1"
          onClick={handleSubmit}
          disabled={isPending}
        >
          {isPending ? 'Asignando...' : 'Asignar'}
        </Button>
      </div>
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function AssignRoutineModal({ isOpen, onClose, clientId, coachId }) {
  const [selectedRoutine, setSelectedRoutine] = useState(null)

  const handleClose = () => {
    setSelectedRoutine(null)
    onClose()
  }

  const step = selectedRoutine ? 2 : 1

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 1 ? 'Seleccionar rutina' : 'Configurar asignación'}
    >
      {step === 1 && (
        <StepSelectRoutine
          coachId={coachId}
          onSelect={(routine) => setSelectedRoutine(routine)}
        />
      )}

      {step === 2 && (
        <StepConfigure
          selectedRoutine={selectedRoutine}
          clientId={clientId}
          coachId={coachId}
          onBack={() => setSelectedRoutine(null)}
          onClose={handleClose}
        />
      )}
    </Modal>
  )
}
