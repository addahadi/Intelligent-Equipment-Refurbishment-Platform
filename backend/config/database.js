import postgres from 'postgres';
import env from './env.js'; // ensures dotenv has loaded before the pool is created

let sql;

if (!global._sql) {
  const connectionString = env.databaseUrl;

  global._sql = postgres(connectionString, {
    max: 20,
    idle_timeout: 20,
    max_lifetime: 60 * 30,
    prepare: false, // Required for Supabase Transaction Pooler
  });

  console.log('Database connection pool created');
}


sql = global._sql;

export default sql;
