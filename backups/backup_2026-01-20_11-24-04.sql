--
-- PostgreSQL database dump
--

\restrict jGOaOY7IyxATKX4d676UIYD9G8EOWVoUUqzraj5FoNNA0f1dPnGcsoZMeqIE37i

-- Dumped from database version 15.14
-- Dumped by pg_dump version 15.14

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: aporte; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.aporte (
    id bigint NOT NULL,
    data timestamp(6) without time zone NOT NULL,
    descricao character varying(255),
    valor numeric(38,2) NOT NULL,
    id_funcionario integer NOT NULL
);


ALTER TABLE public.aporte OWNER TO postgres;

--
-- Name: aporte_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.aporte_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.aporte_id_seq OWNER TO postgres;

--
-- Name: aporte_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.aporte_id_seq OWNED BY public.aporte.id;


--
-- Name: balcao; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.balcao (
    id_balcao integer NOT NULL,
    status character varying(100)
);


ALTER TABLE public.balcao OWNER TO postgres;

--
-- Name: balcao_id_balcao_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.balcao_id_balcao_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.balcao_id_balcao_seq OWNER TO postgres;

--
-- Name: balcao_id_balcao_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.balcao_id_balcao_seq OWNED BY public.balcao.id_balcao;


--
-- Name: cliente; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cliente (
    email character varying(255),
    id_pessoa integer NOT NULL
);


ALTER TABLE public.cliente OWNER TO postgres;

--
-- Name: endereco; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.endereco (
    id_endereco integer NOT NULL,
    bairro character varying(255),
    cep character varying(255),
    cidade character varying(255),
    numero integer,
    rua character varying(255) NOT NULL,
    uf character varying(255),
    id_pessoa_cliente integer
);


ALTER TABLE public.endereco OWNER TO postgres;

--
-- Name: endereco_id_endereco_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.endereco_id_endereco_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.endereco_id_endereco_seq OWNER TO postgres;

--
-- Name: endereco_id_endereco_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.endereco_id_endereco_seq OWNED BY public.endereco.id_endereco;


--
-- Name: entrega; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.entrega (
    id_entrega integer NOT NULL,
    status character varying(255) NOT NULL,
    id_endereco_entrega integer,
    id_funcionario_entregador integer,
    id_pedido integer NOT NULL,
    CONSTRAINT entrega_status_check CHECK (((status)::text = ANY ((ARRAY['EM_ROTA'::character varying, 'ENTREGUE'::character varying])::text[])))
);


ALTER TABLE public.entrega OWNER TO postgres;

--
-- Name: entrega_id_entrega_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.entrega_id_entrega_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.entrega_id_entrega_seq OWNER TO postgres;

--
-- Name: entrega_id_entrega_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.entrega_id_entrega_seq OWNED BY public.entrega.id_entrega;


--
-- Name: funcionario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.funcionario (
    cargo character varying(100),
    id_funcionario integer NOT NULL,
    login_usuario character varying(100)
);


ALTER TABLE public.funcionario OWNER TO postgres;

--
-- Name: item_pedido_sabores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.item_pedido_sabores (
    item_pedido_id integer NOT NULL,
    produto_id integer NOT NULL
);


ALTER TABLE public.item_pedido_sabores OWNER TO postgres;

--
-- Name: itempedido; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.itempedido (
    id_item integer NOT NULL,
    preco numeric(10,2) NOT NULL,
    quantidade integer NOT NULL,
    id_pedido integer NOT NULL,
    id_produto integer NOT NULL,
    tamanho character varying(1),
    sabores text
);


ALTER TABLE public.itempedido OWNER TO postgres;

--
-- Name: itempedido_id_item_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.itempedido_id_item_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.itempedido_id_item_seq OWNER TO postgres;

--
-- Name: itempedido_id_item_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.itempedido_id_item_seq OWNED BY public.itempedido.id_item;


--
-- Name: mesa; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mesa (
    numero integer NOT NULL,
    capacidade integer,
    status character varying(255) NOT NULL,
    CONSTRAINT mesa_status_check CHECK (((status)::text = ANY ((ARRAY['LIVRE'::character varying, 'OCUPADA'::character varying, 'RESERVADA'::character varying])::text[])))
);


ALTER TABLE public.mesa OWNER TO postgres;

