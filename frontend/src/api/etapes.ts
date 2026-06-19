import api from '../lib/axios'
import { etapeListSchema, etapeSchema } from '../lib/schemas'
import type { EtapeTracabilite, TypeEtape } from '../types'

export interface EtapeInput {
  type?: TypeEtape
  ordre?: number
  date?: string
  description?: string
  descriptionAr?: string
}

export async function listEtapes(composantId: number): Promise<EtapeTracabilite[]> {
  const { data } = await api.get(`/composants/${composantId}/etapes`)
  return etapeListSchema.parse(data) as EtapeTracabilite[]
}

export async function createEtape(composantId: number, input: EtapeInput): Promise<EtapeTracabilite> {
  const { data } = await api.post(`/composants/${composantId}/etapes`, input)
  return etapeSchema.parse(data) as EtapeTracabilite
}

export async function updateEtape(etapeId: number, input: EtapeInput): Promise<EtapeTracabilite> {
  const { data } = await api.patch(`/etapes/${etapeId}`, input)
  return etapeSchema.parse(data) as EtapeTracabilite
}

export async function deleteEtape(etapeId: number): Promise<void> {
  await api.delete(`/etapes/${etapeId}`)
}

export async function reorderEtape(etapeId: number, direction: 'up' | 'down'): Promise<EtapeTracabilite[]> {
  const { data } = await api.post(`/etapes/${etapeId}/reorder`, { direction })
  return etapeListSchema.parse(data) as EtapeTracabilite[]
}
