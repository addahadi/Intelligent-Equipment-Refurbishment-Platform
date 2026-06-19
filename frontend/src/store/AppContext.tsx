import { createContext, useReducer, useContext, useEffect } from 'react'
import type { ReactNode } from 'react'
import type {
  Categorie,
  Client,
  Admin,
  Composant,
  Organe,
  Piece,
  EtapeTracabilite,
  Offre,
  Commande,
  Entreprise,
} from '../types'
import {
  mockCategories,
  mockEntreprises,
  mockComposants,
  mockEtapes,
  mockOffres,
  mockCommandes,
  currentClient,
  adminUser,
} from '../data/mock'
import { addMonths } from '../lib/utils'

// ─── Toast ────────────────────────────────────────────────────────────────────
export interface ToastMessage {
  id: number
  message: string
  type: 'success' | 'error'
}

// ─── AppState ─────────────────────────────────────────────────────────────────
export interface AppState {
  composants: (Organe | Piece)[]
  etapes: EtapeTracabilite[]
  offres: Offre[]
  commandes: Commande[]
  categories: Categorie[]
  entreprises: Entreprise[]
  currentClient: Client | null
  adminUser: Admin | null
  isAuthenticated: boolean
  isAdmin: boolean
  favoris: number[]
  toasts: ToastMessage[]
}

const initialState: AppState = {
  composants: mockComposants,
  etapes: mockEtapes,
  offres: mockOffres,
  commandes: mockCommandes,
  categories: mockCategories,
  entreprises: mockEntreprises,
  currentClient: null,
  adminUser: null,
  isAuthenticated: false,
  isAdmin: false,
  favoris: [],
  toasts: [],
}

// ─── Actions ──────────────────────────────────────────────────────────────────
type Action =
  | { type: 'LOGIN_ADMIN'; payload: Admin }
  | { type: 'LOGIN_CLIENT'; payload: Client }
  | { type: 'LOGOUT' }
  | { type: 'TOGGLE_FAVORI'; payload: number }
  | { type: 'ACHETER'; payload: { commande: Commande } }
  | { type: 'ACCEPTER_OFFRE'; payload: { offre: Offre; composant: Organe | Piece; etapes: EtapeTracabilite[] } }
  | { type: 'REJETER_OFFRE'; payload: number }
  | { type: 'ADD_ETAPE'; payload: EtapeTracabilite }
  | { type: 'ADD_ETAPES'; payload: EtapeTracabilite[] }
  | { type: 'UPDATE_ETAPE'; payload: { id: number; updates: Partial<EtapeTracabilite> } }
  | { type: 'DELETE_ETAPE'; payload: number }
  | { type: 'REORDER_ETAPE'; payload: { id: number; direction: 'up' | 'down' } }
  | { type: 'UPDATE_COMPOSANT'; payload: { id: number; updates: Partial<Composant> } }
  | { type: 'ADD_COMPOSANT'; payload: Organe | Piece }
  | { type: 'ADD_COMPOSANTS'; payload: (Organe | Piece)[] }
  | { type: 'ADD_CATEGORIE'; payload: string }
  | { type: 'DELETE_CATEGORIE'; payload: number }
  | { type: 'SUBMIT_OFFRE'; payload: { offre: Offre; entreprise: Entreprise } }
  | { type: 'SHOW_TOAST'; payload: ToastMessage }
  | { type: 'DISMISS_TOAST'; payload: number }

