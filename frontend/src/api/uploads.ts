import api from '../lib/axios'

// Upload image files to Cloudinary (proxied by the backend); returns their URLs.
export async function uploadImages(files: File[], folder?: string): Promise<string[]> {
  const formData = new FormData()
  files.forEach((f) => formData.append('files', f))
  if (folder) formData.append('folder', folder)
  const { data } = await api.post('/uploads', formData)
  return Array.isArray(data?.urls) ? (data.urls as string[]) : []
}
