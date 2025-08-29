-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.allocation (
  allocation_id integer NOT NULL DEFAULT nextval('allocation_allocation_id_seq'::regclass),
  user_id integer NOT NULL,
  session_id integer NOT NULL,
  status text,
  paycode_id text NOT NULL,
  CONSTRAINT allocation_pkey PRIMARY KEY (allocation_id),
  CONSTRAINT allocation_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id),
  CONSTRAINT allocation_paycode_id_fkey FOREIGN KEY (paycode_id) REFERENCES public.paycode(code),
  CONSTRAINT allocation_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.session_occurrence(occurrence_id)
);

CREATE TABLE public.approval (
  approval_id integer NOT NULL DEFAULT nextval('approval_approval_id_seq'::regclass),
  request_id integer NOT NULL,
  approver_id integer NOT NULL,
  approval_status USER-DEFINED NOT NULL DEFAULT 'pending'::approval_status,
  approval_date timestamp with time zone DEFAULT now(),
  CONSTRAINT approval_pkey PRIMARY KEY (approval_id),
  CONSTRAINT approval_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.request(request_id),
  CONSTRAINT approval_approver_id_fkey FOREIGN KEY (approver_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.audit_log (
  log_id integer NOT NULL DEFAULT nextval('audit_log_log_id_seq'::regclass),
  user_id integer,
  entity text NOT NULL,
  entity_id integer NOT NULL,
  action character varying NOT NULL,
  before_json jsonb,
  after_json jsonb,
  log_date timestamp with time zone DEFAULT now(),
  CONSTRAINT audit_log_pkey PRIMARY KEY (log_id),
  CONSTRAINT audit_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.budget_transaction (
  transaction_id integer NOT NULL DEFAULT nextval('budget_transaction_transaction_id_seq'::regclass),
  offering_id integer NOT NULL,
  source text NOT NULL,
  reference_id integer,
  delta_amount numeric NOT NULL,
  CONSTRAINT budget_transaction_pkey PRIMARY KEY (transaction_id),
  CONSTRAINT budget_transaction_offering_id_fkey FOREIGN KEY (offering_id) REFERENCES public.unit_offering(offering_id)
);
CREATE TABLE public.cancellationrequest (
  request_id integer NOT NULL,
  occurrence_id integer NOT NULL,
  replacement_mode text NOT NULL CHECK (replacement_mode = ANY (ARRAY['suggest'::character varying::text, 'assign_uc'::character varying::text])),
  suggested_tutor integer,
  timing text NOT NULL,
  reason text NOT NULL,
  CONSTRAINT cancellationrequest_pkey PRIMARY KEY (request_id),
  CONSTRAINT cancellationrequest_suggested_tutor_fkey FOREIGN KEY (suggested_tutor) REFERENCES public.users(user_id),
  CONSTRAINT cancellationrequest_occurrence_id_fkey FOREIGN KEY (occurrence_id) REFERENCES public.session_occurrence(occurrence_id),
  CONSTRAINT cancellationrequest_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.request(request_id)
);
CREATE TABLE public.changerequest (
  request_id integer NOT NULL,
  session_id integer NOT NULL,
  change_description text,
  change_field text CHECK (change_field = ANY (ARRAY['time'::character varying::text, 'location'::character varying::text, 'paycode'::character varying::text])),
  old_val text,
  new_val text,
  CONSTRAINT changerequest_pkey PRIMARY KEY (request_id),
  CONSTRAINT changerequest_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.request(request_id),
  CONSTRAINT changerequest_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.session_occurrence(occurrence_id)
);
CREATE TABLE public.claimrequest (
  request_id integer NOT NULL,
  allocation_id integer,
  occurrence_id integer,
  claimed_hours numeric NOT NULL CHECK (claimed_hours > 0::numeric),
  claimed_paycode text,
  comment text,
  CONSTRAINT claimrequest_pkey PRIMARY KEY (request_id),
  CONSTRAINT claimrequest_allocation_id_fkey FOREIGN KEY (allocation_id) REFERENCES public.allocation(allocation_id),
  CONSTRAINT claimrequest_claimed_paycode_fkey FOREIGN KEY (claimed_paycode) REFERENCES public.paycode(code),
  CONSTRAINT claimrequest_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.request(request_id),
  CONSTRAINT claimrequest_occurrence_id_fkey FOREIGN KEY (occurrence_id) REFERENCES public.session_occurrence(occurrence_id)
);
CREATE TABLE public.comment (
  comment_id integer NOT NULL DEFAULT nextval('comment_comment_id_seq'::regclass),
  request_id integer NOT NULL,
  user_id integer NOT NULL,
  comment_text text NOT NULL,
  comment_date timestamp with time zone DEFAULT now(),
  CONSTRAINT comment_pkey PRIMARY KEY (comment_id),
  CONSTRAINT comment_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.request(request_id),
  CONSTRAINT comment_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.course_unit (
  unit_code text NOT NULL UNIQUE,
  unit_name text NOT NULL,
  unit_description text,
  CONSTRAINT course_unit_pkey PRIMARY KEY (unit_code)
);

CREATE TABLE public.paycode (
  code text NOT NULL UNIQUE,
  paycode_description text,
  amount numeric NOT NULL DEFAULT 0,
  CONSTRAINT paycode_pkey PRIMARY KEY (code)
);
CREATE TABLE public.queryrequest (
  request_id integer NOT NULL,
  subject text NOT NULL,
  details text NOT NULL,
  CONSTRAINT queryrequest_pkey PRIMARY KEY (request_id),
  CONSTRAINT queryrequest_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.request(request_id)
);
CREATE TABLE public.request (
  request_id integer NOT NULL DEFAULT nextval('request_request_id_seq'::regclass),
  requester_id integer NOT NULL,
  offering_id integer NOT NULL,
  request_type USER-DEFINED NOT NULL,
  request_date timestamp with time zone DEFAULT now(),
  request_status USER-DEFINED DEFAULT 'pending'::request_status,
  flags ARRAY DEFAULT '{}'::text[],
  route text DEFAULT 'TA→Admin→UC'::text,
  current_stage text DEFAULT 'Admin Review'::text,
  CONSTRAINT request_pkey PRIMARY KEY (request_id),
  CONSTRAINT request_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES public.users(user_id),
  CONSTRAINT request_offering_id_fkey FOREIGN KEY (offering_id) REFERENCES public.unit_offering(offering_id)
);
CREATE TABLE public.request_attachment (
  id bigint NOT NULL DEFAULT nextval('request_attachment_id_seq'::regclass),
  request_id integer NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  mime_type text,
  size_bytes integer,
  uploaded_at timestamp with time zone DEFAULT now(),
  CONSTRAINT request_attachment_pkey PRIMARY KEY (id),
  CONSTRAINT request_attachment_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.request(request_id)
);
CREATE TABLE public.role (
  role_id integer NOT NULL DEFAULT nextval('role_role_id_seq'::regclass),
  role_name text NOT NULL UNIQUE,
  role_description text,
  CONSTRAINT role_pkey PRIMARY KEY (role_id)
);
CREATE TABLE public.session_occurrence (
  occurrence_id integer NOT NULL DEFAULT nextval('session_occurrence_occurrence_id_seq'::regclass),
  activity_id integer NOT NULL,
  start_at timestamp with time zone NOT NULL,
  end_at timestamp with time zone NOT NULL,
  is_cancelled boolean DEFAULT false,
  location text NOT NULL,
  notes text,
  hours integer,
  CONSTRAINT session_occurrence_pkey PRIMARY KEY (occurrence_id),
  CONSTRAINT session_occurrence_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.teaching_activity(activity_id)
);
CREATE TABLE public.swaprequest (
  request_id integer NOT NULL,
  from_session_id integer NOT NULL,
  to_session_id integer NOT NULL,
  CONSTRAINT swaprequest_pkey PRIMARY KEY (request_id),
  CONSTRAINT swaprequest_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.request(request_id),
  CONSTRAINT swaprequest_from_session_id_fkey FOREIGN KEY (from_session_id) REFERENCES public.session_occurrence(occurrence_id),
  CONSTRAINT swaprequest_to_session_id_fkey FOREIGN KEY (to_session_id) REFERENCES public.session_occurrence(occurrence_id)
);
CREATE TABLE public.teaching_activity (
  activity_id integer NOT NULL DEFAULT nextval('teaching_activity_activity_id_seq'::regclass),
  unit_offering_id integer NOT NULL,
  activity_type text NOT NULL,
  capacity integer,
  activity_name text,
  description text,
  CONSTRAINT teaching_activity_pkey PRIMARY KEY (activity_id),
  CONSTRAINT teaching_activity_unit_offering_id_fkey FOREIGN KEY (unit_offering_id) REFERENCES public.unit_offering(offering_id)
);
CREATE TABLE public.timesheet_entry (
  entry_id integer NOT NULL DEFAULT nextval('timesheet_entry_entry_id_seq'::regclass),
  user_id integer NOT NULL,
  occurrence_id integer NOT NULL,
  approver_id integer,
  start_actual timestamp with time zone NOT NULL,
  end_actual timestamp with time zone NOT NULL,
  minutes integer,
  status USER-DEFINED DEFAULT 'submitted'::timesheet_status,
  minutes_calc integer DEFAULT ((EXTRACT(epoch FROM (end_actual - start_actual)) / (60)::numeric))::integer,
  CONSTRAINT timesheet_entry_pkey PRIMARY KEY (entry_id),
  CONSTRAINT timesheet_entry_occurrence_id_fkey FOREIGN KEY (occurrence_id) REFERENCES public.session_occurrence(occurrence_id),
  CONSTRAINT timesheet_entry_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id),
  CONSTRAINT timesheet_entry_approver_id_fkey FOREIGN KEY (approver_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.unit_offering (
  offering_id integer NOT NULL DEFAULT nextval('unit_offering_offering_id_seq'::regclass),
  course_unit_id text NOT NULL,
  session_code text NOT NULL,
  year integer NOT NULL,
  budget numeric NOT NULL,
  anticipated_enrolments integer,
  actual enrolments integer,
  CONSTRAINT unit_offering_pkey PRIMARY KEY (offering_id),
  CONSTRAINT unit_offering_course_unit_id_fkey FOREIGN KEY (course_unit_id) REFERENCES public.course_unit(unit_code)
);
CREATE TABLE public.user_role (
  user_id integer NOT NULL,
  role_id integer NOT NULL,
  unit_offering_id integer NOT NULL,
  CONSTRAINT user_role_pkey PRIMARY KEY (user_id, role_id, unit_offering_id),
  CONSTRAINT user_role_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.role(role_id),
  CONSTRAINT user_role_unit_offering_id_fkey FOREIGN KEY (unit_offering_id) REFERENCES public.unit_offering(offering_id),
  CONSTRAINT user_role_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.users (
  user_id integer NOT NULL DEFAULT nextval('users_user_id_seq'::regclass),
  auth_uid uuid UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL UNIQUE,
  CONSTRAINT users_pkey PRIMARY KEY (user_id)
);