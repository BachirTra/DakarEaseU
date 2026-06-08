import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
  throw new Error('Définis SUPABASE_ANON_KEY (valeur affichée par `npx supabase status`).');
}

const STUDENT_A = { email: 'rls-test-a@dakareaseu.test', password: 'Test1234!' };
const STUDENT_B = { email: 'rls-test-b@dakareaseu.test', password: 'Test1234!' };
const SAMPLE_LISTING_ID = 'b0000000-0000-0000-0000-000000000001';

async function signedInClient(creds: { email: string; password: string }): Promise<SupabaseClient> {
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY!);
  const { error } = await client.auth.signInWithPassword(creds);
  if (error) {
    throw new Error(`Connexion ${creds.email} a échoué : ${error.message} (crée d'abord les comptes de test, voir Step 1)`);
  }
  return client;
}

let failures = 0;
function check(condition: boolean, message: string) {
  if (condition) {
    console.log(`  OK   ${message}`);
  } else {
    failures += 1;
    console.error(`  ÉCHEC ${message}`);
  }
}

async function main() {
  console.log('Connexion des deux comptes de test...');
  const a = await signedInClient(STUDENT_A);
  const b = await signedInClient(STUDENT_B);

  console.log('\n[1] Lecture des données publiques (les deux doivent voir les annonces publiées)');
  const { data: listingsA } = await a.from('listings').select('id').eq('verification_status', 'published');
  const { data: listingsB } = await b.from('listings').select('id').eq('verification_status', 'published');
  check((listingsA?.length ?? 0) > 0, "l'étudiant A voit des annonces publiées");
  check((listingsB?.length ?? 0) > 0, "l'étudiant B voit des annonces publiées");

  console.log('\n[2] Isolation des favoris');
  const { data: favA, error: favInsertErr } = await a
    .from('favorites')
    .insert({ user_id: (await a.auth.getUser()).data.user!.id, entity_type: 'listing', entity_id: SAMPLE_LISTING_ID })
    .select()
    .single();
  check(!favInsertErr && !!favA, "l'étudiant A peut créer son propre favori");

  const { data: favoritesSeenByB } = await b.from('favorites').select('id');
  check(
    (favoritesSeenByB ?? []).every((row) => row.id !== favA?.id),
    "l'étudiant B ne voit AUCUN favori appartenant à l'étudiant A"
  );

  if (favA) {
    const { error: updateByOtherErr } = await b
      .from('favorites')
      .update({ entity_type: 'restaurant' })
      .eq('id', favA.id);
    const { data: rowAfterAttempt } = await a.from('favorites').select('entity_type').eq('id', favA.id).single();
    check(
      rowAfterAttempt?.entity_type === 'listing',
      "l'étudiant B ne peut pas modifier le favori de l'étudiant A (la ligne reste inchangée)"
    );
    check(!!updateByOtherErr || rowAfterAttempt?.entity_type === 'listing', 'la tentative de modification croisée est bloquée par RLS');
  }

  console.log('\n[3] Isolation des notifications et demandes de recherche guidée');
  const { data: requestA, error: requestErr } = await a
    .from('guided_search_requests')
    .insert({ user_id: (await a.auth.getUser()).data.user!.id, housing_type: 'studio', budget: 150000, duration_months: 3 })
    .select()
    .single();
  check(!requestErr && !!requestA, "l'étudiant A peut créer sa propre demande de recherche guidée");

  const { data: requestsSeenByB } = await b.from('guided_search_requests').select('id');
  check(
    (requestsSeenByB ?? []).every((row) => row.id !== requestA?.id),
    "l'étudiant B ne voit AUCUNE demande de recherche guidée de l'étudiant A"
  );

  console.log('\n[4] Écriture refusée sur les tables réservées aux admins');
  const { error: schoolWriteErr } = await a.from('schools').insert({ name: 'École test RLS', district: 'Fann' });
  check(!!schoolWriteErr, "un étudiant non-admin ne peut PAS créer d'école (réservé aux admins)");

  const { error: listingWriteErr } = await a
    .from('listings')
    .update({ verification_status: 'published' })
    .eq('id', SAMPLE_LISTING_ID);
  const { data: listingAfter } = await a.from('listings').select('verification_status').eq('id', SAMPLE_LISTING_ID).single();
  check(
    !!listingWriteErr || listingAfter?.verification_status === 'published',
    "un étudiant non-admin ne peut pas modifier le statut de vérification d'une annonce"
  );

  console.log('\n[5] Le bucket privé student-ids est inaccessible à un autre utilisateur');
  const { data: signedUrlForOther, error: signedUrlErr } = await b.storage
    .from('student-ids')
    .createSignedUrl(`${(await a.auth.getUser()).data.user?.id}/carte-test.jpg`, 60);
  check(
    !!signedUrlErr || !signedUrlForOther,
    "l'étudiant B ne peut pas générer d'URL signée vers le dossier privé de l'étudiant A"
  );

  console.log('\nNettoyage...');
  if (favA) await a.from('favorites').delete().eq('id', favA.id);
  if (requestA) await a.from('guided_search_requests').delete().eq('id', requestA.id);

  console.log(`\n${failures === 0 ? 'Toutes les vérifications RLS sont passées.' : `${failures} vérification(s) ont ÉCHOUÉ — corrige les policies avant de continuer.`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('\nErreur inattendue :', err.message);
  process.exit(1);
});
