import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { uploadFileToS3, getVideoDuration } from '@/provider/aws_s3'

const MAX_VIDEO_DURATION_SECONDS = 60

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
        .order('photo_date', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!clientId,
  })
}

export const useUploadProgressMedia = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ clientId, file, notes, photoDate }) => {
      const isVideo = file.type.startsWith('video/')

      if (isVideo) {
        const duration = await getVideoDuration(file)
        if (duration > MAX_VIDEO_DURATION_SECONDS) {
          throw new Error(`El video supera el límite de ${MAX_VIDEO_DURATION_SECONDS} segundos (duración: ${Math.round(duration)}s)`)
        }
      }

      const mediaUrl = await uploadFileToS3(file, clientId)

      const { data, error } = await supabase
        .from('progress_photos')
        .insert({
          client_id: clientId,
          photo_url: mediaUrl,
          photo_date: photoDate,
          media_type: isVideo ? 'video' : 'photo',
          notes: notes || null,
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
