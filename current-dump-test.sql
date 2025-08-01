--
-- PostgreSQL database dump
--

-- Dumped from database version 15.13 (Debian 15.13-1.pgdg120+1)
-- Dumped by pg_dump version 15.13 (Debian 15.13-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: attachments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attachments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    test_case_id uuid NOT NULL,
    filename character varying(255) NOT NULL,
    original_filename character varying(255) NOT NULL,
    file_path character varying(500) NOT NULL,
    file_size integer NOT NULL,
    mime_type character varying(100),
    description text,
    uploaded_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: TABLE attachments; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.attachments IS '╨Т╨╗╨╛╨╢╨╡╨╜╨╕╤П ╨║ ╤В╨╡╤Б╤В-╨║╨╡╨╣╤Б╨░╨╝ (╤Б╨║╤А╨╕╨╜╤И╨╛╤В╤Л, ╨┤╨╛╨║╤Г╨╝╨╡╨╜╤В╤Л, ╨╗╨╛╨│╨╕ ╨╕ ╤В.╨┤.)';


--
-- Name: COLUMN attachments.filename; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.attachments.filename IS '╨г╨╜╨╕╨║╨░╨╗╤М╨╜╨╛╨╡ ╨╕╨╝╤П ╤Д╨░╨╣╨╗╨░ ╨▓ ╤Б╨╕╤Б╤В╨╡╨╝╨╡';


--
-- Name: COLUMN attachments.original_filename; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.attachments.original_filename IS '╨Ю╤А╨╕╨│╨╕╨╜╨░╨╗╤М╨╜╨╛╨╡ ╨╕╨╝╤П ╤Д╨░╨╣╨╗╨░';


--
-- Name: COLUMN attachments.file_path; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.attachments.file_path IS '╨Я╤Г╤В╤М ╨║ ╤Д╨░╨╣╨╗╤Г ╨▓ ╤Д╨░╨╣╨╗╨╛╨▓╨╛╨╣ ╤Б╨╕╤Б╤В╨╡╨╝╨╡';


--
-- Name: COLUMN attachments.file_size; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.attachments.file_size IS '╨а╨░╨╖╨╝╨╡╤А ╤Д╨░╨╣╨╗╨░ ╨▓ ╨▒╨░╨╣╤В╨░╤Е';


--
-- Name: COLUMN attachments.mime_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.attachments.mime_type IS 'MIME-╤В╨╕╨┐ ╤Д╨░╨╣╨╗╨░';


--
-- Name: COLUMN attachments.description; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.attachments.description IS '╨Ю╨┐╨╕╤Б╨░╨╜╨╕╨╡ ╨▓╨╗╨╛╨╢╨╡╨╜╨╕╤П';


--
-- Name: checklist_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.checklist_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    checklist_id uuid,
    title character varying(200) NOT NULL,
    description text,
    is_required boolean DEFAULT false,
    order_index integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: checklist_results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.checklist_results (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    test_result_id uuid,
    checklist_item_id uuid,
    status character varying(20) DEFAULT 'not_checked'::character varying,
    notes text,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: checklists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.checklists (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    project_id uuid,
    test_case_id uuid,
    title character varying(200) NOT NULL,
    description text,
    created_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    entity_type character varying(20) NOT NULL,
    entity_id uuid NOT NULL,
    user_id uuid,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    git_repo_url character varying(255),
    git_branch character varying(100) DEFAULT 'main'::character varying,
    created_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
);


--
-- Name: tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tags (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(50) NOT NULL,
    color character varying(7) DEFAULT '#6B7280'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: test_case_sections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.test_case_sections (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    project_id uuid,
    parent_id uuid,
    name character varying(100) NOT NULL,
    order_index integer DEFAULT 0,
    is_deleted boolean DEFAULT false,
    deleted_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: test_case_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.test_case_tags (
    test_case_id uuid NOT NULL,
    tag_id uuid NOT NULL
);


--
-- Name: test_cases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.test_cases (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    project_id uuid,
    test_plan_id uuid,
    title character varying(200) NOT NULL,
    description text,
    preconditions text,
    steps text,
    expected_result text,
    priority character varying(20) DEFAULT 'medium'::character varying,
    status character varying(20) DEFAULT 'draft'::character varying,
    created_by uuid,
    assigned_to uuid,
    section_id uuid,
    is_deleted boolean DEFAULT false,
    deleted_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: test_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.test_plans (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    project_id uuid,
    name character varying(100) NOT NULL,
    description text,
    status character varying(20) DEFAULT 'draft'::character varying,
    created_by uuid,
    is_deleted boolean DEFAULT false,
    deleted_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: test_results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.test_results (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    test_run_id uuid,
    test_case_id uuid,
    status character varying(20) DEFAULT 'not_run'::character varying,
    executed_by uuid,
    executed_at timestamp without time zone,
    notes text,
    duration integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: test_runs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.test_runs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    test_plan_id uuid,
    name character varying(100) NOT NULL,
    description text,
    status character varying(20) DEFAULT 'planned'::character varying,
    started_by uuid,
    started_at timestamp without time zone,
    completed_at timestamp without time zone,
    is_deleted boolean DEFAULT false,
    deleted_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    first_name character varying(50),
    last_name character varying(50),
    role character varying(20) DEFAULT 'user'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Data for Name: attachments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.attachments (id, test_case_id, filename, original_filename, file_path, file_size, mime_type, description, uploaded_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: checklist_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.checklist_items (id, checklist_id, title, description, is_required, order_index, created_at) FROM stdin;
\.


--
-- Data for Name: checklist_results; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.checklist_results (id, test_result_id, checklist_item_id, status, notes, executed_at) FROM stdin;
\.


--
-- Data for Name: checklists; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.checklists (id, project_id, test_case_id, title, description, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.comments (id, entity_type, entity_id, user_id, content, created_at) FROM stdin;
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.projects (id, name, description, git_repo_url, git_branch, created_by, created_at, updated_at, is_deleted, deleted_at) FROM stdin;
b5c5b2b7-1e52-4600-adcb-c5d2b39adf21	╨б	╨░╨▒╨╛╤А ╤В╨╡╤Б╤В-╨║╨╡╨╣╤Б╨╛╨▓ ╨┤╨╗╤П ╤В╨╡╤Б╤В╨╕╤А╨╛╨▓╨░╨╜╨╕╤П ╨б	https://github.com/TmsTestSystem/case_test.git	main	00000000-0000-0000-0000-000000000001	2025-08-01 15:04:10.476952	2025-08-01 15:04:10.476952	f	\N
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tags (id, name, color, created_at) FROM stdin;
3d4f7489-08db-4cc5-a270-0706628dc6f0	╨Ъ╤А╨╕╤В╨╕╤З╨╡╤Б╨║╨╕╨╣	#EF4444	2025-08-01 14:54:24.404966
39689c9a-be2c-46d3-99fe-d5b40f22f076	╨Т╤Л╤Б╨╛╨║╨╕╨╣	#F59E0B	2025-08-01 14:54:24.404966
c843934f-f2f0-4cfa-b7c0-db7d3b85ea32	╨б╤А╨╡╨┤╨╜╨╕╨╣	#10B981	2025-08-01 14:54:24.404966
0edab4e1-99b2-4b64-96a8-2d8bc36cadb5	╨Э╨╕╨╖╨║╨╕╨╣	#6B7280	2025-08-01 14:54:24.404966
60712e25-08ed-4d03-97a8-43e93f906638	╨С╨░╨│	#DC2626	2025-08-01 14:54:24.404966
0cd82449-6c76-4ac7-885c-ae9e6e110a06	╨г╨╗╤Г╤З╤И╨╡╨╜╨╕╨╡	#2563EB	2025-08-01 14:54:24.404966
\.


--
-- Data for Name: test_case_sections; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.test_case_sections (id, project_id, parent_id, name, order_index, is_deleted, deleted_at, created_at, updated_at) FROM stdin;
e793b543-44d6-419e-8ed1-ffac62b3e507	b5c5b2b7-1e52-4600-adcb-c5d2b39adf21	\N	╨Т╤Е╨╛╨┤ ╨╜╨░ ╨┐╨╗╨░╤В╤Д╨╛╤А╨╝╤Г	0	f	\N	2025-07-31 15:44:32.827	2025-07-31 15:44:32.827
1d1d263e-745f-43f2-9494-224481b4e56f	b5c5b2b7-1e52-4600-adcb-c5d2b39adf21	e793b543-44d6-419e-8ed1-ffac62b3e507	╨Т╨╛╤Б╤Б╤В╨░╨╜╨╛╨▓╨╗╨╡╨╜╨╕╨╡ ╨┐╨░╤А╨╛╨╗╤П	0	f	\N	2025-07-31 15:44:59.621	2025-07-31 15:44:59.621
45038ee2-9927-40be-b299-3d4d5e00c6d0	b5c5b2b7-1e52-4600-adcb-c5d2b39adf21	\N	╨п╨╖╤Л╨║ ╨▓╤Л╤А╨░╨╢╨╡╨╜╨╕╨╣	2	f	\N	2025-08-01 15:14:41.328858	2025-08-01 15:14:41.328858
95e96c84-840b-4f94-8f28-10db98bff94d	b5c5b2b7-1e52-4600-adcb-c5d2b39adf21	45038ee2-9927-40be-b299-3d4d5e00c6d0	╨░╨╖╨┤╨╡╨╗╨╡╨╜╨╕╤П ╨╛╨┐╨╡╤А╨░╤В╨╛╤А╨╛╨▓ ╤З╨╡╤А╨╡╨╖ ;	3	f	\N	2025-08-01 15:14:49.396663	2025-08-01 15:14:49.396663
\.


--
-- Data for Name: test_case_tags; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.test_case_tags (test_case_id, tag_id) FROM stdin;
\.


--
-- Data for Name: test_cases; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.test_cases (id, project_id, test_plan_id, title, description, preconditions, steps, expected_result, priority, status, created_by, assigned_to, section_id, is_deleted, deleted_at, created_at, updated_at) FROM stdin;
0b5bc9ed-0fb0-4d82-a433-76bf11b438e5	b5c5b2b7-1e52-4600-adcb-c5d2b39adf21	fcb2a77f-c984-459e-93f7-b5bf96c3dc00	╨Я╨╛╨┐╤Л╤В╨║╨░ ╨▓╨╛╤Б╤Б╤В╨░╨╜╨╛╨▓╨╗╨╡╨╜╨╕╤П ╨┐╨░╤А╨╛╨╗╤П ╨┤╨╗╤П ╨┤╨╡╨░╨║╤В╨╕╨▓╨╕╤А╨╛╨▓╨░╨╜╨╜╨╛╨│╨╛ ╨┐╨╛╨╗╤М╨╖╨╛╨▓╨░╤В╨╡╨╗╤П		╨г╤З╨╡╤В╨╜╨░╤П ╨╖╨░╨┐╨╕╤Б╤М ╨┐╨╛╨╗╤М╨╖╨╛╨▓╨░╤В╨╡╨╗╤П ╤Б╤Г╤Й╨╡╤Б╤В╨▓╤Г╨╡╤В, ╨╜╨╛ ╨┤╨╡╨░╨║╤В╨╕╨▓╨╕╤А╨╛╨▓╨░╨╜╨░.	1. ╨Т╨▓╨╡╤Б╤В╨╕ email ╨┤╨╡╨░╨║╤В╨╕╨▓╨╕╤А╨╛╨▓╨░╨╜╨╜╨╛╨│╨╛ ╨┐╨╛╨╗╤М╨╖╨╛╨▓╨░╤В╨╡╨╗╤П.\n\n2. ╨Э╨░╨╢╨░╤В╤М ╨║╨╜╨╛╨┐╨║╤Г "╨Я╨╛╨╗╤Г╤З╨╕╤В╤М ╨┐╨╕╤Б╤М╨╝╨╛".	╨Я╨╛╤П╨▓╨╗╤П╨╡╤В╤Б╤П ╤Б╨╛╨╛╨▒╤Й╨╡╨╜╨╕╨╡: "╨Э╨╡ ╤Г╨┤╨░╨╗╨╛╤Б╤М ╨╛╨▒╤А╨░╨▒╨╛╤В╨░╤В╤М".\n\n╨Я╨╕╤Б╤М╨╝╨╛ ╨╜╨╡ ╨╛╤В╨┐╤А╨░╨▓╨╗╤П╨╡╤В╤Б╤П.	medium	draft	\N	\N	1d1d263e-745f-43f2-9494-224481b4e56f	f	\N	2025-07-31 15:50:04.441	2025-07-31 16:20:06.193
64ef9bc7-10fc-434e-ae9b-758f6e028fbb	b5c5b2b7-1e52-4600-adcb-c5d2b39adf21	fcb2a77f-c984-459e-93f7-b5bf96c3dc00	╨г╤Б╨┐╨╡╤И╨╜╨╛╨╡ ╨╕╨╖╨╝╨╡╨╜╨╡╨╜╨╕╨╡ ╨┐╨░╤А╨╛╨╗╤П ╨┐╨╛ ╤Б╤Б╤Л╨╗╨║╨╡ ╨╕╨╖ ╨┐╨╕╤Б╤М╨╝╨░		╨Я╨╛╨╗╤М╨╖╨╛╨▓╨░╤В╨╡╨╗╤М ╨┐╨╡╤А╨╡╤И╨╡╨╗ ╨┐╨╛ ╤Б╤Б╤Л╨╗╨║╨╡ ╨╕╨╖ ╨┐╨╕╤Б╤М╨╝╨░ ╨┤╨╗╤П ╨▓╨╛╤Б╤Б╤В╨░╨╜╨╛╨▓╨╗╨╡╨╜╨╕╤П ╨┐╨░╤А╨╛╨╗╤П.	1. ╨Т╨▓╨╡╤Б╤В╨╕ ╨╜╨╛╨▓╤Л╨╣ ╨┐╨░╤А╨╛╨╗╤М ╨▓ ╨┐╨╛╨╗╨╡ "╨Э╨╛╨▓╤Л╨╣ ╨┐╨░╤А╨╛╨╗╤М".\n\n2. ╨Т╨▓╨╡╤Б╤В╨╕ ╤В╨╛╤В ╨╢╨╡ ╨┐╨░╤А╨╛╨╗╤М ╨▓ ╨┐╨╛╨╗╨╡ "╨Я╨╛╨┤╤В╨▓╨╡╤А╨┤╨╕╤В╨╡ ╨┐╨░╤А╨╛╨╗╤М".\n\n3. ╨Э╨░╨╢╨░╤В╤М ╨║╨╜╨╛╨┐╨║╤Г "╨Т╨╛╤Б╤Б╤В╨░╨╜╨╛╨▓╨╕╤В╤М".	╨Я╨░╤А╨╛╨╗╤М ╤Г╤Б╨┐╨╡╤И╨╜╨╛ ╨╕╨╖╨╝╨╡╨╜╨╡╨╜.\n\n╨Я╨╛╨╗╤М╨╖╨╛╨▓╨░╤В╨╡╨╗╤М ╨┐╨╡╤А╨╡╨╜╨░╨┐╤А╨░╨▓╨╗╨╡╨╜ ╨╜╨░ ╤Б╤В╤А╨░╨╜╨╕╤Ж╤Г ╨░╨▓╤В╨╛╤А╨╕╨╖╨░╤Ж╨╕╨╕.\n\n╨Т╨╛╨╖╨╝╨╛╨╢╨╡╨╜ ╨▓╤Е╨╛╨┤ ╤Б ╨╜╨╛╨▓╤Л╨╝ ╨┐╨░╤А╨╛╨╗╨╡╨╝.	medium	draft	\N	\N	1d1d263e-745f-43f2-9494-224481b4e56f	f	\N	2025-07-31 15:50:57.632	2025-07-31 16:20:06.159
d5b6481e-84f6-4f5c-8b7c-0c1debe5a72a	b5c5b2b7-1e52-4600-adcb-c5d2b39adf21	fcb2a77f-c984-459e-93f7-b5bf96c3dc00	╨Т╨▓╨╛╨┤ ╨╜╨╡╤Б╤Г╤Й╨╡╤Б╤В╨▓╤Г╤О╤Й╨╡╨│╨╛ email ╨┐╤А╨╕ ╨▓╨╛╤Б╤Б╤В╨░╨╜╨╛╨▓╨╗╨╡╨╜╨╕╨╕ ╨┐╨░╤А╨╛╨╗╤П		╨Я╨╛╨╗╤М╨╖╨╛╨▓╨░╤В╨╡╨╗╤М ╨╜╨░╤Е╨╛╨┤╨╕╤В╤Б╤П ╨╜╨░ ╤Б╤В╤А╨░╨╜╨╕╤Ж╨╡ ╨▓╨╛╤Б╤Б╤В╨░╨╜╨╛╨▓╨╗╨╡╨╜╨╕╤П ╨┐╨░╤А╨╛╨╗╤П.	1. ╨Т╨▓╨╡╤Б╤В╨╕ ╨╜╨╡╤Б╤Г╤Й╨╡╤Б╤В╨▓╤Г╤О╤Й╨╕╨╣ email.\n\n2. ╨Э╨░╨╢╨░╤В╤М ╨║╨╜╨╛╨┐╨║╤Г "╨Я╨╛╨╗╤Г╤З╨╕╤В╤М ╨┐╨╕╤Б╤М╨╝╨╛".	╨Я╨╛╤П╨▓╨╗╤П╨╡╤В╤Б╤П ╤Б╨╛╨╛╨▒╤Й╨╡╨╜╨╕╨╡: "╨Э╨╡ ╤Г╨┤╨░╨╗╨╛╤Б╤М ╨╛╨▒╤А╨░╨▒╨╛╤В╨░╤В╤М" (╨╕╨╗╨╕ "╨Я╨╛╨╗╤М╨╖╨╛╨▓╨░╤В╨╡╨╗╤М ╨╜╨╡ ╨╜╨░╨╣╨┤╨╡╨╜").\n\n╨Я╨╕╤Б╤М╨╝╨╛ ╨╜╨╡ ╨╛╤В╨┐╤А╨░╨▓╨╗╤П╨╡╤В╤Б╤П.	medium	draft	\N	\N	1d1d263e-745f-43f2-9494-224481b4e56f	f	\N	2025-07-31 15:49:26.195	2025-07-31 16:20:06.194
f6d834fd-0b82-4f7f-81c7-28251bf63678	b5c5b2b7-1e52-4600-adcb-c5d2b39adf21	fcb2a77f-c984-459e-93f7-b5bf96c3dc00	╨Ю╤И╨╕╨▒╨║╨░ ╨┐╤А╨╕ ╨╜╨╡╤Б╨╛╨▓╨┐╨░╨┤╨╡╨╜╨╕╨╕ ╨┐╨░╤А╨╛╨╗╨╡╨╣		╨Я╨╛╨╗╤М╨╖╨╛╨▓╨░╤В╨╡╨╗╤М ╨┐╨╡╤А╨╡╤И╨╡╨╗ ╨┐╨╛ ╤Б╤Б╤Л╨╗╨║╨╡ ╨╕╨╖ ╨┐╨╕╤Б╤М╨╝╨░ ╨┤╨╗╤П ╨▓╨╛╤Б╤Б╤В╨░╨╜╨╛╨▓╨╗╨╡╨╜╨╕╤П ╨┐╨░╤А╨╛╨╗╤П.	1. ╨Т╨▓╨╡╤Б╤В╨╕ ╨╜╨╛╨▓╤Л╨╣ ╨┐╨░╤А╨╛╨╗╤М ╨▓ ╨┐╨╛╨╗╨╡ "╨Э╨╛╨▓╤Л╨╣ ╨┐╨░╤А╨╛╨╗╤М".\n\n2. ╨Т╨▓╨╡╤Б╤В╨╕ ╨┤╤А╤Г╨│╨╛╨╣ ╨┐╨░╤А╨╛╨╗╤М ╨▓ ╨┐╨╛╨╗╨╡ "╨Я╨╛╨┤╤В╨▓╨╡╤А╨┤╨╕╤В╨╡ ╨┐╨░╤А╨╛╨╗╤М".\n\n3. ╨Э╨░╨╢╨░╤В╤М ╨║╨╜╨╛╨┐╨║╤Г "╨Т╨╛╤Б╤Б╤В╨░╨╜╨╛╨▓╨╕╤В╤М".\n	╨Я╨╛╤П╨▓╨╗╤П╨╡╤В╤Б╤П ╤Б╨╛╨╛╨▒╤Й╨╡╨╜╨╕╨╡: "╨Я╨░╤А╨╛╨╗╨╕ ╨╜╨╡ ╤Б╨╛╨▓╨┐╨░╨┤╨░╤О╤В".\n\n╨Ш╨╖╨╝╨╡╨╜╨╡╨╜╨╕╨╡ ╨┐╨░╤А╨╛╨╗╤П ╨╜╨╡ ╨┐╤А╨╛╨╕╤Б╤Е╨╛╨┤╨╕╤В.	medium	draft	\N	\N	1d1d263e-745f-43f2-9494-224481b4e56f	f	\N	2025-07-31 15:53:10.556	2025-07-31 16:20:06.119
fdcafda9-bdac-4a55-8aed-14c136c426aa	b5c5b2b7-1e52-4600-adcb-c5d2b39adf21	fcb2a77f-c984-459e-93f7-b5bf96c3dc00	╨г╤Б╨┐╨╡╤И╨╜╤Л╨╣ ╨╖╨░╨┐╤А╨╛╤Б ╨╜╨░ ╨▓╨╛╤Б╤Б╤В╨░╨╜╨╛╨▓╨╗╨╡╨╜╨╕╨╡ ╨┐╨░╤А╨╛╨╗╤П		- ╨Я╨╛╨╗╤М╨╖╨╛╨▓╨░╤В╨╡╨╗╤М ╨╜╨░╤Е╨╛╨┤╨╕╤В╤Б╤П ╨╜╨░ ╤Б╤В╤А╨░╨╜╨╕╤Ж╨╡ ╨░╨▓╤В╨╛╤А╨╕╨╖╨░╤Ж╨╕╨╕.\n\n- ╨г╤З╨╡╤В╨╜╨░╤П ╨╖╨░╨┐╨╕╤Б╤М ╨┐╨╛╨╗╤М╨╖╨╛╨▓╨░╤В╨╡╨╗╤П ╨░╨║╤В╨╕╨▓╨╜╨░.\n	1. ╨Э╨░╨╢╨░╤В╤М ╨║╨╜╨╛╨┐╨║╤Г "╨Ч╨░╨▒╤Л╨╗╨╕ ╨┐╨░╤А╨╛╨╗╤М?".\n\n2. ╨Т ╨╛╤В╨║╤А╤Л╨▓╤И╨╡╨╝╤Б╤П ╨╛╨║╨╜╨╡ ╨▓╨▓╨╡╤Б╤В╨╕ ╨▓╨░╨╗╨╕╨┤╨╜╤Л╨╣ email, ╨┐╤А╨╕╨▓╤П╨╖╨░╨╜╨╜╤Л╨╣ ╨║ ╨░╨║╨║╨░╤Г╨╜╤В╤Г.\n\n3. ╨Э╨░╨╢╨░╤В╤М ╨║╨╜╨╛╨┐╨║╤Г "╨Я╨╛╨╗╤Г╤З╨╕╤В╤М ╨┐╨╕╤Б╤М╨╝╨╛".	╨Я╨╛╤П╨▓╨╗╤П╨╡╤В╤Б╤П ╤Г╨▓╨╡╨┤╨╛╨╝╨╗╨╡╨╜╨╕╨╡: "╨Я╨╕╤Б╤М╨╝╨╛ ╤Б ╨╕╨╜╤Б╤В╤А╤Г╨║╤Ж╨╕╨╡╨╣ ╨╛╤В╨┐╤А╨░╨▓╨╗╨╡╨╜╨╛ ╨╜╨░ ╨▓╨░╤И email".\n\n╨Э╨░ ╤Г╨║╨░╨╖╨░╨╜╨╜╤Г╤О ╨┐╨╛╤З╤В╤Г ╨┐╤А╨╕╤Е╨╛╨┤╨╕╤В ╨┐╨╕╤Б╤М╨╝╨╛ ╤Б╨╛ ╤Б╤Б╤Л╨╗╨║╨╛╨╣ ╨┤╨╗╤П ╨▓╨╛╤Б╤Б╤В╨░╨╜╨╛╨▓╨╗╨╡╨╜╨╕╤П ╨┐╨░╤А╨╛╨╗╤П.	medium	draft	\N	\N	1d1d263e-745f-43f2-9494-224481b4e56f	f	\N	2025-07-31 15:48:29.813	2025-07-31 16:20:06.053
5ab18431-77a8-4dd9-9a4a-226a62abb668	b5c5b2b7-1e52-4600-adcb-c5d2b39adf21	\N	╨а╨░╨╖╨┤╨╡╨╗╨╡╨╜╨╕╨╡ ╨╛╨┐╨╡╤А╨░╤В╨╛╤А╨╛╨▓ ╨▓ ╨╛╨┤╨╜╨╛╨╣ ╤Б╤В╤А╨╛╨║╨╡	╨Я╤А╨╛╨▓╨╡╤А╨║╨░ ╨║╨╛╤А╤А╨╡╨║╤В╨╜╨╛╤Б╤В╨╕ ╨▓╤Л╤З╨╕╤Б╨╗╨╡╨╜╨╕╤П ╨┐╨╛╤Б╨╗╨╡╨┤╨╜╨╡╨│╨╛ ╨▓╤Л╤А╨░╨╢╨╡╨╜╨╕╤П	╨б╨╛╨╖╨┤╨░╨╜ ╨┐╤А╨╛╤Ж╨╡╤Б╤Б: ╨б╤В╨░╤А╤В тЖТ ╨Я╤А╨╕╤Б╨▓╨░╨╕╨▓╨░╨╜╨╕╨╡ тЖТ ╨Ъ╨╛╨╜╨╡╤Ж.\r\n╨Т ╨┐╤А╨╛╤Ж╨╡╤Б╤Б╨╡ ╨╛╨▒╤К╤П╨▓╨╗╨╡╨╜╨░ ╨┐╨╡╤А╨╡╨╝╨╡╨╜╨╜╨░╤П a (╤В╨╕╨┐ integer).\r\n╨Т╤Е╨╛╨┤╨╜╤Л╨╡ ╨┤╨░╨╜╨╜╤Л╨╡: {"a": 1}.	1. ╨Ю╤В╨║╤А╤Л╤В╤М ╨╜╨░╤Б╤В╤А╨╛╨╣╨║╨╕ ╨║╨╛╨╝╨┐╨╛╨╜╨╡╨╜╤В╨░ "╨Я╤А╨╕╤Б╨▓╨░╨╕╨▓╨░╨╜╨╕╨╡".\r\n2. ╨Ф╨╛╨▒╨░╨▓╨╕╤В╤М ╨┐╨╡╤А╨╡╨╝╨╡╨╜╨╜╤Г╤О.\r\n3. ╨Т ╨┐╨╛╨╗╨╡ ╨┐╨╡╤А╨╡╨╝╨╡╨╜╨╜╨╛╨╣ ╨▓╨▓╨╡╤Б╤В╨╕ $var.a.\r\n4. ╨Т ╨┐╨╛╨╗╨╡ ╨╖╨╜╨░╤З╨╡╨╜╨╕╤П ╤Г╨║╨░╨╖╨░╤В╤М ╨╖╨╜╨░╤З╨╡╨╜╨╕╨╡ $node.Input.data.a + 1; $node.Input.data.a * 2\r\n5. ╨Ч╨░╨┐╤Г╤Б╤В╨╕╤В╤М ╨┐╤А╨╛╤Ж╨╡╤Б╤Б.	╨а╨╡╨╖╤Г╨╗╤М╤В╨░╤В ╨▓╤Л╨┐╨╛╨╗╨╜╨╡╨╜╨╕╤П ╨║╨╛╨╝╨┐╨╛╨╜╨╡╨╜╤В╨░ ╨┐╤А╨╕╤Б╨▓╨░╨╕╨▓╨░╨╜╨╕╨╡: 2	medium	draft	\N	\N	95e96c84-840b-4f94-8f28-10db98bff94d	f	\N	2025-08-01 15:15:03.253768	2025-08-01 15:15:03.253768
7eff3a5d-c9d8-4aaf-9eb7-b2c1e6fa256f	b5c5b2b7-1e52-4600-adcb-c5d2b39adf21	\N	╨Ю╨▒╤А╨░╨▒╨╛╤В╨║╨░ ╤Ж╨╡╨┐╨╛╤З╨║╨╕ ╨╕╨╖ 3+ ╨╛╨┐╨╡╤А╨░╤В╨╛╤А╨╛╨▓ ╤З╨╡╤А╨╡╨╖ ;	╨Я╤А╨╛╨▓╨╡╤А╨║╨░ ╨║╨╛╤А╤А╨╡╨║╤В╨╜╨╛╤Б╤В╨╕ ╨▓╤Л╨┐╨╛╨╗╨╜╨╡╨╜╨╕╤П ╨┐╨╛╤Б╨╗╨╡╨┤╨╛╨▓╨░╤В╨╡╨╗╤М╨╜╨╛╤Б╤В╨╕ ╨┤╨╡╨╣╤Б╤В╨▓╨╕╨╣.	╨б╨╛╨╖╨┤╨░╨╜ ╨┐╤А╨╛╤Ж╨╡╤Б╤Б: ╨б╤В╨░╤А╤В тЖТ ╨Я╤А╨╕╤Б╨▓╨░╨╕╨▓╨░╨╜╨╕╨╡ тЖТ ╨Ъ╨╛╨╜╨╡╤Ж.\r\n╨Т ╨┐╤А╨╛╤Ж╨╡╤Б╤Б╨╡ ╨╛╨▒╤К╤П╨▓╨╗╨╡╨╜╨░ ╨┐╨╡╤А╨╡╨╝╨╡╨╜╨╜╨░╤П a (╤В╨╕╨┐ integer).\r\n╨Т╤Е╨╛╨┤╨╜╤Л╨╡ ╨┤╨░╨╜╨╜╤Л╨╡: {}.	1. ╨Т ╨┐╨╛╨╗╨╡ ╨╖╨╜╨░╤З╨╡╨╜╨╕╤П ╨║╨╛╨╝╨┐╨╛╨╜╨╡╨╜╤В╨░ "╨Я╤А╨╕╤Б╨▓╨░╨╕╨▓╨░╨╜╨╕╨╡" $var.a ╨▓╨▓╨╡╤Б╤В╨╕:  x = 5; y = 10; x + y\r\n2. ╨Ч╨░╨┐╤Г╤Б╤В╨╕╤В╤М ╨┐╤А╨╛╤Ж╨╡╤Б╤Б.	╨а╨╡╨╖╤Г╨╗╤М╤В╨░╤В ╨▓╤Л╨┐╨╛╨╗╨╜╨╡╨╜╨╕╤П ╨║╨╛╨╝╨┐╨╛╨╜╨╡╨╜╤В╨░ ╨┐╤А╨╕╤Б╨▓╨░╨╕╨▓╨░╨╜╨╕╨╡: 15	medium	draft	\N	\N	95e96c84-840b-4f94-8f28-10db98bff94d	f	\N	2025-08-01 15:15:03.259588	2025-08-01 15:15:03.259588
6a6e348e-0443-4b0b-b2f1-b33269fae65b	b5c5b2b7-1e52-4600-adcb-c5d2b39adf21	\N	╨Ш╨│╨╜╨╛╤А╨╕╤А╨╛╨▓╨░╨╜╨╕╨╡ ╨┐╤А╨╛╨▒╨╡╨╗╨╛╨▓ ╨▓╨╛╨║╤А╤Г╨│ ╤А╨░╨╖╨┤╨╡╨╗╨╕╤В╨╡╨╗╤П ;	╨Я╤А╨╛╨▓╨╡╤А╨║╨░, ╤З╤В╨╛ ╨┐╤А╨╛╨▒╨╡╨╗╤Л ╨▓╨╛╨║╤А╤Г╨│ ; ╨╜╨╡ ╨▓╨╗╨╕╤П╤О╤В ╨╜╨░ ╨▓╤Л╨┐╨╛╨╗╨╜╨╡╨╜╨╕╨╡.	╨б╨╛╨╖╨┤╨░╨╜ ╨┐╤А╨╛╤Ж╨╡╤Б╤Б: ╨б╤В╨░╤А╤В тЖТ ╨Я╤А╨╕╤Б╨▓╨░╨╕╨▓╨░╨╜╨╕╨╡ тЖТ ╨Ъ╨╛╨╜╨╡╤Ж.\r\n╨Т ╨┐╤А╨╛╤Ж╨╡╤Б╤Б╨╡ ╨╛╨▒╤К╤П╨▓╨╗╨╡╨╜╨░ ╨┐╨╡╤А╨╡╨╝╨╡╨╜╨╜╨░╤П a (╤В╨╕╨┐ integer).\r\n╨Т╤Е╨╛╨┤╨╜╤Л╨╡ ╨┤╨░╨╜╨╜╤Л╨╡: {"a": 1}.	1. ╨Т ╨┐╨╛╨╗╨╡ ╨╖╨╜╨░╤З╨╡╨╜╨╕╤П ╨║╨╛╨╝╨┐╨╛╨╜╨╡╨╜╤В╨░ "╨Я╤А╨╕╤Б╨▓╨░╨╕╨▓╨░╨╜╨╕╨╡" $var.a ╨▓╨▓╨╡╤Б╤В╨╕: $node.Input.data.a   ;   $node.Input.data.a + 1  \r\n2. ╨Ч╨░╨┐╤Г╤Б╤В╨╕╤В╤М ╨┐╤А╨╛╤Ж╨╡╤Б╤Б.	╨а╨╡╨╖╤Г╨╗╤М╤В╨░╤В ╨▓╤Л╨┐╨╛╨╗╨╜╨╡╨╜╨╕╤П ╨║╨╛╨╝╨┐╨╛╨╜╨╡╨╜╤В╨░ ╨┐╤А╨╕╤Б╨▓╨░╨╕╨▓╨░╨╜╨╕╨╡: 2	medium	draft	\N	\N	95e96c84-840b-4f94-8f28-10db98bff94d	f	\N	2025-08-01 15:15:03.267596	2025-08-01 15:15:03.267596
91ae1932-4ec1-4c9c-b3b2-870b11aabbcd	b5c5b2b7-1e52-4600-adcb-c5d2b39adf21	\N	╨Ч╨░╨┐╤А╨╡╤В ╨┐╨╡╤А╨╡╨╜╨╛╤Б╨░ ╤Б╤В╤А╨╛╨║╨╕ ╨┐╨╛╤Б╨╗╨╡ ╤А╨░╨╖╨┤╨╡╨╗╨╕╤В╨╡╨╗╤П ;	╨Я╤А╨╛╨▓╨╡╤А╨║╨░, ╤З╤В╨╛ ╨┐╨╛╤Б╨╗╨╡ ;  ╨┐╨╡╤А╨╡╨▓╨╛╨┤ ╤Б╤В╤А╨╛╨║╨╕ ╨╜╨╡ ╤А╨░╨╖╤А╨╡╤И╨░╨╡╤В╤Б╤П.	╨б╨╛╨╖╨┤╨░╨╜ ╨┐╤А╨╛╤Ж╨╡╤Б╤Б: ╨б╤В╨░╤А╤В тЖТ ╨Я╤А╨╕╤Б╨▓╨░╨╕╨▓╨░╨╜╨╕╨╡ тЖТ ╨Ъ╨╛╨╜╨╡╤Ж.\r\n╨Т ╨┐╤А╨╛╤Ж╨╡╤Б╤Б╨╡ ╨╛╨▒╤К╤П╨▓╨╗╨╡╨╜╨░ ╨┐╨╡╤А╨╡╨╝╨╡╨╜╨╜╨░╤П a (╤В╨╕╨┐ integer).\r\n╨Т╤Е╨╛╨┤╨╜╤Л╨╡ ╨┤╨░╨╜╨╜╤Л╨╡: {"a": 1}.	1. ╨Ю╤В╨║╤А╤Л╤В╤М ╨╜╨░╤Б╤В╤А╨╛╨╣╨║╨╕ ╨║╨╛╨╝╨┐╨╛╨╜╨╡╨╜╤В╨░ "╨Я╤А╨╕╤Б╨▓╨░╨╕╨▓╨░╨╜╨╕╨╡".\r\n2. ╨Ф╨╛╨▒╨░╨▓╨╕╤В╤М ╨┐╨╡╤А╨╡╨╝╨╡╨╜╨╜╤Г╤О.\r\n3. ╨Т ╨┐╨╛╨╗╨╡ ╨┐╨╡╤А╨╡╨╝╨╡╨╜╨╜╨╛╨╣ ╨▓╨▓╨╡╤Б╤В╨╕ $var.a.\r\n4. ╨Т ╨┐╨╛╨╗╨╡ ╨╖╨╜╨░╤З╨╡╨╜╨╕╤П ╤Г╨║╨░╨╖╨░╤В╤М ╨╖╨╜╨░╤З╨╡╨╜╨╕╨╡ $node.Input.data.a; \r\n $node.Input.data.a + 1\r\n5. ╨Ч╨░╨┐╤Г╤Б╤В╨╕╤В╤М ╨┐╤А╨╛╤Ж╨╡╤Б╤Б.	╨Ю╤И╨╕╨▒╨║╨░ ╨▓ ╨║╨╛╨╝╨┐╨╛╨╜╨╡╨╜╤В╨╡ "╨Я╤А╨╕╤Б╨▓╨░╨╕╨▓╨░╨╜╨╕╨╡" - ╨Я╨╛╨╗╨╡ ┬лassignments.0.value┬╗: ╨Ю╤И╨╕╨▒╨║╨░ ╨▓ ╨┐╨╛╨╖╨╕╤Ж╨╕╨╕ 19. ╨Ш╤Б╨┐╤А╨░╨▓╤М╤В╨╡ ╨▓╤Л╤А╨░╨╢╨╡╨╜╨╕╨╡ ┬л;\r\n$node.Input.data.a + 1┬╗	medium	draft	\N	\N	95e96c84-840b-4f94-8f28-10db98bff94d	f	\N	2025-08-01 15:15:03.273503	2025-08-01 15:15:03.273503
ec27da8a-8c5d-4884-b154-be7006bc83e0	b5c5b2b7-1e52-4600-adcb-c5d2b39adf21	\N	╨Ю╤В╤Б╤Г╤В╤Б╤В╨▓╨╕╨╡ ; ╨▓ ╨╛╨┤╨╜╨╛╤Б╤В╤А╨╛╤З╨╜╨╛╨╝ ╨▓╨▓╨╛╨┤╨╡	╨Я╤А╨╛╨▓╨╡╤А╨║╨░, ╤З╤В╨╛ ╤Б╨╕╤Б╤В╨╡╨╝╨░ ╨▓╨╛╨╖╨▓╤А╨░╤Й╨░╨╡╤В ╨╛╤И╨╕╨▒╨║╤Г ╨┐╤А╨╕ ╨╛╤В╤Б╤Г╤В╤Б╤В╨▓╨╕╨╕ ; ╨╕╨╗╨╕ ╨┐╨╡╤А╨╡╨╜╨╛╤Б╨░ ╤Б╤В╤А╨╛╨║╨╕.	╨б╨╛╨╖╨┤╨░╨╜ ╨┐╤А╨╛╤Ж╨╡╤Б╤Б: ╨б╤В╨░╤А╤В тЖТ ╨Я╤А╨╕╤Б╨▓╨░╨╕╨▓╨░╨╜╨╕╨╡ тЖТ ╨Ъ╨╛╨╜╨╡╤Ж.\r\n╨Т ╨┐╤А╨╛╤Ж╨╡╤Б╤Б╨╡ ╨╛╨▒╤К╤П╨▓╨╗╨╡╨╜╨░ ╨┐╨╡╤А╨╡╨╝╨╡╨╜╨╜╨░╤П a (╤В╨╕╨┐ integer).\r\n╨Т╤Е╨╛╨┤╨╜╤Л╨╡ ╨┤╨░╨╜╨╜╤Л╨╡: {"a": 1}.	1. ╨Ю╤В╨║╤А╤Л╤В╤М ╨╜╨░╤Б╤В╤А╨╛╨╣╨║╨╕ ╨║╨╛╨╝╨┐╨╛╨╜╨╡╨╜╤В╨░ "╨Я╤А╨╕╤Б╨▓╨░╨╕╨▓╨░╨╜╨╕╨╡".\r\n2. ╨Ф╨╛╨▒╨░╨▓╨╕╤В╤М ╨┐╨╡╤А╨╡╨╝╨╡╨╜╨╜╤Г╤О.\r\n3. ╨Т ╨┐╨╛╨╗╨╡ ╨┐╨╡╤А╨╡╨╝╨╡╨╜╨╜╨╛╨╣ ╨▓╨▓╨╡╤Б╤В╨╕ $var.a.\r\n4. ╨Т ╨┐╨╛╨╗╨╡ ╨╖╨╜╨░╤З╨╡╨╜╨╕╤П ╤Г╨║╨░╨╖╨░╤В╤М ╨╖╨╜╨░╤З╨╡╨╜╨╕╨╡ $node.Input.data.a $node.Input.data.a + 1\r\n5. ╨Ч╨░╨┐╤Г╤Б╤В╨╕╤В╤М ╨┐╤А╨╛╤Ж╨╡╤Б╤Б.	╨Ф╨╕╨░╨│╤А╨░╨╝╨╝╨░ ╨╖╨░╨▓╨╡╤А╤И╨╡╨╜╨░ ╤Б ╨╛╤И╨╕╨▒╨║╨╛╨╣\r\n╨Ю╤И╨╕╨▒╨║╨░ ╨▓ ╨║╨╛╨╝╨┐╨╛╨╜╨╡╨╜╤В╨╡ Assignment: "╨Ю╤И╨╕╨▒╨║╨░ ╨▓ ╨┐╨╛╨╖╨╕╤Ж╨╕╨╕ 20. ╨Ш╤Б╨┐╤А╨░╨▓╤М╤В╨╡ ╨▓╤Л╤А╨░╨╢╨╡╨╜╨╕╨╡ ┬л$node.Input.data.a + 1┬╗"	medium	draft	\N	\N	95e96c84-840b-4f94-8f28-10db98bff94d	f	\N	2025-08-01 15:15:03.283528	2025-08-01 15:15:03.283528
\.


--
-- Data for Name: test_plans; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.test_plans (id, project_id, name, description, status, created_by, is_deleted, deleted_at, created_at, updated_at) FROM stdin;
2eb0fe9f-567c-4346-8799-7411a37b0c07	b5c5b2b7-1e52-4600-adcb-c5d2b39adf21	qew	qwe	draft	00000000-0000-0000-0000-000000000001	t	2025-08-01 10:13:42.086	2025-07-31 19:26:40.44	2025-07-31 19:26:40.44
fcb2a77f-c984-459e-93f7-b5bf96c3dc00	b5c5b2b7-1e52-4600-adcb-c5d2b39adf21	TEST1	TEST1`	draft	00000000-0000-0000-0000-000000000001	f	\N	2025-07-31 16:19:58.937	2025-07-31 16:19:58.937
\.


--
-- Data for Name: test_results; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.test_results (id, test_run_id, test_case_id, status, executed_by, executed_at, notes, duration, created_at) FROM stdin;
\.


--
-- Data for Name: test_runs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.test_runs (id, test_plan_id, name, description, status, started_by, started_at, completed_at, is_deleted, deleted_at, created_at) FROM stdin;
5f5fc62b-4c06-4ce7-8b8f-9bac5d51d4d6	fcb2a77f-c984-459e-93f7-b5bf96c3dc00	TEST1 31 ╨╕╤О╨╗╤П 2025	TEST1	planned	00000000-0000-0000-0000-000000000001	\N	\N	f	\N	2025-07-31 16:20:14.576
a73655d3-1e52-47d3-92a2-e3c19c1fa1b8	2eb0fe9f-567c-4346-8799-7411a37b0c07	qew 31 ╨╕╤О╨╗╤П 2025		planned	00000000-0000-0000-0000-000000000001	\N	\N	t	2025-08-01 10:14:28.674	2025-07-31 19:27:18.679
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, email, password_hash, first_name, last_name, role, created_at, updated_at) FROM stdin;
00000000-0000-0000-0000-000000000001	admin	admin@spr.com	$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.	╨Р╨┤╨╝╨╕╨╜╨╕╤Б╤В╤А╨░╤В╨╛╤А	╨б╨╕╤Б╤В╨╡╨╝╤Л	admin	2025-08-01 14:54:24.400666	2025-08-01 14:54:24.400666
\.


--
-- Name: checklist_items checklist_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checklist_items
    ADD CONSTRAINT checklist_items_pkey PRIMARY KEY (id);


--
-- Name: checklist_results checklist_results_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checklist_results
    ADD CONSTRAINT checklist_results_pkey PRIMARY KEY (id);


--
-- Name: checklists checklists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checklists
    ADD CONSTRAINT checklists_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: tags tags_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_name_key UNIQUE (name);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: test_case_sections test_case_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_case_sections
    ADD CONSTRAINT test_case_sections_pkey PRIMARY KEY (id);


--
-- Name: test_case_tags test_case_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_case_tags
    ADD CONSTRAINT test_case_tags_pkey PRIMARY KEY (test_case_id, tag_id);


--
-- Name: test_cases test_cases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_cases
    ADD CONSTRAINT test_cases_pkey PRIMARY KEY (id);


--
-- Name: test_plans test_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_plans
    ADD CONSTRAINT test_plans_pkey PRIMARY KEY (id);


--
-- Name: test_results test_results_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_results
    ADD CONSTRAINT test_results_pkey PRIMARY KEY (id);


--
-- Name: test_runs test_runs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_runs
    ADD CONSTRAINT test_runs_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_attachments_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_attachments_created_at ON public.attachments USING btree (created_at);


--
-- Name: idx_attachments_test_case_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_attachments_test_case_id ON public.attachments USING btree (test_case_id);


--
-- Name: idx_attachments_uploaded_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_attachments_uploaded_by ON public.attachments USING btree (uploaded_by);


--
-- Name: idx_comments_entity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_comments_entity ON public.comments USING btree (entity_type, entity_id);


--
-- Name: idx_test_case_sections_is_deleted; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_test_case_sections_is_deleted ON public.test_case_sections USING btree (is_deleted);


--
-- Name: idx_test_cases_is_deleted; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_test_cases_is_deleted ON public.test_cases USING btree (is_deleted);


--
-- Name: idx_test_cases_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_test_cases_project_id ON public.test_cases USING btree (project_id);


--
-- Name: idx_test_cases_test_plan_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_test_cases_test_plan_id ON public.test_cases USING btree (test_plan_id);


--
-- Name: idx_test_plans_is_deleted; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_test_plans_is_deleted ON public.test_plans USING btree (is_deleted);


--
-- Name: idx_test_results_test_case_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_test_results_test_case_id ON public.test_results USING btree (test_case_id);


--
-- Name: idx_test_results_test_run_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_test_results_test_run_id ON public.test_results USING btree (test_run_id);


--
-- Name: idx_test_runs_is_deleted; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_test_runs_is_deleted ON public.test_runs USING btree (is_deleted);


--
-- Name: checklist_items checklist_items_checklist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checklist_items
    ADD CONSTRAINT checklist_items_checklist_id_fkey FOREIGN KEY (checklist_id) REFERENCES public.checklists(id) ON DELETE CASCADE;


--
-- Name: checklist_results checklist_results_checklist_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checklist_results
    ADD CONSTRAINT checklist_results_checklist_item_id_fkey FOREIGN KEY (checklist_item_id) REFERENCES public.checklist_items(id) ON DELETE CASCADE;


--
-- Name: checklist_results checklist_results_test_result_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checklist_results
    ADD CONSTRAINT checklist_results_test_result_id_fkey FOREIGN KEY (test_result_id) REFERENCES public.test_results(id) ON DELETE CASCADE;


--
-- Name: checklists checklists_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checklists
    ADD CONSTRAINT checklists_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: checklists checklists_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checklists
    ADD CONSTRAINT checklists_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: checklists checklists_test_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checklists
    ADD CONSTRAINT checklists_test_case_id_fkey FOREIGN KEY (test_case_id) REFERENCES public.test_cases(id) ON DELETE CASCADE;


--
-- Name: comments comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: projects projects_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: test_case_sections test_case_sections_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_case_sections
    ADD CONSTRAINT test_case_sections_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.test_case_sections(id) ON DELETE CASCADE;


--
-- Name: test_case_sections test_case_sections_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_case_sections
    ADD CONSTRAINT test_case_sections_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: test_case_tags test_case_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_case_tags
    ADD CONSTRAINT test_case_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- Name: test_case_tags test_case_tags_test_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_case_tags
    ADD CONSTRAINT test_case_tags_test_case_id_fkey FOREIGN KEY (test_case_id) REFERENCES public.test_cases(id) ON DELETE CASCADE;


--
-- Name: test_cases test_cases_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_cases
    ADD CONSTRAINT test_cases_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: test_cases test_cases_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_cases
    ADD CONSTRAINT test_cases_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: test_cases test_cases_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_cases
    ADD CONSTRAINT test_cases_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: test_cases test_cases_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_cases
    ADD CONSTRAINT test_cases_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.test_case_sections(id) ON DELETE SET NULL;


--
-- Name: test_cases test_cases_test_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_cases
    ADD CONSTRAINT test_cases_test_plan_id_fkey FOREIGN KEY (test_plan_id) REFERENCES public.test_plans(id) ON DELETE SET NULL;


--
-- Name: test_plans test_plans_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_plans
    ADD CONSTRAINT test_plans_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: test_plans test_plans_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_plans
    ADD CONSTRAINT test_plans_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: test_results test_results_executed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_results
    ADD CONSTRAINT test_results_executed_by_fkey FOREIGN KEY (executed_by) REFERENCES public.users(id);


--
-- Name: test_results test_results_test_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_results
    ADD CONSTRAINT test_results_test_case_id_fkey FOREIGN KEY (test_case_id) REFERENCES public.test_cases(id) ON DELETE CASCADE;


--
-- Name: test_results test_results_test_run_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_results
    ADD CONSTRAINT test_results_test_run_id_fkey FOREIGN KEY (test_run_id) REFERENCES public.test_runs(id) ON DELETE CASCADE;


--
-- Name: test_runs test_runs_started_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_runs
    ADD CONSTRAINT test_runs_started_by_fkey FOREIGN KEY (started_by) REFERENCES public.users(id);


--
-- Name: test_runs test_runs_test_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_runs
    ADD CONSTRAINT test_runs_test_plan_id_fkey FOREIGN KEY (test_plan_id) REFERENCES public.test_plans(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

