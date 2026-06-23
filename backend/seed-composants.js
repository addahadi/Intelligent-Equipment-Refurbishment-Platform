/**
 * Seed a realistic catalog of refurbished industrial components (organes & pièces)
 * with REAL, freely-licensed photos sourced from Wikimedia Commons and re-hosted
 * on the project's own Cloudinary (so the catalog never depends on hot-links).
 *
 * Idempotent: keyed on `reference`. Re-running skips composants that already exist
 * and only fetches images for items it actually needs to insert.
 *
 *   node seed-composants.js
 */
import sql from './config/database.js';
import cloudinary from './config/cloudinary.js';

const UA = 'SahAnalytics-Seed/1.0 (youcef.missoum@sahanalytics.com)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Categories (bilingual FR/AR) — ensured, then resolved to ids by key ──────
const CATEGORIES = {
  moteur:    { fr: 'Moteur électrique',     ar: 'محرك كهربائي' },
  pompe_h:   { fr: 'Pompe hydraulique',     ar: 'مضخة هيدروليكية' },
  pompe:     { fr: 'Pompe',                 ar: 'مضخة' },
  variateur: { fr: 'Variateur de fréquence', ar: 'مغير التردد' },
  capteur:   { fr: 'Capteur industriel',    ar: 'مستشعر صناعي' },
  vanne:     { fr: 'Vanne pneumatique',     ar: 'صمام هوائي' },
  compresseur: { fr: 'Compresseur',         ar: 'ضاغط هواء' },
  roulement: { fr: 'Roulement',             ar: 'محمل' },
  carte:     { fr: 'Carte électronique',    ar: 'بطاقة إلكترونية' },
};

// ─── Image topics → Wikimedia Commons search terms. Fetched once, cached. ─────
const IMAGE_TOPICS = {
  motor_async: 'electric motor industrial three phase',
  servo:       'servo motor drive',
  pump_hyd:    'hydraulic pump',
  pump_cent:   'centrifugal pump',
  vfd:         'variable frequency drive inverter',
  screw_comp:  'rotary screw air compressor',
  piston_comp: 'reciprocating piston air compressor',
  bearing:     'ball bearing',
  pressure:    'pressure sensor transmitter',
  valve:       'pneumatic solenoid valve',
  rtd:         'temperature sensor probe industrial',
  pcb:         'printed circuit board electronics',
};