--
-- Name: pagamento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pagamento (
    id_pagamento integer NOT NULL,
    datapag timestamp(6) without time zone NOT NULL,
    metodo character varying(255) NOT NULL,
    status character varying(255),
    valor_pago numeric(10,2) NOT NULL,
    id_pedido integer NOT NULL,
    CONSTRAINT pagamento_metodo_check CHECK (((metodo)::text = ANY ((ARRAY['PIX'::character varying, 'CARTAO_CREDITO'::character varying, 'CARTAO_DEBITO'::character varying, 'DINHEIRO'::character varying])::text[]))),
    CONSTRAINT pagamento_status_check CHECK (((status)::text = ANY ((ARRAY['PENDENTE'::character varying, 'EFETUADO'::character varying, 'FALHOU'::character varying, 'CANCELADO'::character varying])::text[])))
);


ALTER TABLE public.pagamento OWNER TO postgres;

--
-- Name: pagamento_id_pagamento_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pagamento_id_pagamento_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.pagamento_id_pagamento_seq OWNER TO postgres;

--
-- Name: pagamento_id_pagamento_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pagamento_id_pagamento_seq OWNED BY public.pagamento.id_pagamento;


--
-- Name: pedido; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pedido (
    id integer NOT NULL,
    data timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    data_pagamento timestamp(6) without time zone,
    nome_cliente_temporario character varying(255),
    numero_dia integer,
    status character varying(255) NOT NULL,
    total numeric(10,2),
    id_balcao integer,
    id_pessoa integer,
    id_mesa integer,
    taxa_entrega numeric(10,2),
    CONSTRAINT pedido_status_check CHECK (((status)::text = ANY ((ARRAY['PREPARANDO'::character varying, 'PRONTO'::character varying, 'PAGO'::character varying, 'ENTREGUE'::character varying, 'CANCELADO'::character varying])::text[])))
);


ALTER TABLE public.pedido OWNER TO postgres;

--
-- Name: pedido_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pedido_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.pedido_id_seq OWNER TO postgres;

--
-- Name: pedido_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pedido_id_seq OWNED BY public.pedido.id;


--
-- Name: pessoa; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pessoa (
    id integer NOT NULL,
    nome character varying(255) NOT NULL,
    telefone character varying(255)
);


ALTER TABLE public.pessoa OWNER TO postgres;

--
-- Name: pessoa_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pessoa_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.pessoa_id_seq OWNER TO postgres;

--
-- Name: pessoa_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pessoa_id_seq OWNED BY public.pessoa.id;


--
-- Name: produto; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.produto (
    id_produto integer NOT NULL,
    descricao character varying(500),
    imagem_url character varying(255),
    nome character varying(255) NOT NULL,
    preco numeric(10,2) NOT NULL,
    tipo character varying(255) NOT NULL,
    preco_grande numeric(10,2),
    preco_medio numeric(10,2),
    preco_pequeno numeric(10,2),
    CONSTRAINT produto_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['PIZZA_ESPECIAL'::character varying, 'PIZZA_TRADICIONAL'::character varying, 'PIZZA_DOCE'::character varying, 'PASTEL_DOCE'::character varying, 'LANCHES'::character varying, 'PASTEL'::character varying, 'SUCOS'::character varying, 'DRINKS'::character varying, 'SOBREMESA'::character varying, 'BEBIDA'::character varying])::text[])))
);


ALTER TABLE public.produto OWNER TO postgres;

--
-- Name: produto_id_produto_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.produto_id_produto_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.produto_id_produto_seq OWNER TO postgres;

--
-- Name: produto_id_produto_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.produto_id_produto_seq OWNED BY public.produto.id_produto;


--
-- Name: relatorio_diario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.relatorio_diario (
    id bigint NOT NULL,
    data date NOT NULL,
    valor_total numeric(38,2) NOT NULL
);


ALTER TABLE public.relatorio_diario OWNER TO postgres;

--
-- Name: relatorio_diario_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.relatorio_diario_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.relatorio_diario_id_seq OWNER TO postgres;

--
-- Name: relatorio_diario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.relatorio_diario_id_seq OWNED BY public.relatorio_diario.id;


--
-- Name: reserva; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reserva (
    id integer NOT NULL,
    data_reserva timestamp(6) without time zone NOT NULL,
    nome_reserva character varying(255),
    num_pessoas integer NOT NULL,
    observacoes character varying(255),
    status character varying(255) NOT NULL,
    id_pessoa integer,
    id_mesa integer NOT NULL,
    CONSTRAINT reserva_status_check CHECK (((status)::text = ANY ((ARRAY['PENDENTE'::character varying, 'CONFIRMADA'::character varying, 'CANCELADA_CLIENTE'::character varying, 'CANCELADA_ESTABELECIMENTO'::character varying, 'CONCLUIDA'::character varying, 'NAO_COMPARECEU'::character varying])::text[])))
);


