import api from '../lib/axios'
import { categorieListSchema } from '../lib/schemas'
import type { Categorie } from '../types'

export async function listCategories(): Promise<Categorie[]> {
  const { data } = await api.get('/categories')
  return categorieListSchema.parse(data) as Categorie[]
}
