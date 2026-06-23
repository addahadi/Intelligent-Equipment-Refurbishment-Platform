import type {
  Categorie,
  Entreprise,
  Organe,
  Piece,
  EtapeTracabilite,
  Offre,
  Commande,
  Client,
  Admin,
} from '../types'

const IMG = 'https://placehold.co/600x400/EEF1F2/6E7A80?text=Photo'

// ─── Categories (FR-25) ───────────────────────────────────────────────────────
export const mockCategories: Categorie[] = [
  { id: 1, libelle: 'Pompe hydraulique' },
  { id: 2, libelle: 'Moteur électrique' },
  { id: 3, libelle: 'Variateur de fréquence' },
  { id: 4, libelle: 'Capteur industriel' },
  { id: 5, libelle: 'Vanne pneumatique' },
  { id: 6, libelle: 'Compresseur' },
]

// ─── Entreprises (FR-18/19, non-deduplicated) ─────────────────────────────────
export const mockEntreprises: Entreprise[] = [
  { id: 1, nom: 'Maintenance Industrielle SA', contact: 'j.martin@mi-sa.fr', adresse: '12 rue des Ateliers, 69007 Lyon' },
  { id: 2, nom: 'TechnoServ Maintenance', contact: 'contact@technoserv.fr', adresse: '8 av. de l’Industrie, 59000 Lille' },
  { id: 3, nom: 'AtelierPro', contact: 'sav@atelierpro.fr', adresse: '23 chemin du Fort, 13015 Marseille' },
]