ALTER TABLE public.reserva OWNER TO postgres;

--
-- Name: reserva_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reserva_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.reserva_id_seq OWNER TO postgres;

--
-- Name: reserva_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reserva_id_seq OWNED BY public.reserva.id;


--
-- Name: sangria; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sangria (
    id bigint NOT NULL,
    data timestamp(6) without time zone NOT NULL,
    observacao character varying(255),
    valor numeric(38,2) NOT NULL,
    id_funcionario integer NOT NULL
);


ALTER TABLE public.sangria OWNER TO postgres;

--
-- Name: sangria_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sangria_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sangria_id_seq OWNER TO postgres;

--
-- Name: sangria_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sangria_id_seq OWNED BY public.sangria.id;


--
-- Name: sequenciador_pedido; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sequenciador_pedido (
    id bigint NOT NULL,
    data_inicio_expediente timestamp(6) without time zone NOT NULL,
    proximo_numero integer NOT NULL
);


ALTER TABLE public.sequenciador_pedido OWNER TO postgres;

--
-- Name: usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuario (
    id_usuario integer NOT NULL,
    login character varying(100) NOT NULL,
    senha character varying(255) NOT NULL,
    tipo character varying(255) NOT NULL,
    CONSTRAINT usuario_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['ADMIN'::character varying, 'FUNCIONARIO'::character varying])::text[])))
);


ALTER TABLE public.usuario OWNER TO postgres;

--
-- Name: usuario_id_usuario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuario_id_usuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.usuario_id_usuario_seq OWNER TO postgres;

--
-- Name: usuario_id_usuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuario_id_usuario_seq OWNED BY public.usuario.id_usuario;


--
-- Name: aporte id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aporte ALTER COLUMN id SET DEFAULT nextval('public.aporte_id_seq'::regclass);


--
-- Name: balcao id_balcao; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.balcao ALTER COLUMN id_balcao SET DEFAULT nextval('public.balcao_id_balcao_seq'::regclass);


--
-- Name: endereco id_endereco; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.endereco ALTER COLUMN id_endereco SET DEFAULT nextval('public.endereco_id_endereco_seq'::regclass);


--
-- Name: entrega id_entrega; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entrega ALTER COLUMN id_entrega SET DEFAULT nextval('public.entrega_id_entrega_seq'::regclass);


--
-- Name: itempedido id_item; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itempedido ALTER COLUMN id_item SET DEFAULT nextval('public.itempedido_id_item_seq'::regclass);


--
-- Name: pagamento id_pagamento; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagamento ALTER COLUMN id_pagamento SET DEFAULT nextval('public.pagamento_id_pagamento_seq'::regclass);


--
-- Name: pedido id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido ALTER COLUMN id SET DEFAULT nextval('public.pedido_id_seq'::regclass);


--
-- Name: pessoa id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pessoa ALTER COLUMN id SET DEFAULT nextval('public.pessoa_id_seq'::regclass);


--
-- Name: produto id_produto; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.produto ALTER COLUMN id_produto SET DEFAULT nextval('public.produto_id_produto_seq'::regclass);


--
-- Name: relatorio_diario id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.relatorio_diario ALTER COLUMN id SET DEFAULT nextval('public.relatorio_diario_id_seq'::regclass);


--
-- Name: reserva id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reserva ALTER COLUMN id SET DEFAULT nextval('public.reserva_id_seq'::regclass);


--
-- Name: sangria id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sangria ALTER COLUMN id SET DEFAULT nextval('public.sangria_id_seq'::regclass);


--
-- Name: usuario id_usuario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario ALTER COLUMN id_usuario SET DEFAULT nextval('public.usuario_id_usuario_seq'::regclass);


--
-- Data for Name: aporte; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.aporte (id, data, descricao, valor, id_funcionario) FROM stdin;
1	2025-11-11 03:34:03.693628	4dsefsf	50.00	1
2	2025-11-11 03:39:25.024316	4535	34534.00	1
35	2026-01-19 18:44:59.851612	adicao de trocos	5.00	1
\.


--
-- Data for Name: balcao; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.balcao (id_balcao, status) FROM stdin;
\.


--
-- Data for Name: cliente; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cliente (email, id_pessoa) FROM stdin;
fabiogifagundes@gmail.com	2
josedossantos@gmail.com	3
rosiivancheski@gmail.com	5
\.


