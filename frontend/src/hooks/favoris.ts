import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useApp } from '../store/AppContext'
import { listFavoris, addFavori, removeFavori } from '../api/favoris'

export function useFavoris() {
  const { lang, isAuthenticated } = useApp()
  return useQuery({
    queryKey: ['favoris', lang],
    queryFn: listFavoris,
    enabled: isAuthenticated,
  })
}

// Set of favourited composant ids, for quick membership checks in lists.
export function useFavorisIds(): Set<number> {
  const { data } = useFavoris()
  return useMemo(() => new Set((data ?? []).map((c) => c.id)), [data])
}

export function useToggleFavori() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isFavori }: { id: number; isFavori: boolean }) =>
      isFavori ? removeFavori(id) : addFavori(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['favoris'] })
    },
  })
}
