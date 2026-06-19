import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useApp } from '../store/AppContext'
import {
  submitOffre, listOffres, accepterOffre, rejeterOffre, type SubmitOffreInput,
} from '../api/offres'

export function useSubmitOffre() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: SubmitOffreInput) => submitOffre(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['offres'] }),
  })
}

export function useOffres(statut?: string) {
  const { lang } = useApp()
  return useQuery({
    queryKey: ['offres', lang, statut ?? 'all'],
    queryFn: () => listOffres(statut),
  })
}

export function useAccepterOffre() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => accepterOffre(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['offres'] })
      qc.invalidateQueries({ queryKey: ['composants'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

export function useRejeterOffre() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => rejeterOffre(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['offres'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}