--
-- Data for Name: endereco; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.endereco (id_endereco, bairro, cep, cidade, numero, rua, uf, id_pessoa_cliente) FROM stdin;
1	Uvaranas	84560-000	Rio Azul	80	Rua José Galdino Dos Reis	PR	2
2	centro	84560-000	Rio Azul	20	Avenida das torres	PR	3
3	Sta Terezinha	84560-000	Rio Azul	80	Rua Albino Ianoski	PR	5
\.


--
-- Data for Name: entrega; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.entrega (id_entrega, status, id_endereco_entrega, id_funcionario_entregador, id_pedido) FROM stdin;
\.


--
-- Data for Name: funcionario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.funcionario (cargo, id_funcionario, login_usuario) FROM stdin;
ADMIN	1	admin
garçom	4	fabio
\.


--
-- Data for Name: item_pedido_sabores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.item_pedido_sabores (item_pedido_id, produto_id) FROM stdin;
\.


--
-- Data for Name: itempedido; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.itempedido (id_item, preco, quantidade, id_pedido, id_produto, tamanho, sabores) FROM stdin;
1	90.00	1	1	1	\N	\N
2	90.00	1	2	1	\N	\N
3	90.00	1	3	1	\N	\N
4	90.00	1	4	1	\N	\N
5	90.00	1	5	1	\N	\N
6	90.00	1	6	1	\N	\N
7	90.00	1	7	1	\N	\N
8	90.00	1	8	1	\N	\N
9	90.00	1	9	1	\N	\N
10	90.00	1	10	1	\N	\N
11	90.00	1	11	1	\N	\N
12	90.00	1	12	1	\N	\N
13	90.00	1	28	1	\N	\N
14	90.00	1	29	1	\N	\N
15	90.00	1	30	4	\N	\N
16	60.00	1	36	4	M	Pizza Teste,Pepperoni Especials
17	5.00	1	36	7	\N	\N
18	60.00	1	37	4	M	Morango com Nutella
19	5.00	1	38	7	\N	\N
20	5.00	1	39	7	\N	\N
21	5.00	1	40	7	\N	\N
22	5.00	1	37	7	\N	\N
23	5.00	1	41	7	\N	\N
24	5.00	1	42	7	\N	\N
25	100.00	1	43	6	P	Pizza Teste
26	60.00	1	44	5	P	Morango com Nutella,Pistache
27	55.00	1	45	4	P	Pistache
\.


--
-- Data for Name: mesa; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mesa (numero, capacidade, status) FROM stdin;
5	4	LIVRE
6	4	LIVRE
7	4	LIVRE
8	4	LIVRE
9	4	LIVRE
10	4	LIVRE
11	4	LIVRE
12	4	LIVRE
13	4	LIVRE
14	4	LIVRE
15	4	LIVRE
16	4	LIVRE
17	4	LIVRE
18	4	LIVRE
19	4	LIVRE
20	4	LIVRE
21	4	LIVRE
22	4	LIVRE
23	4	LIVRE
24	4	LIVRE
25	4	LIVRE
26	4	LIVRE
27	4	LIVRE
28	4	LIVRE
29	4	LIVRE
30	4	LIVRE
31	4	LIVRE
32	4	LIVRE
33	4	LIVRE
34	4	LIVRE
35	4	LIVRE
2	4	LIVRE
4	4	LIVRE
3	4	RESERVADA
1	4	LIVRE
\.