// ─── Catalog ──────────────────────────────────────────────────────────────────
// prix in DZD-agnostic numeric; garantie in months. dates as YYYY-MM-DD.
const ITEMS = [
  // ---- ORGANES ----
  {
    ref: 'RC-MOT-4000', type: 'ORGANE', topic: 'motor_async', cat: 'moteur',
    nom_fr: 'Moteur asynchrone triphasé 4 kW', nom_ar: 'محرك غير متزامن ثلاثي الطور 4 كيلوواط',
    marque: 'Siemens', modele: '1LA7 096-4AA',
    type_equipement_fr: 'Moteur asynchrone 4 kW – 1500 tr/min',
    type_equipement_ar: 'محرك غير متزامن 4 كيلوواط – 1500 دورة/دقيقة',
    qualite: 'COMME_NEUF', prix: 720, garantie: 24, etat: 'EN_VENTE', pub: '2026-06-12',
    desc_fr: 'Moteur asynchrone 4 kW reconditionné : roulements neufs, bobinage contrôlé et reverni, peinture refaite. Testé en charge.',
    desc_ar: 'محرك غير متزامن 4 كيلوواط مُجدّد: محامل جديدة، فحص اللف وإعادة الطلاء، اختبار تحت الحمل.',
  },
  {
    ref: 'RC-POM-0480', type: 'ORGANE', topic: 'pump_hyd', cat: 'pompe_h',
    nom_fr: 'Pompe hydraulique à pistons axiaux', nom_ar: 'مضخة هيدروليكية ذات مكابس محورية',
    marque: 'Bosch Rexroth', modele: 'A10VSO 45',
    type_equipement_fr: 'Pompe à pistons axiaux – 450 bar',
    type_equipement_ar: 'مضخة ذات مكابس محورية – 450 بار',
    qualite: 'TRES_BON', prix: 480, garantie: 12, etat: 'EN_VENTE', pub: '2026-06-10',
    desc_fr: 'Pompe hydraulique haute pression reconditionnée : joints et plateau de distribution remplacés, pistons réutilisés. Testée à 450 bar.',
    desc_ar: 'مضخة هيدروليكية عالية الضغط مُجدّدة: استبدال الحشيات ولوحة التوزيع، اختبار عند 450 بار.',
  },
  {
    ref: 'RC-VAR-5500', type: 'ORGANE', topic: 'vfd', cat: 'variateur',
    nom_fr: 'Variateur de fréquence 5,5 kW', nom_ar: 'مغير التردد 5.5 كيلوواط',
    marque: 'Schneider Electric', modele: 'ATV320 U55N4',
    type_equipement_fr: 'Variateur de vitesse 3×400 V – 5,5 kW',
    type_equipement_ar: 'مغير سرعة 3×400 فولت – 5.5 كيلوواط',
    qualite: 'BON', prix: 615, garantie: 12, etat: 'EN_VENTE', pub: '2026-06-05',
    desc_fr: 'Variateur de vitesse 5,5 kW : condensateurs de puissance remplacés, ventilateur neuf, firmware mis à jour. Testé sur banc.',
    desc_ar: 'مغير سرعة 5.5 كيلوواط: استبدال المكثفات والمروحة، تحديث البرنامج، اختبار على المنصة.',
  },
  {
    ref: 'RC-SRV-0750', type: 'ORGANE', topic: 'servo', cat: 'moteur',
    nom_fr: 'Servomoteur brushless 750 W', nom_ar: 'محرك سيرفو بدون فرشاة 750 واط',
    marque: 'Bosch Rexroth', modele: 'MSK040C',
    type_equipement_fr: 'Servomoteur AC avec codeur absolu',
    type_equipement_ar: 'محرك سيرفو تيار متردد مع مشفّر مطلق',
    qualite: 'TRES_BON', prix: 540, garantie: 18, etat: 'EN_VENTE', pub: '2026-06-16',
    desc_fr: 'Servomoteur AC 750 W : codeur absolu testé, frein de maintien vérifié, étanchéité contrôlée.',
    desc_ar: 'محرك سيرفو 750 واط: فحص المشفّر المطلق ومكبح التثبيت والإحكام.',
  },
  {
    ref: 'RC-CMP-7500', type: 'ORGANE', topic: 'screw_comp', cat: 'compresseur',
    nom_fr: 'Compresseur à vis 7,5 kW', nom_ar: 'ضاغط لولبي 7.5 كيلوواط',
    marque: 'Atlas Copco', modele: 'GA7',
    type_equipement_fr: 'Compresseur à vis lubrifié – 7,5 kW',
    type_equipement_ar: 'ضاغط لولبي مزيّت – 7.5 كيلوواط',
    qualite: 'BON', prix: 1850, garantie: 12, etat: 'EN_RECONDITIONNEMENT', pub: null,
    desc_fr: 'En cours de reconditionnement : diagnostic réalisé, remplacement des paliers et du séparateur d’huile en cours.',
    desc_ar: 'قيد التجديد: تم التشخيص، استبدال المحامل وفاصل الزيت جارٍ.',
  },
  {
    ref: 'RC-POM-0390', type: 'ORGANE', topic: 'pump_cent', cat: 'pompe',
    nom_fr: 'Pompe centrifuge 2,2 kW', nom_ar: 'مضخة طرد مركزي 2.2 كيلوواط',
    marque: 'Grundfos', modele: 'CR3-15',
    type_equipement_fr: 'Pompe centrifuge multicellulaire inox',
    type_equipement_ar: 'مضخة طرد مركزي متعددة المراحل من الفولاذ المقاوم',
    qualite: 'TRES_BON', prix: 390, garantie: 12, etat: 'VENDU', pub: '2026-04-20',
    desc_fr: 'Pompe centrifuge inox reconditionnée : garniture mécanique neuve, roues contrôlées, test débit/pression conforme.',
    desc_ar: 'مضخة طرد مركزي مُجدّدة: حشوة ميكانيكية جديدة، فحص الدوّارات واختبار التدفق/الضغط.',
  },
  {
    ref: 'RC-CMP-0000', type: 'ORGANE', topic: 'piston_comp', cat: 'compresseur',
    nom_fr: 'Compresseur à piston (hors service)', nom_ar: 'ضاغط مكبسي (خارج الخدمة)',
    marque: 'Atlas Copco', modele: 'LE7',
    type_equipement_fr: 'Compresseur à piston bi-étagé',
    type_equipement_ar: 'ضاغط مكبسي ثنائي المرحلة',
    qualite: 'CORRECT', prix: 0, garantie: 0, etat: 'RECYCLE', pub: null,
    desc_fr: 'Carter fissuré — diagnostic « endommagé », irréparable. Recyclé ; pièces récupérables déclarées (roulements, clapets).',
    desc_ar: 'هيكل متصدّع — تشخيص «تالف» غير قابل للإصلاح. أُعيد تدويره؛ قطع قابلة للاسترجاع.',
    isParentRecycle: true,
  },

  // ---- PIECES ----
  {
    ref: 'RC-ROU-6205', type: 'PIECE', topic: 'bearing', cat: 'roulement',
    nom_fr: 'Roulement à billes étanche 6205-2RS', nom_ar: 'محمل كروي محكم 6205-2RS',
    marque: 'SKF', modele: '6205-2RS1',
    materiau_fr: 'Acier chromé, joints caoutchouc', materiau_ar: 'فولاذ كروم، حشيات مطاطية',
    compatibilite_fr: 'Arbres Ø25 mm', compatibilite_ar: 'أعمدة قطر 25 مم',
    qualite: 'BON', prix: 60, garantie: 6, etat: 'EN_VENTE', pub: '2026-06-15',
    desc_fr: 'Roulement récupéré sur compresseur recyclé, nettoyé, contrôlé au jeu radial, regraissé.',
    desc_ar: 'محمل مُسترجَع من ضاغط معاد تدويره، تنظيف وفحص الخلوص وإعادة التشحيم.',
    parentRef: 'RC-CMP-0000',
  },
  {
    ref: 'RC-CAP-7781', type: 'PIECE', topic: 'pressure', cat: 'capteur',
    nom_fr: 'Capteur de pression industriel', nom_ar: 'مستشعر ضغط صناعي',
    marque: 'Festo', modele: 'SDE5',
    materiau_fr: 'Inox 316L', materiau_ar: 'فولاذ مقاوم 316L',
    compatibilite_fr: 'Réseaux pneumatiques 0–10 bar', compatibilite_ar: 'شبكات هوائية 0–10 بار',
    qualite: 'TRES_BON', prix: 145, garantie: 6, etat: 'EN_VENTE', pub: '2026-06-14',
    desc_fr: 'Capteur de pression nettoyé et recalibré, sortie 4–20 mA vérifiée, certificat d’étalonnage fourni.',
    desc_ar: 'مستشعر ضغط مُنظَّف ومعاد معايرته، فحص الخرج 4–20 مللي أمبير مع شهادة معايرة.',
  },
  {
    ref: 'RC-VAN-5520', type: 'PIECE', topic: 'valve', cat: 'vanne',
    nom_fr: 'Distributeur pneumatique 5/2', nom_ar: 'موزّع هوائي 5/2',
    marque: 'Parker', modele: 'B3 Series',
    materiau_fr: 'Aluminium anodisé', materiau_ar: 'ألمنيوم مؤكسد',
    compatibilite_fr: 'Embases ISO 15407-2', compatibilite_ar: 'قواعد ISO 15407-2',
    qualite: 'CORRECT', prix: 210, garantie: 6, etat: 'EN_VENTE', pub: '2026-06-01',
    desc_fr: 'Distributeur 5/2 à commande électropneumatique : joints remplacés, test d’étanchéité et de commutation conforme.',
    desc_ar: 'موزّع 5/2 بتحكّم كهربائي هوائي: استبدال الحشيات واختبار الإحكام والتبديل.',
  },
  {
    ref: 'RC-CAP-8830', type: 'PIECE', topic: 'rtd', cat: 'capteur',
    nom_fr: 'Sonde de température PT100', nom_ar: 'مجس حرارة PT100',
    marque: 'Endress+Hauser', modele: 'TR10',
    materiau_fr: 'Inox 316', materiau_ar: 'فولاذ مقاوم 316',
    compatibilite_fr: 'Boucles 4–20 mA', compatibilite_ar: 'حلقات 4–20 مللي أمبير',
    qualite: 'COMME_NEUF', prix: 130, garantie: 12, etat: 'VENDU', pub: '2026-03-15',
    desc_fr: 'Sonde PT100 recalibrée sur banc, certificat d’étalonnage fourni.',
    desc_ar: 'مجس PT100 معاد معايرته على المنصة مع شهادة معايرة.',
  },
  {
    ref: 'RC-CAR-1020', type: 'PIECE', topic: 'pcb', cat: 'carte',
    nom_fr: 'Carte électronique de commande', nom_ar: 'بطاقة تحكّم إلكترونية',
    marque: 'Schneider Electric', modele: 'VW3A3',
    materiau_fr: 'Circuit imprimé FR4', materiau_ar: 'دارة مطبوعة FR4',
    compatibilite_fr: 'Variateurs Altivar série 320', compatibilite_ar: 'مغيرات Altivar سلسلة 320',
    qualite: 'BON', prix: 175, garantie: 6, etat: 'EN_VENTE', pub: '2026-06-08',
    desc_fr: 'Carte de commande révisée : condensateurs remplacés, soudures reprises, test fonctionnel sur banc.',
    desc_ar: 'بطاقة تحكّم مُراجَعة: استبدال المكثفات وإعادة اللحام واختبار وظيفي.',
  },
];

