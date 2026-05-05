-- Migration 003 : ajout site/pôle participants + other_text réponses

ALTER TABLE participants
  ADD COLUMN site text,
  ADD COLUMN pole text;

CREATE INDEX idx_participants_site ON participants(site);
CREATE INDEX idx_participants_pole ON participants(pole);

ALTER TABLE responses
  ADD COLUMN other_text text;

-- Recréer submit_quiz avec p_site, p_pole et other_text dans responses
DROP FUNCTION IF EXISTS submit_quiz(text, text, text, text, timestamptz, int, int, text, jsonb, text);

CREATE OR REPLACE FUNCTION submit_quiz(
  p_first_name      text,
  p_last_name       text,
  p_email           text,
  p_service         text,
  p_completed_at    timestamptz,
  p_total_score     int,
  p_max_score       int,
  p_level           text,
  p_responses       jsonb,
  p_training_format text DEFAULT NULL,
  p_site            text DEFAULT NULL,
  p_pole            text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_id uuid;
BEGIN
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
  IF p_training_format IS NOT NULL AND p_training_format NOT IN ('presentiel', 'distanciel', 'indifferent') THEN
    RAISE EXCEPTION 'training_format invalide';
  END IF;

  p_email      := lower(trim(p_email));
  p_first_name := trim(p_first_name);
  p_last_name  := trim(p_last_name);
  IF p_site IS NOT NULL THEN p_site := trim(p_site); END IF;
  IF p_pole IS NOT NULL THEN p_pole := trim(p_pole); END IF;
  IF p_service IS NOT NULL THEN p_service := trim(p_service); END IF;

  INSERT INTO participants
    (first_name, last_name, email, service, completed_at, total_score, max_score, level, training_format, site, pole)
  VALUES
    (p_first_name, p_last_name, p_email, p_service, p_completed_at, p_total_score, p_max_score, p_level, p_training_format, p_site, p_pole)
  ON CONFLICT (email) DO UPDATE SET
    first_name      = EXCLUDED.first_name,
    last_name       = EXCLUDED.last_name,
    service         = EXCLUDED.service,
    completed_at    = EXCLUDED.completed_at,
    total_score     = EXCLUDED.total_score,
    max_score       = EXCLUDED.max_score,
    level           = EXCLUDED.level,
    training_format = EXCLUDED.training_format,
    site            = EXCLUDED.site,
    pole            = EXCLUDED.pole
  RETURNING id INTO v_id;

  DELETE FROM responses WHERE participant_id = v_id;

  INSERT INTO responses (participant_id, question_id, answer_values, points_earned, other_text)
  SELECT
    v_id,
    r->>'question_id',
    r->'answer_values',
    (r->>'points_earned')::int,
    r->>'other_text'
  FROM jsonb_array_elements(p_responses) r;

  RETURN v_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION submit_quiz(text, text, text, text, timestamptz, int, int, text, jsonb, text, text, text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION submit_quiz(text, text, text, text, timestamptz, int, int, text, jsonb, text, text, text) TO anon, authenticated;
