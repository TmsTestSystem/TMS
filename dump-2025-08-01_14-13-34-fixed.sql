--
-- PostgreSQL database dump (FIXED VERSION)
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
-- Name: public; Type: SCHEMA; Schema: -; Owner: tms_user
--

-- *not* creating schema, since initdb creates it

ALTER SCHEMA public OWNER TO tms_user;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: tms_user
--

COMMENT ON SCHEMA public IS '';

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
    file_size bigint NOT NULL,
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
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
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
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
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
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
);

ALTER TABLE public.checklists OWNER TO tms_user;

--
-- Name: comments; Type: TABLE; Schema: public; Owner: tms_user
--

CREATE TABLE public.comments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    test_case_id uuid,
    user_id uuid,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
);

ALTER TABLE public.comments OWNER TO tms_user;

--
-- Name: projects; Type: TABLE; Schema: public; Owner: tms_user
--

CREATE TABLE public.projects (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    status character varying(20) DEFAULT 'active'::character varying,
    created_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
);

ALTER TABLE public.projects OWNER TO tms_user;

--
-- Name: tags; Type: TABLE; Schema: public; Owner: tms_user
--

CREATE TABLE public.tags (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(50) NOT NULL,
    color character varying(7),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
);

ALTER TABLE public.tags OWNER TO tms_user;

--
-- Name: test_case_sections; Type: TABLE; Schema: public; Owner: tms_user
--

CREATE TABLE public.test_case_sections (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    project_id uuid NOT NULL,
    parent_id uuid,
    name character varying(100) NOT NULL,
    order_index integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
);

ALTER TABLE public.test_case_sections OWNER TO tms_user;

--
-- Name: test_case_tags; Type: TABLE; Schema: public; Owner: tms_user
--

