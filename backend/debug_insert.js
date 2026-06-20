import 'dotenv/config';
import postgres from 'postgres';

const sql = postgres(process.env.SUPABASE_DB_URL, { prepare: false });

// Simulate the exact columns buildColumns would produce for the payload
const cols = {
  type_composant: 'ORGANE',
  nom_fr: 'Picro',
  reference: 'REF_DEBUG_TEST_' + Date.now(), // unique to avoid conflict
  marque: 'Fabricant',
  modele: 'fabricant',
  qualite: 'CORRECT',
  prix: 35,
  garantie: 6,
  images: ['https://res.cloudinary.com/dkm97ic10/image/upload/v1781912535/composants/bzy7g210jvh68efutqoj.png', 'https://res.cloudinary.com/dkm97ic10/image/upload/v1781912536/composants/odu1greluatmtonlscpn.png'],
  description_fr: '',
  type_equipement_fr: 'PNUMIRIQUE',
  materiau_fr: null,
  materiau_ar: null,
  compatibilite_fr: null,
  compatibilite_ar: null,
};

console.log('Inserting with columns:', JSON.stringify(cols, null, 2));

try {
  const [row] = await sql`insert into composant ${sql(cols)} returning id, type_composant, nom_fr`;
  console.log('SUCCESS:', row);
  // Clean up
  await sql`delete from composant where id = ${row.id}`;
  console.log('Cleaned up test row');
} catch (err) {
  console.error('FAILED!');
  console.error('Code:', err.code);
  console.error('Message:', err.message);
  console.error('Detail:', err.detail);
  console.error('Constraint:', err.constraint_name || err.constraint);
  console.error('Column:', err.column_name || err.column);
  console.error('Table:', err.table_name || err.table);
  console.error('Full error:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
} finally {
  await sql.end();
}