--
-- Data for Name: pagamento; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pagamento (id_pagamento, datapag, metodo, status, valor_pago, id_pedido) FROM stdin;
1	2025-11-10 19:38:42.32475	DINHEIRO	EFETUADO	90.00	1
2	2025-11-10 19:44:52.197312	DINHEIRO	EFETUADO	90.00	2
3	2025-11-10 19:48:35.433443	PIX	EFETUADO	120.00	3
4	2025-11-10 20:34:00.797328	CARTAO_CREDITO	EFETUADO	90.00	4
5	2025-11-10 20:34:15.291805	CARTAO_DEBITO	EFETUADO	95.00	5
6	2025-11-10 20:58:25.691513	PIX	EFETUADO	97.00	6
7	2025-11-10 21:03:36.237001	PIX	EFETUADO	90.00	7
8	2025-11-10 21:05:12.448071	PIX	EFETUADO	90.00	8
9	2025-11-10 21:05:20.471426	DINHEIRO	EFETUADO	222.00	9
10	2025-11-10 21:23:46.999875	DINHEIRO	EFETUADO	97.00	11
11	2025-11-10 21:25:11.157666	PIX	EFETUADO	90.00	12
12	2025-11-10 22:59:23.932352	DINHEIRO	EFETUADO	90.00	28
13	2025-11-10 23:24:42.64864	PIX	EFETUADO	97.00	29
14	2025-11-11 03:29:54.251298	DINHEIRO	EFETUADO	200.00	30
15	2026-01-19 17:48:50.032536	PIX	EFETUADO	120.00	36
16	2026-01-19 18:15:24.122591	CARTAO_CREDITO	EFETUADO	51.00	38
17	2026-01-19 18:43:36.024478	PIX	EFETUADO	65.00	37
18	2026-01-19 18:43:43.701652	PIX	EFETUADO	12.00	40
19	2026-01-19 18:43:51.290942	PIX	EFETUADO	5.00	41
20	2026-01-19 18:43:59.239186	CARTAO_CREDITO	EFETUADO	5.00	39
21	2026-01-19 22:38:50.127328	CARTAO_CREDITO	EFETUADO	100.00	43
22	2026-01-19 22:40:10.447268	PIX	EFETUADO	60.00	44
\.


--
-- Data for Name: pedido; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pedido (id, data, data_pagamento, nome_cliente_temporario, numero_dia, status, total, id_balcao, id_pessoa, id_mesa, taxa_entrega) FROM stdin;
42	2026-01-19 18:39:32.448565	\N	\N	7	ENTREGUE	12.00	\N	2	\N	7.00
36	2026-01-19 17:46:17.513318	2026-01-19 17:48:50.119716	\N	1	ENTREGUE	65.00	\N	\N	1	0.00
37	2026-01-19 17:49:13.536905	2026-01-19 18:43:36.042375	\N	2	ENTREGUE	65.00	\N	\N	2	0.00
38	2026-01-19 17:59:01.070248	2026-01-19 18:15:24.193999	\N	3	ENTREGUE	5.00	\N	\N	3	0.00
10	2025-11-10 21:05:41.345419	\N	\N	10	CANCELADO	97.00	\N	3	\N	7.00
39	2026-01-19 18:08:37.586122	2026-01-19 18:43:59.243751	\N	4	ENTREGUE	5.00	\N	\N	4	0.00
40	2026-01-19 18:20:26.279636	2026-01-19 18:43:43.710065	\N	5	ENTREGUE	12.00	\N	5	\N	7.00
41	2026-01-19 18:39:04.502743	2026-01-19 18:43:51.298691	fabio	6	ENTREGUE	5.00	\N	\N	\N	0.00
1	2025-11-10 19:38:26.340067	2025-11-10 19:38:42.336596	fabio	1	ENTREGUE	90.00	\N	\N	\N	\N
2	2025-11-10 19:44:38.022483	2025-11-10 19:44:52.207373	fabio	2	ENTREGUE	90.00	\N	\N	\N	\N
3	2025-11-10 19:45:20.734932	2025-11-10 19:48:35.439763	maria	3	ENTREGUE	90.00	\N	\N	\N	\N
4	2025-11-10 19:50:25.564447	2025-11-10 20:34:00.802382	maria	4	ENTREGUE	90.00	\N	\N	\N	\N
5	2025-11-10 20:33:51.46696	2025-11-10 20:34:15.294116	\N	5	ENTREGUE	95.00	\N	2	\N	5.00
6	2025-11-10 20:45:49.998626	2025-11-10 20:58:25.696294	\N	6	ENTREGUE	97.00	\N	2	\N	7.00
7	2025-11-10 20:56:48.688355	2025-11-10 21:03:36.251589	fabio	7	ENTREGUE	90.00	\N	\N	\N	0.00
8	2025-11-10 21:04:58.757343	2025-11-10 21:05:12.4517	zanini	8	ENTREGUE	90.00	\N	\N	\N	0.00
9	2025-11-10 21:05:04.340366	2025-11-10 21:05:20.474252	zanini	9	ENTREGUE	90.00	\N	\N	\N	0.00
11	2025-11-10 21:23:32.956014	2025-11-10 21:23:47.014325	\N	11	ENTREGUE	97.00	\N	3	\N	7.00
43	2026-01-19 22:38:38.595248	2026-01-19 22:38:50.153841	eu	1	PAGO	100.00	\N	\N	\N	0.00
44	2026-01-19 22:39:40.569594	2026-01-19 22:40:10.458337	\N	2	PAGO	60.00	\N	\N	1	0.00
45	2026-01-20 14:13:07.344105	\N	fa bio	3	PREPARANDO	55.00	\N	\N	\N	0.00
12	2025-11-10 21:25:06.261805	2025-11-10 21:25:11.159826	maria	1	ENTREGUE	90.00	\N	\N	\N	0.00
28	2025-11-10 22:59:18.838328	2025-11-10 22:59:23.951198	fabio	2	ENTREGUE	90.00	\N	\N	\N	0.00
29	2025-11-10 23:23:06.703975	2025-11-10 23:24:42.653339	\N	3	ENTREGUE	97.00	\N	3	\N	7.00
30	2025-11-11 03:29:13.140154	2025-11-11 03:29:54.272217	\N	4	ENTREGUE	97.00	\N	2	\N	7.00
\.


