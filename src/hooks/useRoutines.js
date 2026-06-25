import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// ─── Routines ────────────────────────────────────────────────────────────────

export const useRoutines = (coachId) => {
  return useQuery({
    queryKey: ['routines', coachId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('routines')
        .select('*')
        .eq('coach_id', coachId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!coachId,
  })
}

export const useRoutine = (routineId) => {
  return useQuery({
    queryKey: ['routine', routineId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('routines')
        .select(`
          *,
          routine_days (
            *,
            routine_day_sections (
              *,
              routine_day_exercises (
                *,
                exercise:exercises (*)
              )
            )
          )
        `)
        .eq('id', routineId)
        .order('order_index', { ascending: true, referencedTable: 'routine_days' })
        .order('order_index', { ascending: true, referencedTable: 'routine_days.routine_day_sections' })
        .order('order_index', { ascending: true, referencedTable: 'routine_days.routine_day_sections.routine_day_exercises' })
        .single()

      if (error) throw error
      return data
    },
    enabled: !!routineId,
  })
}

export const useCreateRoutine = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (routineData) => {
      const { data, error } = await supabase
        .from('routines')
        .insert(routineData)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['routines', data.coach_id] })
    },
  })
}

export const useUpdateRoutine = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ routineId, updates }) => {
      const { data, error } = await supabase
        .from('routines')
        .update(updates)
        .eq('id', routineId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data, { routineId }) => {
      queryClient.invalidateQueries({ queryKey: ['routines'] })
      queryClient.invalidateQueries({ queryKey: ['routine', routineId] })
    },
  })
}

export const useDeleteRoutine = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (routineId) => {
      const { error } = await supabase
        .from('routines')
        .delete()
        .eq('id', routineId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] })
    },
  })
}

// ─── Routine Days ─────────────────────────────────────────────────────────────

export const useAddRoutineDay = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ routineId, name, order_index, ...rest }) => {
      const { data, error } = await supabase
        .from('routine_days')
        .insert({ routine_id: routineId, name, order_index, ...rest })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['routine', data.routine_id] })
    },
  })
}

export const useUpdateRoutineDay = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ dayId, updates, routineId }) => {
      const { data, error } = await supabase
        .from('routine_days')
        .update(updates)
        .eq('id', dayId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data, { routineId }) => {
      queryClient.invalidateQueries({ queryKey: ['routine', routineId] })
    },
  })
}

export const useDeleteRoutineDay = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ dayId, routineId }) => {
      const { error } = await supabase
        .from('routine_days')
        .delete()
        .eq('id', dayId)

      if (error) throw error
    },
    onSuccess: (data, { routineId }) => {
      queryClient.invalidateQueries({ queryKey: ['routine', routineId] })
    },
  })
}

// ─── Sections ─────────────────────────────────────────────────────────────────

export const useAddSection = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ routineDayId, name, section_type, order_index, routineId }) => {
      const { data, error } = await supabase
        .from('routine_day_sections')
        .insert({ routine_day_id: routineDayId, name, section_type, order_index })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data, { routineId }) => {
      queryClient.invalidateQueries({ queryKey: ['routine', routineId] })
    },
  })
}

export const useDeleteSection = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ sectionId, routineId }) => {
      const { error } = await supabase
        .from('routine_day_sections')
        .delete()
        .eq('id', sectionId)

      if (error) throw error
    },
    onSuccess: (data, { routineId }) => {
      queryClient.invalidateQueries({ queryKey: ['routine', routineId] })
    },
  })
}

// ─── Routine Day Exercises ────────────────────────────────────────────────────

export const useAddExerciseToSection = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      sectionId,
      exercise_id,
      order_index,
      sets,
      reps_min,
      reps_max,
      reps_note,
      to_failure,
      intensity_min,
      intensity_max,
      intensity_type,
      duration_minutes,
      duration_note,
      notes,
      routineId,
    }) => {
      const { data, error } = await supabase
        .from('routine_day_exercises')
        .insert({
          section_id: sectionId,
          exercise_id,
          order_index,
          sets,
          reps_min,
          reps_max,
          reps_note,
          to_failure,
          intensity_min,
          intensity_max,
          intensity_type,
          duration_minutes,
          duration_note,
          notes,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data, { routineId }) => {
      queryClient.invalidateQueries({ queryKey: ['routine', routineId] })
    },
  })
}

export const useUpdateRoutineDayExercise = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ exerciseId, updates, routineId }) => {
      const { data, error } = await supabase
        .from('routine_day_exercises')
        .update(updates)
        .eq('id', exerciseId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data, { routineId }) => {
      queryClient.invalidateQueries({ queryKey: ['routine', routineId] })
    },
  })
}

export const useDeleteRoutineDayExercise = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ exerciseId, routineId }) => {
      const { error } = await supabase
        .from('routine_day_exercises')
        .delete()
        .eq('id', exerciseId)

      if (error) throw error
    },
    onSuccess: (data, { routineId }) => {
      queryClient.invalidateQueries({ queryKey: ['routine', routineId] })
    },
  })
}

// ─── Client Routines ──────────────────────────────────────────────────────────

export const useClientRoutines = (clientId) => {
  return useQuery({
    queryKey: ['clientRoutines', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_routines')
        .select(`
          *,
          routine:routines (
            name,
            description,
            goal
          )
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!clientId,
  })
}

export const useAssignRoutine = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ client_id, coach_id, routine_id, start_date, end_date, notes }) => {
      const { data, error } = await supabase
        .from('client_routines')
        .insert({ client_id, coach_id, routine_id, start_date, end_date, notes })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clientRoutines', data.client_id] })
    },
  })
}

export const useUpdateClientRoutine = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ clientRoutineId, updates, clientId }) => {
      const { data, error } = await supabase
        .from('client_routines')
        .update(updates)
        .eq('id', clientRoutineId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data, { clientId }) => {
      queryClient.invalidateQueries({ queryKey: ['clientRoutines', clientId] })
    },
  })
}

// ─── Client Exercise Config ───────────────────────────────────────────────────

export const useClientExerciseConfigs = (clientRoutineId) => {
  return useQuery({
    queryKey: ['clientRoutineConfig', clientRoutineId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_exercise_config')
        .select('*')
        .eq('client_routine_id', clientRoutineId)

      if (error) throw error
      return data
    },
    enabled: !!clientRoutineId,
  })
}

export const useUpsertExerciseConfig = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (configData) => {
      const { data, error } = await supabase
        .from('client_exercise_config')
        .upsert(configData, { onConflict: 'client_routine_id,routine_day_exercise_id' })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data, configData) => {
      queryClient.invalidateQueries({ queryKey: ['clientRoutineConfig', configData.client_routine_id] })
    },
  })
}

// ─── Exercises ────────────────────────────────────────────────────────────────

export const useExercises = () => {
  return useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      return data
    },
  })
}

export const useExerciseSearch = (query) => {
  return useQuery({
    queryKey: ['exercises', 'search', query],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .ilike('name', `%${query}%`)
        .order('name', { ascending: true })

      if (error) throw error
      return data
    },
    enabled: query.length >= 2,
  })
}
