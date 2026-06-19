import { useQuery } from '@tanstack/react-query'
import { useApp } from '../store/AppContext'
import { getStats } from '../api/stats'

export function useStats() {
  const { isAdmin } = useApp()
  return useQuery({
    queryKey: ['stats'],
    queryFn: getStats,
    enabled: isAdmin,
  })
}
