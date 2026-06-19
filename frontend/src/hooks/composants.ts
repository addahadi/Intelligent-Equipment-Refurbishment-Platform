import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useApp } from '../store/AppContext'
import {
  listComposants, getComposant, acheterComposant, type ComposantFilters,
} from '../api/composants'

export function useComposants(filters: ComposantFilters = {}) {
  const { lang } = useApp()
  return useQuery({
    queryKey: ['composants', lang, filters],
    queryFn: () => listComposants(filters),
  })
}

export function useComposant(id: number) {
  const { lang } = useApp()
  return useQuery({
    queryKey: ['composant', lang, id],
    queryFn: () => getComposant(id),
    enabled: Number.isFinite(id) && id > 0,
  })
}

export function useAcheter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => acheterComposant(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['composants'] })
      qc.invalidateQueries({ queryKey: ['composant'] })
      qc.invalidateQueries({ queryKey: ['commandes'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}
