import api from '../lib/axios'
import { commandeListSchema } from '../lib/schemas'
import type { Commande } from '../types'

export async function listCommandes(): Promise<Commande[]> {
  const { data } = await api.get('/commandes')
  return commandeListSchema.parse(data) as Commande[]
}