--
-- Data for Name: pessoa; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pessoa (id, nome, telefone) FROM stdin;
1	Administrador do Sistema	00000-0000
2	Fabio Gabriel Ivancheski Fagundes	(42) 99847-1585
3	José dos Santos	(42) 93345-6764
4	Fabio Gabriel Ivancheski Fagundes	(42) 99847-1585
5	Rosimeri Ivancheski	(42) 99835-1553
\.


--
-- Data for Name: produto; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.produto (id_produto, descricao, imagem_url, nome, preco, tipo, preco_grande, preco_medio, preco_pequeno) FROM stdin;
4	\N	\N	Pepperoni Especials	90.00	PIZZA_ESPECIAL	90.00	60.00	55.00
1	Massa, Pistache, Creme de Pistache	757a6117-57d8-4fdb-b25f-3850cf5f3f22.jpg	Pistache	90.00	PIZZA_DOCE	100.00	80.00	70.00
5	Massa, Nutella, Morango	07ecdebe-58ec-4e29-93fb-ab633d54eac2.jpg	Morango com Nutella	90.00	PIZZA_DOCE	80.00	70.00	60.00
6	Massa teste	5d3c6d57-f538-45ce-829e-cc6e30d429a6.jpg	Pizza Teste	100.00	PIZZA_TRADICIONAL	300.00	200.00	100.00
7	\N	727aec71-5f07-4fc2-859c-4176a3c15b2b.jpg	Coca-Cola Lata	5.00	BEBIDA	\N	\N	\N
\.


--
-- Data for Name: relatorio_diario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.relatorio_diario (id, data, valor_total) FROM stdin;
1	2025-11-10	1146.00
2	2025-11-11	34667.00
3	2026-01-19	312.00
\.


--
-- Data for Name: reserva; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reserva (id, data_reserva, nome_reserva, num_pessoas, observacoes, status, id_pessoa, id_mesa) FROM stdin;
1	2026-01-20 19:00:00	Reserva	1		CONFIRMADA	\N	3
\.


--
-- Data for Name: sangria; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sangria (id, data, observacao, valor, id_funcionario) FROM stdin;
1	2025-11-10 21:24:25.542378	troco	50.00	1
2	2025-11-11 03:34:26.45796	wtrt	4.00	1
3	2025-11-11 03:39:09.653819	tsdsf	5.00	1
4	2025-11-11 03:40:46.337996	troco	5.00	1
36	2026-01-19 18:44:26.34712	comprado gelo	10.00	1
\.


--
-- Data for Name: sequenciador_pedido; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sequenciador_pedido (id, data_inicio_expediente, proximo_numero) FROM stdin;
1	2026-01-19 18:45:29.793336	4
\.


--
-- Data for Name: usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuario (id_usuario, login, senha, tipo) FROM stdin;
1	admin	$2a$10$QAOOcsJ22rnVuVxPRWGPY.pYrRyscRx/Znw6MAW5tkBIrhJgCnfAS	ADMIN
2	fabio	$2a$10$e0hB4qCEw7o9sY4YuAhsmuKU3qfurhI5oQ/QYD0XkJyRPGAa7OHNu	FUNCIONARIO
\.


--
-- Name: aporte_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.aporte_id_seq', 35, true);


--
-- Name: balcao_id_balcao_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.balcao_id_balcao_seq', 1, false);


--
-- Name: endereco_id_endereco_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.endereco_id_endereco_seq', 3, true);


--
-- Name: entrega_id_entrega_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.entrega_id_entrega_seq', 1, false);


--
-- Name: itempedido_id_item_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.itempedido_id_item_seq', 27, true);


