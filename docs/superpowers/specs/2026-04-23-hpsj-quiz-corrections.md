# Corrections spec — validées le 2026-04-23

Ces 3 corrections s'appliquent à `2026-04-23-hpsj-quiz-design.md`.

## Correction 1 — Sécurité scoring (CRITIQUE) — §6 et §10

**Payload client → serveur :** `{ identity: { first_name, last_name, email, service }, answers: Record<string, string[]> }` uniquement.

Le client n'envoie JAMAIS `total_score`, `level`, ni `points_earned`.

Ordre impératif dans `/api/submit-quiz` :
1. Valider payload zod (identity + answers bruts)
2. `calculateScore(answers, QUESTIONS)` ← serveur recalcule
3. `calculateMaxScore(QUESTIONS)` ← serveur recalcule
4. `classify(score, maxScore)` ← serveur calcule
5. `applyKnockout(answers, level)` ← serveur applique
6. Construire `p_responses` avec `points_earned` recalculés par option
7. Appel RPC Supabase avec toutes les valeurs serveur

Ajouter dans §10 : "Scoring entièrement recompté côté serveur — le client envoie seulement { identity, answers }, jamais de score ou de level."

## Correction 2 — Seed garde-fou NODE_ENV — §11

Première ligne du fichier `scripts/seed-demo-participants.ts` :
```typescript
if (process.env.NODE_ENV === 'production') throw new Error('Ne pas exécuter en production');
```

## Correction 3 — Endpoint /api/check-email + UX formulaire — §3 et §5

**Nouvel endpoint :** `GET /api/check-email?email=xxx` → `{ exists: boolean }` (public, pas d'auth)
Ajouter dans `/app/api/check-email/route.ts`.

**Dans QuizForm.tsx :** à chaque modification du champ email (debounce 500ms), appel GET `/api/check-email`.
Si `exists: true`, afficher sous le champ (non-bloquant, style warning) :
> "Un résultat existe déjà pour cet email. Si vous continuez, votre précédente passation sera remplacée par celle-ci."
L'utilisateur peut tout de même soumettre.
