-- Table participants
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

-- Table responses
CREATE TABLE responses (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  question_id    text NOT NULL,
  answer_values  jsonb NOT NULL,
  points_earned  int NOT NULL,
  created_at     timestamptz DEFAULT now()
);

CREATE INDEX idx_responses_participant ON responses(participant_id);

-- RLS : tout bloqué côté client, accès uniquement via RPC ou service_role
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses    ENABLE ROW LEVEL SECURITY;

-- Aucune policy = tout bloqué pour anon/authenticated (hors service_role)

-- RPC submit_quiz (atomique, SECURITY DEFINER)
CREATE OR REPLACE FUNCTION submit_quiz(
  p_first_name   text,
  p_last_name    text,
  p_email        text,
  p_service      text,
  p_completed_at timestamptz,
  p_total_score  int,
  p_max_score    int,
  p_level        text,
  p_responses    jsonb
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_id uuid;
BEGIN
  -- Validation
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

  -- UPSERT (conserve l'UUID si email déjà connu)
  INSERT INTO participants
    (first_name, last_name, email, service, completed_at, total_score, max_score, level)
  VALUES
    (p_first_name, p_last_name, p_email, p_service, p_completed_at, p_total_score, p_max_score, p_level)
  ON CONFLICT (email) DO UPDATE SET
    first_name   = EXCLUDED.first_name,
    last_name    = EXCLUDED.last_name,
    service      = EXCLUDED.service,
    completed_at = EXCLUDED.completed_at,
    total_score  = EXCLUDED.total_score,
    max_score    = EXCLUDED.max_score,
    level        = EXCLUDED.level
  RETURNING id INTO v_id;

  -- Supprime les anciennes réponses + réinsère
  DELETE FROM responses WHERE participant_id = v_id;

  INSERT INTO responses (participant_id, question_id, answer_values, points_earned)
  SELECT
    v_id,
    r->>'question_id',
    r->'answer_values',
    (r->>'points_earned')::int
  FROM jsonb_array_elements(p_responses) r;

  RETURN v_id;
END;
$$;

-- Permissions RPC
REVOKE EXECUTE ON FUNCTION submit_quiz FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION submit_quiz TO anon, authenticated;