--
-- Name: pagamento_id_pagamento_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pagamento_id_pagamento_seq', 22, true);


--
-- Name: pedido_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pedido_id_seq', 45, true);


--
-- Name: pessoa_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pessoa_id_seq', 5, true);


--
-- Name: produto_id_produto_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.produto_id_produto_seq', 7, true);


--
-- Name: relatorio_diario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.relatorio_diario_id_seq', 3, true);


--
-- Name: reserva_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reserva_id_seq', 1, true);


--
-- Name: sangria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sangria_id_seq', 36, true);


--
-- Name: usuario_id_usuario_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuario_id_usuario_seq', 2, true);


--
-- Name: aporte aporte_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aporte
    ADD CONSTRAINT aporte_pkey PRIMARY KEY (id);


--
-- Name: balcao balcao_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.balcao
    ADD CONSTRAINT balcao_pkey PRIMARY KEY (id_balcao);


--
-- Name: cliente cliente_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT cliente_pkey PRIMARY KEY (id_pessoa);


--
-- Name: endereco endereco_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.endereco
    ADD CONSTRAINT endereco_pkey PRIMARY KEY (id_endereco);


--
-- Name: entrega entrega_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entrega
    ADD CONSTRAINT entrega_pkey PRIMARY KEY (id_entrega);


--
-- Name: funcionario funcionario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.funcionario
    ADD CONSTRAINT funcionario_pkey PRIMARY KEY (id_funcionario);


--
-- Name: itempedido itempedido_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itempedido
    ADD CONSTRAINT itempedido_pkey PRIMARY KEY (id_item);


--
-- Name: mesa mesa_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mesa
    ADD CONSTRAINT mesa_pkey PRIMARY KEY (numero);


--
-- Name: pagamento pagamento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagamento
    ADD CONSTRAINT pagamento_pkey PRIMARY KEY (id_pagamento);


--
-- Name: pedido pedido_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT pedido_pkey PRIMARY KEY (id);


--
-- Name: pessoa pessoa_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pessoa
    ADD CONSTRAINT pessoa_pkey PRIMARY KEY (id);


--
-- Name: produto produto_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.produto
    ADD CONSTRAINT produto_pkey PRIMARY KEY (id_produto);


--
-- Name: relatorio_diario relatorio_diario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.relatorio_diario
    ADD CONSTRAINT relatorio_diario_pkey PRIMARY KEY (id);


--
-- Name: reserva reserva_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reserva
    ADD CONSTRAINT reserva_pkey PRIMARY KEY (id);


--
-- Name: sangria sangria_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sangria
    ADD CONSTRAINT sangria_pkey PRIMARY KEY (id);


--
-- Name: sequenciador_pedido sequenciador_pedido_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sequenciador_pedido
    ADD CONSTRAINT sequenciador_pedido_pkey PRIMARY KEY (id);


--
-- Name: cliente uk_cmxo70m08n43599l3h0h07cc6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT uk_cmxo70m08n43599l3h0h07cc6 UNIQUE (email);


--
-- Name: usuario uk_pm3f4m4fqv89oeeeac4tbe2f4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT uk_pm3f4m4fqv89oeeeac4tbe2f4 UNIQUE (login);


--
-- Name: funcionario uk_qipvw6r6p9gijuu4cbxpgss9f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.funcionario
    ADD CONSTRAINT uk_qipvw6r6p9gijuu4cbxpgss9f UNIQUE (login_usuario);


--
-- Name: entrega uk_sgigrf2neiyd5ce8gs2p5xpje; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entrega
    ADD CONSTRAINT uk_sgigrf2neiyd5ce8gs2p5xpje UNIQUE (id_pedido);


--
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (id_usuario);


--
-- Name: entrega fk4s24o1nni3i77fjwy9613u88d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entrega
    ADD CONSTRAINT fk4s24o1nni3i77fjwy9613u88d FOREIGN KEY (id_endereco_entrega) REFERENCES public.endereco(id_endereco);


--
-- Name: funcionario fk5ryf76v09jtf9jihrtxs22bnh; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.funcionario
    ADD CONSTRAINT fk5ryf76v09jtf9jihrtxs22bnh FOREIGN KEY (id_funcionario) REFERENCES public.pessoa(id);


--
-- Name: pedido fk6vxat0l7c1d0enyrlij0fiyks; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT fk6vxat0l7c1d0enyrlij0fiyks FOREIGN KEY (id_mesa) REFERENCES public.mesa(numero);


