import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonCard } from '@/components/ui/Skeleton'
import {
  useRoutine, useAddRoutineDay, useDeleteRoutineDay,
  useAddSection, useDeleteSection,
  useAddExerciseToSection, useDeleteRoutineDayExercise,
  useExerciseSearch, useExercises,
} from '@/hooks/useRoutines'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DIFFICULTY_LABELS = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
}

const GOAL_LABELS = {
  strength: 'Fuerza',
  hypertrophy: 'Hipertrofia',
  endurance: 'Resistencia',
  weight_loss: 'Pérdida de peso',
  mobility: 'Movilidad',
  general: 'General',
}

const SECTION_TYPE_LABELS = {
  warmup: 'Calentamiento',
  core: 'Core',
  main: 'Fuerza principal',
  cardio: 'Cardio',
  cooldown: 'Vuelta a la calma',
  custom: 'Personalizado',
}

const SECTION_TYPE_DEFAULT_NAMES = {
  warmup: 'CALENTAMIENTO / MOVILIDAD',
  core: 'ACTIVACIÓN CORE',
  main: 'FUERZA / TRABAJO PRINCIPAL',
  cardio: 'COMPLEMENTARIO / CARDIO',
  cooldown: 'VUELTA A LA CALMA',
  custom: '',
}

function buildParamSummary(ex) {
  const parts = []

  if (ex.sets) {
    let repsStr = ''
    if (ex.to_failure) {
      repsStr = 'al fallo'
    } else if (ex.reps_min != null && ex.reps_max != null) {
      repsStr = ex.reps_min === ex.reps_max ? String(ex.reps_min) : `${ex.reps_min}-${ex.reps_max}`
    } else if (ex.reps_min != null) {
      repsStr = String(ex.reps_min)
    }
    if (repsStr) {
      parts.push(`${ex.sets} × ${repsStr}`)
    } else {
      parts.push(`${ex.sets} series`)
    }
  }

  if (ex.reps_note) {
    parts.push(ex.reps_note)
  }

  if (ex.intensity_min != null && ex.intensity_max != null) {
    const suffix = ex.intensity_type === 'rpe_10' ? ' RPE' : '%'
    parts.push(
      ex.intensity_min === ex.intensity_max
        ? `${ex.intensity_min}${suffix}`
        : `${ex.intensity_min}-${ex.intensity_max}${suffix}`
    )
  } else if (ex.intensity_min != null) {
    const suffix = ex.intensity_type === 'rpe_10' ? ' RPE' : '%'
    parts.push(`${ex.intensity_min}${suffix}`)
  }

  if (ex.duration_minutes != null) {
    parts.push(`${ex.duration_minutes} min`)
  }

  return parts.join(' · ')
}

// ─── AddDayModal ──────────────────────────────────────────────────────────────

function AddDayModal({ isOpen, onClose, routineId, currentDaysCount }) {
  const [name, setName] = useState('')
  const [duration, setDuration] = useState('')
  const addDay = useAddRoutineDay()

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    addDay.mutate(
      {
        routineId,
        name: name.trim(),
        order_index: currentDaysCount,
        estimated_duration_minutes: duration ? Number(duration) : null,
      },
      {
        onSuccess: () => {
          setName('')
          setDuration('')
          onClose()
        },
      }
    )
  }

  function handleClose() {
    setName('')
    setDuration('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Agregar Día">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre del día"
          placeholder='Ej: "DÍA 4 — PIERNA (ÉNFASIS POSTERIOR)"'
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <Input
          label="Duración estimada (min, opcional)"
          type="number"
          min="1"
          placeholder="60"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={!name.trim() || addDay.isPending}
        >
          {addDay.isPending ? 'Guardando…' : 'Agregar día'}
        </Button>
      </form>
    </Modal>
  )
}

// ─── AddSectionModal ──────────────────────────────────────────────────────────

