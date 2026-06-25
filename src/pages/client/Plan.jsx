import { useState } from 'react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { useAuthStore } from '@/stores/authStore'
import {
  useClientRoutines,
  useRoutine,
  useClientExerciseConfigs,
} from '@/hooks/useRoutines'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildParamLine(rde, config) {
  const sets = config?.sets ?? rde.sets
  const repsMin = config?.reps_min ?? rde.reps_min
  const repsMax = config?.reps_max ?? rde.reps_max
  const toFailure = rde.to_failure
  const repsNote = rde.reps_note
  const intensityMin = config?.intensity_min ?? rde.intensity_min
  const intensityMax = config?.intensity_max ?? rde.intensity_max
  const durationMinutes = rde.duration_minutes

  const parts = []

  if (durationMinutes) {
    if (sets) {
      parts.push(`${sets} × ${durationMinutes} min`)
    } else {
      parts.push(`${durationMinutes} min`)
    }
  } else if (sets) {
    if (toFailure) {
      parts.push(`${sets} × al fallo`)
    } else if (repsMin && repsMax && repsMin !== repsMax) {
      parts.push(`${sets} × ${repsMin}-${repsMax} reps`)
    } else if (repsMin) {
      parts.push(`${sets} × ${repsMin} reps`)
    } else {
      parts.push(`${sets} series`)
    }
  }

  if (repsNote) {
    if (parts.length > 0) {
      parts[parts.length - 1] = parts[parts.length - 1] + ' por lado'
    } else {
      parts.push('por lado')
    }
  }

  if (intensityMin && intensityMax && intensityMin !== intensityMax) {
    parts.push(`+ ${intensityMin}-${intensityMax}%`)
  } else if (intensityMin) {
    parts.push(`+ ${intensityMin}%`)
  }

  return parts.join(' · ')
}

// ─── Exercise constants ────────────────────────────────────────────────────────

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

// ─── Exercise Row ─────────────────────────────────────────────────────────────

function ExerciseRow({ rde, config, orderIndex }) {
  const exercise = rde.exercise
  const color = EXERCISE_COLORS[orderIndex % EXERCISE_COLORS.length]

  const sets = config?.sets ?? rde.sets
  const repsMin = config?.reps_min ?? rde.reps_min
  const repsMax = config?.reps_max ?? rde.reps_max
  const toFailure = rde.to_failure
  const intensityMin = config?.intensity_min ?? rde.intensity_min
  const intensityMax = config?.intensity_max ?? rde.intensity_max
  const durationMinutes = rde.duration_minutes

  let setsBadge = null
  if (durationMinutes) {
    setsBadge = sets ? `${sets} × ${durationMinutes} min` : `${durationMinutes} min`
  } else if (sets) {
    if (toFailure) {
      setsBadge = `${sets} × al fallo`
    } else if (repsMin && repsMax && repsMin !== repsMax) {
      setsBadge = `${sets} × ${repsMin}-${repsMax}`
    } else if (repsMin) {
      setsBadge = `${sets} × ${repsMin}`
    } else {
      setsBadge = `${sets} series`
    }
  }

  let rpeBadge = null
  if (intensityMin != null) {
    if (intensityMax != null && intensityMax !== intensityMin) {
      rpeBadge = `RPE ${intensityMin}-${intensityMax}%`
    } else {
      rpeBadge = `RPE ${intensityMin}%`
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
        </div>
      </div>

      <a
        href={ytUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-accent text-sm"
      >
        ▶ Ver técnica
      </a>

      {rde.notes && (
        <p className="text-sm italic text-zinc-400">💡 {rde.notes}</p>
      )}

      {config?.weight_kg && (
        <p className="text-sm text-accent">Peso: {config.weight_kg}kg</p>
      )}
    </div>
  )
}

// ─── Day Card ─────────────────────────────────────────────────────────────────

function DayCard({ day, configMap, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)

  const sections = [...(day.routine_day_sections ?? [])].sort(
    (a, b) => a.order_index - b.order_index
  )

  return (
    <Card className="overflow-hidden p-0">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold text-white">{day.name}</span>
          {day.estimated_duration ? (
            <span className="text-xs text-zinc-500">~{day.estimated_duration} min</span>
          ) : null}
        </div>
        <span className="text-zinc-500 text-sm">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4">
          {sections.map((section) => {
            const exercises = [...(section.routine_day_exercises ?? [])].sort(
              (a, b) => a.order_index - b.order_index
            )

            return (
              <div key={section.id}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-zinc-500 text-xs">●</span>
                  <span className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-300">{section.name}</span>
                  <div className="flex-1 h-px bg-zinc-800" />
                </div>

                <div className="space-y-2">
                  {exercises.map((rde, idx) => (
                    <ExerciseRow
                      key={rde.id}
                      rde={rde}
                      config={configMap[rde.id] ?? null}
                      orderIndex={idx}
                    />
                  ))}
                </div>
              </div>
            )
          })}

          {sections.length === 0 && (
            <p className="text-sm text-zinc-500 text-center py-2">
              Sin ejercicios configurados
            </p>
          )}
        </div>
      )}
    </Card>
  )
}

