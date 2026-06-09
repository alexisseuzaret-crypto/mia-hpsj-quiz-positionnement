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

// Réponses type par niveau — 19 questions

// Profil zéro IA : déclenche le knockout (q1-q5 tous négatifs, q6-q18 non répondus)
const DEBUTANT_ANSWERS: Record<string, string[]> = {
  q1: ['no'], q2: ['never'], q3: ['novice'], q4: ['none'], q5: ['none'],
  q6: [], q7: [], q8: [], q9: [], q10: [],
  q11: [], q12: [], q13: [], q14: [], q15: [], q16: [], q17: [], q18: [],
  q19: ['threat'],
};

// Débutant qui répond à toutes les questions (ne déclenche pas le knockout)
const DEBUTANT_ANSWERS_2: Record<string, string[]> = {
  q1: ['yes'], q2: ['tried'], q3: ['beginner'], q4: ['chatgpt'], q5: ['none'],
  q6: ['short'], q7: ['never'], q8: ['context'], q9: ['restart'],
  q10: ['no'], q11: ['translation'], q12: ['no'], q13: ['no'], q14: ['dont_know'],
  q15: ['sometimes'], q16: ['no'], q17: ['partial'], q18: ['no'], q19: ['neutral'],
};

const INTER_ANSWERS: Record<string, string[]> = {
  q1: ['yes'], q2: ['monthly'], q3: ['intermediate'], q4: ['chatgpt', 'gemini'], q5: ['auto'],
  q6: ['detailed'], q7: ['sometimes'], q8: ['context', 'format'], q9: ['iterate'],
  q10: ['heard'], q11: ['web_search', 'translation'], q12: ['tried'], q13: ['tried'], q14: ['other_tool'],
  q15: ['sometimes'], q16: ['no'], q17: ['partial'], q18: ['heard'], q19: ['opportunity'],
};

const INTER_ANSWERS_2: Record<string, string[]> = {
  q1: ['yes'], q2: ['daily'], q3: ['intermediate'], q4: ['chatgpt'], q5: ['auto'],
  q6: ['detailed'], q7: ['sometimes'], q8: ['context', 'length'], q9: ['iterate'],
  q10: ['heard'], q11: ['document_analysis', 'translation'], q12: ['tried'], q13: ['regular'], q14: ['transcript_prompt'],
  q15: ['always'], q16: ['no'], q17: ['partial'], q18: ['yes'], q19: ['opportunity'],
};

const AVANCE_ANSWERS: Record<string, string[]> = {
  q1: ['yes'], q2: ['daily'], q3: ['advanced'], q4: ['chatgpt', 'gemini', 'perplexity', 'claude'], q5: ['external'],
  q6: ['structured'], q7: ['always'], q8: ['context', 'format', 'length', 'examples', 'role', 'style'], q9: ['iterate'],
  q10: ['use'], q11: ['web_search', 'document_analysis', 'translation', 'image_gen'], q12: ['regular'], q13: ['expert'], q14: ['transcript_prompt'],
  q15: ['always'], q16: ['no'], q17: ['well'], q18: ['yes'], q19: ['opportunity'],
};

const AVANCE_ANSWERS_2: Record<string, string[]> = {
  q1: ['yes'], q2: ['daily'], q3: ['advanced'], q4: ['chatgpt', 'gemini'], q5: ['auto', 'external'],
  q6: ['structured'], q7: ['always'], q8: ['context', 'format', 'examples', 'role'], q9: ['iterate'],
  q10: ['use'], q11: ['web_search', 'document_analysis', 'translation'], q12: ['regular'], q13: ['regular'], q14: ['transcript_prompt'],
  q15: ['always'], q16: ['no'], q17: ['well'], q18: ['yes'], q19: ['opportunity'],
};

type AnswerSet = Record<string, string[]>;

const MAX_SCORE = calculateMaxScore(QUESTIONS);

function buildResponses(answers: AnswerSet) {
  return QUESTIONS.map((q) => {
    const selected = answers[q.id] ?? [];
    const points = q.options
      .filter((o) => selected.includes(o.value))
      .reduce((s, o) => s + o.points, 0);
    return { question_id: q.id, answer_values: selected, points_earned: points, other_text: null };
  });
}

function scoreAndLevel(answers: AnswerSet) {
  const score = calculateScore(answers, QUESTIONS);
  const level = applyKnockout(answers, classify(score, MAX_SCORE));
  return { score, level };
}

const SITES = ['Saint-Joseph Paris', 'Marie-Lannelongue Le Plessis-Robinson'];

const POLES = [
  'Pôle Médico-chirurgical',
  'Pôle Mère-Enfant',
  'Pôle Cancérologie',
  'Pôle Cardiologie-Pneumologie',
  'Pôle Gériatrie',
  'Pôle Direction et Support',
];

