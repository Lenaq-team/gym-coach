import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useCreateClient } from '@/hooks/useAuth'
import {
  GENDER_OPTIONS,
  FITNESS_LEVEL_OPTIONS,
  GOAL_OPTIONS,
  INJURY_OPTIONS,
  MEDICAL_CONDITION_OPTIONS,
} from '@/constants/client.const'

const SELECT_CLASS =
  'w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent'

const INITIAL_FORM = {
  full_name: '',
  email: '',
  phone: '',
  password: '',
  date_of_birth: '',
  gender: '',
  height_cm: '',
  weight_kg: '',
  fitness_level: '',
  goals: [],
  injuries: [],
  medical_conditions: [],
}

function FormLabel({ children, required }) {
  return (
    <label className="block text-sm font-medium text-zinc-300 mb-1">
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  )
}

function TagSelector({ label, options, selected, onChange }) {
  const toggle = (option) => {
    onChange(
      selected.includes(option)
        ? selected.filter((v) => v !== option)
        : [...selected, option]
    )
  }

  return (
    <div>
      <FormLabel>{label}</FormLabel>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option)
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                isSelected
                  ? 'bg-accent border-accent text-black font-medium'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500'
              }`}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 pt-2">
      {children}
    </h3>
  )
}

export function AddClientModal({ isOpen, onClose }) {
  const [form, setForm] = useState(INITIAL_FORM)
  const [error, setError] = useState('')
  const createClient = useCreateClient()

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))
  const setArray = (field) => (value) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleClose = () => {
    setForm(INITIAL_FORM)
    setError('')
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const payload = {
      ...form,
      height_cm: form.height_cm ? Number(form.height_cm) : null,
      weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
      date_of_birth: form.date_of_birth || null,
      gender: form.gender || null,
      fitness_level: form.fitness_level || null,
    }

    try {
      await createClient.mutateAsync(payload)
      handleClose()
    } catch (err) {
      setError(err.message || 'Error al crear el cliente')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Agregar cliente">
      <form onSubmit={handleSubmit} className="space-y-4">
        <SectionTitle>Cuenta de acceso</SectionTitle>

        <Input
          label="Nombre completo"
          required
          placeholder="Juan Pérez"
          value={form.full_name}
          onChange={set('full_name')}
        />

        <Input
          label="Correo electrónico"
          type="email"
          required
          placeholder="cliente@email.com"
          value={form.email}
          onChange={set('email')}
        />

        <Input
          label="Contraseña temporal"
          type="password"
          required
          placeholder="Mínimo 6 caracteres"
          value={form.password}
          onChange={set('password')}
          minLength={6}
        />

        <Input
          label="Teléfono"
          type="tel"
          placeholder="+52 55 1234 5678"
          value={form.phone}
          onChange={set('phone')}
        />

        <SectionTitle>Información física</SectionTitle>

        <Input
          label="Fecha de nacimiento"
          type="date"
          value={form.date_of_birth}
          onChange={set('date_of_birth')}
        />

        <div>
          <FormLabel>Género</FormLabel>
          <select value={form.gender} onChange={set('gender')} className={SELECT_CLASS}>
            <option value="">Seleccionar...</option>
            {GENDER_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Peso (kg)"
            type="number"
            step="0.1"
            min="0"
            placeholder="70"
            value={form.weight_kg}
            onChange={set('weight_kg')}
          />
          <Input
            label="Altura (cm)"
            type="number"
            step="0.1"
            min="0"
            placeholder="175"
            value={form.height_cm}
            onChange={set('height_cm')}
          />
        </div>

        <div>
          <FormLabel>Nivel de fitness</FormLabel>
          <select value={form.fitness_level} onChange={set('fitness_level')} className={SELECT_CLASS}>
            <option value="">Seleccionar...</option>
            {FITNESS_LEVEL_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <SectionTitle>Objetivos y salud</SectionTitle>

        <TagSelector
          label="Objetivos"
          options={GOAL_OPTIONS}
          selected={form.goals}
          onChange={setArray('goals')}
        />

        <TagSelector
          label="Lesiones previas"
          options={INJURY_OPTIONS}
          selected={form.injuries}
          onChange={setArray('injuries')}
        />

        <TagSelector
          label="Condiciones médicas"
          options={MEDICAL_CONDITION_OPTIONS}
          selected={form.medical_conditions}
          onChange={setArray('medical_conditions')}
        />

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={handleClose}
            disabled={createClient.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={createClient.isPending}
          >
            {createClient.isPending ? 'Creando...' : 'Agregar cliente'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
