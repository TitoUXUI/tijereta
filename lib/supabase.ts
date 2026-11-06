import { createClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase para el servidor. El prototipo todavía corre con la capa
 * de datos local (`lib/store/demo-store.tsx`); este archivo queda listo para
 * cuando se conecte la base real con `supabase/schema.sql`.
 * Nunca importar este módulo desde un componente de cliente.
 */
export function createServerSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Faltan SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY (ver .env.example).");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
