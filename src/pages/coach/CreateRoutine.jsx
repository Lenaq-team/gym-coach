import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { useAuthStore } from '@/stores/authStore'
import { useCreateRoutine } from '@/hooks/useRoutines'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'

const GOALS = ['Hipertrofia', 'Fuerza', 'Resistencia', 'Definición', 'Pérdida de peso', 'Otro']

const DIFFICULTY_OPTIONS = [
  { value: 'beginner', label: 'Principiante' },
  { value: 'intermediate', label: 'Intermedio' },
  { value: 'advanced', label: 'Avanzado' },
]

const DIFFICULTY_LABEL = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
}

const selectClass =
  'w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent'

const labelClass = 'block text-sm font-medium text-zinc-300 mb-1'

const initialForm = {
  name: '',
  description: '',
  goal: '',
  difficulty_level: '',
  days_per_week: '',
  is_template: false,
}

export default function CreateRoutine() {
  const navigate = useNavigate()
  const coachId = useAuthStore((s) => s.coachId)
  const { mutate: createRoutine, isPending, error } = useCreateRoutine()

  const [step, setStep] = useState(1)
  const [form, setForm] = useState(initialForm)

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    createRoutine(
      {
        coach_id: coachId,
        name: form.name,
        description: form.description || null,
        goal: form.goal || null,
        difficulty_level: form.difficulty_level || null,
        days_per_week: form.days_per_week ? parseInt(form.days_per_week) : null,
        is_template: form.is_template,
      },
      {
        onSuccess: (data) => {
          navigate(`/coach/routines/${data.id}`)
        },
      }
    )
  }

  return (
    <PageWrapper title="Nueva Rutina">
      <div className="py-4 space-y-4">
        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {[1, 2].map((n) => (
            <div key={n} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= n ? 'bg-accent text-black' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {n}
              </div>
              {n < 2 && <div className={`flex-1 h-0.5 w-8 ${step > n ? 'bg-accent' : 'bg-zinc-800'}`} />}
            </div>
          ))}
          <span className="text-sm text-zinc-400 ml-1">
            {step === 1 ? 'Datos básicos' : 'Confirmar'}
          </span>
        </div>

        {/* ── Step 1 ── */}
        {step === 1 && (
          <div className="space-y-4">
            <Input
              label="Nombre de la rutina *"
              placeholder="Ej. Rutina de fuerza 3 días"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />

            <div>
              <label className={labelClass}>Descripción</label>
              <textarea
                className={`${selectClass} resize-none`}
                rows={3}
                placeholder="Describe el objetivo general de la rutina..."
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </div>

            <div>
              <label className={labelClass}>Objetivo</label>
              <select
                className={selectClass}
                value={form.goal}
                onChange={(e) => handleChange('goal', e.target.value)}
              >
                <option value="">Seleccionar objetivo</option>
                {GOALS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Nivel de dificultad</label>
              <select
                className={selectClass}
                value={form.difficulty_level}
                onChange={(e) => handleChange('difficulty_level', e.target.value)}
              >
                <option value="">Seleccionar nivel</option>
                {DIFFICULTY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Días por semana</label>
              <select
                className={selectClass}
                value={form.days_per_week}
                onChange={(e) => handleChange('days_per_week', e.target.value)}
              >
                <option value="">Seleccionar días</option>
                {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                  <option key={d} value={d}>
                    {d} {d === 1 ? 'día' : 'días'}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={form.is_template}
                  onChange={(e) => handleChange('is_template', e.target.checked)}
                />
                <div className="w-10 h-6 bg-zinc-700 rounded-full peer-checked:bg-accent transition-colors" />
                <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
              </div>
              <div>
                <span className="text-sm font-medium text-white">Guardar como plantilla</span>
                <p className="text-xs text-zinc-400">Podrás reutilizarla para otros clientes</p>
              </div>
            </label>

            <Button
              size="lg"
              className="w-full mt-2"
              disabled={!form.name.trim()}
              onClick={() => setStep(2)}
            >
              Siguiente
            </Button>
          </div>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <div className="space-y-4">
            <Card className="space-y-3">
              <h3 className="font-semibold text-white text-base">Resumen</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Nombre</span>
                  <span className="text-white font-medium text-right max-w-[60%] truncate">
                    {form.name}
                  </span>
                </div>

                {form.description && (
                  <div className="flex justify-between gap-4">
                    <span className="text-zinc-400 shrink-0">Descripción</span>
                    <span className="text-white text-right line-clamp-2">{form.description}</span>
                  </div>
                )}

                {form.goal && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Objetivo</span>
                    <span className="text-white">{form.goal}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-zinc-400">Dificultad</span>
                  <span className="text-white">
                    {form.difficulty_level
                      ? DIFFICULTY_LABEL[form.difficulty_level]
                      : 'No especificada'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-zinc-400">Días/semana</span>
                  <span className="text-white">
                    {form.days_per_week ? `${form.days_per_week} días` : 'No especificado'}
                  </span>
                </div>
              </div>

              <div className="pt-1 flex gap-2 flex-wrap">
                {form.difficulty_level && (
                  <Badge variant="default">
                    {DIFFICULTY_LABEL[form.difficulty_level]}
                  </Badge>
                )}
                {form.days_per_week && (
                  <Badge variant="default">{form.days_per_week} días/sem</Badge>
                )}
                {form.is_template && (
                  <Badge variant="success">Plantilla</Badge>
                )}
              </div>
            </Card>

            {error && (
              <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-lg">
                {error.message ?? 'Error al crear la rutina. Intenta de nuevo.'}
              </p>
            )}

            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="lg"
                className="flex-1"
                disabled={isPending}
                onClick={() => setStep(1)}
              >
                Volver
              </Button>
              <Button
                size="lg"
                className="flex-1"
                disabled={isPending}
                onClick={handleSubmit}
              >
                {isPending ? 'Creando...' : 'Crear rutina'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
