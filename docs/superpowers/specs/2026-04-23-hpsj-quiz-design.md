# Design Spec — Quiz de positionnement IA
**Client :** Hôpitaux Paris Saint-Joseph Marie-Lannelongue × Mister IA
**Date :** 2026-04-23
**Statut :** Validé — prêt pour implémentation

---

## 1. Contexte

Quiz de positionnement en ligne (5-10 min) pour orienter les professionnels de l'hôpital vers l'un des 3 programmes de formation Microsoft Copilot Chat : Débutant / Intermédiaire / Avancé.

---

## 2. Stack technique

- **Framework :** Next.js 15 (App Router) + TypeScript
- **UI :** Tailwind CSS + shadcn/ui
- **DB :** Supabase (PostgreSQL + RLS)
- **Hébergement :** Vercel (auto-deploy sur push `main`)
- **Auth admin :** cookie httpOnly signé (jose, JWT HS256, 24h) — pas de Supabase Auth
- **Formulaires :** react-hook-form + zod
- **Analytics :** Vercel Analytics

---

## 3. Architecture & structure de fichiers

```
/app
  /page.tsx                           → Landing (RSC)
  /quiz
    /page.tsx                         → Formulaire identité (Client Component)
    /questions/page.tsx               → Quiz 20 questions (Client Component)
    /resultat/page.tsx                → Résultat (RSC, lit searchParams.id)
  /admin
    /login/page.tsx                   → Login mot de passe (Client Component)
    /dashboard/page.tsx               → Dashboard filtres URL (RSC)
    /participant/[id]/page.tsx        → Détail participant (RSC)
  /api
    /submit-quiz/route.ts             → POST : score + RPC Supabase
    /admin/login/route.ts             → POST : vérifie password + set cookie
    /admin/logout/route.ts            → POST : supprime cookie
    /admin/export/route.ts            → GET : CSV stream (protégé)
/lib
  /supabase-server.ts                 → Client Supabase service_role (server-only)
  /supabase-client.ts                 → Client Supabase anon (browser)
  /questions.ts                       → 20 questions + types TypeScript
  /scoring.ts                         → calculateScore, calculateMaxScore, classify, applyKnockout
  /auth.ts                            → verifyAdminSession()
/middleware.ts                        → Vérifie cookie sur /admin/* sauf /admin/login
/components
  /QuizForm.tsx                       → Formulaire identité
  /QuizQuestion.tsx                   → Une question (radio ou checkbox)
  /ProgressBar.tsx
  /ResultCard.tsx
  /AdminFilters.tsx                   → Filtres URL (Client Component)
  /AdminTableHead.tsx                 → En-têtes sortables (Client Component, useRouter)
  /AdminTable.tsx                     → Tableau participants (RSC, tbody)
/supabase/migrations/001_init.sql
/scripts/seed-demo-participants.ts
/public/logos/
  /mister-ia.svg                      → Placeholder à remplacer
  /saint-joseph.svg                   → Placeholder à remplacer
```

**Principe data layer :**
- Pages admin = RSC pur, lisent URL searchParams, requêtent Supabase directement avec `service_role`
- Quiz submit = API route POST (seul cas où le client envoie des données)
- Seule exception RSC : `AdminTableHead.tsx` est Client Component (boutons sort → `useRouter`)
- URL = unique source de vérité pour filtres/tri/pagination/recherche

---

## 4. Modèle de données (Supabase)

### Table `participants`
```sql
CREATE TABLE participants (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name   text NOT NULL,
  last_name    text NOT NULL,
  email        text NOT NULL,
  service      text,
  started_at   timestamptz DEFAULT now(),
  completed_at timestamptz,
  total_score  int,
  max_score    int,
  level        text CHECK (level IN ('debutant', 'intermediaire', 'avance')),
  created_at   timestamptz DEFAULT now(),
  CONSTRAINT participants_email_unique UNIQUE (email)
);

CREATE INDEX idx_participants_email   ON participants(email);
CREATE INDEX idx_participants_level   ON participants(level);
CREATE INDEX idx_participants_created ON participants(created_at DESC);
```

### Table `responses`
```sql
CREATE TABLE responses (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  question_id    text NOT NULL,
  answer_values  jsonb NOT NULL,
  points_earned  int NOT NULL,
  created_at     timestamptz DEFAULT now()
);

CREATE INDEX idx_responses_participant ON responses(participant_id);
```

