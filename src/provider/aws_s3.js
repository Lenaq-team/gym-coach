import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
  region: import.meta.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
})

const BUCKET_NAME = import.meta.env.VITE_AWS_S3_BUCKET_NAME

/**
 * Uploads a file to S3 using a presigned PUT URL and returns the public URL.
 * Using presigned URL + native fetch avoids browser/SDK stream compatibility issues.
 * @param {File} file - The file to upload
 * @param {string} clientId - Used to namespace the S3 key
 * @returns {Promise<string>} Public URL of the uploaded file
 */
export const uploadFileToS3 = async (file, clientId) => {
  const ext = file.name.split('.').pop().toLowerCase()
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)
  const key = `progress-media/${clientId}/${timestamp}-${random}.${ext}`

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: file.type,
  })

  const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 })

  const response = await fetch(presignedUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  })

  if (!response.ok) {
    throw new Error(`Error al subir archivo a S3: ${response.status} ${response.statusText}`)
  }

  const region = import.meta.env.VITE_AWS_REGION
  return `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`
}

/**
 * Returns the duration in seconds of a video file using the HTML5 Media API.
 * @param {File} file - The video file
 * @returns {Promise<number>} Duration in seconds
 */
export const getVideoDuration = (file) => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url)
      resolve(video.duration)
    }
    video.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('No se pudo leer el video'))
    }
    video.src = url
  })
}
