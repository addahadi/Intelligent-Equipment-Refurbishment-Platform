import api from '../lib/axios'
import { composantListSchema } from '../lib/schemas'
import type { Organe, Piece } from '../types'

export async function listFavoris(): Promise<(Organe | Piece)[]> {
  const { data } = await api.get('/favoris')
  return composantListSchema.parse(data) as unknown as (Organe | Piece)[]
}

export async function addFavori(composantId: number): Promise<void> {
  await api.put(`/favoris/${composantId}`)
}

export async function removeFavori(composantId: number): Promise<void> {
  await api.delete(`/favoris/${composantId}`)
}
