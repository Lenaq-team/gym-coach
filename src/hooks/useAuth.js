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
        .select(`
          *,
          user:users(full_name, email, avatar_url)
        `)
        .eq('coach_id', coachId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      // Flatten user data for each client
      return data.map(client => ({
        ...client,
        full_name: client.user?.full_name,
        email: client.user?.email,
        avatar_url: client.user?.avatar_url,
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
        .select(`
          *,
          user:users(full_name, email, avatar_url)
        `)
        .eq('id', clientId)
        .single()
      
      if (error) throw error
      // Flatten user data
      return {
        ...data,
        full_name: data.user?.full_name,
        email: data.user?.email,
        avatar_url: data.user?.avatar_url,
      }
    },
    enabled: !!clientId,
  })
}

export const useUpdateClient = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ clientId, updates }) => {
      console.log('Updating client:', clientId, updates)
      
      // Get client data first to get user_id
      const { data: clientData, error: fetchError } = await supabase
        .from('clients')
        .select('user_id, id')
        .eq('id', clientId)
        .single()
      
      if (fetchError) {
        console.error('Error fetching client:', fetchError)
        throw fetchError
      }
      
      console.log('Client data:', clientData)
      
      // Separate updates for users table and clients table
      const userUpdates = {}
      const clientUpdates = {}
      
      // full_name goes to users table
      if (updates.full_name !== undefined) {
        userUpdates.full_name = updates.full_name
      }
      
      // Everything else goes to clients table
      const clientFields = ['date_of_birth', 'gender', 'height_cm', 'weight_kg', 'fitness_level', 'goals', 'injuries', 'medical_conditions']
      clientFields.forEach(field => {
        if (updates[field] !== undefined) {
          clientUpdates[field] = updates[field]
        }
      })
      
      console.log('User updates:', userUpdates)
      console.log('Client updates:', clientUpdates)
      
      // Update users table if needed
      if (Object.keys(userUpdates).length > 0) {
        const { error: userError } = await supabase
          .from('users')
          .update(userUpdates)
          .eq('id', clientData.user_id)
        
        if (userError) {
          console.error('Error updating user:', userError)
          throw userError
        }
      }
      
      // Update clients table if needed
      if (Object.keys(clientUpdates).length > 0) {
        const { data, error } = await supabase
          .from('clients')
          .update(clientUpdates)
          .eq('id', clientId)
          .select('*')
          .single()
        
        if (error) {
          console.error('Error updating client:', error)
          throw error
        }
        return data
      }
      
      // If only user fields were updated, return client data
      return { id: clientData.id }
    },
    onSuccess: (data) => {
      console.log('Update successful:', data)
      queryClient.invalidateQueries({ queryKey: ['client'] })
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
    onError: (error) => {
      console.error('Mutation error:', error)
    }
  })
}
