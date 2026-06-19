import { useMutation } from '@tanstack/react-query'
import { uploadImages } from '../api/uploads'

export function useUploadImages() {
  return useMutation({
    mutationFn: ({ files, folder }: { files: File[]; folder?: string }) =>
      uploadImages(files, folder),
  })
}
