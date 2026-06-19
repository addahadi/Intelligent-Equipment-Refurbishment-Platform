import api from '../lib/axios'
import { categorieListSchema, categorieSchema } from '../lib/schemas'
import type { Categorie } from '../types'

export async function listCategories(): Promise<Categorie[]> {
  const { data } = await api.get('/categories')
  return categorieListSchema.parse(data) as Categorie[]
}

export async function createCategorie(input: { libelle: string; libelleAr?: string }): Promise<Categorie> {
  const { data } = await api.post('/categories', input)
  return categorieSchema.parse(data) as Categorie
}

export async function deleteCategorie(id: number): Promise<void> {
  await api.delete(`/categories/${id}`)
}