function AddSectionModal({ isOpen, onClose, routineId, dayId, currentSectionsCount }) {
  const [sectionType, setSectionType] = useState('main')
  const [name, setName] = useState(SECTION_TYPE_DEFAULT_NAMES['main'])
  const addSection = useAddSection()

  function handleTypeChange(type) {
    setSectionType(type)
    setName(SECTION_TYPE_DEFAULT_NAMES[type])
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    addSection.mutate(
      {
        routineDayId: dayId,
        name: name.trim(),
        section_type: sectionType,
        order_index: currentSectionsCount,
        routineId,
      },
      {
        onSuccess: () => {
          setSectionType('main')
          setName(SECTION_TYPE_DEFAULT_NAMES['main'])
          onClose()
        },
      }
    )
  }

  function handleClose() {
    setSectionType('main')
    setName(SECTION_TYPE_DEFAULT_NAMES['main'])
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Agregar Sección">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-zinc-300">Tipo de sección</label>
          <select
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent"
            value={sectionType}
            onChange={(e) => handleTypeChange(e.target.value)}
          >
            {Object.entries(SECTION_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <Input
          label="Nombre de la sección"
          placeholder="NOMBRE DE LA SECCIÓN"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={!name.trim() || addSection.isPending}
        >
          {addSection.isPending ? 'Guardando…' : 'Agregar sección'}
        </Button>
      </form>
    </Modal>
  )
}

// ─── ExercisePickerModal ──────────────────────────────────────────────────────

const EMPTY_CONFIG = {
  sets: '',
  reps_min: '',
  reps_max: '',
  reps_note: '',
  to_failure: false,
  intensity_min: '',
  intensity_max: '',
  intensity_type: 'percent_rm',
  duration_minutes: '',
  duration_note: '',
  notes: '',
}

function ExercisePickerModal({ isOpen, onClose, routineId, sectionId, sectionType, currentExerciseCount }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [config, setConfig] = useState(EMPTY_CONFIG)

  const { data: searchResults, isFetching: searching } = useExerciseSearch(searchQuery)
  const { data: allExercises, isFetching: loadingAll } = useExercises()
  const addExercise = useAddExerciseToSection()

  const exercises = searchQuery.length >= 2 ? (searchResults ?? []) : (allExercises ?? [])
  const isLoading = searchQuery.length >= 2 ? searching : loadingAll

  function handleSelectExercise(ex) {
    setSelectedExercise(ex)
  }

  function handleBack() {
    setSelectedExercise(null)
    setConfig(EMPTY_CONFIG)
  }

  function handleClose() {
    setSelectedExercise(null)
    setSearchQuery('')
    setConfig(EMPTY_CONFIG)
    onClose()
  }

  function setField(field, value) {
    setConfig((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!selectedExercise) return

    const payload = {
      sectionId,
      exercise_id: selectedExercise.id,
      order_index: currentExerciseCount,
      routineId,
      notes: config.notes || null,
      sets: config.sets ? Number(config.sets) : null,
      reps_min: config.reps_min ? Number(config.reps_min) : null,
      reps_max: config.reps_max ? Number(config.reps_max) : null,
      reps_note: config.reps_note || null,
      to_failure: config.to_failure || false,
      intensity_min: config.intensity_min ? Number(config.intensity_min) : null,
      intensity_max: config.intensity_max ? Number(config.intensity_max) : null,
      intensity_type: config.intensity_min ? config.intensity_type : null,
      duration_minutes: config.duration_minutes ? Number(config.duration_minutes) : null,
      duration_note: config.duration_note || null,
    }

    addExercise.mutate(payload, {
      onSuccess: () => {
        handleClose()
      },
    })
  }

  const isWarmupOrCooldown = sectionType === 'warmup' || sectionType === 'cooldown'
  const isMain = sectionType === 'main'
  const isCardio = sectionType === 'cardio'
  const isCoreOrCustom = sectionType === 'core' || sectionType === 'custom'

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={selectedExercise ? 'Configurar ejercicio' : 'Seleccionar ejercicio'}
    >
      {!selectedExercise ? (
        <div className="space-y-3">
          <Input
            placeholder="Buscar ejercicio…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          <div className="max-h-64 overflow-y-auto space-y-1 -mx-1 px-1">
            {isLoading && (
              <p className="text-sm text-zinc-500 text-center py-4">Buscando…</p>
            )}
            {!isLoading && exercises.length === 0 && (
              <p className="text-sm text-zinc-500 text-center py-4">
                {searchQuery.length >= 2 ? 'Sin resultados' : 'No hay ejercicios disponibles'}
              </p>
            )}
            {exercises.map((ex) => (
              <button
                key={ex.id}
                type="button"
                onClick={() => handleSelectExercise(ex)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-left transition-colors"
              >
                <span className="text-sm font-medium text-white">{ex.name}</span>
                {ex.category && (
                  <Badge className="ml-2 shrink-0">{ex.category}</Badge>
                )}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
            <button
              type="button"
              onClick={handleBack}
              className="text-zinc-400 hover:text-white text-sm"
            >
              ← Volver
            </button>
            <span className="text-sm font-semibold text-white truncate">{selectedExercise.name}</span>
          </div>

          {/* warmup / cooldown */}
          {isWarmupOrCooldown && (
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Repeticiones"
                type="number"
                min="0"
                placeholder="10"
                value={config.reps_min}
                onChange={(e) => setField('reps_min', e.target.value)}
              />
              <Input
                label="Nota (ej: por lado)"
                placeholder="por lado"
                value={config.reps_note}
                onChange={(e) => setField('reps_note', e.target.value)}
              />
            </div>
          )}

          {/* main */}
          {isMain && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Series"
                  type="number"
                  min="1"
                  placeholder="4"
                  value={config.sets}
                  onChange={(e) => setField('sets', e.target.value)}
                />
                <Input
                  label="Reps min"
                  type="number"
                  min="0"
                  placeholder="8"
                  value={config.reps_min}
                  onChange={(e) => setField('reps_min', e.target.value)}
                  disabled={config.to_failure}
                />
                <Input
                  label="Reps max"
                  type="number"
                  min="0"
                  placeholder="10"
                  value={config.reps_max}
                  onChange={(e) => setField('reps_max', e.target.value)}
                  disabled={config.to_failure}
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.to_failure}
                  onChange={(e) => setField('to_failure', e.target.checked)}
                  className="w-4 h-4 rounded accent-accent"
                />
                <span className="text-sm text-zinc-300">Al fallo</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Intensidad min"
                  type="number"
                  min="0"
                  placeholder="50"
                  value={config.intensity_min}
                  onChange={(e) => setField('intensity_min', e.target.value)}
                />
                <Input
                  label="Intensidad max"
                  type="number"
                  min="0"
                  placeholder="60"
                  value={config.intensity_max}
                  onChange={(e) => setField('intensity_max', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-zinc-300">Tipo de intensidad</label>
                <select
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  value={config.intensity_type}
                  onChange={(e) => setField('intensity_type', e.target.value)}
                >
                  <option value="percent_rm">% RM</option>
                  <option value="rpe_10">RPE (0-10)</option>
                </select>
              </div>
            </>
          )}

          {/* cardio */}
          {isCardio && (
            <>
              <Input
                label="Duración (min)"
                type="number"
                min="1"
                placeholder="20"
                value={config.duration_minutes}
                onChange={(e) => setField('duration_minutes', e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Intensidad min"
                  type="number"
                  min="0"
                  placeholder="60"
                  value={config.intensity_min}
                  onChange={(e) => setField('intensity_min', e.target.value)}
                />
                <Input
                  label="Intensidad max"
                  type="number"
                  min="0"
                  placeholder="75"
                  value={config.intensity_max}
                  onChange={(e) => setField('intensity_max', e.target.value)}
                />
              </div>
            </>
          )}

          {/* core / custom */}
          {isCoreOrCustom && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Series"
                  type="number"
                  min="1"
                  placeholder="3"
                  value={config.sets}
                  onChange={(e) => setField('sets', e.target.value)}
                />
                <Input
                  label="Reps min"
                  type="number"
                  min="0"
                  placeholder="12"
                  value={config.reps_min}
                  onChange={(e) => setField('reps_min', e.target.value)}
                  disabled={config.to_failure}
                />
                <Input
                  label="Reps max"
                  type="number"
                  min="0"
                  placeholder="15"
                  value={config.reps_max}
                  onChange={(e) => setField('reps_max', e.target.value)}
                  disabled={config.to_failure}
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.to_failure}
                  onChange={(e) => setField('to_failure', e.target.checked)}
                  className="w-4 h-4 rounded accent-accent"
                />
                <span className="text-sm text-zinc-300">Al fallo</span>
              </label>
            </>
          )}

          {/* notes — always */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-zinc-300">Notas (opcional)</label>
            <textarea
              rows={2}
              placeholder="Indicaciones adicionales…"
              value={config.notes}
              onChange={(e) => setField('notes', e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent resize-none"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={addExercise.isPending}
          >
            {addExercise.isPending ? 'Agregando…' : 'Agregar ejercicio'}
          </Button>
        </form>
      )}
    </Modal>
  )
}

// ─── ExerciseRow constants ────────────────────────────────────────────────────

const EXERCISE_COLORS = [
  'border-cyan-400',
  'border-blue-400',
  'border-orange-400',
  'border-purple-400',
  'border-green-400',
  'border-rose-400',
]

const CATEGORY_LABEL = {
  strength: 'FUERZA',
  cardio: 'CARDIO',
  flexibility: 'FLEXIBILIDAD',
  balance: 'EQUILIBRIO',
  plyometric: 'PLIOMÉTRICO',
  other: 'GENERAL',
}

// ─── ExerciseRow ──────────────────────────────────────────────────────────────

function ExerciseRow({ ex, routineId, orderIndex }) {
  const deleteExercise = useDeleteRoutineDayExercise()
  const exercise = ex.exercise
  const color = EXERCISE_COLORS[orderIndex % EXERCISE_COLORS.length]

  let setsBadge = null
  if (ex.duration_minutes) {
    setsBadge = ex.sets ? `${ex.sets} × ${ex.duration_minutes} min` : `${ex.duration_minutes} min`
  } else if (ex.sets) {
    if (ex.to_failure) {
      setsBadge = `${ex.sets} × al fallo`
    } else if (ex.reps_min != null && ex.reps_max != null && ex.reps_min !== ex.reps_max) {
      setsBadge = `${ex.sets} × ${ex.reps_min}-${ex.reps_max}`
    } else if (ex.reps_min != null) {
      setsBadge = `${ex.sets} × ${ex.reps_min}`
    } else {
      setsBadge = `${ex.sets} series`
    }
  }

  let rpeBadge = null
  if (ex.intensity_min != null) {
    if (ex.intensity_max != null && ex.intensity_max !== ex.intensity_min) {
      rpeBadge = `RPE ${ex.intensity_min}-${ex.intensity_max}%`
    } else {
      rpeBadge = `RPE ${ex.intensity_min}%`
    }
  }

  const muscleLabel =
    exercise?.muscle_groups?.[0]
      ? exercise.muscle_groups[0].toUpperCase()
      : (CATEGORY_LABEL[exercise?.category] ?? 'GENERAL')

  const paddedIndex = String(orderIndex + 1).padStart(2, '0')

  const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    (exercise?.name ?? '') + ' ejercicio shorts'
  )}`

  function handleDelete() {
    if (!confirm(`¿Eliminar "${exercise?.name}"?`)) return
    deleteExercise.mutate({ exerciseId: ex.id, routineId })
  }

  function handleYouTube() {
    window.open(ytUrl, '_blank', 'noopener')
  }

  return (
    <div className={`bg-zinc-900 rounded-xl border-l-4 ${color} p-4 space-y-2`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
            {paddedIndex} · {muscleLabel}
          </div>
          <div className="text-base font-bold text-white leading-tight">
            {exercise?.name ?? '—'}
          </div>
        </div>
        <div className="flex flex-col gap-1 items-end shrink-0">
          {setsBadge && (
            <span className="bg-zinc-800 text-white text-xs px-2.5 py-1 rounded-full">
              {setsBadge}
            </span>
          )}
          {rpeBadge && (
            <span className="bg-zinc-800 text-accent text-xs px-2.5 py-1 rounded-full">
              {rpeBadge}
            </span>
          )}
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteExercise.isPending}
            className="text-zinc-600 hover:text-red-400 text-xs transition-colors mt-1"
            title="Eliminar ejercicio"
          >
            ✕
          </button>
        </div>
      </div>

      <a
        href={ytUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-accent text-sm"
        onClick={(e) => { e.preventDefault(); handleYouTube() }}
      >
        ▶ Ver técnica
      </a>

      {ex.notes && (
        <p className="text-sm italic text-zinc-400">💡 {ex.notes}</p>
      )}
    </div>
  )
}

// ─── SectionBlock ─────────────────────────────────────────────────────────────

function SectionBlock({ section, routineId, dayId }) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const deleteSection = useDeleteSection()

  const exercises = [...(section.routine_day_exercises ?? [])].sort(
    (a, b) => a.order_index - b.order_index
  )

  function handleDeleteSection() {
    if (!confirm(`¿Eliminar la sección "${section.name}"?`)) return
    deleteSection.mutate({ sectionId: section.id, routineId })
  }

  return (
    <div className="mt-4 first:mt-0">
      {/* Section header with horizontal divider */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-zinc-500 text-xs">●</span>
        <span className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-300 whitespace-nowrap">
          {section.name}
        </span>
        <div className="flex-1 h-px bg-zinc-800" />
        <button
          type="button"
          onClick={handleDeleteSection}
          disabled={deleteSection.isPending}
          className="text-xs text-zinc-600 hover:text-red-400 transition-colors shrink-0"
        >
          Eliminar
        </button>
      </div>

      {/* Exercises */}
      {exercises.length > 0 ? (
        <div className="space-y-2">
          {exercises.map((ex, idx) => (
            <ExerciseRow key={ex.id} ex={ex} routineId={routineId} orderIndex={idx} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-600 italic py-1">Sin ejercicios aún</p>
      )}

      {/* Add exercise */}
      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        className="mt-2 text-sm text-accent hover:text-accent/80 transition-colors"
      >
        + Agregar ejercicio
      </button>

      <ExercisePickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        routineId={routineId}
        sectionId={section.id}
        sectionType={section.section_type}
        currentExerciseCount={exercises.length}
      />
    </div>
  )
}

// ─── DayCard ──────────────────────────────────────────────────────────────────

function DayCard({ day, routineId }) {
  const [expanded, setExpanded] = useState(true)
  const [sectionModalOpen, setSectionModalOpen] = useState(false)
  const deleteDay = useDeleteRoutineDay()

  const sections = [...(day.routine_day_sections ?? [])].sort(
    (a, b) => a.order_index - b.order_index
  )

  function handleDeleteDay() {
    if (!confirm(`¿Eliminar "${day.name}"? Se eliminarán todas sus secciones y ejercicios.`)) return
    deleteDay.mutate({ dayId: day.id, routineId })
  }

  return (
    <Card className="p-0 overflow-hidden">
      {/* Day header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-bold text-white truncate">{day.name}</span>
          {day.estimated_duration_minutes && (
            <Badge className="shrink-0">{day.estimated_duration_minutes} min</Badge>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleDeleteDay() }}
            disabled={deleteDay.isPending}
            className="text-xs text-zinc-600 hover:text-red-400 px-2 py-1 rounded hover:bg-zinc-800 transition-colors"
            title="Eliminar día"
          >
            🗑 Eliminar
          </button>
          <span className="text-zinc-500 text-sm">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {/* Day body */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-zinc-800/60">
          {sections.length === 0 && (
            <p className="text-sm text-zinc-600 italic pt-3">Sin secciones aún</p>
          )}
          {sections.map((section) => (
            <SectionBlock
              key={section.id}
              section={section}
              routineId={routineId}
              dayId={day.id}
            />
          ))}

          {/* Add section */}
          <button
            type="button"
            onClick={() => setSectionModalOpen(true)}
            className="mt-4 w-full py-2 rounded-lg border border-dashed border-zinc-700 text-sm text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 transition-colors"
          >
            + Agregar sección
          </button>
        </div>
      )}

      <AddSectionModal
        isOpen={sectionModalOpen}
        onClose={() => setSectionModalOpen(false)}
        routineId={routineId}
        dayId={day.id}
        currentSectionsCount={sections.length}
      />
    </Card>
  )
}

// ─── RoutineEditor (page) ─────────────────────────────────────────────────────

export default function RoutineEditor() {
  const { routineId } = useParams()
  const navigate = useNavigate()
  const [dayModalOpen, setDayModalOpen] = useState(false)

  const { data: routine, isLoading, isError } = useRoutine(routineId)

  const days = [...(routine?.routine_days ?? [])].sort((a, b) => a.order_index - b.order_index)

  if (isLoading) {
    return (
      <PageWrapper title="Editor de rutina" showNav={false}>
        <div className="space-y-4 pt-2">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </PageWrapper>
    )
  }

  if (isError || !routine) {
    return (
      <PageWrapper title="Editor de rutina" showNav={false}>
        <EmptyState
          icon="⚠️"
          title="No se pudo cargar la rutina"
          description="Intenta de nuevo o regresa al listado."
          action={
            <Button variant="secondary" onClick={() => navigate('/coach/routines')}>
              Volver
            </Button>
          }
        />
      </PageWrapper>
    )
  }

  return (
    <PageWrapper title="Editor de rutina" showNav={false}>
      {/* Back + routine meta */}
      <div className="pt-2 pb-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white mb-4 transition-colors"
        >
          ← Volver
        </button>

        <h2 className="text-xl font-bold text-white leading-snug">{routine.name}</h2>
        {routine.description && (
          <p className="text-sm text-zinc-400 mt-1">{routine.description}</p>
        )}

        <div className="flex flex-wrap gap-2 mt-2">
          {routine.goal && (
            <Badge variant="success">{GOAL_LABELS[routine.goal] ?? routine.goal}</Badge>
          )}
          {routine.difficulty_level && (
            <Badge variant="warning">
              {DIFFICULTY_LABELS[routine.difficulty_level] ?? routine.difficulty_level}
            </Badge>
          )}
          {routine.days_per_week && (
            <Badge>{routine.days_per_week} días/semana</Badge>
          )}
          {routine.is_template && (
            <Badge variant="default">Plantilla</Badge>
          )}
        </div>
      </div>

      {/* Days */}
      {days.length === 0 ? (
        <EmptyState
          icon="📅"
          title="Sin días aún"
          description="Agrega el primer día para comenzar a construir la rutina."
          action={
            <Button variant="primary" onClick={() => setDayModalOpen(true)}>
              Agregar primer día
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {days.map((day) => (
            <DayCard key={day.id} day={day} routineId={routineId} />
          ))}

          {/* Add day button */}
          <button
            type="button"
            onClick={() => setDayModalOpen(true)}
            className="w-full py-3 rounded-xl border border-dashed border-zinc-700 text-sm text-zinc-500 hover:border-accent hover:text-accent transition-colors"
          >
            + Agregar Día
          </button>
        </div>
      )}

      <AddDayModal
        isOpen={dayModalOpen}
        onClose={() => setDayModalOpen(false)}
        routineId={routineId}
        currentDaysCount={days.length}
      />
    </PageWrapper>
  )
}