### RLS
- `participants` + `responses` : INSERT public **bloqué** (tout passe par la RPC SECURITY DEFINER)
- SELECT/UPDATE/DELETE : bloqués côté client sur les deux tables
- Accès lecture admin : via `supabase-server.ts` avec `service_role` key (bypass RLS)

### RPC `submit_quiz` (atomique)
```sql
CREATE OR REPLACE FUNCTION submit_quiz(
  p_first_name  text,
  p_last_name   text,
  p_email       text,
  p_service     text,
  p_completed_at timestamptz,
  p_total_score  int,
  p_max_score    int,
  p_level        text,
  p_responses    jsonb  -- [{ question_id, answer_values, points_earned }]
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_id uuid;
BEGIN
  -- Validation des inputs
  IF p_email !~ '^[^@]+@[^@]+\.[^@]+$' THEN
    RAISE EXCEPTION 'email invalide';
  END IF;
  IF trim(p_first_name) = '' OR trim(p_last_name) = '' THEN
    RAISE EXCEPTION 'nom/prénom requis';
  END IF;
  IF p_level NOT IN ('debutant', 'intermediaire', 'avance') THEN
    RAISE EXCEPTION 'level invalide';
  END IF;
  IF jsonb_array_length(p_responses) = 0 THEN
    RAISE EXCEPTION 'responses vides';
  END IF;

  -- Normalisation
  p_email      := lower(trim(p_email));
  p_first_name := trim(p_first_name);
  p_last_name  := trim(p_last_name);

  -- Upsert participant (conserve l'UUID existant si email connu)
  INSERT INTO participants (first_name, last_name, email, service, completed_at, total_score, max_score, level)
  VALUES (p_first_name, p_last_name, p_email, p_service, p_completed_at, p_total_score, p_max_score, p_level)
  ON CONFLICT (email) DO UPDATE SET
    first_name   = EXCLUDED.first_name,
    last_name    = EXCLUDED.last_name,
    service      = EXCLUDED.service,
    completed_at = EXCLUDED.completed_at,
    total_score  = EXCLUDED.total_score,
    max_score    = EXCLUDED.max_score,
    level        = EXCLUDED.level
  RETURNING id INTO v_id;

  -- Supprime les anciennes réponses + réinsère les nouvelles
  DELETE FROM responses WHERE participant_id = v_id;

  INSERT INTO responses (participant_id, question_id, answer_values, points_earned)
  SELECT v_id,
         r->>'question_id',
         r->'answer_values',
         (r->>'points_earned')::int
  FROM jsonb_array_elements(p_responses) r;

  RETURN v_id;
END;
$$;

-- Permissions explicites
REVOKE EXECUTE ON FUNCTION submit_quiz FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION submit_quiz TO anon, authenticated;
```

---

## 5. Parcours participant

### Navigation
```
/  →  /quiz  →  /quiz/questions  →  /quiz/resultat?id=<uuid>
```

### Écran 1 — Landing (`/`)
- Header : logo Mister IA × logo Saint-Joseph
- Titre + sous-titre + paragraphe RGPD
- CTA "Commencer le quiz"
- Footer : mentions légales + contact

### Écran 2 — Identité (`/quiz`)
- Formulaire react-hook-form + zod : Prénom*, Nom*, Email professionnel*, Service (optionnel)
- Services (dropdown) : Direction générale · DSN · RH · Qualité · Assistantes de direction · Service international · Autre
- Checkbox RGPD obligatoire
- CTA "Démarrer le quiz"

### Handoff identité → questions
Au submit du formulaire `/quiz`, stocker l'identité dans `sessionStorage` (clé `quiz_identity`) avant de router vers `/quiz/questions`. Au mount de `/quiz/questions`, lire `sessionStorage`. Si absent (navigation directe) → redirect `/quiz`.

### Écran 3 — Questions (`/quiz/questions`)
- Client Component, `useReducer`
- State : `{ answers: Record<string, string[]>, currentIndex: number }`
- Une question à la fois, progress bar ("Question 7 / 20")
- Radio pour `single`, checkbox pour `multiple` (libellé "Plusieurs réponses possibles")
- Bouton "Suivant" désactivé si aucune réponse
- Bouton "Précédent" sauf sur Q1
- `scrollTo(0,0)` à chaque changement de `currentIndex` (UX mobile)
- **Q20 uniquement** : bouton "Valider mes réponses" (libellé + style plus accentué)
  - Au clic : état loading → POST `/api/submit-quiz` → redirect `/quiz/resultat?id=<uuid>`
  - En cas d'erreur : toast + bouton réessayer, state des réponses intact