function nextId(items: { id: number }[]): number {
  return items.length === 0 ? 1 : Math.max(...items.map((i) => i.id)) + 1
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOGIN_ADMIN':
      return { ...state, isAuthenticated: true, isAdmin: true, adminUser: action.payload, currentClient: null, favoris: [] }

    case 'LOGIN_CLIENT':
      return { ...state, isAuthenticated: true, isAdmin: false, adminUser: null, currentClient: action.payload, favoris: action.payload.favoris }

    case 'LOGOUT':
      return { ...state, isAuthenticated: false, isAdmin: false, adminUser: null, currentClient: null, favoris: [] }

    case 'TOGGLE_FAVORI': {
      const id = action.payload
      const favoris = state.favoris.includes(id)
        ? state.favoris.filter((f) => f !== id)
        : [...state.favoris, id]
      const currentClient = state.currentClient ? { ...state.currentClient, favoris } : null
      return { ...state, favoris, currentClient }
    }

    case 'ACHETER': {
      const { commande } = action.payload
      const composants = state.composants.map((c) =>
        c.id === commande.composantId ? { ...c, etatActuel: 'VENDU' as const } : c
      )
      const currentClient = state.currentClient
        ? { ...state.currentClient, commandes: [...state.currentClient.commandes, commande.id] }
        : null
      return { ...state, composants, commandes: [...state.commandes, commande], currentClient }
    }

    case 'ACCEPTER_OFFRE': {
      const { offre, composant, etapes } = action.payload
      const offres = state.offres.map((o) => (o.id === offre.id ? offre : o))
      return {
        ...state,
        offres,
        composants: [...state.composants, composant],
        etapes: [...state.etapes, ...etapes],
      }
    }

    case 'REJETER_OFFRE': {
      const offres = state.offres.map((o) =>
        o.id === action.payload ? { ...o, statut: 'REJETEE' as const } : o
      )
      return { ...state, offres }
    }

    case 'ADD_ETAPE':
      return { ...state, etapes: [...state.etapes, action.payload] }

    case 'ADD_ETAPES':
      return { ...state, etapes: [...state.etapes, ...action.payload] }

    case 'UPDATE_ETAPE': {
      const etapes = state.etapes.map((e) =>
        e.id === action.payload.id ? { ...e, ...action.payload.updates } : e
      )
      return { ...state, etapes }
    }

    case 'DELETE_ETAPE':
      return { ...state, etapes: state.etapes.filter((e) => e.id !== action.payload) }

    case 'REORDER_ETAPE': {
      const { id, direction } = action.payload
      const target = state.etapes.find((e) => e.id === id)
      if (!target) return state
      const siblings = state.etapes
        .filter((e) => e.composantId === target.composantId)
        .sort((a, b) => a.ordre - b.ordre)
      const idx = siblings.findIndex((e) => e.id === id)
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= siblings.length) return state
      const a = siblings[idx]
      const b = siblings[swapIdx]
      const etapes = state.etapes.map((e) => {
        if (e.id === a.id) return { ...e, ordre: b.ordre }
        if (e.id === b.id) return { ...e, ordre: a.ordre }
        return e
      })
      return { ...state, etapes }
    }

    case 'UPDATE_COMPOSANT': {
      const composants = state.composants.map((c) =>
        c.id === action.payload.id ? ({ ...c, ...action.payload.updates } as Organe | Piece) : c
      )
      return { ...state, composants }
    }

    case 'ADD_COMPOSANT':
      return { ...state, composants: [...state.composants, action.payload] }

    case 'ADD_COMPOSANTS':
      return { ...state, composants: [...state.composants, ...action.payload] }

    case 'ADD_CATEGORIE':
      return {
        ...state,
        categories: [...state.categories, { id: nextId(state.categories), libelle: action.payload }],
      }

    case 'DELETE_CATEGORIE':
      return { ...state, categories: state.categories.filter((c) => c.id !== action.payload) }

    case 'SUBMIT_OFFRE': {
      const { offre, entreprise } = action.payload
      return { ...state, offres: [...state.offres, offre], entreprises: [...state.entreprises, entreprise] }
    }

    case 'SHOW_TOAST':
      return { ...state, toasts: [...state.toasts, action.payload] }

    case 'DISMISS_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.payload) }

    default:
      return state
  }
}