CREATE TABLE public.test_case_tags (
    test_case_id uuid NOT NULL,
    tag_id uuid NOT NULL,
    is_deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
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
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
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
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
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
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
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
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
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
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_deleted boolean DEFAULT false,
    deleted_at timestamp without time zone
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

COPY public.checklist_items (id, checklist_id, title, description, is_required, order_index, created_at, is_deleted, deleted_at) FROM stdin;
\.

--
-- Data for Name: checklist_results; Type: TABLE DATA; Schema: public; Owner: tms_user
--

COPY public.checklist_results (id, test_result_id, checklist_item_id, status, notes, executed_at, is_deleted, deleted_at) FROM stdin;
\.

--
-- Data for Name: checklists; Type: TABLE DATA; Schema: public; Owner: tms_user
--

COPY public.checklists (id, project_id, test_case_id, title, description, created_by, created_at, updated_at, is_deleted, deleted_at) FROM stdin;
\.

--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: tms_user
--

COPY public.comments (id, test_case_id, user_id, content, created_at, is_deleted, deleted_at) FROM stdin;
\.

--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: tms_user
--

COPY public.projects (id, name, description, status, created_by, created_at, updated_at, is_deleted, deleted_at) FROM stdin;
b5c5b2b7-1e52-4600-adcb-c5d2b39adf21	Тест-кейсы СПР	Набор тест-кейсов для тестирования СПР	active	\N	2025-07-31 15:43:50.649209	2025-08-01 11:05:09.445539	f	f
\.

--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: tms_user
--

COPY public.tags (id, name, color, created_at, is_deleted, deleted_at) FROM stdin;
7d8ec539-0e1d-43c6-8827-b158434050b7	Критический	#EF4444	2025-07-29 16:00:16.983945	f	\N
9191b159-924f-46ce-a025-b79c8e2d2e92	Высокий	#F59E0B	2025-07-29 16:00:16.983945	f	\N
904e840f-4803-4ca4-82f8-b704bf2b969f	Средний	#10B981	2025-07-29 16:00:16.983945	f	\N
58ab3ca0-35ab-4ced-9f4f-c54c95cdd2cf	Низкий	#6B7280	2025-07-29 16:00:16.983945	f	\N
baedfd15-6163-4ca6-852f-40d174e1b92f	Баг	#DC2626	2025-07-29 16:00:16.983945	f	\N
f6b33520-0625-4fd4-bda9-93be7d4fa6e8	Улучшение	#2563EB	2025-07-29 16:00:16.983945	f	\N
\.

--
-- Data for Name: test_case_sections; Type: TABLE DATA; Schema: public; Owner: tms_user
--

COPY public.test_case_sections (id, project_id, parent_id, name, order_index, created_at, updated_at, is_deleted, deleted_at) FROM stdin;
e793b543-44d6-419e-8ed1-ffac62b3e507	b5c5b2b7-1e52-4600-adcb-c5d2b39adf21	\N	Вход на платформу	0	2025-07-31 15:44:32.827614	2025-07-31 15:44:32.827614	f	\N
1d1d263e-745f-43f2-9494-224481b4e56f	b5c5b2b7-1e52-4600-adcb-c5d2b39adf21	e793b543-44d6-419e-8ed1-ffac62b3e507	Восстановление пароля	1	2025-07-31 15:44:59.621934	2025-07-31 15:44:59.621934	f	\N
45038ee2-9927-40be-b299-3d4d5e00c6d0	b5c5b2b7-1e52-4600-adcb-c5d2b39adf21	\N	Язык выражений	2	2025-08-01 11:05:44.134268	2025-08-01 11:05:44.134268	f	\N
95e96c84-840b-4f94-8f28-10db98bff94d	b5c5b2b7-1e52-4600-adcb-c5d2b39adf21	45038ee2-9927-40be-b299-3d4d5e00c6d0	Разделения операторов через ;	3	2025-08-01 11:07:12.444091	2025-08-01 11:07:12.444091	f	\N
\.

--
-- Data for Name: test_case_tags; Type: TABLE DATA; Schema: public; Owner: tms_user
--

COPY public.test_case_tags (test_case_id, tag_id, is_deleted, deleted_at) FROM stdin;
\.

--
-- Data for Name: test_cases; Type: TABLE DATA; Schema: public; Owner: tms_user
--

COPY public.test_cases (id, project_id, test_plan_id, title, description, preconditions, steps, expected_result, priority, status, created_by, assigned_to, section_id, created_at, updated_at, is_deleted, deleted_at) FROM stdin;
64ef9bc7-10fc-434e-ae9b-758f6e028fbb	b5c5b2b7-1e52-4600-adcb-c5d2b39adf21	\N	Успешное изменение пароля по ссылке из письма		Пользователь перешел по ссылке из письма для восстановления пароля.	1. Ввести новый пароль в поле "Новый пароль".\n\n2. Ввести тот же пароль в поле "Подтвердите пароль".\n\n3. Нажать кнопку "Восстановить".	Пароль успешно изменен.\n\nПользователь перенаправлен на страницу авторизации.\n\nВозможен вход с новым паролем.	medium	draft	\N	\N	1d1d263e-745f-43f2-9494-224481b4e56f	2025-07-31 15:50:57.632809	2025-07-31 15:52:31.954736	f	\N
f6d834fd-0b82-4f7f-81c7-28251bf63678	b5c5b2b7-1e52-4600-adcb-c5d2b39adf21	\N	Ошибка при несовпадении паролей		Пользователь перешел по ссылке из письма для восстановления пароля.	1. Ввести новый пароль в поле "Новый пароль".\n\n2. Ввести другой пароль в поле "Подтвердите пароль".\n\n3. Нажать кнопку "Восстановить".\n	Появляется сообщение: "Пароли не совпадают".\n\nИзменение пароля не происходит.	medium	draft	\N	\N	1d1d263e-745f-43f2-9494-224481b4e56f	2025-07-31 15:53:10.556411	2025-07-31 15:53:10.556411	f	\N
fdcafda9-bdac-4a55-8aed-14c136c426aa	b5c5b2b7-1e52-4600-adcb-c5d2b39adf21	\N	Успешный запрос на восстановление пароля		- Пользователь находится на странице авторизации.\n\n- Учетная запись пользователя активна.	1. Нажать кнопку "Забыли пароль?".\n\n2. В открывшемся окне ввести валидный email, привязанный к аккаунту.\n\n3. Нажать кнопку "Получить письмо".	Появляется уведомление: "Письмо с инструкцией отправлено на ваш email".\n\nНа указанную почту приходит письмо со ссылкой для восстановления пароля.	medium	draft	\N	\N	1d1d263e-745f-43f2-9494-224481b4e56f	2025-07-31 15:48:29.813257	2025-07-31 15:48:29.813257	f	\N
d5b6481e-84f6-4f5c-8b7c-0c1debe5a72a	b5c5b2b7-1e52-4600-adcb-c5d2b39adf21	\N	Ввод несуществующего email при восстановлении пароля		Пользователь находится на странице восстановления пароля.	1. Ввести несуществующий email.\n\n2. Нажать кнопку "Получить письмо".	Появляется сообщение: "Не удалось обработать" (или "Пользователь не найден").\n\nПисьмо не отправляется.	medium	draft	\N	\N	1d1d263e-745f-43f2-9494-224481b4e56f	2025-07-31 15:49:26.195821	2025-07-31 15:49:26.195821	f	\N
0b5bc9ed-0fb0-4d82-a433-76bf11b438e5	b5c5b2b7-1e52-4600-adcb-c5d2b39adf21	\N	Попытка восстановления пароля для деактивированного пользователя		Учетная запись пользователя существует, но деактивирована.	1. Ввести email деактивированного пользователя.\n\n2. Нажать кнопку "Получить письмо".	Появляется сообщение: "Не удалось обработать".\n\nПисьмо не отправляется.	medium	draft	\N	\N	1d1d263e-745f-43f2-9494-224481b4e56f	2025-07-31 15:50:04.441066	2025-07-31 15:50:04.441066	f	\N
5ab18431-77a8-4dd9-9a4a-226a62abb668	b5c5b2b7-1e52-4600-adcb-c5d2b39adf21	\N	Разделение операторов в одной строке	Проверка корректности вычисления последнего выражения	Создан процесс: Старт → Присваивание → Конец.\nВ процессе объявлена переменная a (тип integer).\nВходные данные: {"a": 1}.	1. Открыть настройки компонента "Присваивание".\n2. Добавить переменную.\n3. В поле переменной ввести $var.a.\n4. В поле значения указать значение $node.Input.data.a + 1; $node.Input.data.a * 2\n5. Запустить процесс.	Результат выполнения компонента присваивание: 2	medium	draft	\N	\N	95e96c84-840b-4f94-8f28-10db98bff94d	2025-08-01 11:17:43.168541	2025-08-01 11:32:55.242949	f	\N
7eff3a5d-c9d8-4aaf-9eb7-b2c1e6fa256f	b5c5b2b7-1e52-4600-adcb-c5d2b39adf21	\N	Обработка цепочки из 3+ операторов через ;	Проверка корректности выполнения последовательности действий.	Создан процесс: Старт → Присваивание → Конец.\nВ процессе объявлена переменная a (тип integer).\nВходные данные: {}.	1. В поле значения компонента "Присваивание" $var.a ввести:  x = 5; y = 10; x + y\n2. Запустить процесс.	Результат выполнения компонента присваивание: 15	medium	draft	\N	\N	95e96c84-840b-4f94-8f28-10db98bff94d	2025-08-01 11:35:14.256988	2025-08-01 11:35:14.256988	f	\N
6a6e348e-0443-4b0b-b2f1-b33269fae65b	b5c5b2b7-1e52-4600-adcb-c5d2b39adf21	\N	Игнорирование пробелов вокруг разделителя ;	Проверка, что пробелы вокруг ; не влияют на выполнение.	Создан процесс: Старт → Присваивание → Конец.\nВ процессе объявлена переменная a (тип integer).\nВходные данные: {"a": 1}.	1. В поле значения компонента "Присваивание" $var.a ввести: $node.Input.data.a   ;   $node.Input.data.a + 1  \n2. Запустить процесс.	Результат выполнения компонента присваивание: 2	medium	draft	\N	\N	95e96c84-840b-4f94-8f28-10db98bff94d	2025-08-01 11:25:33.90253	2025-08-01 11:35:00.814286	f	\N
91ae1932-4ec1-4c9c-b3b2-870b11aabbcd	b5c5b2b7-1e52-4600-adcb-c5d2b39adf21	\N	Запрет переноса строки после разделителя ;	Проверка, что после ;  перевод строки не разрешается.	Создан процесс: Старт → Присваивание → Конец.\nВ процессе объявлена переменная a (тип integer).\nВходные данные: {"a": 1}.	1. Открыть настройки компонента "Присваивание".\n2. Добавить переменную.\n3. В поле переменной ввести $var.a.\n4. В поле значения указать значение $node.Input.data.a; \n $node.Input.data.a + 1\n5. Запустить процесс.	Ошибка в компоненте "Присваивание" - Поле «assignments.0.value»: Ошибка в позиции 19. Исправьте выражение «;\n$node.Input.data.a + 1»	medium	draft	\N	\N	95e96c84-840b-4f94-8f28-10db98bff94d	2025-08-01 11:44:18.923864	2025-08-01 11:45:20.651568	f	\N
ec27da8a-8c5d-4884-b154-be7006bc83e0	b5c5b2b7-1e52-4600-adcb-c5d2b39adf21	\N	Отсутствие ; в однострочном вводе	Проверка, что система возвращает ошибку при отсутствии ; или переноса строки.	Создан процесс: Старт → Присваивание → Конец.\nВ процессе объявлена переменная a (тип integer).\nВходные данные: {"a": 1}.	1. Открыть настройки компонента "Присваивание".\n2. Добавить переменную.\n3. В поле переменной ввести $var.a.\n4. В поле значения указать значение $node.Input.data.a $node.Input.data.a + 1\n5. Запустить процесс.	Диаграмма завершена с ошибкой\nОшибка в компоненте Assignment: "Ошибка в позиции 20. Исправьте выражение «$node.Input.data.a + 1»"	medium	draft	\N	\N	95e96c84-840b-4f94-8f28-10db98bff94d	2025-08-01 11:49:46.649624	2025-08-01 11:49:46.649624	f	\N
\.

--
-- Data for Name: test_plans; Type: TABLE DATA; Schema: public; Owner: tms_user
--

COPY public.test_plans (id, project_id, name, description, status, created_by, created_at, updated_at, is_deleted, deleted_at) FROM stdin;
\.

--
-- Data for Name: test_results; Type: TABLE DATA; Schema: public; Owner: tms_user
--

COPY public.test_results (id, test_run_id, test_case_id, status, executed_by, executed_at, notes, duration, created_at, is_deleted, deleted_at) FROM stdin;
\.

--
-- Data for Name: test_runs; Type: TABLE DATA; Schema: public; Owner: tms_user
--

COPY public.test_runs (id, test_plan_id, name, description, status, started_by, started_at, completed_at, created_at, is_deleted, deleted_at) FROM stdin;
\.

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: tms_user
--

COPY public.users (id, username, email, password_hash, first_name, last_name, role, created_at, updated_at, is_deleted, deleted_at) FROM stdin;
00000000-0000-0000-0000-000000000001	admin	admin@spr.com	$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.	Администратор	Системы	admin	2025-07-29 16:00:16.981172	2025-07-29 16:00:16.981172	f	\N
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
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);

