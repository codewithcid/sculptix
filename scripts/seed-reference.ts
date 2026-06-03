/**
 * Optional: push the app's exercise + physique-goal config into the reference
 * tables (public.exercises / public.physique_goals) so a future backend can
 * serve content server-side. The mobile app does NOT need this — it ships the
 * data as JSON for offline use.
 *
 * Usage (requires the SERVICE ROLE key — never ship this to the client):
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/seed-reference.ts
 */
import { createClient } from '@supabase/supabase-js';
import { EXERCISES } from '../src/data/exercises';
import { PHYSIQUE_GOALS } from '../src/data/physiqueGoals';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

async function main() {
  const exerciseRows = EXERCISES.map((e) => ({
    id: e.id,
    name: e.name,
    primary_muscle: e.primaryMuscle,
    equipment: e.equipment.join(','),
    difficulty: e.difficulty,
    data: e,
  }));

  const physiqueRows = PHYSIQUE_GOALS.map((p) => ({ id: p.id, name: p.name, data: p }));

  const { error: exErr } = await supabase.from('exercises').upsert(exerciseRows);
  if (exErr) throw exErr;
  console.log(`Seeded ${exerciseRows.length} exercises.`);

  const { error: pgErr } = await supabase.from('physique_goals').upsert(physiqueRows);
  if (pgErr) throw pgErr;
  console.log(`Seeded ${physiqueRows.length} physique goals.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