// ─── Context value ────────────────────────────────────────────────────────────
interface AppContextValue {
  state: AppState
  login: (email: string, password: string) => { success: boolean; isAdmin: boolean }
  logout: () => void
  register: (nom: string, email: string, password: string) => void
  toggleFavori: (composantId: number) => void
  acheter: (composantId: number) => { success: boolean; message: string }
  accepterOffre: (offreId: number) => number | null
  rejeterOffre: (offreId: number) => void
  addEtape: (composantId: number, etape: Omit<EtapeTracabilite, 'id' | 'composantId'>) => void
  updateEtape: (etapeId: number, updates: Partial<EtapeTracabilite>) => void
  deleteEtape: (etapeId: number) => void
  reorderEtape: (etapeId: number, direction: 'up' | 'down') => void
  updateComposant: (id: number, updates: Partial<Composant>) => void
  addComposant: (composant: Omit<Organe | Piece, 'id'>) => number
  declarePieces: (parentOrganeId: number, pieces: Array<Omit<Piece, 'id' | 'typeComposant' | 'etatActuel' | 'parentOrganeId'>>) => void
  addCategorie: (libelle: string) => void
  deleteCategorie: (id: number) => void
  submitOffre: (
    offre: Omit<Offre, 'id' | 'statut' | 'dateOffre' | 'entrepriseId'>,
    entreprise: Omit<Entreprise, 'id'>
  ) => void
  showToast: (message: string, type?: 'success' | 'error') => void
  dismissToast: (id: number) => void
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

const today = () => new Date().toISOString().split('T')[0]

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  useEffect(() => {
    if (state.toasts.length === 0) return
    const latest = state.toasts[state.toasts.length - 1]
    const timer = setTimeout(() => dispatch({ type: 'DISMISS_TOAST', payload: latest.id }), 4000)
    return () => clearTimeout(timer)
  }, [state.toasts])

  const showToast = (message: string, type: 'success' | 'error' = 'success') =>
    dispatch({ type: 'SHOW_TOAST', payload: { id: Date.now() + Math.floor(performance.now()), message, type } })

  const login = (email: string, _password: string) => {
    if (email.trim().toLowerCase() === 'admin@reconditionnement.fr') {
      dispatch({ type: 'LOGIN_ADMIN', payload: adminUser })
      return { success: true, isAdmin: true }
    }
    dispatch({ type: 'LOGIN_CLIENT', payload: { ...currentClient, email } })
    return { success: true, isAdmin: false }
  }

  const logout = () => dispatch({ type: 'LOGOUT' })

  const register = (nom: string, email: string, _password: string) => {
    dispatch({ type: 'LOGIN_CLIENT', payload: { ...currentClient, nom, email, favoris: [], commandes: [] } })
  }

  const toggleFavori = (composantId: number) => dispatch({ type: 'TOGGLE_FAVORI', payload: composantId })

  // FR-14 transactional guard
  const acheter = (composantId: number): { success: boolean; message: string } => {
    if (!state.currentClient) return { success: false, message: 'Connectez-vous pour acheter.' }
    const composant = state.composants.find((c) => c.id === composantId)
    if (!composant || composant.etatActuel !== 'EN_VENTE') {
      return { success: false, message: 'Cet article vient d’être vendu.' }
    }
    const date = today()
    const commande: Commande = {
      id: nextId(state.commandes),
      clientId: state.currentClient.id,
      composantId,
      date,
      prix: composant.prix,
      statut: 'CONFIRMEE',
      dateFinGarantie: addMonths(date, composant.garantie),
    }
    dispatch({ type: 'ACHETER', payload: { commande } })
    return { success: true, message: 'Achat confirmé.' }
  }

  // FR-22: accept offer → create EN_RECONDITIONNEMENT composant pre-filled from offer
  const accepterOffre = (offreId: number): number | null => {
    const offre = state.offres.find((o) => o.id === offreId)
    if (!offre) return null
    const newId = nextId(state.composants)
    const base = {
      id: newId,
      nom: offre.designation,
      reference: offre.reference,
      marque: offre.marque,
      modele: offre.modele,
      categorieId: offre.categorieId,
      qualite: 'BON' as const,
      prix: 0,
      garantie: 12,
      images: offre.images,
      description: offre.description,
      etatActuel: 'EN_RECONDITIONNEMENT' as const,
    }
    const composant: Organe | Piece =
      offre.typePropose === 'ORGANE'
        ? ({ ...base, typeComposant: 'ORGANE', typeEquipement: '' } as Organe)
        : ({ ...base, typeComposant: 'PIECE', materiau: '', compatibilite: '' } as Piece)
    dispatch({
      type: 'ACCEPTER_OFFRE',
      payload: { offre: { ...offre, statut: 'ACCEPTEE', composantId: newId }, composant, etapes: [] },
    })
    return newId
  }

  const rejeterOffre = (offreId: number) => dispatch({ type: 'REJETER_OFFRE', payload: offreId })