--
-- Name: tags tags_name_key; Type: CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_name_key UNIQUE (name);

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
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);

--
-- Name: attachments_test_case_id_idx; Type: INDEX; Schema: public; Owner: tms_user
--

CREATE INDEX attachments_test_case_id_idx ON public.attachments USING btree (test_case_id);

--
-- Name: attachments_uploaded_by_idx; Type: INDEX; Schema: public; Owner: tms_user
--

CREATE INDEX attachments_uploaded_by_idx ON public.attachments USING btree (uploaded_by);

--
-- Name: checklist_items_checklist_id_idx; Type: INDEX; Schema: public; Owner: tms_user
--

CREATE INDEX checklist_items_checklist_id_idx ON public.checklist_items USING btree (checklist_id);

--
-- Name: checklist_results_test_result_id_idx; Type: INDEX; Schema: public; Owner: tms_user
--

CREATE INDEX checklist_results_test_result_id_idx ON public.checklist_results USING btree (test_result_id);

--
-- Name: checklists_project_id_idx; Type: INDEX; Schema: public; Owner: tms_user
--

CREATE INDEX checklists_project_id_idx ON public.checklists USING btree (project_id);

--
-- Name: checklists_test_case_id_idx; Type: INDEX; Schema: public; Owner: tms_user
--

