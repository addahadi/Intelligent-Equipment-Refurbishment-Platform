import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useApp } from '../store/AppContext'
import { listCategories, createCategorie, deleteCategorie } from '../api/categories'

export function useCategories() {
  const { lang } = useApp()
  return useQuery({
    queryKey: ['categories', lang],
    queryFn: listCategories,
  })
}

export function useCreateCategorie() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { libelle: string; libelleAr?: string }) => createCategorie(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useDeleteCategorie() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteCategorie(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}