// ─── Composants (12 items across every state) ─────────────────────────────────
export const mockComposants: (Organe | Piece)[] = [
  // 6 EN_VENTE
  {
    id: 1, nom: 'Pompe hydraulique haute pression', reference: 'REF-2208-A', marque: 'ABB',
    modele: 'HP-450', categorieId: 1, typeComposant: 'ORGANE', typeEquipement: 'Pompe à pistons axiaux',
    qualite: 'TRES_BON', prix: 480, garantie: 12, images: [IMG, IMG],
    description: 'Pompe hydraulique reconditionnée, joints et pistons remplacés. Testée à 450 bar.',
    etatActuel: 'EN_VENTE', datePublication: '2026-06-10',
  } as Organe,
  {
    id: 2, nom: 'Moteur électrique triphasé', reference: 'REF-1042-M', marque: 'Siemens',
    modele: '1LA7-090', categorieId: 2, typeComposant: 'ORGANE', typeEquipement: 'Moteur asynchrone 4 kW',
    qualite: 'COMME_NEUF', prix: 720, garantie: 24, images: [IMG],
    description: 'Moteur asynchrone 4 kW, roulements neufs, bobinage vérifié et verni.',
    etatActuel: 'EN_VENTE', datePublication: '2026-06-12',
  } as Organe,
  {
    id: 3, nom: 'Variateur de fréquence 5,5 kW', reference: 'REF-3310-V', marque: 'Schneider',
    modele: 'ATV320', categorieId: 3, typeComposant: 'ORGANE', typeEquipement: 'Variateur 3x400V',
    qualite: 'BON', prix: 615, garantie: 12, images: [IMG],
    description: 'Variateur de vitesse 5,5 kW, condensateurs remplacés, firmware à jour.',
    etatActuel: 'EN_VENTE', datePublication: '2026-06-05',
  } as Organe,
  {
    id: 4, nom: 'Capteur de pression inductif', reference: 'REF-7781-C', marque: 'Festo',
    modele: 'SDE5', categorieId: 4, typeComposant: 'PIECE', materiau: 'Inox 316L',
    compatibilite: 'Réseaux pneumatiques 0–10 bar',
    qualite: 'TRES_BON', prix: 145, garantie: 6, images: [IMG],
    description: 'Capteur de pression nettoyé et recalibré, certificat d’étalonnage fourni.',
    etatActuel: 'EN_VENTE', datePublication: '2026-06-14',
  } as Piece,
  {
    id: 5, nom: 'Vanne pneumatique 5/2', reference: 'REF-5520-P', marque: 'Parker',
    modele: 'B3-Series', categorieId: 5, typeComposant: 'PIECE', materiau: 'Aluminium anodisé',
    compatibilite: 'Distributeurs ISO 15407-2',
    qualite: 'CORRECT', prix: 210, garantie: 6, images: [IMG],
    description: 'Distributeur 5/2 à commande électropneumatique, joints remplacés.',
    etatActuel: 'EN_VENTE', datePublication: '2026-06-01',
  } as Piece,
  {
    // salvaged piece from recycled organe (id=11)
    id: 6, nom: 'Roulement à billes étanche', reference: 'REF-9001-R', marque: 'SKF',
    modele: '6205-2RS', categorieId: 6, typeComposant: 'PIECE', materiau: 'Acier chromé',
    compatibilite: 'Arbres Ø25 mm', parentOrganeId: 11,
    qualite: 'BON', prix: 60, garantie: 6, images: [IMG],
    description: 'Roulement récupéré sur compresseur recyclé, nettoyé, testé, regraissé.',
    etatActuel: 'EN_VENTE', datePublication: '2026-06-15',
  } as Piece,

  // 2 EN_RECONDITIONNEMENT
  {
    id: 7, nom: 'Compresseur à vis 7,5 kW', reference: 'REF-6612-K', marque: 'Atlas Copco',
    modele: 'GA7', categorieId: 6, typeComposant: 'ORGANE', typeEquipement: 'Compresseur à vis',
    qualite: 'BON', prix: 1850, garantie: 12, images: [IMG],
    description: 'En cours de reconditionnement — diagnostic réalisé, réparation en cours.',
    etatActuel: 'EN_RECONDITIONNEMENT',
  } as Organe,
  {
    id: 8, nom: 'Moteur pas à pas NEMA 34', reference: 'REF-4420-S', marque: 'Siemens',
    modele: 'ST-340', categorieId: 2, typeComposant: 'PIECE', materiau: 'Acier / aluminium',
    compatibilite: 'Commandes CNC standard',
    qualite: 'CORRECT', prix: 95, garantie: 6, images: [IMG],
    description: 'Reçu d’une offre acceptée — nettoyage effectué, diagnostic à venir.',
    etatActuel: 'EN_RECONDITIONNEMENT',
  } as Piece,

  // 2 VENDU
  {
    id: 9, nom: 'Pompe centrifuge 2,2 kW', reference: 'REF-1190-A', marque: 'Grundfos',
    modele: 'CR3', categorieId: 1, typeComposant: 'ORGANE', typeEquipement: 'Pompe centrifuge',
    qualite: 'TRES_BON', prix: 390, garantie: 12, images: [IMG],
    description: 'Pompe centrifuge reconditionnée, garniture mécanique neuve.',
    etatActuel: 'VENDU', datePublication: '2026-04-20',
  } as Organe,
  {
    id: 10, nom: 'Capteur de température PT100', reference: 'REF-8830-C', marque: 'Endress+Hauser',
    modele: 'TR10', categorieId: 4, typeComposant: 'PIECE', materiau: 'Inox 316',
    compatibilite: 'Boucles 4–20 mA',
    qualite: 'COMME_NEUF', prix: 130, garantie: 12, images: [IMG],
    description: 'Sonde PT100 recalibrée, certificat fourni.',
    etatActuel: 'VENDU', datePublication: '2026-03-15',
  } as Piece,

  // 1 RECYCLE (organe — parent of piece id=6)
  {
    id: 11, nom: 'Compresseur à piston (HS)', reference: 'REF-7700-K', marque: 'Atlas Copco',
    modele: 'LE7', categorieId: 6, typeComposant: 'ORGANE', typeEquipement: 'Compresseur à piston',
    qualite: 'CORRECT', prix: 0, garantie: 0, images: [IMG],
    description: 'Carter fissuré — diagnostic Endommagé. Recyclé ; pièces récupérables déclarées.',
    etatActuel: 'RECYCLE',
  } as Organe,

  // 1 extra EN_VENTE for richer catalog
  {
    id: 12, nom: 'Servomoteur brushless 750 W', reference: 'REF-2255-M', marque: 'Bosch Rexroth',
    modele: 'MSK040', categorieId: 2, typeComposant: 'ORGANE', typeEquipement: 'Servomoteur',
    qualite: 'TRES_BON', prix: 540, garantie: 18, images: [IMG],
    description: 'Servomoteur AC, codeur testé, frein vérifié.',
    etatActuel: 'EN_VENTE', datePublication: '2026-06-16',
  } as Organe,
]