CREATE INDEX checklists_test_case_id_idx ON public.checklists USING btree (test_case_id);

--
-- Name: comments_test_case_id_idx; Type: INDEX; Schema: public; Owner: tms_user
--

CREATE INDEX comments_test_case_id_idx ON public.comments USING btree (test_case_id);

--
-- Name: projects_created_by_idx; Type: INDEX; Schema: public; Owner: tms_user
--

CREATE INDEX projects_created_by_idx ON public.projects USING btree (created_by);

--
-- Name: test_case_sections_project_id_idx; Type: INDEX; Schema: public; Owner: tms_user
--

CREATE INDEX test_case_sections_project_id_idx ON public.test_case_sections USING btree (project_id);

--
-- Name: test_case_tags_tag_id_idx; Type: INDEX; Schema: public; Owner: tms_user
--

CREATE INDEX test_case_tags_tag_id_idx ON public.test_case_tags USING btree (tag_id);

--
-- Name: test_case_tags_test_case_id_idx; Type: INDEX; Schema: public; Owner: tms_user
--

CREATE INDEX test_case_tags_test_case_id_idx ON public.test_case_tags USING btree (test_case_id);

--
-- Name: test_cases_assigned_to_idx; Type: INDEX; Schema: public; Owner: tms_user
--

CREATE INDEX test_cases_assigned_to_idx ON public.test_cases USING btree (assigned_to);