// ─── Inner: needs activeRoutine ───────────────────────────────────────────────

function ActiveRoutineView({ activeRoutine }) {
  const { data: routine, isLoading: routineLoading } = useRoutine(
    activeRoutine.routine_id
  )
  const { data: configs, isLoading: configLoading } = useClientExerciseConfigs(
    activeRoutine.id
  )

  const configMap = {}
  configs?.forEach((c) => {
    configMap[c.routine_day_exercise_id] = c
  })

  if (routineLoading || configLoading) {
    return (
      <div className="space-y-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  const days = [...(routine?.routine_days ?? [])].sort(
    (a, b) => a.order_index - b.order_index
  )

  return (
    <div className="space-y-3">
      {/* Routine header */}
      <Card className="bg-zinc-800/60">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">{routine?.name}</h2>
            {activeRoutine.notes ? (
              <p className="text-sm text-zinc-400 mt-1">{activeRoutine.notes}</p>
            ) : null}
          </div>
          {routine?.goal ? (
            <Badge variant="success" className="shrink-0">
              {routine.goal}
            </Badge>
          ) : null}
        </div>

        {activeRoutine.start_date ? (
          <p className="text-xs text-zinc-500 mt-2">
            Desde{' '}
            {new Date(activeRoutine.start_date + 'T00:00:00').toLocaleDateString(
              'es-MX',
              { day: 'numeric', month: 'long', year: 'numeric' }
            )}
          </p>
        ) : null}
      </Card>

      {/* Days */}
      {days.map((day, idx) => (
        <DayCard
          key={day.id}
          day={day}
          configMap={configMap}
          defaultOpen={idx === 0}
        />
      ))}

      {days.length === 0 && (
        <EmptyState
          icon="🏋️"
          title="Sin días configurados"
          description="Tu coach aún no ha agregado días a esta rutina"
        />
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClientPlan() {
  const profileId = useAuthStore((s) => s.profileId)
  const { data: clientRoutines, isLoading } = useClientRoutines(profileId)
  const [selectedIdx, setSelectedIdx] = useState(0)

  const activeRoutines = clientRoutines?.filter((cr) => cr.is_active) ?? []

  // Keep selected index in bounds if routines change
  const safeIdx = Math.min(selectedIdx, Math.max(0, activeRoutines.length - 1))

  return (
    <PageWrapper title="Mi Plan">
      <div className="py-4 space-y-4">
        {isLoading && (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {!isLoading && activeRoutines.length === 0 && (
          <EmptyState
            icon="📋"
            title="Sin plan activo"
            description="Tu coach aún no ha asignado una rutina"
          />
        )}

        {!isLoading && activeRoutines.length > 1 && (
          <div className="flex gap-1 bg-zinc-800 p-1 rounded-xl overflow-x-auto">
            {activeRoutines.map((cr, idx) => (
              <button
                key={cr.id}
                onClick={() => setSelectedIdx(idx)}
                className={`flex-1 min-w-0 py-1.5 px-3 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  idx === safeIdx
                    ? 'bg-zinc-700 text-white'
                    : 'text-zinc-400 hover:text-zinc-300'
                }`}
              >
                {cr.routine?.name ?? `Rutina ${idx + 1}`}
              </button>
            ))}
          </div>
        )}

        {!isLoading && activeRoutines.length > 0 && (
          <ActiveRoutineView activeRoutine={activeRoutines[safeIdx]} />
        )}
      </div>
    </PageWrapper>
  )
}