--
-- Name: entrega fk7t7b8df6pntkiqkis1r4sm7w9; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entrega
    ADD CONSTRAINT fk7t7b8df6pntkiqkis1r4sm7w9 FOREIGN KEY (id_funcionario_entregador) REFERENCES public.funcionario(id_funcionario);


--
-- Name: itempedido fk8n0fyxjjnmxi31wmefpju8r7w; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itempedido
    ADD CONSTRAINT fk8n0fyxjjnmxi31wmefpju8r7w FOREIGN KEY (id_pedido) REFERENCES public.pedido(id);


--
-- Name: funcionario fk93qfbu8khioi3owkf8fuakiy8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.funcionario
    ADD CONSTRAINT fk93qfbu8khioi3owkf8fuakiy8 FOREIGN KEY (login_usuario) REFERENCES public.usuario(login);


--
-- Name: cliente fkbjwqfll0hhesxqhyjaombdnj1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT fkbjwqfll0hhesxqhyjaombdnj1 FOREIGN KEY (id_pessoa) REFERENCES public.pessoa(id);


--
-- Name: entrega fkcdustrwuo7xjwlf79ru25i6vq; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entrega
    ADD CONSTRAINT fkcdustrwuo7xjwlf79ru25i6vq FOREIGN KEY (id_pedido) REFERENCES public.pedido(id);


--
-- Name: item_pedido_sabores fkd5s5pa6duey107lyfs3mw6qqc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_pedido_sabores
    ADD CONSTRAINT fkd5s5pa6duey107lyfs3mw6qqc FOREIGN KEY (item_pedido_id) REFERENCES public.itempedido(id_item);


--
-- Name: endereco fkiqlkt6er2po552djlj864hgq3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.endereco
    ADD CONSTRAINT fkiqlkt6er2po552djlj864hgq3 FOREIGN KEY (id_pessoa_cliente) REFERENCES public.cliente(id_pessoa);


--
-- Name: pedido fkjkkq3fu9u3t33gas5qj27kd1f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT fkjkkq3fu9u3t33gas5qj27kd1f FOREIGN KEY (id_pessoa) REFERENCES public.cliente(id_pessoa);


--
-- Name: pedido fkjukc9nffvcoxerrudf2wx4u8o; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido
    ADD CONSTRAINT fkjukc9nffvcoxerrudf2wx4u8o FOREIGN KEY (id_balcao) REFERENCES public.balcao(id_balcao);


--
-- Name: itempedido fkl3fb2gkul68aspl7wii9shaad; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itempedido
    ADD CONSTRAINT fkl3fb2gkul68aspl7wii9shaad FOREIGN KEY (id_produto) REFERENCES public.produto(id_produto);


--
-- Name: aporte fklf3rwknnw2itd0ibwqtt25j4e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aporte
    ADD CONSTRAINT fklf3rwknnw2itd0ibwqtt25j4e FOREIGN KEY (id_funcionario) REFERENCES public.funcionario(id_funcionario);


--
-- Name: item_pedido_sabores fkm2f89yjp18qtfybu4g7ynkpt0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_pedido_sabores
    ADD CONSTRAINT fkm2f89yjp18qtfybu4g7ynkpt0 FOREIGN KEY (produto_id) REFERENCES public.produto(id_produto);


--
-- Name: reserva fkpe2q7n2tr82uqra44vrdci7nv; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reserva
    ADD CONSTRAINT fkpe2q7n2tr82uqra44vrdci7nv FOREIGN KEY (id_pessoa) REFERENCES public.cliente(id_pessoa);


--
-- Name: pagamento fkr0y4u4wge04ftnh22vhmid0ee; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagamento
    ADD CONSTRAINT fkr0y4u4wge04ftnh22vhmid0ee FOREIGN KEY (id_pedido) REFERENCES public.pedido(id);


--
-- Name: reserva fksofygkea29tra372a1w1qcbur; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reserva
    ADD CONSTRAINT fksofygkea29tra372a1w1qcbur FOREIGN KEY (id_mesa) REFERENCES public.mesa(numero);


--
-- Name: sangria fkt0c4a1guvh29fefdn9un0g5c2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sangria
    ADD CONSTRAINT fkt0c4a1guvh29fefdn9un0g5c2 FOREIGN KEY (id_funcionario) REFERENCES public.funcionario(id_funcionario);


--
-- PostgreSQL database dump complete
--

\unrestrict jGOaOY7IyxATKX4d676UIYD9G8EOWVoUUqzraj5FoNNA0f1dPnGcsoZMeqIE37i

