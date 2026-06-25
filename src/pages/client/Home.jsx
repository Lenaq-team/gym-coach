import { useState } from 'react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { useAuthStore } from '@/stores/authStore'
import { useClient } from '@/hooks/useAuth'
import { useClientRoutines, useRoutine, useClientExerciseConfigs } from '@/hooks/useRoutines'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'

const SECTION_TYPE_ICONS = {
  warmup: '🔥',
  core: '⚡',
  main: '💪',
  cardio: '🏃',
  cooldown: '🧘',
  custom: '📌',
}

function buildParamLine(rde, config) {
  const sets = config?.sets ?? rde.sets
  const repsMin = config?.reps_min ?? rde.reps_min
  const repsMax = config?.reps_max ?? rde.reps_max
  const parts = []

  if (rde.duration_minutes) {
    parts.push(`${rde.duration_minutes} min`)
  } else if (sets) {
    if (rde.to_failure) {
      parts.push(`${sets} × al fallo`)
    } else if (repsMin && repsMax && repsMin !== repsMax) {
      parts.push(`${sets} × ${repsMin}-${repsMax}`)
    } else if (repsMin) {
      parts.push(`${sets} × ${repsMin}`)
    } else {
      parts.push(`${sets} series`)
    }
  } else if (repsMin) {
    parts.push(`× ${repsMin}${rde.reps_note ? ' ' + rde.reps_note : ''}`)
  }

  const intensityMin = config?.intensity_min ?? rde.intensity_min
  const intensityMax = config?.intensity_max ?? rde.intensity_max
  if (intensityMin != null) {
    const range = intensityMax && intensityMax !== intensityMin
      ? `${intensityMin}-${intensityMax}%`
      : `${intensityMin}%`
    parts.push(range)
  }

  return parts.join(' · ')
}

// ─── Single routine workout view ──────────────────────────────────────────────

function TodayWorkoutView({ activeClientRoutine }) {
  const { data: routine, isLoading: routineLoading } = useRoutine(activeClientRoutine.routine_id)
  const { data: configs } = useClientExerciseConfigs(activeClientRoutine.id)

  const configMap = {}
  configs?.forEach((c) => { configMap[c.routine_day_exercise_id] = c })

  if (routineLoading) return <SkeletonCard />

  const today = new Date().getDay()
  const days = [...(routine?.routine_days ?? [])].sort((a, b) => a.order_index - b.order_index)
  const todayDay = days.length ? days[today % days.length] : null

  if (!todayDay) {
    return (
      <EmptyState
        icon="📅"
        title="Sin sesión hoy"
        description="Tu rutina no tiene días configurados aún"
      />
    )
  }

  const sections = [...(todayDay.routine_day_sections ?? [])].sort(
    (a, b) => a.order_index - b.order_index
  )
  const totalExercises = sections.reduce(
    (acc, s) => acc + (s.routine_day_exercises?.length ?? 0), 0
  )

  return (
    <div className="space-y-3">
      <Card>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
              {routine?.name}
            </div>
            <h3 className="text-xl font-bold text-white">{todayDay.name}</h3>
            {routine?.goal && (
              <p className="text-sm text-zinc-400 mt-0.5">{routine.goal}</p>
            )}
          </div>
          <div className="text-right shrink-0">
            <Badge variant="success">{totalExercises} ejercicios</Badge>
            {todayDay.estimated_duration_minutes && (
              <div className="text-xs text-zinc-500 mt-1">~{todayDay.estimated_duration_minutes} min</div>
            )}
          </div>
        </div>
      </Card>

      {sections.map((section) => {
        const exercises = [...(section.routine_day_exercises ?? [])].sort(
          (a, b) => a.order_index - b.order_index
        )
        if (!exercises.length) return null

        return (
          <div key={section.id}>
            <div className="flex items-center gap-2 px-1 mb-2">
              <span className="text-sm">{SECTION_TYPE_ICONS[section.section_type] ?? '•'}</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {section.name}
              </span>
              <div className="flex-1 h-px bg-zinc-800" />
            </div>

            <div className="space-y-2">
              {exercises.map((rde, idx) => {
                const config = configMap[rde.id]
                const paramLine = buildParamLine(rde, config)
                const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(rde.exercise?.name + ' ejercicio shorts')}`

                return (
                  <div
                    key={rde.id}
                    className="flex items-start gap-3 px-3 py-2.5 bg-zinc-900 rounded-xl"
                  >
                    <div className="w-7 h-7 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white text-sm leading-tight">
                        {rde.exercise?.name ?? 'Ejercicio'}
                      </div>
                      {paramLine && (
                        <div className="text-xs text-zinc-400 mt-0.5">{paramLine}</div>
                      )}
                      {config?.weight_kg && (
                        <div className="text-xs text-accent mt-0.5">{config.weight_kg} kg</div>
                      )}
                      {rde.notes && (
                        <div className="text-xs text-zinc-500 mt-1 italic">{rde.notes}</div>
                      )}
                    </div>
                    <a
                      href={ytUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 px-2 py-1 bg-zinc-800 text-zinc-400 hover:text-white rounded-lg text-xs transition-colors"
                    >
                      ▶ YT
                    </a>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Carousel nav ─────────────────────────────────────────────────────────────

function CarouselNav({ current, total, onPrev, onNext, label }) {
  if (total <= 1) return null
  return (
    <div className="flex items-center justify-between">
      <button
        onClick={onPrev}
        disabled={current === 0}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 disabled:opacity-30 hover:text-white transition-colors"
      >
        ‹
      </button>

      <div className="flex flex-col items-center gap-1">
        <span className="text-sm font-semibold text-white truncate max-w-[180px] text-center">
          {label}
        </span>
        <div className="flex gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === current ? 'w-4 bg-accent' : 'w-1.5 bg-zinc-700'
              }`}
            />
          ))}
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={current === total - 1}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 disabled:opacity-30 hover:text-white transition-colors"
      >
        ›
      </button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClientHome() {
  const profileId = useAuthStore((state) => state.profileId)
  const { data: client } = useClient(profileId)
  const { data: clientRoutines, isLoading } = useClientRoutines(profileId)
  const [carouselIdx, setCarouselIdx] = useState(0)

  const activeRoutines = clientRoutines?.filter((cr) => cr.is_active) ?? []
  const safeIdx = Math.min(carouselIdx, Math.max(0, activeRoutines.length - 1))
  const current = activeRoutines[safeIdx]

  return (
    <PageWrapper title="Hoy">
      <div className="py-4 space-y-4">
        <Card>
          <h2 className="text-2xl font-bold mb-1">
            Hola, {client?.full_name?.split(' ')[0] || 'Atleta'} 💪
          </h2>
          <p className="text-zinc-400">¡Es momento de entrenar!</p>
        </Card>

        {isLoading && <SkeletonCard />}

        {!isLoading && activeRoutines.length === 0 && (
          <EmptyState
            icon="📋"
            title="Sin rutina activa"
            description="Tu coach aún no ha asignado una rutina. ¡Pronto tendrás tu plan!"
          />
        )}

        {!isLoading && activeRoutines.length > 0 && (
          <>
            <CarouselNav
              current={safeIdx}
              total={activeRoutines.length}
              onPrev={() => setCarouselIdx((i) => Math.max(0, i - 1))}
              onNext={() => setCarouselIdx((i) => Math.min(activeRoutines.length - 1, i + 1))}
              label={current?.routine?.name ?? `Rutina ${safeIdx + 1}`}
            />
            <TodayWorkoutView activeClientRoutine={current} />
          </>
        )}
      </div>
    </PageWrapper>
  )
}