### Écran 4 — Résultat (`/quiz/resultat`)
- RSC, lit `searchParams.id`
- Requête Supabase : si ID invalide **ou** `completed_at IS NULL` → redirect `/`
- Affiche : niveau (grande carte), score (petit), message personnalisé selon niveau
- Messages :
  - **Débutant :** *"Vous êtes orienté(e) vers le programme Premiers pas avec Copilot Chat..."*
  - **Intermédiaire :** *"Vous êtes orienté(e) vers le programme Approfondir ses usages..."*
  - **Avancé :** *"Vous êtes orienté(e) vers le programme Exploiter Copilot au maximum..."*
- Message de clôture + aucun bouton retour

---

## 6. Logique de scoring

```typescript
// lib/scoring.ts

export function calculateMaxScore(questions: Question[]): number {
  return questions.reduce((total, q) => {
    if (q.type === 'single') {
      return total + Math.max(...q.options.map(o => o.points));
    }
    // multiple : somme des points positifs uniquement
    return total + q.options.filter(o => o.points > 0).reduce((s, o) => s + o.points, 0);
  }, 0);
}

export function calculateScore(answers: Record<string, string[]>, questions: Question[]): number {
  return questions.reduce((total, q) => {
    const selected = answers[q.id] ?? [];
    return total + q.options
      .filter(o => selected.includes(o.value))
      .reduce((s, o) => s + o.points, 0);
  }, 0);
}

export function classify(score: number, maxScore: number): 'debutant' | 'intermediaire' | 'avance' {
  const pct = (score / maxScore) * 100;
  if (pct < 35) return 'debutant';
  if (pct < 70) return 'intermediaire';
  return 'avance';
}

export function applyKnockout(
  answers: Record<string, string[]>,
  level: 'debutant' | 'intermediaire' | 'avance'
): 'debutant' | 'intermediaire' | 'avance' {
  const neverUsed = answers['q1']?.[0] === 'never' && answers['q2']?.includes('none');
  return neverUsed ? 'debutant' : level;
}
```

**Ordre impératif dans `/api/submit-quiz` :**
```
calculateScore → classify → applyKnockout → RPC Supabase
```
Le `level` envoyé à Postgres est la valeur finale après knockout.

**Score max calculé dynamiquement :** ~79 pts (recalculé à runtime depuis `questions.ts`).

**Seuils :** < 35% → Débutant · 35–69% → Intermédiaire · ≥ 70% → Avancé

**Règle knockout :** Q1 = "Jamais" ET Q2 inclut "Aucun" → forcer Débutant.

> **Dépendance importante :** `applyKnockout` référence les valeurs `'never'` (Q1) et `'none'` (Q2). Ces strings doivent correspondre exactement aux champs `value` des options correspondantes dans `lib/questions.ts`. À vérifier lors de l'implémentation.

---

## 7. Parcours admin

### Middleware (`middleware.ts`)
- Vérifie le cookie `admin_session` (JWT HS256 signé avec `ADMIN_SESSION_SECRET`) sur `/admin/*`
- Exceptions : `/admin/login`
- Si absent/invalide → redirect `/admin/login`

### Login (`/admin/login`)
- Client Component, POST `/api/admin/login`
- Compare `ADMIN_PASSWORD` (env) côté serveur
- Succès : cookie httpOnly / Secure / SameSite=Strict / 24h → redirect `/admin/dashboard`

### Dashboard (`/admin/dashboard`) — RSC pur
**URL params :**
```
?level=debutant|intermediaire|avance
&service=DSN
&from=2026-01-01&to=2026-04-30
&q=dupont              ← recherche nom/prénom/email
&sort=created_at&dir=desc
&page=2
&status=complete|incomplete|all   ← défaut : complete
```

