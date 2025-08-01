--
-- PostgreSQL database dump
--

-- Dumped from database version 15.13 (Debian 15.13-1.pgdg120+1)
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: attachments; Type: TABLE; Schema: public; Owner: tms_user
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


ALTER TABLE public.attachments OWNER TO tms_user;

--
-- Name: checklist_items; Type: TABLE; Schema: public; Owner: tms_user
--

CREATE TABLE public.checklist_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    checklist_id uuid,
    title character varying(200) NOT NULL,
    description text,
    is_required boolean DEFAULT false,
    order_index integer DEFAULT 0,
    is_deleted boolean DEFAULT false,
    deleted_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.checklist_items OWNER TO tms_user;

--
-- Name: checklist_results; Type: TABLE; Schema: public; Owner: tms_user
--

CREATE TABLE public.checklist_results (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    test_result_id uuid,
    checklist_item_id uuid,
    status character varying(20) DEFAULT 'not_checked'::character varying,
    notes text,
    is_deleted boolean DEFAULT false,
    deleted_at timestamp without time zone,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.checklist_results OWNER TO tms_user;

--
-- Name: checklists; Type: TABLE; Schema: public; Owner: tms_user
--

CREATE TABLE public.checklists (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    project_id uuid,
    test_case_id uuid,
    title character varying(200) NOT NULL,
    description text,
    created_by uuid,
    is_deleted boolean DEFAULT false,
    deleted_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.checklists OWNER TO tms_user;

--
-- Name: comments; Type: TABLE; Schema: public; Owner: tms_user
--

CREATE TABLE public.comments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    entity_type character varying(20) NOT NULL,
    entity_id uuid NOT NULL,
    user_id uuid,
    content text NOT NULL,
    is_deleted boolean DEFAULT false,
    deleted_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.comments OWNER TO tms_user;

--
-- Name: projects; Type: TABLE; Schema: public; Owner: tms_user
--

CREATE TABLE public.projects (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    git_repo_url character varying(255),
    git_branch character varying(100) DEFAULT 'main'::character varying,
    created_by uuid,
    is_deleted boolean DEFAULT false,
    deleted_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.projects OWNER TO tms_user;

--
-- Name: tags; Type: TABLE; Schema: public; Owner: tms_user
--

CREATE TABLE public.tags (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(50) NOT NULL,
    color character varying(7) DEFAULT '#6B7280'::character varying,
    is_deleted boolean DEFAULT false,
    deleted_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.tags OWNER TO tms_user;

--
-- Name: test_case_sections; Type: TABLE; Schema: public; Owner: tms_user
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


ALTER TABLE public.test_case_sections OWNER TO tms_user;

--
-- Name: test_case_tags; Type: TABLE; Schema: public; Owner: tms_user
--

CREATE TABLE public.test_case_tags (
    test_case_id uuid NOT NULL,
    tag_id uuid NOT NULL
);


ALTER TABLE public.test_case_tags OWNER TO tms_user;

--
-- Name: test_cases; Type: TABLE; Schema: public; Owner: tms_user
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


ALTER TABLE public.test_cases OWNER TO tms_user;

--
-- Name: test_plans; Type: TABLE; Schema: public; Owner: tms_user
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


ALTER TABLE public.test_plans OWNER TO tms_user;

--
-- Name: test_results; Type: TABLE; Schema: public; Owner: tms_user
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
    is_deleted boolean DEFAULT false,
    deleted_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.test_results OWNER TO tms_user;

--
-- Name: test_runs; Type: TABLE; Schema: public; Owner: tms_user
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


ALTER TABLE public.test_runs OWNER TO tms_user;

--
-- Name: users; Type: TABLE; Schema: public; Owner: tms_user
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    first_name character varying(50),
    last_name character varying(50),
    role character varying(20) DEFAULT 'user'::character varying,
    is_deleted boolean DEFAULT false,
    deleted_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO tms_user;

--
-- Data for Name: attachments; Type: TABLE DATA; Schema: public; Owner: tms_user
--

COPY public.attachments (id, test_case_id, filename, original_filename, file_path, file_size, mime_type, description, uploaded_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: checklist_items; Type: TABLE DATA; Schema: public; Owner: tms_user
--

COPY public.checklist_items (id, checklist_id, title, description, is_required, order_index, is_deleted, deleted_at, created_at) FROM stdin;
\.


--
-- Data for Name: checklist_results; Type: TABLE DATA; Schema: public; Owner: tms_user
--

COPY public.checklist_results (id, test_result_id, checklist_item_id, status, notes, is_deleted, deleted_at, executed_at) FROM stdin;
\.


--
-- Data for Name: checklists; Type: TABLE DATA; Schema: public; Owner: tms_user
--

COPY public.checklists (id, project_id, test_case_id, title, description, created_by, is_deleted, deleted_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: tms_user
--

COPY public.comments (id, entity_type, entity_id, user_id, content, is_deleted, deleted_at, created_at) FROM stdin;
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: tms_user
--

COPY public.projects (id, name, description, git_repo_url, git_branch, created_by, is_deleted, deleted_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: tms_user
--

COPY public.tags (id, name, color, is_deleted, deleted_at, created_at) FROM stdin;
3d4f7489-08db-4cc5-a270-0706628dc6f0	Критический	#EF4444	f	\N	2025-08-01 14:54:24.404966
39689c9a-be2c-46d3-99fe-d5b40f22f076	Высокий	#F59E0B	f	\N	2025-08-01 14:54:24.404966
c843934f-f2f0-4cfa-b7c0-db7d3b85ea32	Средний	#10B981	f	\N	2025-08-01 14:54:24.404966
0edab4e1-99b2-4b64-96a8-2d8bc36cadb5	Низкий	#6B7280	f	\N	2025-08-01 14:54:24.404966
60712e25-08ed-4d03-97a8-43e93f906638	Баг	#DC2626	f	\N	2025-08-01 14:54:24.404966
0cd82449-6c76-4ac7-885c-ae9e6e110a06	Улучшение	#2563EB	f	\N	2025-08-01 14:54:24.404966
\.


--
-- Data for Name: test_case_sections; Type: TABLE DATA; Schema: public; Owner: tms_user
--

COPY public.test_case_sections (id, project_id, parent_id, name, order_index, is_deleted, deleted_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: test_case_tags; Type: TABLE DATA; Schema: public; Owner: tms_user
--

COPY public.test_case_tags (test_case_id, tag_id) FROM stdin;
\.


--
-- Data for Name: test_cases; Type: TABLE DATA; Schema: public; Owner: tms_user
--

COPY public.test_cases (id, project_id, test_plan_id, title, description, preconditions, steps, expected_result, priority, status, created_by, assigned_to, section_id, is_deleted, deleted_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: test_plans; Type: TABLE DATA; Schema: public; Owner: tms_user
--

COPY public.test_plans (id, project_id, name, description, status, created_by, is_deleted, deleted_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: test_results; Type: TABLE DATA; Schema: public; Owner: tms_user
--

COPY public.test_results (id, test_run_id, test_case_id, status, executed_by, executed_at, notes, duration, is_deleted, deleted_at, created_at) FROM stdin;
\.


--
-- Data for Name: test_runs; Type: TABLE DATA; Schema: public; Owner: tms_user
--

COPY public.test_runs (id, test_plan_id, name, description, status, started_by, started_at, completed_at, is_deleted, deleted_at, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: tms_user
--

COPY public.users (id, username, email, password_hash, first_name, last_name, role, is_deleted, deleted_at, created_at, updated_at) FROM stdin;
00000000-0000-0000-0000-000000000001	admin	admin@spr.com	$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.	Администратор	Системы	admin	f	\N	2025-08-01 14:54:24.400666	2025-08-01 14:54:24.400666
\.


--
-- Name: attachments attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_pkey PRIMARY KEY (id);


--
-- Name: checklist_items checklist_items_pkey; Type: CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.checklist_items
    ADD CONSTRAINT checklist_items_pkey PRIMARY KEY (id);


--
-- Name: checklist_results checklist_results_pkey; Type: CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.checklist_results
    ADD CONSTRAINT checklist_results_pkey PRIMARY KEY (id);


--
-- Name: checklists checklists_pkey; Type: CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.checklists
    ADD CONSTRAINT checklists_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: tags tags_name_key; Type: CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_name_key UNIQUE (name);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: test_case_sections test_case_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.test_case_sections
    ADD CONSTRAINT test_case_sections_pkey PRIMARY KEY (id);


--
-- Name: test_case_tags test_case_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.test_case_tags
    ADD CONSTRAINT test_case_tags_pkey PRIMARY KEY (test_case_id, tag_id);


--
-- Name: test_cases test_cases_pkey; Type: CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.test_cases
    ADD CONSTRAINT test_cases_pkey PRIMARY KEY (id);


--
-- Name: test_plans test_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.test_plans
    ADD CONSTRAINT test_plans_pkey PRIMARY KEY (id);


--
-- Name: test_results test_results_pkey; Type: CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.test_results
    ADD CONSTRAINT test_results_pkey PRIMARY KEY (id);


--
-- Name: test_runs test_runs_pkey; Type: CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.test_runs
    ADD CONSTRAINT test_runs_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_attachments_test_case_id; Type: INDEX; Schema: public; Owner: tms_user
--

CREATE INDEX idx_attachments_test_case_id ON public.attachments USING btree (test_case_id);


--
-- Name: idx_checklist_items_is_deleted; Type: INDEX; Schema: public; Owner: tms_user
--

CREATE INDEX idx_checklist_items_is_deleted ON public.checklist_items USING btree (is_deleted);


--
-- Name: idx_checklist_results_is_deleted; Type: INDEX; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.checklist_results
    ADD CONSTRAINT checklist_results_checklist_item_id_fkey FOREIGN KEY (checklist_item_id) REFERENCES public.checklist_items(id) ON DELETE CASCADE;


--
-- Name: checklist_results checklist_results_test_result_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.checklist_results
    ADD CONSTRAINT checklist_results_test_result_id_fkey FOREIGN KEY (test_result_id) REFERENCES public.test_results(id) ON DELETE CASCADE;


--
-- Name: checklists checklists_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.checklists
    ADD CONSTRAINT checklists_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: checklists checklists_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.checklists
    ADD CONSTRAINT checklists_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: checklists checklists_test_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.checklists
    ADD CONSTRAINT checklists_test_case_id_fkey FOREIGN KEY (test_case_id) REFERENCES public.test_cases(id) ON DELETE CASCADE;


--
-- Name: comments comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: projects projects_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: test_case_sections test_case_sections_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.test_case_sections
    ADD CONSTRAINT test_case_sections_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.test_case_sections(id) ON DELETE CASCADE;


--
-- Name: test_case_sections test_case_sections_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.test_case_sections
    ADD CONSTRAINT test_case_sections_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: test_case_tags test_case_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.test_case_tags
    ADD CONSTRAINT test_case_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- Name: test_case_tags test_case_tags_test_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.test_case_tags
    ADD CONSTRAINT test_case_tags_test_case_id_fkey FOREIGN KEY (test_case_id) REFERENCES public.test_cases(id) ON DELETE CASCADE;


--
-- Name: test_cases test_cases_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.test_cases
    ADD CONSTRAINT test_cases_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: test_cases test_cases_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.test_cases
    ADD CONSTRAINT test_cases_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: test_cases test_cases_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.test_cases
    ADD CONSTRAINT test_cases_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: test_cases test_cases_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.test_cases
    ADD CONSTRAINT test_cases_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.test_case_sections(id) ON DELETE SET NULL;


--
-- Name: test_cases test_cases_test_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.test_cases
    ADD CONSTRAINT test_cases_test_plan_id_fkey FOREIGN KEY (test_plan_id) REFERENCES public.test_plans(id) ON DELETE SET NULL;


--
-- Name: test_plans test_plans_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.test_plans
    ADD CONSTRAINT test_plans_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: test_plans test_plans_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.test_plans
    ADD CONSTRAINT test_plans_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: test_results test_results_executed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.test_results
    ADD CONSTRAINT test_results_executed_by_fkey FOREIGN KEY (executed_by) REFERENCES public.users(id);


--
-- Name: test_results test_results_test_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.test_results
    ADD CONSTRAINT test_results_test_case_id_fkey FOREIGN KEY (test_case_id) REFERENCES public.test_cases(id) ON DELETE CASCADE;


--
-- Name: test_results test_results_test_run_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.test_results
    ADD CONSTRAINT test_results_test_run_id_fkey FOREIGN KEY (test_run_id) REFERENCES public.test_runs(id) ON DELETE CASCADE;


--
-- Name: test_runs test_runs_started_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.test_runs
    ADD CONSTRAINT test_runs_started_by_fkey FOREIGN KEY (started_by) REFERENCES public.users(id);


--
-- Name: test_runs test_runs_test_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.test_runs
    ADD CONSTRAINT test_runs_test_plan_id_fkey FOREIGN KEY (test_plan_id) REFERENCES public.test_plans(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
-- 