// ─── Etapes de traçabilité ────────────────────────────────────────────────────
export const mockEtapes: EtapeTracabilite[] = [
  // id=1 organe réparable : full pipeline
  { id: 1, composantId: 1, type: 'DECOMPOSITION', ordre: 1, date: '2026-03-02', description: 'Démontage complet, inventaire des sous-ensembles.' },
  { id: 2, composantId: 1, type: 'NETTOYAGE', ordre: 2, date: '2026-03-04', description: 'Nettoyage ultrasons et dégraissage.' },
  { id: 3, composantId: 1, type: 'DIAGNOSTIC', ordre: 3, date: '2026-03-06', description: 'Verdict : Réparable. Usure des joints, pistons réutilisables.' },
  { id: 4, composantId: 1, type: 'REPARATION', ordre: 4, date: '2026-03-08', description: 'Remplacement des joints et de la garniture.' },
  { id: 5, composantId: 1, type: 'COMPOSITION', ordre: 5, date: '2026-03-09', description: 'Remontage et réglage du jeu fonctionnel.' },
  { id: 6, composantId: 1, type: 'TEST', ordre: 6, date: '2026-03-10', description: 'Test en charge à 450 bar — conforme.' },
  { id: 7, composantId: 1, type: 'MISE_EN_VENTE', ordre: 7, date: '2026-06-10', description: 'Publication au catalogue.' },

  // id=4 piece directe : nettoyage → diagnostic → test → mise en vente
  { id: 8, composantId: 4, type: 'NETTOYAGE', ordre: 1, date: '2026-06-08', description: 'Nettoyage et inspection visuelle.' },
  { id: 9, composantId: 4, type: 'DIAGNOSTIC', ordre: 2, date: '2026-06-09', description: 'Verdict : Réparable. Membrane intacte.' },
  { id: 10, composantId: 4, type: 'TEST', ordre: 3, date: '2026-06-13', description: 'Recalibrage et test d’étanchéité.' },
  { id: 11, composantId: 4, type: 'MISE_EN_VENTE', ordre: 4, date: '2026-06-14', description: 'Publication au catalogue.' },

  // id=6 salvaged piece : provenance first node + pipeline
  { id: 12, composantId: 6, type: 'NETTOYAGE', ordre: 1, date: '2026-06-11', description: 'Nettoyage et regraissage.' },
  { id: 13, composantId: 6, type: 'DIAGNOSTIC', ordre: 2, date: '2026-06-12', description: 'Verdict : Réparable. Jeu radial dans la tolérance.' },
  { id: 14, composantId: 6, type: 'TEST', ordre: 3, date: '2026-06-14', description: 'Test de rotation et de charge.' },
  { id: 15, composantId: 6, type: 'MISE_EN_VENTE', ordre: 4, date: '2026-06-15', description: 'Publication au catalogue.' },

  // id=7 organe en reconditionnement : partial
  { id: 16, composantId: 7, type: 'DECOMPOSITION', ordre: 1, date: '2026-06-08', description: 'Démontage du bloc vis.' },
  { id: 17, composantId: 7, type: 'NETTOYAGE', ordre: 2, date: '2026-06-10', description: 'Nettoyage des rotors.' },
  { id: 18, composantId: 7, type: 'DIAGNOSTIC', ordre: 3, date: '2026-06-12', description: 'Verdict : Réparable. Remplacement des paliers nécessaire.' },

  // id=8 piece en reconditionnement : partial
  { id: 19, composantId: 8, type: 'NETTOYAGE', ordre: 1, date: '2026-06-15', description: 'Nettoyage du stator.' },

  // id=9 vendu : kept full for proof (NFR-03)
  { id: 20, composantId: 9, type: 'NETTOYAGE', ordre: 1, date: '2026-04-10', description: 'Nettoyage corps de pompe.' },
  { id: 21, composantId: 9, type: 'DIAGNOSTIC', ordre: 2, date: '2026-04-12', description: 'Verdict : Réparable.' },
  { id: 22, composantId: 9, type: 'REPARATION', ordre: 3, date: '2026-04-15', description: 'Garniture mécanique neuve.' },
  { id: 23, composantId: 9, type: 'TEST', ordre: 4, date: '2026-04-18', description: 'Test débit/pression conforme.' },
  { id: 24, composantId: 9, type: 'MISE_EN_VENTE', ordre: 5, date: '2026-04-20', description: 'Publication au catalogue.' },

  // id=11 recycled organe : through RECYCLAGE
  { id: 25, composantId: 11, type: 'DECOMPOSITION', ordre: 1, date: '2026-05-20', description: 'Démontage pour inspection.' },
  { id: 26, composantId: 11, type: 'NETTOYAGE', ordre: 2, date: '2026-05-22', description: 'Nettoyage avant diagnostic.' },
  { id: 27, composantId: 11, type: 'DIAGNOSTIC', ordre: 3, date: '2026-05-24', description: 'Verdict : Endommagé. Carter fissuré, irréparable.' },
  { id: 28, composantId: 11, type: 'RECYCLAGE', ordre: 4, date: '2026-05-26', description: 'Mise au rebut du corps. Pièces récupérables déclarées.' },
]

