create table if not exists public.interaction_attempts (
  id bigint generated always as identity primary key,
  visitor_id uuid not null,
  lesson_id text not null,
  interaction_id text not null,
  activity_type text not null check (activity_type in ('predict', 'multiple-choice', 'number-input', 'drag-and-drop')),
  answer jsonb not null,
  is_correct boolean not null,
  attempt_number integer not null check (attempt_number > 0),
  created_at timestamptz not null default now()
);

create index if not exists interaction_attempts_visitor_lesson_created_at_idx
  on public.interaction_attempts (visitor_id, lesson_id, created_at desc);

create index if not exists interaction_attempts_lesson_interaction_idx
  on public.interaction_attempts (lesson_id, interaction_id);

alter table public.interaction_attempts enable row level security;
