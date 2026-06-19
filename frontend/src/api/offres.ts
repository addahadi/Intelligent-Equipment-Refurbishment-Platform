import api from '../lib/axios'
import { offreSchema, offreListSchema, composantSchema } from '../lib/schemas'
import type { Offre, Composant, TypeComposant, EtatDeclare } from '../types'

export interface SubmitOffreInput {
  designation: string
  designationAr?: string
  typePropose: TypeComposant
  marque?: string
  modele?: string
  reference?: string
  categorieId?: number
  etatDeclare: EtatDeclare
  prixPropose: number
  description?: string
  images?: string[]
  entreprise: { nom: string; contact: string; adresse?: string }
}

export async function submitOffre(input: SubmitOffreInput): Promise<Offre> {
  const { data } = await api.post('/offres', input)
  return offreSchema.parse(data) as Offre
}

export async function listOffres(statut?: string): Promise<Offre[]> {
  const params = statut ? { statut } : {}
  const { data } = await api.get('/offres', { params })
  return offreListSchema.parse(data) as Offre[]
}

// Accept returns the newly created EN_RECONDITIONNEMENT composant.
export async function accepterOffre(id: number): Promise<Composant> {
  const { data } = await api.post(`/offres/${id}/accepter`)
  return composantSchema.parse(data) as unknown as Composant
}

export async function rejeterOffre(id: number): Promise<Offre> {
  const { data } = await api.post(`/offres/${id}/rejeter`)
  return offreSchema.parse(data) as Offre
}
