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
        .eq('id', session.user.id)
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
        .select(`
          *,
          user:users(full_name, email, avatar_url)
        `)
        .eq('user_id', userId)
        .single()
      
      if (error) throw error
      return {
        ...data,
        full_name: data.user?.full_name,
        email: data.user?.email,
        avatar_url: data.user?.avatar_url,
      }
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
        .select('*, user:users(full_name, email, avatar_url)')
        .eq('coach_id', coachId)
        .order('created_at', { ascending: false })

      if (error) throw error
      if (!data) return []

      return data.map(({ user, ...client }) => ({
        ...client,
        full_name: user?.full_name,
        email: user?.email,
        avatar_url: user?.avatar_url,
      }))
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
        .select('*, user:users(full_name, email, avatar_url)')
        .eq('id', clientId)
        .single()

      if (error) throw error

      const { user, ...client } = data
      return {
        ...client,
        full_name: user?.full_name,
        email: user?.email,
        avatar_url: user?.avatar_url,
      }
    },
    enabled: !!clientId,
  })
}

export const useCreateClient = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (clientData) => {
      const { data, error } = await supabase.functions.invoke('create-client', {
        body: clientData,
      })

      if (error) throw error
      if (data?.error) throw new Error(data.error)

      return data.client
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}

export const useUpdateClient = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ clientId, updates }) => {
      const { data: clientData, error: fetchError } = await supabase
        .from('clients')
        .select('user_id, id')
        .eq('id', clientId)
        .single()

      if (fetchError) throw fetchError

      const clientFields = ['date_of_birth', 'gender', 'height_cm', 'weight_kg', 'fitness_level', 'goals', 'injuries', 'medical_conditions']
      const clientUpdates = {}
      clientFields.forEach(field => {
        if (updates[field] !== undefined) clientUpdates[field] = updates[field]
      })

      // full_name lives in the users table; requires the coach to have the
      // "Coaches can update their clients' name" RLS policy (migration 006).
      if (updates.full_name !== undefined) {
        const { error: userError } = await supabase
          .from('users')
          .update({ full_name: updates.full_name })
          .eq('id', clientData.user_id)

        if (userError) throw userError
      }

      if (Object.keys(clientUpdates).length > 0) {
        const { error } = await supabase
          .from('clients')
          .update(clientUpdates)
          .eq('id', clientId)

        if (error) throw error
      }

      return { id: clientId }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client'] })
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}
