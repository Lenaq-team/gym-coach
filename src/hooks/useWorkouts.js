import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export const useWorkoutPlans = (clientId) => {
  return useQuery({
    queryKey: ['workoutPlans', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },
    enabled: !!clientId,
  })
}

export const useWorkoutSessions = (planId) => {
  return useQuery({
    queryKey: ['workoutSessions', planId],
    queryFn: async () => {
      const { data, error} = await supabase
        .from('workout_sessions')
        .select(`
          *,
          workout_exercises (
            *,
            exercise:exercises (*)
          )
        `)
        .eq('workout_plan_id', planId)
        .order('day_of_week', { ascending: true })
      
      if (error) throw error
      return data
    },
    enabled: !!planId,
  })
}

export const useWeekSessions = (clientId, weekStart) => {
  return useQuery({
    queryKey: ['weekSessions', clientId, weekStart],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select(`
          *,
          workout_exercises (
            *,
            exercise:exercises (*)
          )
        `)
        .eq('client_id', clientId)
        .gte('scheduled_date', weekStart)
        .order('scheduled_date', { ascending: true })
      
      if (error) throw error
      return data
    },
    enabled: !!clientId && !!weekStart,
  })
}

export const useTodaySession = (clientId) => {
  const today = new Date().toISOString().split('T')[0]
  
  return useQuery({
    queryKey: ['todaySession', clientId, today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select(`
          *,
          workout_exercises (
            *,
            exercise:exercises (*)
          )
        `)
        .eq('client_id', clientId)
        .eq('scheduled_date', today)
        .maybeSingle()
      
      if (error) throw error
      return data
    },
    enabled: !!clientId,
  })
}

export const useCreateWorkoutPlan = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (planData) => {
      const { data, error } = await supabase
        .from('workout_plans')
        .insert(planData)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workoutPlans', data.client_id] })
    },
  })
}
