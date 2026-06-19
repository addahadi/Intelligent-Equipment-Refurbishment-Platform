import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useApp } from '../store/AppContext'
import {
  listComposants, getComposant, acheterComposant,
  createComposant, updateComposant, declarePieces,
  type ComposantFilters, type ComposantInput,
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

function invalidateComposants(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['composants'] })
  qc.invalidateQueries({ queryKey: ['composant'] })
  qc.invalidateQueries({ queryKey: ['stats'] })
}

export function useCreateComposant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: ComposantInput) => createComposant(input),
    onSuccess: () => invalidateComposants(qc),
  })
}

export function useUpdateComposant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ComposantInput }) => updateComposant(id, input),
    onSuccess: () => invalidateComposants(qc),
  })
}

export function useDeclarePieces() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ parentId, pieces }: { parentId: number; pieces: ComposantInput[] }) =>
      declarePieces(parentId, pieces),
    onSuccess: (_data, { parentId }) => {
      invalidateComposants(qc)
      qc.invalidateQueries({ queryKey: ['etapes'] })
      qc.invalidateQueries({ queryKey: ['composant', undefined, parentId] })
    },
  })
}
