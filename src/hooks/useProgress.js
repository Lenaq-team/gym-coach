import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export const useProgressMeasurements = (clientId) => {
  return useQuery({
    queryKey: ['progressMeasurements', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('progress_measurements')
        .select('*')
        .eq('client_id', clientId)
        .order('recorded_at', { ascending: false })
      
      if (error) throw error
      return data
    },
    enabled: !!clientId,
  })
}

export const useLogMeasurement = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (measurementData) => {
      const { data, error } = await supabase
        .from('progress_measurements')
        .insert(measurementData)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['progressMeasurements', data.client_id] })
    },
  })
}

export const usePersonalRecords = (clientId) => {
  return useQuery({
    queryKey: ['personalRecords', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('personal_records')
        .select(`
          *,
          exercise:exercises (*)
        `)
        .eq('client_id', clientId)
        .order('recorded_at', { ascending: false })
      
      if (error) throw error
      return data
    },
    enabled: !!clientId,
  })
}

export const useLogPR = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (prData) => {
      const { data, error } = await supabase
        .from('personal_records')
        .insert(prData)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['personalRecords', data.client_id] })
    },
  })
}

export const useProgressPhotos = (clientId) => {
  return useQuery({
    queryKey: ['progressPhotos', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('progress_photos')
        .select('*')
        .eq('client_id', clientId)
        .order('recorded_at', { ascending: false })
      
      if (error) throw error
      return data
    },
    enabled: !!clientId,
  })
}

export const useUploadPhoto = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ clientId, file, notes }) => {
      const fileName = `${clientId}/${Date.now()}.jpg`
      
      const { error: uploadError } = await supabase.storage
        .from('progress-photos')
        .upload(fileName, file)
      
      if (uploadError) throw uploadError
      
      const { data: urlData } = supabase.storage
        .from('progress-photos')
        .getPublicUrl(fileName)
      
      const { data, error } = await supabase
        .from('progress_photos')
        .insert({
          client_id: clientId,
          photo_url: urlData.publicUrl,
          recorded_at: new Date().toISOString(),
          notes,
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['progressPhotos', data.client_id] })
    },
  })
}
