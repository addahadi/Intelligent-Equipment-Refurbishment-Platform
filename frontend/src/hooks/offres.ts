import { useMutation } from '@tanstack/react-query'
import { submitOffre, type SubmitOffreInput } from '../api/offres'

export function useSubmitOffre() {
  return useMutation({
    mutationFn: (input: SubmitOffreInput) => submitOffre(input),
  })
}