// ─── Offres (FR-18) ───────────────────────────────────────────────────────────
export const mockOffres: Offre[] = [
  {
    id: 1, designation: 'Lot pompe hydraulique usagée', typePropose: 'ORGANE', marque: 'Bosch Rexroth',
    modele: 'A10VSO', reference: 'OFR-001', categorieId: 1, etatDeclare: 'PARTIELLEMENT_FONCTIONNEL',
    prixPropose: 200, quantite: 3, description: 'Fuite constatée côté distributeur.', images: [IMG],
    dateOffre: '2026-06-16', statut: 'EN_ATTENTE', entrepriseId: 1,
  },
  {
    id: 2, designation: 'Capteur de niveau radar', typePropose: 'PIECE', marque: 'Vega',
    modele: 'VEGAPULS', reference: 'OFR-002', categorieId: 4, etatDeclare: 'FONCTIONNEL',
    prixPropose: 90, quantite: 1, description: 'Déposé lors d’une rénovation, fonctionnel.', images: [IMG],
    dateOffre: '2026-06-17', statut: 'EN_ATTENTE', entrepriseId: 2,
  },
  {
    id: 3, designation: 'Moteur pas à pas', typePropose: 'PIECE', marque: 'Siemens',
    modele: 'ST-340', reference: 'OFR-003', categorieId: 2, etatDeclare: 'PARTIELLEMENT_FONCTIONNEL',
    prixPropose: 40, quantite: 5, quantiteAcceptee: 5, description: 'Bruit anormal au démarrage.', images: [IMG],
    dateOffre: '2026-06-02', statut: 'ACCEPTEE', entrepriseId: 3, composantId: 8,
  },
  {
    id: 4, designation: 'Vérin pneumatique grippé', typePropose: 'PIECE', marque: 'SMC',
    modele: 'CDQ2', reference: 'OFR-004', categorieId: 5, etatDeclare: 'DEFECTUEUX',
    prixPropose: 25, quantite: 2, description: 'Tige rayée, joint HS.', images: [IMG],
    dateOffre: '2026-05-28', statut: 'REJETEE', entrepriseId: 1,
  },
  {
    id: 5, designation: 'Variateur ABB 11 kW', typePropose: 'ORGANE', marque: 'ABB',
    modele: 'ACS580', reference: 'OFR-005', categorieId: 3, etatDeclare: 'FONCTIONNEL',
    prixPropose: 300, quantite: 1, description: 'Remplacé pour montée en puissance.', images: [IMG],
    dateOffre: '2026-06-18', statut: 'EN_ATTENTE', entrepriseId: 2,
  },
]

// ─── Commandes (FR-13/16, BR-10) ──────────────────────────────────────────────
export const mockCommandes: Commande[] = [
  // active warranty (purchased recently)
  { id: 1, clientId: 1, composantId: 9, date: '2026-05-15', prix: 390, statut: 'CONFIRMEE', dateFinGarantie: '2027-05-15' },
  // expired warranty (purchased long ago)
  { id: 2, clientId: 1, composantId: 10, date: '2025-02-10', prix: 130, statut: 'CONFIRMEE', dateFinGarantie: '2026-02-10' },
]

// ─── Users ────────────────────────────────────────────────────────────────────
export const currentClient: Client = {
  id: 1,
  nom: 'Lefebvre',
  prenom: 'Marie',
  email: 'marie@example.com',
  telephone: '06 12 34 56 78',
  adresse: '5 rue Victor Hugo, 75011 Paris',
  favoris: [1, 2, 9],
  commandes: [1, 2],
}

export const adminUser: Admin = {
  id: 1,
  nom: 'Administrateur',
  email: 'admin@reconditionnement.fr',
}