  const addEtape = (composantId: number, etape: Omit<EtapeTracabilite, 'id' | 'composantId'>) => {
    dispatch({ type: 'ADD_ETAPE', payload: { ...etape, id: nextId(state.etapes), composantId } })
    // FR-33: terminal steps derive etatActuel
    if (etape.type === 'MISE_EN_VENTE') {
      dispatch({ type: 'UPDATE_COMPOSANT', payload: { id: composantId, updates: { etatActuel: 'EN_VENTE', datePublication: etape.date } } })
    } else if (etape.type === 'RECYCLAGE') {
      dispatch({ type: 'UPDATE_COMPOSANT', payload: { id: composantId, updates: { etatActuel: 'RECYCLE' } } })
    }
  }

  const updateEtape = (etapeId: number, updates: Partial<EtapeTracabilite>) =>
    dispatch({ type: 'UPDATE_ETAPE', payload: { id: etapeId, updates } })

  const deleteEtape = (etapeId: number) => dispatch({ type: 'DELETE_ETAPE', payload: etapeId })

  const reorderEtape = (etapeId: number, direction: 'up' | 'down') =>
    dispatch({ type: 'REORDER_ETAPE', payload: { id: etapeId, direction } })

  const updateComposant = (id: number, updates: Partial<Composant>) =>
    dispatch({ type: 'UPDATE_COMPOSANT', payload: { id, updates } })

  const addComposant = (composant: Omit<Organe | Piece, 'id'>): number => {
    const id = nextId(state.composants)
    dispatch({ type: 'ADD_COMPOSANT', payload: { ...composant, id } as Organe | Piece })
    return id
  }

  // FR-32: declare salvageable pieces at recycle decision
  const declarePieces = (
    parentOrganeId: number,
    pieces: Array<Omit<Piece, 'id' | 'typeComposant' | 'etatActuel' | 'parentOrganeId'>>
  ) => {
    const parent = state.composants.find((c) => c.id === parentOrganeId)
    let composantId = nextId(state.composants)
    let etapeId = nextId(state.etapes)
    const newComposants: Piece[] = []
    const newEtapes: EtapeTracabilite[] = []
    pieces.forEach((p) => {
      const id = composantId++
      newComposants.push({
        ...p,
        id,
        typeComposant: 'PIECE',
        etatActuel: 'EN_RECONDITIONNEMENT',
        parentOrganeId,
      } as Piece)
      newEtapes.push({
        id: etapeId++,
        composantId: id,
        type: 'NETTOYAGE',
        ordre: 1,
        date: today(),
        description: `Issue de la décomposition de ${parent?.nom ?? 'l’organe parent'}`,
      })
    })
    dispatch({ type: 'ADD_COMPOSANTS', payload: newComposants })
    dispatch({ type: 'ADD_ETAPES', payload: newEtapes })
  }

  const addCategorie = (libelle: string) => dispatch({ type: 'ADD_CATEGORIE', payload: libelle })
  const deleteCategorie = (id: number) => dispatch({ type: 'DELETE_CATEGORIE', payload: id })

  const submitOffre = (
    offre: Omit<Offre, 'id' | 'statut' | 'dateOffre' | 'entrepriseId'>,
    entreprise: Omit<Entreprise, 'id'>
  ) => {
    const entrepriseId = nextId(state.entreprises)
    const newEntreprise: Entreprise = { ...entreprise, id: entrepriseId }
    const newOffre: Offre = {
      ...offre,
      id: nextId(state.offres),
      statut: 'EN_ATTENTE',
      dateOffre: today(),
      entrepriseId,
    }
    dispatch({ type: 'SUBMIT_OFFRE', payload: { offre: newOffre, entreprise: newEntreprise } })
  }

  const dismissToast = (id: number) => dispatch({ type: 'DISMISS_TOAST', payload: id })

  const value: AppContextValue = {
    state,
    login,
    logout,
    register,
    toggleFavori,
    acheter,
    accepterOffre,
    rejeterOffre,
    addEtape,
    updateEtape,
    deleteEtape,
    reorderEtape,
    updateComposant,
    addComposant,
    declarePieces,
    addCategorie,
    deleteCategorie,
    submitOffre,
    showToast,
    dismissToast,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within an AppProvider')
  return context
}

export default AppContext
