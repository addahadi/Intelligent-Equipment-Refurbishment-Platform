import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useApp } from '../store/AppContext'
import {
  listEtapes, createEtape, updateEtape, deleteEtape, reorderEtape,
  type EtapeInput, type OverrideInput,
} from '../api/etapes'

export function useEtapes(composantId: number) {
  const { lang } = useApp()
  return useQuery({
    queryKey: ['etapes', lang, composantId],
    queryFn: () => listEtapes(composantId),
    enabled: Number.isFinite(composantId) && composantId > 0,
  })
}

// Étape mutations all affect the parent composant's timeline (and possibly its
// etat via FR-33 side-effects), so they invalidate etapes + composant queries.
function invalidateEtapes(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['etapes'] })
  qc.invalidateQueries({ queryKey: ['composant'] })
  qc.invalidateQueries({ queryKey: ['composants'] })
}

export function useCreateEtape() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ composantId, input }: { composantId: number; input: EtapeInput }) =>
      createEtape(composantId, input),
    onSuccess: () => invalidateEtapes(qc),
  })
}

export function useUpdateEtape() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ etapeId, input }: { etapeId: number; input: EtapeInput }) =>
      updateEtape(etapeId, input),
    onSuccess: () => invalidateEtapes(qc),
  })
}

export function useDeleteEtape() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ etapeId, ...opts }: { etapeId: number } & OverrideInput) =>
      deleteEtape(etapeId, opts),
    onSuccess: () => invalidateEtapes(qc),
  })
}

export function useReorderEtape() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ etapeId, direction, ...opts }:
      { etapeId: number; direction: 'up' | 'down' } & OverrideInput) =>
      reorderEtape(etapeId, direction, opts),
    onSuccess: () => invalidateEtapes(qc),
  })
}