--
-- Name: test_cases_created_by_idx; Type: INDEX; Schema: public; Owner: tms_user
--

CREATE INDEX test_cases_created_by_idx ON public.test_cases USING btree (created_by);

--
-- Name: test_cases_project_id_idx; Type: INDEX; Schema: public; Owner: tms_user
--

CREATE INDEX test_cases_project_id_idx ON public.test_cases USING btree (project_id);

--
-- Name: test_cases_section_id_idx; Type: INDEX; Schema: public; Owner: tms_user
--

CREATE INDEX test_cases_section_id_idx ON public.test_cases USING btree (section_id);

--
-- Name: test_cases_test_plan_id_idx; Type: INDEX; Schema: public; Owner: tms_user
--

CREATE INDEX test_cases_test_plan_id_idx ON public.test_cases USING btree (test_plan_id);

--
-- Name: test_plans_created_by_idx; Type: INDEX; Schema: public; Owner: tms_user
--

CREATE INDEX test_plans_created_by_idx ON public.test_plans USING btree (created_by);

--
-- Name: test_plans_project_id_idx; Type: INDEX; Schema: public; Owner: tms_user
--

CREATE INDEX test_plans_project_id_idx ON public.test_plans USING btree (project_id);

--
-- Name: test_results_executed_by_idx; Type: INDEX; Schema: public; Owner: tms_user
--

CREATE INDEX test_results_executed_by_idx ON public.test_results USING btree (executed_by);

--
-- Name: test_results_test_case_id_idx; Type: INDEX; Schema: public; Owner: tms_user
--

CREATE INDEX test_results_test_case_id_idx ON public.test_results USING btree (test_case_id);

--
-- Name: test_results_test_run_id_idx; Type: INDEX; Schema: public; Owner: tms_user
--

CREATE INDEX test_results_test_run_id_idx ON public.test_results USING btree (test_run_id);

--
-- Name: test_runs_started_by_idx; Type: INDEX; Schema: public; Owner: tms_user
--

CREATE INDEX test_runs_started_by_idx ON public.test_runs USING btree (started_by);

--
-- Name: test_runs_test_plan_id_idx; Type: INDEX; Schema: public; Owner: tms_user
--

CREATE INDEX test_runs_test_plan_id_idx ON public.test_runs USING btree (test_plan_id);

--
-- Name: attachments_test_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_test_case_id_fkey FOREIGN KEY (test_case_id) REFERENCES public.test_cases(id) ON DELETE CASCADE;

