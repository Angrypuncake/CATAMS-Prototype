CREATE TEMPORARY TABLE tmp_allocations_staging (
  unit_code               text,
  unit_name               text,
  session                 text,
  anticipated_enrolments  integer,
  actual_enrolments       integer,
  allocation_status       text,
  error_text              text,
  activity_type           text,
  activity_description    text,
  activity_name           text,
  activity_date           date,
  activity_start          time without time zone,
  activity_end            time without time zone,
  paycode                 text,
  teaching_role           text,
  staff_id                text,
  staff_name              text,
  faculty                 text,
  school                  text,
  department              text,
  units_hours             numeric
);

-- Load  CSV into tmp_allocations_staging 

INSERT INTO public.teaching_activity (
    unit_offering_id,
    activity_type,
    activity_name,
    activity_description
)
SELECT DISTINCT
    u.offering_id AS unit_offering_id,
    s.activity_type,
    s.activity_name,
    s.activity_description
FROM public.allocations_staging s
JOIN public.unit_offering u
  ON u.course_unit_id = s.unit_code
WHERE s.activity_type IS NOT NULL
  AND s.activity_name IS NOT NULL
ON CONFLICT (unit_offering_id, activity_name) DO NOTHING;



-- Insert distinct occurrences from staging into session_occurrence
INSERT INTO public.session_occurrence (
    activity_id,
    start_at,
    end_at,
    notes,
    hours,
    "Date"
)
SELECT DISTINCT
    t.activity_id,
    s.activity_start::time AS start_time,
    s.activity_end::time   AS end_time,
    s.activity_description AS notes,
    s.units_hours::int     AS hours,
    s.activity_date::date  AS "Date"
FROM public.allocations_staging s
JOIN public.unit_offering u
  ON u.course_unit_id = s.unit_code
JOIN public.teaching_activity t
  ON t.unit_offering_id = u.offering_id
 AND t.activity_name    = s.activity_name
WHERE s.activity_date  IS NOT NULL
  AND s.activity_start IS NOT NULL
  AND s.activity_end   IS NOT NULL
ON CONFLICT (activity_id, "Date", start_at) DO NOTHING;


INSERT INTO public.allocation (
    user_id,
    session_id,
    status,
    paycode_id,
    teaching_role
)
SELECT DISTINCT
    u.user_id,                                      -- internal surrogate user_id
    so.occurrence_id AS session_id,                 -- session occurrence
    s.allocation_status AS status,                  -- from staging
    s.paycode AS paycode_id,                        -- from staging
    s.teaching_role                                 -- from staging
FROM public.allocations_staging s
JOIN public.unit_offering uo
  ON uo.course_unit_id = s.unit_code
JOIN public.teaching_activity ta
  ON ta.unit_offering_id = uo.offering_id
 AND ta.activity_name    = s.activity_name
JOIN public.session_occurrence so
  ON so.activity_id = ta.activity_id
 AND so.start_at = s.activity_start
JOIN public.users u
  ON u.user_id = s.staff_id::int   -- assume int for demo
WHERE s.staff_id IS NOT NULL
  AND s.paycode IS NOT NULL
ON CONFLICT DO NOTHING;
