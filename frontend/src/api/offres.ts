import api from '../lib/axios'
import { offreSchema } from '../lib/schemas'
import type { Offre, TypeComposant, EtatDeclare } from '../types'

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
