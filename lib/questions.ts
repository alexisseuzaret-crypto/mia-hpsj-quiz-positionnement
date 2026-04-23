export type QuestionSection = 'profil' | 'prompting' | 'fonctionnalites' | 'usage-responsable';
export type QuestionType = 'single' | 'multiple';

export type QuestionOption = {
  value: string;
  label: string;
  points: number;
};

export type Question = {
  id: string;
  section: QuestionSection;
  type: QuestionType;
  label: string;
  helpText?: string;
  options: QuestionOption[];
  exclusiveValue?: string;
};

// Score max attendu : 79 pts (S1:30 + S2:17 + S3:19 + S4:13)
export const QUESTIONS: Question[] = [
  // ── Section 1 — Profil (max 30 pts) ──────────────────────────────────────
  {
    id: 'q1',
    section: 'profil',
    type: 'single',
    label: 'À quelle fréquence utilisez-vous Microsoft Copilot Chat dans votre travail ?',
    options: [
      { value: 'never',   label: 'Jamais',                          points: 0 },
      { value: 'tried',   label: "J'ai essayé une ou deux fois",    points: 1 },
      { value: 'monthly', label: 'Quelques fois par mois',          points: 3 },
      { value: 'daily',   label: 'Tous les jours ou presque',       points: 5 },
    ],
  },
  {
    id: 'q2',
    section: 'profil',
    type: 'multiple',
    label: 'Pour quelles tâches professionnelles avez-vous utilisé Copilot Chat ?',
    helpText: 'Plusieurs réponses possibles',
    exclusiveValue: 'none',
    options: [
      { value: 'none',      label: 'Aucun de ces usages',                         points: 0 },
      { value: 'emails',    label: 'Rédiger ou reformuler des emails',             points: 2 },
      { value: 'summaries', label: 'Faire des résumés de documents',               points: 2 },
      { value: 'research',  label: 'Chercher des informations',                    points: 2 },
      { value: 'meetings',  label: 'Préparer des réunions ou comptes-rendus',      points: 2 },
    ],
  },
  {
    id: 'q3',
    section: 'profil',
    type: 'single',
    label: 'Comment évaluez-vous votre niveau global avec les outils IA ?',
    options: [
      { value: 'novice',       label: "Je n'en ai jamais utilisé",                          points: 0 },
      { value: 'beginner',     label: "Je m'en sers occasionnellement",                      points: 2 },
      { value: 'intermediate', label: "Je m'en sers régulièrement et je suis à l'aise",     points: 3 },
      { value: 'advanced',     label: "Je les utilise intensivement et j'aide mes collègues", points: 5 },
    ],
  },
  {
    id: 'q4',
    section: 'profil',
    type: 'multiple',
    label: "En dehors de Copilot Chat, avez-vous utilisé d'autres outils IA ?",
    helpText: 'Plusieurs réponses possibles',
    options: [
      { value: 'none',       label: 'Aucun autre outil',   points: 0 },
      { value: 'chatgpt',    label: 'ChatGPT',              points: 2 },
      { value: 'gemini',     label: 'Gemini (Google)',       points: 2 },
      { value: 'perplexity', label: 'Perplexity AI',        points: 2 },
    ],
  },
  {
    id: 'q5',
    section: 'profil',
    type: 'single',
    label: 'Avez-vous suivi une formation ou un accompagnement sur les outils IA ?',
    options: [
      { value: 'none',     label: 'Non, aucune formation',                          points: 0 },
      { value: 'auto',     label: 'Autodidacte (YouTube, articles, tutoriels)',      points: 2 },
      { value: 'internal', label: "Formation interne à l'établissement",             points: 4 },
      { value: 'external', label: 'Formation externe (organisme spécialisé)',        points: 6 },
    ],
  },

  // ── Section 2 — Prompting (max 17 pts) ───────────────────────────────────
  {
    id: 'q6',
    section: 'prompting',
    type: 'single',
    label: 'Comment formulez-vous généralement vos demandes à Copilot Chat ?',
    options: [
      { value: 'short',      label: 'En quelques mots simples',                                  points: 1 },
      { value: 'sentence',   label: 'En une phrase claire',                                       points: 2 },
      { value: 'detailed',   label: 'Avec un contexte et des détails précis',                     points: 3 },
      { value: 'structured', label: 'Avec un rôle, un contexte, une tâche et un format attendu', points: 4 },
    ],
  },
  {
    id: 'q7',
    section: 'prompting',
    type: 'single',
    label: "Donnez-vous un rôle à Copilot Chat (ex. « Tu es un expert en communication ») ?",
    options: [
      { value: 'never',     label: 'Non, jamais',             points: 0 },
      { value: 'sometimes', label: 'Parfois',                  points: 2 },
      { value: 'always',    label: 'Oui, systématiquement',   points: 3 },
    ],
  },
  {
    id: 'q8',
    section: 'prompting',
    type: 'multiple',
    label: 'Quels éléments incluez-vous habituellement dans vos prompts ?',
    helpText: 'Plusieurs réponses possibles',
    options: [
      { value: 'context',  label: 'Le contexte de la situation',                    points: 1 },
      { value: 'format',   label: 'Le format de réponse attendu (liste, tableau…)',  points: 1 },
      { value: 'length',   label: 'La longueur souhaitée',                           points: 1 },
      { value: 'examples', label: 'Des exemples concrets',                           points: 1 },
    ],
  },
  {
    id: 'q9',
    section: 'prompting',
    type: 'single',
    label: 'Si la réponse de Copilot ne vous convient pas, que faites-vous ?',
    options: [
      { value: 'restart', label: "J'abandonne et recommence une nouvelle conversation",        points: 0 },
      { value: 'rephrase', label: 'Je reformule ma demande',                                   points: 2 },
      { value: 'iterate',  label: "Je précise ou affine ma demande dans la même conversation", points: 3 },
    ],
  },
  {
    id: 'q10',
    section: 'prompting',
    type: 'single',
    label: "Savez-vous ce qu'est le « prompt chaining » (enchaîner plusieurs prompts pour un résultat complexe) ?",
    options: [
      { value: 'no',    label: 'Non, je ne connais pas ce concept',                points: 0 },
      { value: 'heard', label: "J'en ai entendu parler mais je ne l'utilise pas",  points: 1 },
      { value: 'use',   label: "Oui, je l'utilise régulièrement",                  points: 3 },
    ],
  },

  // ── Section 3 — Fonctionnalités (max 19 pts) ─────────────────────────────
  {
    id: 'q11',
    section: 'fonctionnalites',
    type: 'single',
    label: 'Avez-vous utilisé Copilot Chat dans Microsoft Teams (résumé de réunion, questions sur un chat…) ?',
    options: [
      { value: 'no',      label: 'Non, jamais',                                            points: 0 },
      { value: 'tried',   label: "J'ai essayé une fois",                                   points: 1 },
      { value: 'regular', label: 'Oui, régulièrement',                                     points: 2 },
      { value: 'expert',  label: 'Oui, et je combine plusieurs fonctions Teams + Copilot', points: 4 },
    ],
  },
  {
    id: 'q12',
    section: 'fonctionnalites',
    type: 'multiple',
    label: 'Parmi ces fonctionnalités de Copilot Chat, lesquelles avez-vous déjà utilisées ?',
    helpText: 'Plusieurs réponses possibles',
    options: [
      { value: 'web_search',        label: 'Recherche web intégrée',                    points: 1 },
      { value: 'document_analysis', label: 'Analyse de documents joints',                points: 1 },
      { value: 'code',              label: 'Aide à la rédaction ou correction de code',  points: 1 },
      { value: 'translation',       label: 'Traduction de textes',                       points: 1 },
      { value: 'image_gen',         label: "Génération d'images",                        points: 1 },
    ],
  },
  {
    id: 'q13',
    section: 'fonctionnalites',
    type: 'single',
    label: 'Avez-vous déjà généré des images avec Copilot ?',
    options: [
      { value: 'no',      label: "Non, je ne savais pas que c'était possible", points: 0 },
      { value: 'tried',   label: "J'ai essayé quelques fois",                  points: 1 },
      { value: 'regular', label: "Oui, je l'utilise régulièrement",            points: 3 },
    ],
  },
  {
    id: 'q14',
    section: 'fonctionnalites',
    type: 'single',
    label: "Connaissez-vous Copilot Pages (espace de travail collaboratif avec l'IA) ?",
    options: [
      { value: 'no',     label: 'Non, jamais entendu parler',                        points: 0 },
      { value: 'heard',  label: "J'en ai entendu parler",                            points: 2 },
      { value: 'used',   label: "Je l'ai déjà utilisé",                              points: 3 },
      { value: 'expert', label: "Je l'utilise régulièrement pour collaborer",         points: 4 },
    ],
  },
  {
    id: 'q15',
    section: 'fonctionnalites',
    type: 'multiple',
    label: 'Quelles intégrations Microsoft 365 utilisez-vous avec Copilot ?',
    helpText: 'Plusieurs réponses possibles',
    options: [
      { value: 'none',    label: "Aucune pour l'instant",  points: 0 },
      { value: 'word',    label: 'Copilot dans Word',       points: 1 },
      { value: 'outlook', label: 'Copilot dans Outlook',    points: 1 },
      { value: 'excel',   label: 'Copilot dans Excel',      points: 1 },
    ],
  },

  // ── Section 4 — Usage responsable (max 13 pts) ───────────────────────────
  {
    id: 'q16',
    section: 'usage-responsable',
    type: 'single',
    label: 'Vérifiez-vous les informations fournies par Copilot Chat avant de les utiliser ?',
    options: [
      { value: 'never',     label: 'Non, je fais confiance aux réponses',                 points: 0 },
      { value: 'sometimes', label: 'Parfois, pour les informations importantes',           points: 2 },
      { value: 'always',    label: "Oui, toujours — je vérifie avant d'utiliser",         points: 3 },
    ],
  },
  {
    id: 'q17',
    section: 'usage-responsable',
    type: 'single',
    label: 'Partagez-vous des données patients ou des informations sensibles avec Copilot Chat ?',
    options: [
      { value: 'yes_often',     label: 'Oui, régulièrement',                             points: 0 },
      { value: 'yes_sometimes', label: 'Oui, parfois',                                    points: 1 },
      { value: 'no',            label: "Non, jamais — je sais que c'est interdit",        points: 3 },
    ],
  },
  {
    id: 'q18',
    section: 'usage-responsable',
    type: 'single',
    label: 'Connaissez-vous les principales limites de Copilot Chat (hallucinations, biais, données cutoff…) ?',
    options: [
      { value: 'no',      label: 'Non, je ne les connais pas',                    points: 0 },
      { value: 'partial', label: "J'en connais quelques-unes",                    points: 2 },
      { value: 'well',    label: "Je les connais bien et j'en tiens compte",      points: 3 },
    ],
  },
  {
    id: 'q19',
    section: 'usage-responsable',
    type: 'single',
    label: "Avez-vous conscience des obligations réglementaires liées à l'IA dans le secteur santé (RGPD, HDS…) ?",
    options: [
      { value: 'no',    label: "Non, ce n'est pas mon domaine",               points: 0 },
      { value: 'heard', label: "J'en ai entendu parler",                      points: 1 },
      { value: 'yes',   label: 'Oui, je connais les principales obligations', points: 2 },
    ],
  },
  {
    id: 'q20',
    section: 'usage-responsable',
    type: 'single',
    label: "Comment percevez-vous l'IA dans votre environnement de travail hospitalier ?",
    options: [
      { value: 'threat',      label: 'Comme une menace pour mon poste',                        points: 0 },
      { value: 'neutral',     label: "Je reste neutre, je l'utilise si nécessaire",             points: 1 },
      { value: 'opportunity', label: 'Comme un outil utile pour gagner en efficacité',          points: 2 },
    ],
  },
];