const HOSPITAL_SERVICES = [
  'Cardiologie', 'Pharmacie', 'Direction des soins', 'Bloc opératoire',
  'Réanimation', 'Urgences', 'Pédiatrie', 'Imagerie médicale',
  'Laboratoire', 'Administration', 'Communication', 'Qualité et risques',
  'Service technique', 'Restauration', 'Médecine interne', 'Gériatrie',
  'Psychiatrie', 'Maternité', 'Anesthésie', 'Hématologie',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

type CompleteParticipant = {
  first_name: string;
  last_name: string;
  email: string;
  site: string;
  pole: string;
  service: string;
  training_format: 'presentiel' | 'distanciel' | 'indifferent';
  answers: AnswerSet;
};

const COMPLETE_PARTICIPANTS: CompleteParticipant[] = [
  // Débutants (5)
  { first_name: 'Marie',    last_name: 'Leblanc',    email: 'marie.leblanc@hpsj.fr',       site: SITES[0], pole: POLES[1], service: 'Pédiatrie',           training_format: 'presentiel',  answers: DEBUTANT_ANSWERS },
  { first_name: 'Thomas',   last_name: 'Moreau',     email: 'thomas.moreau@hpsj.fr',       site: SITES[0], pole: POLES[5], service: 'Direction des soins', training_format: 'distanciel',  answers: DEBUTANT_ANSWERS_2 },
  { first_name: 'Sophie',   last_name: 'Girard',     email: 'sophie.girard@hpsj.fr',       site: SITES[1], pole: POLES[1], service: 'Maternité',           training_format: 'presentiel',  answers: DEBUTANT_ANSWERS },
  { first_name: 'Lucas',    last_name: 'Bernard',    email: 'lucas.bernard@hpsj.fr',       site: SITES[0], pole: POLES[5], service: 'Qualité et risques',  training_format: 'presentiel',  answers: DEBUTANT_ANSWERS_2 },
  { first_name: 'Emma',     last_name: 'Petit',      email: 'emma.petit@hpsj.fr',          site: SITES[1], pole: POLES[5], service: 'Administration',      training_format: 'indifferent', answers: DEBUTANT_ANSWERS },
  // Intermédiaires (5)
  { first_name: 'Antoine',  last_name: 'Dupont',     email: 'antoine.dupont@hpsj.fr',      site: SITES[0], pole: POLES[0], service: 'Urgences',            training_format: 'presentiel',  answers: INTER_ANSWERS },
  { first_name: 'Claire',   last_name: 'Martin',     email: 'claire.martin@hpsj.fr',       site: SITES[0], pole: POLES[0], service: 'Pharmacie',           training_format: 'presentiel',  answers: INTER_ANSWERS_2 },
  { first_name: 'Nicolas',  last_name: 'Rousseau',   email: 'nicolas.rousseau@hpsj.fr',    site: SITES[1], pole: POLES[0], service: 'Réanimation',         training_format: 'distanciel',  answers: INTER_ANSWERS },
  { first_name: 'Julie',    last_name: 'Fontaine',   email: 'julie.fontaine@hpsj.fr',      site: SITES[0], pole: POLES[3], service: 'Cardiologie',         training_format: 'presentiel',  answers: INTER_ANSWERS_2 },
  { first_name: 'Pierre',   last_name: 'Garnier',    email: 'pierre.garnier@hpsj.fr',      site: SITES[1], pole: POLES[0], service: 'Bloc opératoire',     training_format: 'presentiel',  answers: INTER_ANSWERS },
  // Avancés (5)
  { first_name: 'Isabelle', last_name: 'Chevalier',  email: 'isabelle.chevalier@hpsj.fr',  site: SITES[0], pole: POLES[0], service: 'Imagerie médicale',   training_format: 'distanciel',  answers: AVANCE_ANSWERS },
  { first_name: 'Mathieu',  last_name: 'Simon',      email: 'mathieu.simon@hpsj.fr',       site: SITES[1], pole: POLES[5], service: 'Direction des soins', training_format: 'presentiel',  answers: AVANCE_ANSWERS_2 },
  { first_name: 'Camille',  last_name: 'Laurent',    email: 'camille.laurent@hpsj.fr',     site: SITES[0], pole: POLES[2], service: 'Laboratoire',         training_format: 'indifferent', answers: AVANCE_ANSWERS },
  { first_name: 'Romain',   last_name: 'Michel',     email: 'romain.michel@hpsj.fr',       site: SITES[1], pole: POLES[2], service: 'Hématologie',         training_format: 'distanciel',  answers: AVANCE_ANSWERS_2 },
  { first_name: 'Lucie',    last_name: 'Lefevre',    email: 'lucie.lefevre@hpsj.fr',       site: SITES[0], pole: POLES[0], service: 'Anesthésie',          training_format: 'presentiel',  answers: AVANCE_ANSWERS },
];

const INCOMPLETE_PARTICIPANTS = [
  { first_name: 'Hugo',   last_name: 'Perrin',  email: 'hugo.perrin@hpsj.fr',   site: SITES[0], pole: POLES[5], service: 'DSN', training_format: null },
  { first_name: 'Léa',    last_name: 'Mercier', email: 'lea.mercier@hpsj.fr',    site: SITES[1], pole: POLES[5], service: 'RH',  training_format: null },
  { first_name: 'Maxime', last_name: 'Robert',  email: 'maxime.robert@hpsj.fr',  site: SITES[0], pole: POLES[0], service: '',    training_format: null },
];

// Éviter l'avertissement TS sur la variable inutilisée
void pick;
void HOSPITAL_SERVICES;

async function seedComplete() {
  let ok = 0;
  for (const p of COMPLETE_PARTICIPANTS) {
    const { score, level } = scoreAndLevel(p.answers);
    const responses = buildResponses(p.answers);

    const { error } = await supabase.rpc('submit_quiz', {
      p_first_name:       p.first_name,
      p_last_name:        p.last_name,
      p_email:            p.email,
      p_site:             p.site,
      p_pole:             p.pole,
      p_service:          p.service || null,
      p_completed_at:     new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      p_total_score:      score,
      p_max_score:        MAX_SCORE,
      p_level:            level,
      p_responses:        responses,
      p_training_format:  p.training_format,
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
    const { error } = await supabase.from('hpsj_participants').upsert(
      {
        first_name:      p.first_name,
        last_name:       p.last_name,
        email:           p.email,
        site:            p.site,
        pole:            p.pole,
        service:         p.service || null,
        training_format: p.training_format,
        started_at:      new Date().toISOString(),
        completed_at:    null,
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
