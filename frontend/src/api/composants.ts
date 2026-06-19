import api from '../lib/axios'
import { composantListSchema, composantSchema, commandeSchema } from '../lib/schemas'
import type { Organe, Piece, Commande } from '../types'

// Payload accepted by create/update — mono-lingual fields map to *_fr server-side,
// optional *Ar fields map to *_ar (see backend write contract).
export interface ComposantInput {
  typeComposant?: 'ORGANE' | 'PIECE'
  nom?: string
  nomAr?: string
  reference?: string
  marque?: string
  modele?: string
  categorieId?: number | null
  qualite?: string | null
  prix?: number
  garantie?: number
  images?: string[]
  description?: string
  descriptionAr?: string
  etatActuel?: string
  datePublication?: string | null
  typeEquipement?: string
  typeEquipementAr?: string
  materiau?: string
  materiauAr?: string
  compatibilite?: string
  compatibiliteAr?: string
}

export interface ComposantFilters {
  etat?: string
  search?: string
  categorieId?: number
  type?: 'ORGANE' | 'PIECE'
  marque?: string
  qualite?: string
  prixMin?: number
  prixMax?: number
  sort?: 'recent' | 'prix_asc' | 'prix_desc'
}

export async function listComposants(filters: ComposantFilters = {}): Promise<(Organe | Piece)[]> {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  )
  const { data } = await api.get('/composants', { params })
  return composantListSchema.parse(data) as unknown as (Organe | Piece)[]
}

export async function getComposant(id: number): Promise<Organe | Piece> {
  const { data } = await api.get(`/composants/${id}`)
  return composantSchema.parse(data) as unknown as Organe | Piece
}

export async function acheterComposant(id: number): Promise<Commande> {
  const { data } = await api.post(`/composants/${id}/acheter`)
  return commandeSchema.parse(data) as Commande
}

export async function createComposant(input: ComposantInput): Promise<Organe | Piece> {
  const { data } = await api.post('/composants', input)
  return composantSchema.parse(data) as unknown as Organe | Piece
}

export async function updateComposant(id: number, input: ComposantInput): Promise<Organe | Piece> {
  const { data } = await api.patch(`/composants/${id}`, input)
  return composantSchema.parse(data) as unknown as Organe | Piece
}

export async function declarePieces(parentId: number, pieces: ComposantInput[]): Promise<(Organe | Piece)[]> {
  const { data } = await api.post(`/composants/${parentId}/pieces`, { pieces })
  return composantListSchema.parse(data) as unknown as (Organe | Piece)[]
}
