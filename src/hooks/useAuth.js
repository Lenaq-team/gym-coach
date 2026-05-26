import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

export const useAuthUser = () => {
  const session = useAuthStore((state) => state.session)
  
  return useQuery({
    queryKey: ['authUser', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', session.user.id)
        .single()
      
      if (error) throw error
      return data
    },
    enabled: !!session?.user?.id,
  })
}

export const useCoachProfile = (userId) => {
  return useQuery({
    queryKey: ['coach', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coaches')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (error) throw error
      return data
    },
    enabled: !!userId,
  })
}

export const useClients = (coachId) => {
  return useQuery({
    queryKey: ['clients', coachId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('coach_id', coachId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },
    enabled: !!coachId,
  })
}

export const useClient = (clientId) => {
  return useQuery({
    queryKey: ['client', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single()
      
      if (error) throw error
      return data
    },
    enabled: !!clientId,
  })
}

export const useUpdateClient = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ clientId, updates }) => {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', clientId)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['client', data.id] })
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}
