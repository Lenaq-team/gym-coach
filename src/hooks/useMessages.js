import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export const useMessages = (userId, otherId) => {
  return useQuery({
    queryKey: ['messages', userId, otherId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${userId})`)
        .order('created_at', { ascending: true })
      
      if (error) throw error
      return data
    },
    enabled: !!userId && !!otherId,
  })
}

export const useSendMessage = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (messageData) => {
      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    },
  })
}

export const useNotifications = (userId) => {
  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },
    enabled: !!userId,
  })
}

export const useMarkNotificationsRead = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (userId) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .is('read_at', null)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
