import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export const useCompletedWorkouts = (clientId) => {
  return useQuery({
    queryKey: ['completedWorkouts', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('completed_workouts')
        .select(`
          *,
          workout_session:workout_sessions (*)
        `)
        .eq('client_id', clientId)
        .order('completed_at', { ascending: false })
      
      if (error) throw error
      return data
    },
    enabled: !!clientId,
  })
}

export const useCompleteWorkout = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (workoutData) => {
      const { data, error } = await supabase
        .from('completed_workouts')
        .insert(workoutData)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['completedWorkouts', data.client_id] })
      queryClient.invalidateQueries({ queryKey: ['todaySession', data.client_id] })
    },
  })
}