--
-- Name: attachments_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE SET NULL;

--
-- Name: checklist_items_checklist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.checklist_items
    ADD CONSTRAINT checklist_items_checklist_id_fkey FOREIGN KEY (checklist_id) REFERENCES public.checklists(id) ON DELETE CASCADE;

--
-- Name: checklist_results_checklist_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.checklist_results
    ADD CONSTRAINT checklist_results_checklist_item_id_fkey FOREIGN KEY (checklist_item_id) REFERENCES public.checklist_items(id) ON DELETE CASCADE;

--
-- Name: checklist_results_test_result_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.checklist_results
    ADD CONSTRAINT checklist_results_test_result_id_fkey FOREIGN KEY (test_result_id) REFERENCES public.test_results(id) ON DELETE CASCADE;

--
-- Name: checklists_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.checklists
    ADD CONSTRAINT checklists_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;

--
-- Name: checklists_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.checklists
    ADD CONSTRAINT checklists_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

--
-- Name: checklists_test_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.checklists
    ADD CONSTRAINT checklists_test_case_id_fkey FOREIGN KEY (test_case_id) REFERENCES public.test_cases(id) ON DELETE CASCADE;

--
-- Name: comments_test_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_test_case_id_fkey FOREIGN KEY (test_case_id) REFERENCES public.test_cases(id) ON DELETE CASCADE;

--
-- Name: comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

--
-- Name: projects_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;

--
-- Name: test_case_sections_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.test_case_sections
    ADD CONSTRAINT test_case_sections_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.test_case_sections(id) ON DELETE CASCADE;

--
-- Name: test_case_sections_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.test_case_sections
    ADD CONSTRAINT test_case_sections_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

--
-- Name: test_case_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.test_case_tags
    ADD CONSTRAINT test_case_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;

--
-- Name: test_case_tags_test_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.test_case_tags
    ADD CONSTRAINT test_case_tags_test_case_id_fkey FOREIGN KEY (test_case_id) REFERENCES public.test_cases(id) ON DELETE CASCADE;

--
-- Name: test_cases_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.test_cases
    ADD CONSTRAINT test_cases_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id) ON DELETE SET NULL;

--
-- Name: test_cases_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.test_cases
    ADD CONSTRAINT test_cases_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;

--
-- Name: test_cases_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.test_cases
    ADD CONSTRAINT test_cases_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

--
-- Name: test_cases_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.test_cases
    ADD CONSTRAINT test_cases_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.test_case_sections(id) ON DELETE SET NULL;

--
-- Name: test_cases_test_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.test_cases
    ADD CONSTRAINT test_cases_test_plan_id_fkey FOREIGN KEY (test_plan_id) REFERENCES public.test_plans(id) ON DELETE SET NULL;

--
-- Name: test_plans_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.test_plans
    ADD CONSTRAINT test_plans_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;

--
-- Name: test_plans_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.test_plans
    ADD CONSTRAINT test_plans_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

--
-- Name: test_results_executed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.test_results
    ADD CONSTRAINT test_results_executed_by_fkey FOREIGN KEY (executed_by) REFERENCES public.users(id) ON DELETE SET NULL;

--
-- Name: test_results_test_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.test_results
    ADD CONSTRAINT test_results_test_case_id_fkey FOREIGN KEY (test_case_id) REFERENCES public.test_cases(id) ON DELETE CASCADE;

--
-- Name: test_results_test_run_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.test_results
    ADD CONSTRAINT test_results_test_run_id_fkey FOREIGN KEY (test_run_id) REFERENCES public.test_runs(id) ON DELETE CASCADE;

--
-- Name: test_runs_started_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.test_runs
    ADD CONSTRAINT test_runs_started_by_fkey FOREIGN KEY (started_by) REFERENCES public.users(id) ON DELETE SET NULL;

--
-- Name: test_runs_test_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tms_user
--

ALTER TABLE ONLY public.test_runs
    ADD CONSTRAINT test_runs_test_plan_id_fkey FOREIGN KEY (test_plan_id) REFERENCES public.test_plans(id) ON DELETE CASCADE;

--
-- PostgreSQL database dump complete
-- 