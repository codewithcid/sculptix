// Supabase Edge Function: delete-account
//
// Permanently deletes the authenticated user's account and ALL their data.
// Required by Google Play / Apple for any app with account creation.
//
// Flow:
//   1. Verify the caller's JWT (anon client bound to their Authorization header).
//   2. Remove their progress-photo objects from Storage (not FK-cascaded).
//   3. Delete the auth user with the service role — every user-owned table has
//      ON DELETE CASCADE on user_id, so all rows are removed automatically.
//
// SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ANON_KEY are injected
// automatically into deployed Edge Functions — no manual secrets needed.
//
// Deploy:  supabase functions deploy delete-account
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: 'Missing Authorization header' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Identify the caller from their JWT.
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser();
    if (userErr || !user) {
      return json({ error: 'Invalid or expired session' }, 401);
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // 1) Remove the user's progress-photo objects (Storage is not FK-cascaded).
    await removeUserPhotos(admin, user.id);

    // 2) Delete the auth user — cascades all user_id rows in public schema.
    const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
    if (delErr) {
      return json({ error: delErr.message }, 500);
    }

    return json({ success: true }, 200);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Unexpected error' }, 500);
  }
});

// deno-lint-ignore no-explicit-any
async function removeUserPhotos(admin: any, userId: string) {
  const bucket = admin.storage.from('progress-photos');
  const paths: string[] = [];

  // Photos live at {userId}/{date}/{file}; list the date folders, then files.
  const { data: dateFolders } = await bucket.list(userId, { limit: 1000 });
  for (const folder of dateFolders ?? []) {
    const { data: files } = await bucket.list(`${userId}/${folder.name}`, { limit: 1000 });
    for (const f of files ?? []) paths.push(`${userId}/${folder.name}/${f.name}`);
  }
  if (paths.length) await bucket.remove(paths);
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
