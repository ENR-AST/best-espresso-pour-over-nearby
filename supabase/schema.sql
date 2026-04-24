create table if not exists curated_sources (
  id text primary key,
  name text not null,
  category text not null check (category in ('editorial', 'curated-app', 'community', 'public-review')),
  home_url text
);

create table if not exists curated_cafes (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null,
  street_address text,
  city text,
  state text,
  neighborhood text,
  zip_code text,
  latitude double precision,
  longitude double precision,
  tags text[] not null default array['specialty']::text[]
);

create unique index if not exists curated_cafes_identity_idx
on curated_cafes (
  lower(name),
  lower(coalesce(street_address, '')),
  lower(coalesce(city, '')),
  lower(coalesce(state, '')),
  lower(coalesce(zip_code, ''))
);

alter table curated_cafes add column if not exists street_address text;
alter table curated_cafes add column if not exists state text;
alter table curated_cafes add column if not exists zip_code text;
alter table curated_cafes add column if not exists latitude double precision;
alter table curated_cafes add column if not exists longitude double precision;

create table if not exists curated_mentions (
  id bigint generated always as identity primary key,
  source_id text not null references curated_sources(id) on delete cascade,
  cafe_id bigint not null references curated_cafes(id) on delete cascade,
  confidence numeric not null default 0.5,
  evidence_note text not null,
  source_url text not null,
  espresso_boost numeric,
  pour_over_boost numeric,
  roaster_boost numeric,
  credibility_boost numeric,
  coffee_focus_boost numeric,
  transparency_boost numeric,
  signal_notes text[] default '{}',
  avoid_notes text[] default '{}',
  penalty_signals text[] default '{}',
  unique (source_id, cafe_id, source_url)
);

create index if not exists curated_mentions_source_idx on curated_mentions(source_id);
create index if not exists curated_mentions_cafe_idx on curated_mentions(cafe_id);

create table if not exists personal_saved_cities (
  id bigint generated always as identity primary key,
  label text not null,
  value text not null unique,
  position integer not null default 0
);

create index if not exists personal_saved_cities_position_idx on personal_saved_cities(position);