// ─── Traceability pipelines per state (FR descriptions; bilingual where useful) ─
function pipelineFor(item) {
  const p = item.pub || '2026-06-01';
  const sold = item.etat === 'VENDU';
  const recycle = item.etat === 'RECYCLE';
  const inRecond = item.etat === 'EN_RECONDITIONNEMENT';
  const salvaged = !!item.parentRef;

  const steps = [];
  let o = 1;
  const add = (type, date, fr, ar) => steps.push({ type, ordre: o++, date, fr, ar });

  if (salvaged) {
    add('NETTOYAGE', '2026-06-11', 'Issue de la décomposition d’un compresseur recyclé. Nettoyage et regraissage.', null);
    add('DIAGNOSTIC', '2026-06-12', 'Verdict : Réparable. Jeu radial dans la tolérance.', null);
    add('TEST', '2026-06-13', 'Test de rotation et de charge.', null);
    add('MISE_EN_VENTE', p, 'Publication au catalogue.', null);
    return steps;
  }
  if (recycle) {
    add('DECOMPOSITION', '2026-05-20', 'Démontage pour inspection.', null);
    add('NETTOYAGE', '2026-05-22', 'Nettoyage avant diagnostic.', null);
    add('DIAGNOSTIC', '2026-05-24', 'Verdict : Endommagé. Carter fissuré, irréparable.', null);
    add('RECYCLAGE', '2026-05-26', 'Mise au rebut du corps. Pièces récupérables déclarées.', null);
    return steps;
  }
  if (inRecond) {
    add('DECOMPOSITION', '2026-06-08', 'Démontage des sous-ensembles.', null);
    add('NETTOYAGE', '2026-06-10', 'Nettoyage et dégraissage.', null);
    add('DIAGNOSTIC', '2026-06-12', 'Verdict : Réparable. Remplacement des paliers nécessaire.', null);
    return steps;
  }

  // EN_VENTE / VENDU → full pipeline
  if (item.type === 'ORGANE') {
    add('DECOMPOSITION', '2026-03-02', 'Démontage complet, inventaire des sous-ensembles.', null);
    add('NETTOYAGE', '2026-03-04', 'Nettoyage ultrasons et dégraissage.', null);
    add('DIAGNOSTIC', '2026-03-06', 'Verdict : Réparable. Usure normale, pièces réutilisables.', null);
    add('REPARATION', '2026-03-08', 'Remplacement des consommables (joints, roulements).', null);
    add('COMPOSITION', '2026-03-09', 'Remontage et réglage du jeu fonctionnel.', null);
    add('TEST', '2026-03-10', 'Test en charge — conforme aux spécifications.', null);
    add('MISE_EN_VENTE', p, sold ? 'Publication au catalogue.' : 'Publication au catalogue.', null);
  } else {
    add('NETTOYAGE', '2026-06-08', 'Nettoyage et inspection visuelle.', null);
    add('DIAGNOSTIC', '2026-06-09', 'Verdict : Réparable.', null);
    add('TEST', '2026-06-13', 'Recalibrage / test fonctionnel.', null);
    add('MISE_EN_VENTE', p, 'Publication au catalogue.', null);
  }
  return steps;
}

