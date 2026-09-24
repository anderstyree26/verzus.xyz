-- ============================================================================
-- ANTIGRAVITY — Seed Data
-- ============================================================================

-- Official game profiles (one per major type) -------------------------------
insert into public.game_profiles
  (id, display_name, game_type, platform, roi, constraints, end_keywords, regex_pattern, approved, is_official)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'Subway Surfers (High Score)',
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
    'TrackMania / Speedrun (Time Trial)',
    'LOW_TIME',
    'PC',
    '{"x":0.35,"y":0.05,"w":0.3,"h":0.08}'::jsonb,
    '{"min":0,"max":86400000,"maxJumpPerSec":0}'::jsonb,
    array['Finish','Complete','Results'],
    '(\d{1,2}):(\d{2})(?:\.(\d{2,3}))?',
    true,
    true
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Street Fighter / Tekken (1v1 Fighter)',
    'BINARY_RESULT',
    'CONSOLE',
    '{"x":0.25,"y":0.35,"w":0.5,"h":0.2}'::jsonb,
    '{}'::jsonb,
    array['VICTORY','DEFEAT','WIN','LOSE','K.O.'],
    null,
    true,
    true
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'Chess.com / Rapid 1v1 (Strategy)',
    'BINARY_RESULT',
    'WEB',
    '{"x":0.2,"y":0.2,"w":0.6,"h":0.3}'::jsonb,
    '{}'::jsonb,
    array['Checkmate','Resigned','Time out','Draw'],
    null,
    true,
    true
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    'Flappy Bird / Endless Runner',
    'HIGH_SCORE',
    'MOBILE',
    '{"x":0.4,"y":0.3,"w":0.2,"h":0.1}'::jsonb,
    '{"min":0,"max":9999,"maxJumpPerSec":5}'::jsonb,
    array['Score','Best','Game Over'],
    '([0-9]+)',
    true,
    true
  )
on conflict (id) do update set
  display_name = excluded.display_name,
  game_type = excluded.game_type,
  platform = excluded.platform,
  roi = excluded.roi,
  constraints = excluded.constraints,
  end_keywords = excluded.end_keywords,
  regex_pattern = excluded.regex_pattern,
  approved = excluded.approved,
  is_official = excluded.is_official;

-- One demo season -----------------------------------------------------------
insert into public.seasons (name, starts_at, ends_at, is_active)
values (
  'Season 0 — Genesis',
  now(),
  now() + interval '90 days',
  true
)
on conflict do nothing;

-- One demo sponsor ----------------------------------------------------------
insert into public.sponsors (name, website_url, funded_amount)
values ('Antigravity Foundation', 'https://antigravity.local', 100000)
on conflict do nothing;
