import { useQuery } from '@tanstack/react-query'
import { useApp } from '../store/AppContext'
import { listEtapes } from '../api/etapes'

export function useEtapes(composantId: number) {
  const { lang } = useApp()
  return useQuery({
    queryKey: ['etapes', lang, composantId],
    queryFn: () => listEtapes(composantId),
    enabled: Number.isFinite(composantId) && composantId > 0,
  })
}