// ─── Wikimedia → Cloudinary image sourcing ────────────────────────────────────
async function searchCommons(term, limit = 4) {
  const u = new URL('https://commons.wikimedia.org/w/api.php');
  u.search = new URLSearchParams({
    action: 'query', format: 'json', generator: 'search',
    gsrnamespace: '6', gsrlimit: String(limit), gsrsearch: `${term} -filetype:svg`,
    prop: 'imageinfo', iiprop: 'url|mime|size', iiurlwidth: '1000',
  }).toString();
  const res = await fetch(u, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Commons search ${res.status}`);
  const json = await res.json();
  const pages = Object.values(json.query?.pages || {});
  return pages
    .map((p) => p.imageinfo?.[0])
    .filter((ii) => ii && /image\/(jpeg|png)/.test(ii.mime) && (ii.thumburl || ii.url))
    .map((ii) => ii.thumburl || ii.url);
}

async function toCloudinary(imgUrl, publicHint) {
  const res = await fetch(imgUrl, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`download ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'reconditionnement/seed', resource_type: 'image' },
      (err, r) => (err ? reject(err) : resolve(r.secure_url)),
    );
    stream.end(buf);
  });
}

const topicCache = new Map();
async function imagesForTopic(topicKey) {
  if (topicCache.has(topicKey)) return topicCache.get(topicKey);
  const term = IMAGE_TOPICS[topicKey];
  let urls = [];
  try {
    const candidates = await searchCommons(term, 4);
    for (const c of candidates) {
      if (urls.length >= 2) break;
      try {
        urls.push(await toCloudinary(c, topicKey));
      } catch (e) {
        // Cloudinary failed for this one → keep the real Commons URL as fallback.
        urls.push(c);
      }
    }
    await sleep(400); // be polite to the Commons API
  } catch (e) {
    console.warn(`  ! image search failed for "${term}": ${e.message}`);
  }
  if (!urls.length) urls = ['https://placehold.co/1000x750/EEF1F2/6E7A80?text=Photo'];
  topicCache.set(topicKey, urls);
  return urls;
}

