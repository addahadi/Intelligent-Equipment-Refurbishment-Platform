import { useQuery } from '@tanstack/react-query'
import { useApp } from '../store/AppContext'
import { listCategories } from '../api/categories'

export function useCategories() {
  const { lang } = useApp()
  return useQuery({
    queryKey: ['categories', lang],
    queryFn: listCategories,
  })
}
