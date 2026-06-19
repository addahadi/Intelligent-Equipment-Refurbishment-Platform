import api from '../lib/axios'
import { statsSchema } from '../lib/schemas'
import type { z } from 'zod'

export type Stats = z.infer<typeof statsSchema>

export async function getStats(): Promise<Stats> {
  const { data } = await api.get('/stats')
  return statsSchema.parse(data)
}