// ─── Category resolution ──────────────────────────────────────────────────────
async function ensureCategories() {
  const map = {};
  for (const [key, c] of Object.entries(CATEGORIES)) {
    const [existing] = await sql`select id from categorie where libelle_fr = ${c.fr}`;
    if (existing) {
      map[key] = Number(existing.id);
    } else {
      const [row] = await sql`
        insert into categorie (libelle_fr, libelle_ar) values (${c.fr}, ${c.ar}) returning id`;
      map[key] = Number(row.id);
      console.log(`Categorie créée : ${c.fr}`);
    }
  }
  return map;
}

// ─── Insert one composant (idempotent on reference) ───────────────────────────
async function insertComposant(item, catMap, parentIds) {
  const [exists] = await sql`select id from composant where reference = ${item.ref}`;
  if (exists) {
    console.log(`  = ${item.ref} déjà présent (#${exists.id}) — ignoré.`);
    parentIds.set(item.ref, Number(exists.id));
    return Number(exists.id);
  }

  const images = await imagesForTopic(item.topic);

  const cols = {
    type_composant: item.type,
    nom_fr: item.nom_fr,
    nom_ar: item.nom_ar ?? null,
    reference: item.ref,
    marque: item.marque ?? null,
    modele: item.modele ?? null,
    categorie_id: catMap[item.cat] ?? null,
    qualite: item.qualite ?? null,
    prix: item.prix,
    garantie: item.garantie ?? 0,
    images,
    description_fr: item.desc_fr ?? null,
    description_ar: item.desc_ar ?? null,
    etat_actuel: item.etat,
    date_publication: item.pub ?? null,
    organe_parent_id: item.parentRef ? (parentIds.get(item.parentRef) ?? null) : null,
  };
  if (item.type === 'ORGANE') {
    cols.type_equipement_fr = item.type_equipement_fr ?? null;
    cols.type_equipement_ar = item.type_equipement_ar ?? null;
  } else {
    cols.materiau_fr = item.materiau_fr ?? null;
    cols.materiau_ar = item.materiau_ar ?? null;
    cols.compatibilite_fr = item.compatibilite_fr ?? null;
    cols.compatibilite_ar = item.compatibilite_ar ?? null;
  }

  const [row] = await sql`insert into composant ${sql(cols)} returning id`;
  const id = Number(row.id);
  parentIds.set(item.ref, id);

  // Traceability timeline (skip if somehow already present).
  const steps = pipelineFor(item);
  for (const s of steps) {
    await sql`
      insert into etape_tracabilite (composant_id, type, ordre, date, description_fr, description_ar)
      values (${id}, ${s.type}, ${s.ordre}, ${s.date}, ${s.fr}, ${s.ar})
      on conflict (composant_id, ordre) do nothing`;
  }
  console.log(`  + ${item.ref} → #${id} [${item.type}] "${item.nom_fr}" (${images.length} img, ${steps.length} étapes)`);
  return id;
}

// ─── Run ──────────────────────────────────────────────────────────────────────
try {
  console.log('Ensuring categories…');
  const catMap = await ensureCategories();

  console.log('Seeding composants (organes & pièces) with real images…');
  const parentIds = new Map();
  // Insert parents (organes incl. the recycled one) first so salvaged pieces can link.
  for (const item of ITEMS) await insertComposant(item, catMap, parentIds);

  const [{ n }] = await sql`select count(*)::int as n from composant`;
  console.log(`\nSeed terminé. Total composants en base : ${n}.`);
} catch (err) {
  console.error('Seed failed:', err);
  process.exitCode = 1;
} finally {
  await sql.end();
}
