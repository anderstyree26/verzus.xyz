-- ============================================================================
-- ANTIGRAVITY — Seed Data
-- ============================================================================

-- Official game profiles (one per major type) -------------------------------
insert into public.game_profiles
  (id, display_name, game_type, platform, roi, constraints, end_keywords, regex_pattern, approved, is_official)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'High Score (Universal)',
    'HIGH_SCORE',
    'MOBILE',
    '{"x":0.65,"y":0.05,"w":0.3,"h":0.08}'::jsonb,
    '{"min":0,"max":100000000,"maxJumpPerSec":5000}'::jsonb,
    array['Game Over','Try Again','High Score'],
    '([0-9][0-9,\.]*)',
    true,
    true
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Time Trial (Universal)',
    'LOW_TIME',
    'MOBILE',
    '{"x":0.35,"y":0.05,"w":0.3,"h":0.08}'::jsonb,
    '{"min":0,"max":86400000,"maxJumpPerSec":0}'::jsonb,
    array['Finish','Complete','Results'],
    '(\d{1,2}):(\d{2})(?:\.(\d{2,3}))?',
    true,
    true
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Win/Loss (Universal)',
    'BINARY_RESULT',
    'MOBILE',
    '{"x":0.25,"y":0.35,"w":0.5,"h":0.2}'::jsonb,
    '{}'::jsonb,
    array['VICTORY','DEFEAT','WIN','LOSE'],
    null,
    true,
    true
  );

-- One demo season -----------------------------------------------------------
insert into public.seasons (name, starts_at, ends_at, is_active)
values (
  'Season 0 — Genesis',
  now(),
  now() + interval '90 days',
  true
);

-- One demo sponsor ----------------------------------------------------------
insert into public.sponsors (name, website_url, funded_amount)
values ('Antigravity Foundation', 'https://antigravity.local', 100000);
