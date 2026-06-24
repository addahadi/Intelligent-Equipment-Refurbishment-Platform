import bcrypt from 'bcryptjs';
import sql from './config/database.js';
import env from './config/env.js';

// Idempotent seed: one administrator (email matches the frontend's expected
// admin identity) + a few example categories. Run with `npm run seed`.
const ADMIN_EMAIL = 'admin@reconditionnement.fr';

const CATEGORIES = [
  { fr: 'Moteur', ar: 'محرك' },
  { fr: 'Carte électronique', ar: 'بطاقة إلكترونية' },
  { fr: 'Transmission', ar: 'ناقل الحركة' },
  { fr: 'Pompe', ar: 'مضخة' },
];

async function seedAdmin() {
  const hash = await bcrypt.hash(env.adminSeedPassword, 10);
  const existing = await sql`select id from profil where email = ${ADMIN_EMAIL}`;
  if (existing.length) {
    await sql`update profil set mot_de_passe_hash = ${hash} where email = ${ADMIN_EMAIL}`;
    console.log(`Admin already present (${ADMIN_EMAIL}) — password reset from ADMIN_SEED_PASSWORD.`);
    return;
  }
  await sql`
    insert into profil (role, nom, email, mot_de_passe_hash)
    values ('ADMINISTRATEUR', 'Administrateur', ${ADMIN_EMAIL}, ${hash})
  `;
  console.log(`Admin created: ${ADMIN_EMAIL} (password from ADMIN_SEED_PASSWORD).`);
}

async function seedCategories() {
  for (const c of CATEGORIES) {
    const existing = await sql`select id from categorie where libelle_fr = ${c.fr}`;
    if (existing.length) continue;
    await sql`insert into categorie (libelle_fr, libelle_ar) values (${c.fr}, ${c.ar})`;
    console.log(`Categorie created: ${c.fr}`);
  }
}

try {
  await seedAdmin();
  await seedCategories();
  console.log('Seed complete.');
} catch (err) {
  console.error('Seed failed:', err);
  process.exitCode = 1;
} finally {
  await sql.end();
}
