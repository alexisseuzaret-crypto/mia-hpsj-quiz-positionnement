ALTER TABLE participants
  ADD COLUMN IF NOT EXISTS training_format text CHECK (training_format IN ('presentiel', 'distanciel', 'indifferent'));

CREATE INDEX IF NOT EXISTS idx_participants_training_format ON participants(training_format);

DROP FUNCTION IF EXISTS submit_quiz(text, text, text, text, timestamptz, int, int, text, jsonb);

CREATE FUNCTION submit_quiz(
  p_first_name      text,
  p_last_name       text,
  p_email           text,
  p_service         text,
  p_completed_at    timestamptz,
  p_total_score     int,
  p_max_score       int,
  p_level           text,
  p_responses       jsonb,
  p_training_format text DEFAULT NULL
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

  INSERT INTO participants
    (first_name, last_name, email, service, completed_at, total_score, max_score, level, training_format)
  VALUES
    (p_first_name, p_last_name, p_email, p_service, p_completed_at, p_total_score, p_max_score, p_level, p_training_format)
  ON CONFLICT (email) DO UPDATE SET
    first_name      = EXCLUDED.first_name,
    last_name       = EXCLUDED.last_name,
    service         = EXCLUDED.service,
    completed_at    = EXCLUDED.completed_at,
    total_score     = EXCLUDED.total_score,
    max_score       = EXCLUDED.max_score,
    level           = EXCLUDED.level,
    training_format = EXCLUDED.training_format
  RETURNING id INTO v_id;

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

REVOKE EXECUTE ON FUNCTION submit_quiz(text, text, text, text, timestamptz, int, int, text, jsonb, text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION submit_quiz(text, text, text, text, timestamptz, int, int, text, jsonb, text) TO anon, authenticated;
