import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { QUESTIONS } from '../lib/questions';
import { calculateScore, calculateMaxScore, classify, applyKnockout } from '../lib/scoring';

dotenv.config({ path: '.env.local' });

if (process.env.NODE_ENV === 'production') {
  console.error('Seed interdit en production.');
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  console.error('Variables NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requises.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Réponses type par niveau (question_id → valeurs sélectionnées)
const DEBUTANT_ANSWERS: Record<string, string[]> = {
  q1: ['never'], q2: ['none'], q3: ['novice'], q4: ['none'], q5: ['none'],
  q6: ['short'], q7: ['never'], q8: [], q9: ['restart'], q10: ['no'],
  q11: ['no'], q12: [], q13: ['no'], q14: ['no'], q15: ['none'],
  q16: ['sometimes'], q17: ['yes_sometimes'], q18: ['no'], q19: ['heard'], q20: ['neutral'],
};

const DEBUTANT_ANSWERS_2: Record<string, string[]> = {
  q1: ['tried'], q2: ['emails'], q3: ['beginner'], q4: ['chatgpt'], q5: ['none'],
  q6: ['sentence'], q7: ['never'], q8: ['context'], q9: ['rephrase'], q10: ['no'],
  q11: ['no'], q12: ['translation'], q13: ['no'], q14: ['no'], q15: ['none'],
  q16: ['sometimes'], q17: ['no'], q18: ['partial'], q19: ['no'], q20: ['neutral'],
};

const INTER_ANSWERS: Record<string, string[]> = {
  q1: ['monthly'], q2: ['emails', 'summaries'], q3: ['intermediate'], q4: ['chatgpt', 'gemini'], q5: ['auto'],
  q6: ['detailed'], q7: ['sometimes'], q8: ['context', 'format'], q9: ['iterate'], q10: ['heard'],
  q11: ['tried'], q12: ['web_search', 'translation'], q13: ['tried'], q14: ['heard'], q15: ['outlook'],
  q16: ['sometimes'], q17: ['no'], q18: ['partial'], q19: ['heard'], q20: ['opportunity'],
};

const INTER_ANSWERS_2: Record<string, string[]> = {
  q1: ['daily'], q2: ['emails', 'meetings'], q3: ['intermediate'], q4: ['chatgpt'], q5: ['internal'],
  q6: ['detailed'], q7: ['sometimes'], q8: ['context', 'length'], q9: ['iterate'], q10: ['heard'],
  q11: ['regular'], q12: ['document_analysis', 'translation'], q13: ['tried'], q14: ['heard'], q15: ['word'],
  q16: ['always'], q17: ['no'], q18: ['partial'], q19: ['yes'], q20: ['opportunity'],
};

const AVANCE_ANSWERS: Record<string, string[]> = {
  q1: ['daily'], q2: ['emails', 'summaries', 'research', 'meetings'], q3: ['advanced'], q4: ['chatgpt', 'gemini', 'perplexity'], q5: ['external'],
  q6: ['structured'], q7: ['always'], q8: ['context', 'format', 'length', 'examples'], q9: ['iterate'], q10: ['use'],
  q11: ['expert'], q12: ['web_search', 'document_analysis', 'translation', 'image_gen'], q13: ['regular'], q14: ['expert'], q15: ['word', 'outlook', 'excel'],
  q16: ['always'], q17: ['no'], q18: ['well'], q19: ['yes'], q20: ['opportunity'],
};

const AVANCE_ANSWERS_2: Record<string, string[]> = {
  q1: ['daily'], q2: ['emails', 'summaries', 'meetings'], q3: ['advanced'], q4: ['chatgpt', 'gemini'], q5: ['external'],
  q6: ['structured'], q7: ['always'], q8: ['context', 'format', 'examples'], q9: ['iterate'], q10: ['use'],
  q11: ['regular'], q12: ['web_search', 'document_analysis', 'code'], q13: ['regular'], q14: ['used'], q15: ['word', 'outlook'],
  q16: ['always'], q17: ['no'], q18: ['well'], q19: ['yes'], q20: ['opportunity'],
};

type AnswerSet = Record<string, string[]>;

const MAX_SCORE = calculateMaxScore(QUESTIONS);

function buildResponses(answers: AnswerSet) {
  return QUESTIONS.map((q) => {
    const selected = answers[q.id] ?? [];
    const points = q.options
      .filter((o) => selected.includes(o.value))
      .reduce((s, o) => s + o.points, 0);
    return { question_id: q.id, answer_values: selected, points_earned: points };
  });
}

function scoreAndLevel(answers: AnswerSet) {
  const score = calculateScore(answers, QUESTIONS);
  const level = applyKnockout(answers, classify(score, MAX_SCORE));
  return { score, level };
}

const SERVICES = [
  'Direction générale', 'DSN', 'RH', 'Qualité',
  'Assistantes de direction', 'Service international', 'Autre',
];

const COMPLETE_PARTICIPANTS = [
  // Débutants (5)
  { first_name: 'Marie', last_name: 'Leblanc',    email: 'marie.leblanc@hpsj.fr',     service: 'RH',                    answers: DEBUTANT_ANSWERS },
  { first_name: 'Thomas', last_name: 'Moreau',    email: 'thomas.moreau@hpsj.fr',     service: 'Direction générale',    answers: DEBUTANT_ANSWERS_2 },
  { first_name: 'Sophie', last_name: 'Girard',    email: 'sophie.girard@hpsj.fr',     service: 'Assistantes de direction', answers: DEBUTANT_ANSWERS },
  { first_name: 'Lucas',  last_name: 'Bernard',   email: 'lucas.bernard@hpsj.fr',     service: 'Qualité',               answers: DEBUTANT_ANSWERS_2 },
  { first_name: 'Emma',   last_name: 'Petit',     email: 'emma.petit@hpsj.fr',        service: 'Autre',                 answers: DEBUTANT_ANSWERS },
  // Intermédiaires (5)
  { first_name: 'Antoine', last_name: 'Dupont',   email: 'antoine.dupont@hpsj.fr',    service: 'DSN',                   answers: INTER_ANSWERS },
  { first_name: 'Claire',  last_name: 'Martin',   email: 'claire.martin@hpsj.fr',     service: 'RH',                    answers: INTER_ANSWERS_2 },
  { first_name: 'Nicolas', last_name: 'Rousseau', email: 'nicolas.rousseau@hpsj.fr',  service: 'Service international', answers: INTER_ANSWERS },
  { first_name: 'Julie',   last_name: 'Fontaine', email: 'julie.fontaine@hpsj.fr',    service: 'Qualité',               answers: INTER_ANSWERS_2 },
  { first_name: 'Pierre',  last_name: 'Garnier',  email: 'pierre.garnier@hpsj.fr',    service: 'Direction générale',    answers: INTER_ANSWERS },
  // Avancés (5)
  { first_name: 'Isabelle', last_name: 'Chevalier', email: 'isabelle.chevalier@hpsj.fr', service: 'DSN',                answers: AVANCE_ANSWERS },
  { first_name: 'Mathieu',  last_name: 'Simon',     email: 'mathieu.simon@hpsj.fr',      service: 'Direction générale', answers: AVANCE_ANSWERS_2 },
  { first_name: 'Camille',  last_name: 'Laurent',   email: 'camille.laurent@hpsj.fr',    service: 'RH',                 answers: AVANCE_ANSWERS },
  { first_name: 'Romain',   last_name: 'Michel',    email: 'romain.michel@hpsj.fr',      service: 'Service international', answers: AVANCE_ANSWERS_2 },
  { first_name: 'Lucie',    last_name: 'Lefevre',   email: 'lucie.lefevre@hpsj.fr',      service: 'Qualité',            answers: AVANCE_ANSWERS },
];

const INCOMPLETE_PARTICIPANTS = [
  { first_name: 'Hugo',   last_name: 'Perrin',  email: 'hugo.perrin@hpsj.fr',   service: 'DSN' },
  { first_name: 'Léa',    last_name: 'Mercier', email: 'lea.mercier@hpsj.fr',    service: 'RH' },
  { first_name: 'Maxime', last_name: 'Robert',  email: 'maxime.robert@hpsj.fr',  service: null },
];

async function seedComplete() {
  let ok = 0;
  for (const p of COMPLETE_PARTICIPANTS) {
    const { score, level } = scoreAndLevel(p.answers);
    const responses = buildResponses(p.answers);

    const { error } = await supabase.rpc('submit_quiz', {
      p_first_name:   p.first_name,
      p_last_name:    p.last_name,
      p_email:        p.email,
      p_service:      p.service,
      p_completed_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      p_total_score:  score,
      p_max_score:    MAX_SCORE,
      p_level:        level,
      p_responses:    responses,
    });

    if (error) {
      console.error(`  ✗ ${p.first_name} ${p.last_name}: ${error.message}`);
    } else {
      console.log(`  ✓ ${p.first_name} ${p.last_name} (${level}, ${score}/${MAX_SCORE})`);
      ok++;
    }
  }
  return ok;
}

async function seedIncomplete() {
  let ok = 0;
  for (const p of INCOMPLETE_PARTICIPANTS) {
    const { error } = await supabase.from('participants').upsert(
      {
        first_name:  p.first_name,
        last_name:   p.last_name,
        email:       p.email,
        service:     p.service,
        started_at:  new Date().toISOString(),
        completed_at: null,
      },
      { onConflict: 'email', ignoreDuplicates: false }
    );
    if (error) {
      console.error(`  ✗ ${p.first_name} ${p.last_name}: ${error.message}`);
    } else {
      console.log(`  ✓ ${p.first_name} ${p.last_name} (incomplet)`);
      ok++;
    }
  }
  return ok;
}

async function main() {
  console.log('Seed participants HPSJ…\n');
  console.log(`Complets (${COMPLETE_PARTICIPANTS.length}) :`);
  const c = await seedComplete();
  console.log(`\nIncomplets (${INCOMPLETE_PARTICIPANTS.length}) :`);
  const i = await seedIncomplete();
  console.log(`\nTerminé : ${c}/${COMPLETE_PARTICIPANTS.length} complets, ${i}/${INCOMPLETE_PARTICIPANTS.length} incomplets.`);
}

main().catch((err) => { console.error(err); process.exit(1); });
