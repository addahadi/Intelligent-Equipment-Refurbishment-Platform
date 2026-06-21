import api from '../lib/axios'
import { etapeListSchema, etapeSchema } from '../lib/schemas'
import type { EtapeTracabilite, TypeEtape } from '../types'

export interface EtapeInput {
  type?: TypeEtape
  ordre?: number
  date?: string
  description?: string
  descriptionAr?: string
  // Audited-override fields — required only when the parent composant is SOLD.
  override?: boolean
  motif?: string
}

// Override payload for operations whose body isn't the étape itself
// (delete carries no fields; reorder carries a direction).
export interface OverrideInput {
  override?: boolean
  motif?: string
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

export async function deleteEtape(etapeId: number, opts: OverrideInput = {}): Promise<void> {
  // DELETE carries the override/motif in the request body.
  await api.delete(`/etapes/${etapeId}`, { data: opts })
}

export async function reorderEtape(
  etapeId: number,
  direction: 'up' | 'down',
  opts: OverrideInput = {},
): Promise<EtapeTracabilite[]> {
  const { data } = await api.post(`/etapes/${etapeId}/reorder`, { direction, ...opts })
  return etapeListSchema.parse(data) as EtapeTracabilite[]
}
