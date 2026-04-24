-- Duplicate cafe review and cleanup helpers
-- Run sections one at a time in Supabase SQL Editor.
-- Start with the audit queries before using the delete statements.

-- 1. Exact identity duplicates across the whole curated_cafes table.
with normalized as (
  select
    id,
    slug,
    name,
    street_address,
    city,
    state,
    zip_code,
    lower(trim(name)) as normalized_name,
    lower(trim(coalesce(street_address, ''))) as normalized_street,
    lower(trim(coalesce(city, ''))) as normalized_city,
    lower(trim(coalesce(state, ''))) as normalized_state,
    lower(trim(coalesce(zip_code, ''))) as normalized_zip
  from curated_cafes
),
duplicate_groups as (
  select
    normalized_name,
    normalized_street,
    normalized_city,
    normalized_state,
    normalized_zip,
    count(*) as duplicate_count,
    array_agg(id order by id) as cafe_ids
  from normalized
  group by 1, 2, 3, 4, 5
  having count(*) > 1
)
select *
from duplicate_groups
order by duplicate_count desc, normalized_name, normalized_city;

-- 2. Likely duplicate "your-list" coffees by brand + city.
-- This is looser than the exact identity check and is meant for cases like:
-- "Ceremony Coffee Bethesda" vs "Ceremony Coffee Roasters" in the same city.
with your_list_rows as (
  select
    c.id,
    c.slug,
    c.name,
    c.street_address,
    c.city,
    c.state,
    c.zip_code,
    regexp_replace(
      lower(coalesce(c.name, '')),
      '\m(coffee|roasters|roastery|cafe|espresso)\M',
      '',
      'g'
    ) as stripped_name,
    lower(trim(coalesce(c.city, ''))) as normalized_city
  from curated_cafes c
  join curated_mentions m on m.cafe_id = c.id
  where m.source_id = 'your-list'
),
your_list_grouped as (
  select
    regexp_replace(stripped_name, '\s+', '', 'g') as brand_key,
    normalized_city,
    count(*) as duplicate_count,
    array_agg(id order by id) as cafe_ids,
    array_agg(name order by id) as cafe_names
  from your_list_rows
  group by 1, 2
  having count(*) > 1
)
select *
from your_list_grouped
order by duplicate_count desc, brand_key, normalized_city;

-- 3. Preview which exact duplicate rows would be deleted.
-- Keeps the "best" row by:
--   1) more complete address
--   2) lower id as stable tie-breaker
with ranked_exact_duplicates as (
  select
    c.id,
    c.name,
    c.street_address,
    c.city,
    c.state,
    c.zip_code,
    row_number() over (
      partition by
        lower(trim(c.name)),
        lower(trim(coalesce(c.street_address, ''))),
        lower(trim(coalesce(c.city, ''))),
        lower(trim(coalesce(c.state, ''))),
        lower(trim(coalesce(c.zip_code, '')))
      order by
        (
          case when c.street_address is not null and trim(c.street_address) <> '' then 1 else 0 end +
          case when c.city is not null and trim(c.city) <> '' then 1 else 0 end +
          case when c.state is not null and trim(c.state) <> '' then 1 else 0 end +
          case when c.zip_code is not null and trim(c.zip_code) <> '' then 1 else 0 end
        ) desc,
        c.id asc
    ) as keep_rank
  from curated_cafes c
)
select *
from ranked_exact_duplicates
where keep_rank > 1
order by lower(name), lower(coalesce(city, '')), id;

-- 4. Optional exact-duplicate cleanup.
-- Review section 3 first. Then uncomment and run this delete if it looks correct.
/*
with ranked_exact_duplicates as (
  select
    c.id,
    row_number() over (
      partition by
        lower(trim(c.name)),
        lower(trim(coalesce(c.street_address, ''))),
        lower(trim(coalesce(c.city, ''))),
        lower(trim(coalesce(c.state, ''))),
        lower(trim(coalesce(c.zip_code, '')))
      order by
        (
          case when c.street_address is not null and trim(c.street_address) <> '' then 1 else 0 end +
          case when c.city is not null and trim(c.city) <> '' then 1 else 0 end +
          case when c.state is not null and trim(c.state) <> '' then 1 else 0 end +
          case when c.zip_code is not null and trim(c.zip_code) <> '' then 1 else 0 end
        ) desc,
        c.id asc
    ) as keep_rank
  from curated_cafes c
)
delete from curated_cafes
where id in (
  select id
  from ranked_exact_duplicates
  where keep_rank > 1
);
*/

-- 5. Preview likely "your-list" brand duplicates in the same city.
-- This is intentionally only a preview because it is a looser rule.
with your_list_ranked as (
  select
    c.id,
    c.name,
    c.street_address,
    c.city,
    c.state,
    c.zip_code,
    regexp_replace(
      regexp_replace(
        lower(coalesce(c.name, '')),
        '\m(coffee|roasters|roastery|cafe|espresso)\M',
        '',
        'g'
      ),
      '\s+',
      '',
      'g'
    ) as brand_key,
    lower(trim(coalesce(c.city, ''))) as normalized_city,
    row_number() over (
      partition by
        regexp_replace(
          regexp_replace(
            lower(coalesce(c.name, '')),
            '\m(coffee|roasters|roastery|cafe|espresso)\M',
            '',
            'g'
          ),
          '\s+',
          '',
          'g'
        ),
        lower(trim(coalesce(c.city, '')))
      order by
        (
          case when c.street_address is not null and trim(c.street_address) <> '' then 1 else 0 end +
          case when c.state is not null and trim(c.state) <> '' then 1 else 0 end +
          case when c.zip_code is not null and trim(c.zip_code) <> '' then 1 else 0 end
        ) desc,
        c.id asc
    ) as keep_rank
  from curated_cafes c
  join curated_mentions m on m.cafe_id = c.id
  where m.source_id = 'your-list'
)
select *
from your_list_ranked
where keep_rank > 1
order by brand_key, normalized_city, id;

-- 6. Optional "your-list" duplicate cleanup by brand + city.
-- Use only after reviewing section 5 very carefully.
/*
with your_list_ranked as (
  select
    c.id,
    row_number() over (
      partition by
        regexp_replace(
          regexp_replace(
            lower(coalesce(c.name, '')),
            '\m(coffee|roasters|roastery|cafe|espresso)\M',
            '',
            'g'
          ),
          '\s+',
          '',
          'g'
        ),
        lower(trim(coalesce(c.city, '')))
      order by
        (
          case when c.street_address is not null and trim(c.street_address) <> '' then 1 else 0 end +
          case when c.state is not null and trim(c.state) <> '' then 1 else 0 end +
          case when c.zip_code is not null and trim(c.zip_code) <> '' then 1 else 0 end
        ) desc,
        c.id asc
    ) as keep_rank
  from curated_cafes c
  join curated_mentions m on m.cafe_id = c.id
  where m.source_id = 'your-list'
)
delete from curated_cafes
where id in (
  select id
  from your_list_ranked
  where keep_rank > 1
);
*/
