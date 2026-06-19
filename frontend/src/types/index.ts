// Enums
export type TypeComposant = 'ORGANE' | 'PIECE'
export type EtatComposant = 'EN_RECONDITIONNEMENT' | 'EN_VENTE' | 'VENDU' | 'RECYCLE'
export type QualiteEtat = 'COMME_NEUF' | 'TRES_BON' | 'BON' | 'CORRECT'
export type StatutOffre = 'EN_ATTENTE' | 'ACCEPTEE' | 'REJETEE'
export type EtatDeclare = 'FONCTIONNEL' | 'PARTIELLEMENT_FONCTIONNEL' | 'DEFECTUEUX'
export type TypeEtape = 'DECOMPOSITION' | 'NETTOYAGE' | 'DIAGNOSTIC' | 'REPARATION' | 'COMPOSITION' | 'TEST' | 'MISE_EN_VENTE' | 'RECYCLAGE'
export type StatutCommande = 'SIMULEE' | 'CONFIRMEE'

// Interfaces
export interface Categorie { id: number; libelle: string }
export interface Entreprise { id: number; nom: string; contact: string; adresse: string }
export interface EtapeTracabilite { id: number; composantId: number; type: TypeEtape; ordre: number; date: string; description: string }
export interface Composant { id: number; nom: string; reference: string; marque: string; modele: string; categorieId: number; typeComposant: TypeComposant; qualite: QualiteEtat; prix: number; garantie: number; images: string[]; description?: string; etatActuel: EtatComposant; datePublication?: string; parentOrganeId?: number }
export interface Organe extends Composant { typeComposant: 'ORGANE'; typeEquipement: string }
export interface Piece extends Composant { typeComposant: 'PIECE'; materiau?: string; compatibilite?: string }
export interface Offre { id: number; designation: string; typePropose: TypeComposant; marque: string; modele: string; reference: string; categorieId: number; etatDeclare: EtatDeclare; prixPropose: number; description?: string; images: string[]; dateOffre: string; statut: StatutOffre; entrepriseId: number; composantId?: number }
export interface Commande { id: number; clientId: number; composantId: number; date: string; prix: number; statut: StatutCommande; dateFinGarantie: string }
export interface Client { id: number; nom: string; prenom?: string; email: string; telephone?: string; adresse?: string; favoris: number[]; commandes: number[] }
export interface Admin { id: number; nom: string; prenom?: string; email: string }