**Stats cards (3 requêtes parallèles `Promise.all`) :**
- Total participants
- Répartition par niveau (Débutant N · % / Intermédiaire / Avancé)
- Incomplets (cliquable → ajoute `?status=incomplete` dans l'URL)

**Tableau :**
- Colonnes : Nom · Prénom · Email · Service · Date · Score · Niveau · Lien détail
- Score/Niveau affichent "—" pour les incomplets
- Pagination : 20 par page, `supabase.range()` côté serveur, requête séparée `count:'exact'`
- Affichage : "Page X / Y · N participants"
- `AdminTableHead.tsx` = Client Component (boutons `<button>` sort → `useRouter`)
- `AdminTable.tsx` = RSC (tbody)
- `AdminFilters.tsx` = Client Component (filtres → `router.push()`)

### Export CSV (`/api/admin/export`)
- GET, vérifie cookie admin, accepte mêmes URL params que le dashboard
- Génère CSV : BOM UTF-8, séparateur `;`, RFC 4180, colonnes = dashboard
- Nom de fichier : `participants-saint-joseph-YYYY-MM-DD.csv`

### Détail participant (`/admin/participant/[id]`) — RSC
- Join `participants` + `responses`
- Affiche chaque question avec réponse donnée + points obtenus + total

---

## 8. Charte graphique

```css
--primary:      #2563EB;
--primary-dark: #1E3A8A;
--accent:       #F97316;
--background:   #FFFFFF;
--surface:      #F8FAFC;
--text:         #0F172A;
--text-muted:   #64748B;
--success:      #22C55E;
--error:        #EF4444;
```

- **Typo :** Inter (Google Fonts) — H1 36-48px bold `--primary-dark`, corps 16px `--text`
- **Boutons primaires :** fond `--primary`, texte blanc, radius 8px
- **Cards :** fond blanc, ombre légère, radius 12px, padding 24px
- **Progress bar :** fond `--surface`, remplie en `--primary`
- **Ton :** tutoiement dans les questions, vouvoiement dans les écrans client-facing
- **Logos :** placeholders SVG dans `/public/logos/` (mister-ia.svg, saint-joseph.svg)
- **Responsive :** mobile-first

---

## 9. Variables d'environnement

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=   # chaîne random 32+ chars
```

---

## 10. Sécurité & RGPD

- HTTPS uniquement (Vercel)
- Aucune donnée médicale collectée
- Consentement RGPD explicite (checkbox obligatoire)
- Pas de rate limiting sur le MVP (déduplication par email suffit)
- Validation zod côté serveur sur `/api/submit-quiz`
- Validation + normalisation dans la RPC Postgres (`SECURITY DEFINER`)
- Cookie admin : httpOnly / Secure / SameSite=Strict / 24h
- Service role key jamais exposée côté client
- Pas de cookies tiers (Vercel Analytics = cookie-less)

---

## 11. Seed de démo

Fichier `scripts/seed-demo-participants.ts` :
- 15 participants fictifs avec réponses cohérentes
- Répartition : 5 débutants · 5 intermédiaires · 5 avancés
- 2-3 incomplets (started_at renseigné, completed_at NULL)
- Participants complets → appel RPC `submit_quiz` via Supabase service_role
- Participants incomplets → INSERT direct dans `participants` (bypass RPC, car pas de level/score à valider)

---

## 12. Livrables

1. Code source complet (structure §3)
2. `supabase/migrations/001_init.sql`
3. `scripts/seed-demo-participants.ts`
4. `README.md` (install, Supabase setup, Vercel deploy, changement password admin, ajout/modif question)
5. URL Vercel production fonctionnelle

---

## 13. Décisions prises en session (non issues du brief)

| Décision | Raison |
|---|---|
| Score max calculé dynamiquement via `calculateMaxScore()` | Toute modif de pondération casserait la classification silencieusement si hardcodé |
| Ordre submit-quiz : calculateScore → classify → applyKnockout → RPC | Garantit que le niveau knockout-corrigé est celui envoyé à Postgres |
| `AdminTableHead` Client Component, `AdminTable` RSC | Boutons sort accessibles (`<button>`), tbody reste RSC |
| Pagination via `supabase.range()` + `count:'exact'` | Pagination serveur, pas de chargement inutile |
| Export CSV : BOM UTF-8, séparateur `;` | Compatible Excel français sans conversion |
| Filtre `status=complete\|incomplete\|all` | Expose les incomplets dans le tableau, pas juste dans la stat card |
| Pas de `/quiz/confirmation` — Q20 = "Valider mes réponses" | Réduit la friction, changement de libellé signal suffisant |
| UPSERT sur email + UUID stable | Les URLs admin `/admin/participant/[id]` restent valides après repasse |
| REVOKE/GRANT EXECUTE sur la RPC | Sans ça, l'appel anon est bloqué en 401 |
| Pas de rate limiting MVP | Déduplication email + admin visible suffit pour ce volume |
