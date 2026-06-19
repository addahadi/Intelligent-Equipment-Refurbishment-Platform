import api from '../lib/axios'
import { etapeListSchema } from '../lib/schemas'
import type { EtapeTracabilite } from '../types'

export async function listEtapes(composantId: number): Promise<EtapeTracabilite[]> {
  const { data } = await api.get(`/composants/${composantId}/etapes`)
  return etapeListSchema.parse(data) as EtapeTracabilite[]
}
