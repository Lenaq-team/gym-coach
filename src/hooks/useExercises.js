import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export const useExercises = (accountId) => {
  return useQuery({
    queryKey: ['exercises', accountId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .or(`account_id.eq.${accountId},is_template.eq.true`)
        .order('name', { ascending: true })
      
      if (error) throw error
      return data
    },
    enabled: !!accountId,
  })
}

export const useCreateExercise = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (exerciseData) => {
      const { data, error } = await supabase
        .from('exercises')
        .insert(exerciseData)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['exercises', data.account_id] })
    },
  })
}
