import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { EtatComposant, StatutOffre } from '../types'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatPrice(price: number): string {
  return `${price.toLocaleString('fr-FR')} €`
}

export function addMonths(dateStr: string, months: number): string {
  const date = new Date(dateStr)
  date.setMonth(date.getMonth() + months)
  return date.toISOString().split('T')[0]
}

export function computeWarranty(dateFinGarantie: string): { active: boolean; label: string } {
  const now = new Date()
  const expiry = new Date(dateFinGarantie)
  const active = expiry > now

  if (!active) {
    return { active: false, label: 'Garantie expirée' }
  }

  const expiryFormatted = expiry.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  const diffMs = expiry.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  const diffMonths = Math.round(diffDays / 30.4375)

  let remaining: string
  if (diffMonths <= 0) {
    remaining = `${diffDays} jour${diffDays > 1 ? 's' : ''} restant${diffDays > 1 ? 's' : ''}`
  } else {
    remaining = `${diffMonths} mois restant${diffMonths > 1 ? 's' : ''}`
  }

  return {
    active: true,
    label: `Sous garantie jusqu'au ${expiryFormatted} — ${remaining}`,
  }
}

export function getStateLabel(etat: EtatComposant): string {
  const labels: Record<EtatComposant, string> = {
    EN_RECONDITIONNEMENT: 'En reconditionnement',
    EN_VENTE: 'En vente',
    VENDU: 'Vendu',
    RECYCLE: 'Recyclé',
  }
  return labels[etat] ?? etat
}

export function getOfferStatusLabel(statut: StatutOffre): string {
  const labels: Record<StatutOffre, string> = {
    EN_ATTENTE: 'En attente',
    ACCEPTEE: 'Acceptée',
    REJETEE: 'Rejetée',
  }
  return labels[statut] ?? statut
}
