import { useQuery } from '@tanstack/react-query'
import { useApp } from '../store/AppContext'
import { listCommandes } from '../api/commandes'

export function useCommandes() {
  const { lang, isAuthenticated } = useApp()
  return useQuery({
    queryKey: ['commandes', lang],
    queryFn: listCommandes,
    enabled: isAuthenticated,
  })
}
