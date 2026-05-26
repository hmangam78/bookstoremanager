--
-- PostgreSQL database cluster dump
--

\restrict fT03RQAwjxNSNfmdnuwcfhdehdC3d0mURCr5tLFRKVbhEi25ePaOP543ff1E9dD

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Roles
--

CREATE ROLE bookstore;
ALTER ROLE bookstore WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:ou3xgbF0rR7BrQD7GyN1Lw==$jAuiQl7rJeaZY3drQuXuW8fzdUCP7RLlZcUoBH/LJbk=:PYlrDnb1bkmqTVCOQN7tdRsV53vV8Jixtq6W0Ytr/dU=';

--
-- User Configurations
--








\unrestrict fT03RQAwjxNSNfmdnuwcfhdehdC3d0mURCr5tLFRKVbhEi25ePaOP543ff1E9dD

--
-- Databases
--

--
-- Database "template1" dump
--

\connect template1

--
-- PostgreSQL database dump
--

\restrict dXJAYItLtMhOj0rM5hCvWxNzYl6lON4bhcAAsHEcBhZMptTnThKcUrP8Bq5kIXF

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

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
-- PostgreSQL database dump complete
--

\unrestrict dXJAYItLtMhOj0rM5hCvWxNzYl6lON4bhcAAsHEcBhZMptTnThKcUrP8Bq5kIXF

--
-- Database "bookstore" dump
--

--
-- PostgreSQL database dump
--

\restrict gLWJvdkSk7pFsBrd05m26BRUDYqG4z9B6IMWoiLZS4Au4xQltK738ufbPofDVfh

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

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
-- Name: bookstore; Type: DATABASE; Schema: -; Owner: bookstore
--

CREATE DATABASE bookstore WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE bookstore OWNER TO bookstore;

\unrestrict gLWJvdkSk7pFsBrd05m26BRUDYqG4z9B6IMWoiLZS4Au4xQltK738ufbPofDVfh
\connect bookstore
\restrict gLWJvdkSk7pFsBrd05m26BRUDYqG4z9B6IMWoiLZS4Au4xQltK738ufbPofDVfh

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
-- Name: book; Type: TABLE; Schema: public; Owner: bookstore
--

CREATE TABLE public.book (
    id integer NOT NULL,
    title character varying NOT NULL,
    author character varying NOT NULL,
    isbn character varying NOT NULL,
    price numeric(10,2),
    stock integer DEFAULT 0 NOT NULL,
    description character varying NOT NULL,
    format character varying NOT NULL,
    genre text[] DEFAULT '{}'::text[] NOT NULL,
    "imageUrl" character varying,
    "publisherId" integer,
    "providerId" integer
);


ALTER TABLE public.book OWNER TO bookstore;

--
-- Name: book_id_seq; Type: SEQUENCE; Schema: public; Owner: bookstore
--

CREATE SEQUENCE public.book_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.book_id_seq OWNER TO bookstore;

--
-- Name: book_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bookstore
--

ALTER SEQUENCE public.book_id_seq OWNED BY public.book.id;


--
-- Name: customer; Type: TABLE; Schema: public; Owner: bookstore
--

CREATE TABLE public.customer (
    id integer NOT NULL,
    name character varying NOT NULL,
    phone character varying NOT NULL,
    email character varying
);


ALTER TABLE public.customer OWNER TO bookstore;

--
-- Name: customer_id_seq; Type: SEQUENCE; Schema: public; Owner: bookstore
--

CREATE SEQUENCE public.customer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customer_id_seq OWNER TO bookstore;

--
-- Name: customer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bookstore
--

ALTER SEQUENCE public.customer_id_seq OWNED BY public.customer.id;


--
-- Name: customer_order; Type: TABLE; Schema: public; Owner: bookstore
--

CREATE TABLE public.customer_order (
    id integer NOT NULL,
    isbn character varying NOT NULL,
    quantity integer NOT NULL,
    "customerId" integer NOT NULL
);


ALTER TABLE public.customer_order OWNER TO bookstore;

--
-- Name: customer_order_id_seq; Type: SEQUENCE; Schema: public; Owner: bookstore
--

CREATE SEQUENCE public.customer_order_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customer_order_id_seq OWNER TO bookstore;

--
-- Name: customer_order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bookstore
--

ALTER SEQUENCE public.customer_order_id_seq OWNED BY public.customer_order.id;


--
-- Name: provider; Type: TABLE; Schema: public; Owner: bookstore
--

CREATE TABLE public.provider (
    id integer NOT NULL,
    name character varying NOT NULL,
    publishers text[] DEFAULT '{}'::text[] NOT NULL
);


ALTER TABLE public.provider OWNER TO bookstore;

--
-- Name: provider_id_seq; Type: SEQUENCE; Schema: public; Owner: bookstore
--

CREATE SEQUENCE public.provider_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.provider_id_seq OWNER TO bookstore;

--
-- Name: provider_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bookstore
--

ALTER SEQUENCE public.provider_id_seq OWNED BY public.provider.id;


--
-- Name: provider_return; Type: TABLE; Schema: public; Owner: bookstore
--

CREATE TABLE public.provider_return (
    id integer NOT NULL,
    reference character varying,
    "providerId" integer,
    "publisherId" integer,
    items jsonb DEFAULT '[]'::jsonb NOT NULL,
    status character varying DEFAULT 'pending'::character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.provider_return OWNER TO bookstore;

--
-- Name: provider_return_id_seq; Type: SEQUENCE; Schema: public; Owner: bookstore
--

CREATE SEQUENCE public.provider_return_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.provider_return_id_seq OWNER TO bookstore;

--
-- Name: provider_return_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bookstore
--

ALTER SEQUENCE public.provider_return_id_seq OWNED BY public.provider_return.id;


--
-- Name: publisher; Type: TABLE; Schema: public; Owner: bookstore
--

CREATE TABLE public.publisher (
    id integer NOT NULL,
    "publisherName" character varying NOT NULL
);


ALTER TABLE public.publisher OWNER TO bookstore;

--
-- Name: publisher_id_seq; Type: SEQUENCE; Schema: public; Owner: bookstore
--

CREATE SEQUENCE public.publisher_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.publisher_id_seq OWNER TO bookstore;

--
-- Name: publisher_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bookstore
--

ALTER SEQUENCE public.publisher_id_seq OWNED BY public.publisher.id;


--
-- Name: sale; Type: TABLE; Schema: public; Owner: bookstore
--

CREATE TABLE public.sale (
    id integer NOT NULL,
    quantity integer NOT NULL,
    "unitPrice" numeric(10,2) NOT NULL,
    total numeric(10,2) NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "bookId" integer
);


ALTER TABLE public.sale OWNER TO bookstore;

--
-- Name: sale_id_seq; Type: SEQUENCE; Schema: public; Owner: bookstore
--

CREATE SEQUENCE public.sale_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sale_id_seq OWNER TO bookstore;

--
-- Name: sale_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bookstore
--

ALTER SEQUENCE public.sale_id_seq OWNED BY public.sale.id;


--
-- Name: setting; Type: TABLE; Schema: public; Owner: bookstore
--

CREATE TABLE public.setting (
    id integer NOT NULL,
    key character varying NOT NULL,
    value character varying NOT NULL
);


ALTER TABLE public.setting OWNER TO bookstore;

--
-- Name: setting_id_seq; Type: SEQUENCE; Schema: public; Owner: bookstore
--

CREATE SEQUENCE public.setting_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.setting_id_seq OWNER TO bookstore;

--
-- Name: setting_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bookstore
--

ALTER SEQUENCE public.setting_id_seq OWNED BY public.setting.id;


--
-- Name: stock_movement; Type: TABLE; Schema: public; Owner: bookstore
--

CREATE TABLE public.stock_movement (
    id integer NOT NULL,
    isbn character varying NOT NULL,
    quantity integer NOT NULL,
    type character varying NOT NULL,
    reference character varying,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.stock_movement OWNER TO bookstore;

--
-- Name: stock_movement_id_seq; Type: SEQUENCE; Schema: public; Owner: bookstore
--

CREATE SEQUENCE public.stock_movement_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stock_movement_id_seq OWNER TO bookstore;

--
-- Name: stock_movement_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bookstore
--

ALTER SEQUENCE public.stock_movement_id_seq OWNED BY public.stock_movement.id;


--
-- Name: stock_receipt_order; Type: TABLE; Schema: public; Owner: bookstore
--

CREATE TABLE public.stock_receipt_order (
    id integer NOT NULL,
    "orderNo" character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.stock_receipt_order OWNER TO bookstore;

--
-- Name: stock_receipt_order_id_seq; Type: SEQUENCE; Schema: public; Owner: bookstore
--

CREATE SEQUENCE public.stock_receipt_order_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stock_receipt_order_id_seq OWNER TO bookstore;

--
-- Name: stock_receipt_order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bookstore
--

ALTER SEQUENCE public.stock_receipt_order_id_seq OWNED BY public.stock_receipt_order.id;


--
-- Name: stock_receipt_order_item; Type: TABLE; Schema: public; Owner: bookstore
--

CREATE TABLE public.stock_receipt_order_item (
    id integer NOT NULL,
    "orderId" integer NOT NULL,
    isbn character varying NOT NULL,
    stock integer NOT NULL
);


ALTER TABLE public.stock_receipt_order_item OWNER TO bookstore;

--
-- Name: stock_receipt_order_item_id_seq; Type: SEQUENCE; Schema: public; Owner: bookstore
--

CREATE SEQUENCE public.stock_receipt_order_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stock_receipt_order_item_id_seq OWNER TO bookstore;

--
-- Name: stock_receipt_order_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bookstore
--

ALTER SEQUENCE public.stock_receipt_order_item_id_seq OWNED BY public.stock_receipt_order_item.id;


--
-- Name: ticket; Type: TABLE; Schema: public; Owner: bookstore
--

CREATE TABLE public.ticket (
    id integer NOT NULL,
    "ticketNo" character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "totalAmount" numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    status character varying DEFAULT 'completed'::character varying NOT NULL
);


ALTER TABLE public.ticket OWNER TO bookstore;

--
-- Name: ticket_id_seq; Type: SEQUENCE; Schema: public; Owner: bookstore
--

CREATE SEQUENCE public.ticket_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ticket_id_seq OWNER TO bookstore;

--
-- Name: ticket_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bookstore
--

ALTER SEQUENCE public.ticket_id_seq OWNED BY public.ticket.id;


--
-- Name: ticket_item; Type: TABLE; Schema: public; Owner: bookstore
--

CREATE TABLE public.ticket_item (
    id integer NOT NULL,
    "saleId" integer NOT NULL,
    "bookId" integer NOT NULL,
    quantity integer NOT NULL,
    "unitPrice" numeric(10,2) NOT NULL,
    total numeric(10,2) NOT NULL,
    "returnedQuantity" integer DEFAULT 0 NOT NULL,
    "ticketId" integer
);


ALTER TABLE public.ticket_item OWNER TO bookstore;

--
-- Name: ticket_item_id_seq; Type: SEQUENCE; Schema: public; Owner: bookstore
--

CREATE SEQUENCE public.ticket_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ticket_item_id_seq OWNER TO bookstore;

--
-- Name: ticket_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bookstore
--

ALTER SEQUENCE public.ticket_item_id_seq OWNED BY public.ticket_item.id;


--
-- Name: uncatalogued; Type: TABLE; Schema: public; Owner: bookstore
--

CREATE TABLE public.uncatalogued (
    id integer NOT NULL,
    isbn character varying NOT NULL,
    stock integer NOT NULL
);


ALTER TABLE public.uncatalogued OWNER TO bookstore;

--
-- Name: uncatalogued_id_seq; Type: SEQUENCE; Schema: public; Owner: bookstore
--

CREATE SEQUENCE public.uncatalogued_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.uncatalogued_id_seq OWNER TO bookstore;

--
-- Name: uncatalogued_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bookstore
--

ALTER SEQUENCE public.uncatalogued_id_seq OWNED BY public.uncatalogued.id;


--
-- Name: book id; Type: DEFAULT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.book ALTER COLUMN id SET DEFAULT nextval('public.book_id_seq'::regclass);


--
-- Name: customer id; Type: DEFAULT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.customer ALTER COLUMN id SET DEFAULT nextval('public.customer_id_seq'::regclass);


--
-- Name: customer_order id; Type: DEFAULT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.customer_order ALTER COLUMN id SET DEFAULT nextval('public.customer_order_id_seq'::regclass);


--
-- Name: provider id; Type: DEFAULT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.provider ALTER COLUMN id SET DEFAULT nextval('public.provider_id_seq'::regclass);


--
-- Name: provider_return id; Type: DEFAULT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.provider_return ALTER COLUMN id SET DEFAULT nextval('public.provider_return_id_seq'::regclass);


--
-- Name: publisher id; Type: DEFAULT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.publisher ALTER COLUMN id SET DEFAULT nextval('public.publisher_id_seq'::regclass);


--
-- Name: sale id; Type: DEFAULT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.sale ALTER COLUMN id SET DEFAULT nextval('public.sale_id_seq'::regclass);


--
-- Name: setting id; Type: DEFAULT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.setting ALTER COLUMN id SET DEFAULT nextval('public.setting_id_seq'::regclass);


--
-- Name: stock_movement id; Type: DEFAULT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.stock_movement ALTER COLUMN id SET DEFAULT nextval('public.stock_movement_id_seq'::regclass);


--
-- Name: stock_receipt_order id; Type: DEFAULT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.stock_receipt_order ALTER COLUMN id SET DEFAULT nextval('public.stock_receipt_order_id_seq'::regclass);


--
-- Name: stock_receipt_order_item id; Type: DEFAULT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.stock_receipt_order_item ALTER COLUMN id SET DEFAULT nextval('public.stock_receipt_order_item_id_seq'::regclass);


--
-- Name: ticket id; Type: DEFAULT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.ticket ALTER COLUMN id SET DEFAULT nextval('public.ticket_id_seq'::regclass);


--
-- Name: ticket_item id; Type: DEFAULT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.ticket_item ALTER COLUMN id SET DEFAULT nextval('public.ticket_item_id_seq'::regclass);


--
-- Name: uncatalogued id; Type: DEFAULT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.uncatalogued ALTER COLUMN id SET DEFAULT nextval('public.uncatalogued_id_seq'::regclass);


--
-- Data for Name: book; Type: TABLE DATA; Schema: public; Owner: bookstore
--

COPY public.book (id, title, author, isbn, price, stock, description, format, genre, "imageUrl", "publisherId", "providerId") FROM stdin;
5	Ciudad de sal	David B. Gil	9788491298366	22.90	6	«Busco a alguien que esté dispuesto a acompañarme».\n\nRecién aterrizado en la Policía Judicial de Málaga, el joven teniente Ángel Lobo descubre que, tras una serie de muertes aparentemente casuales, se oculta un patrón de asesinatos que ha pasado inadvertido durante años. Con el respaldo de su superior, la capitán Emma Somerset, Lobo inicia una investigación que da un vuelco al hallar la nota de suicidio publicada por una adolescente en la deep web «Bosque de sal».\n\nGrabaciones de audio, testimonios silenciados, una investigación clandestina y un nombre que lo impregna todo: Lonewolf.\n\nUn mensaje, dos semanas y una vida en juego…	Tapa Blanda	{Novela,"Novela Negra",Thriller}	https://imagessl6.casadellibro.com/a/l/s7/66/9788491298366.webp	5	2
1	Enviado especial	Arturo Pérez-Reverte	9788420470078	23.90	5	Un libro imprescindible para comprender la mirada literaria de Arturo Pérez-Reverte\n\n«Caminé por un mundo en guerra intentando comprender. No me lo contaron. Estuve allí, y esto es lo que vi».\n\nDurante veintiún años como reportero de guerra, Arturo Pérez-Reverte vivió en primera línea los conflictos más cruentos del último tercio del siglo xx. Su experiencia en escenarios bélicos de todo el mundo marcó su vida y dejó huella en su posterior obra literaria. Con el tiempo, el antiguo reportero fue configurando una biografía de guerra que es, además, uno de los relatos más extraordinarios del periodismo en lengua española. Este libro reúne, en orden cronológico, una selección de crónicas y reportajes escritos en los setenta y los ochenta, a los que se añaden los artículos publicados en las últimas décadas sobre conflictos pasados y presentes, dignidad y cobardía, verdad y manipulación. En estas páginas compartimos la memoria de un hombre que estuvo donde muy pocos querían estar y contó lo que muchos prefieren olvidar.\n\nEl autor afirma en el prólogo: «La guerra se queda en tu cabeza y ya no te abandona jamás. No son sólo nombres y rostros. También los lugares retornan con la misma terquedad: Mostar, Sarajevo, Vukovar, Beirut, Malabo, Kassala, Managua, Yamena, Paso de la Yegua, Jartum, Bucarest, Nairobi, El Aaiún, Bagdad, Luanda, Maputo, Tessenei, Petrinja... Con el tiempo los recuerdos se vuelven racimos de cerezas, donde unas tiran de otras: un nombre trae una esquina acribillada a tiros; una ciudad trae un rostro; una habitación de hotel devuelve una conversación; una soledad o una música te hacen recordar una carretera, una sonrisa o una tumba. Y no se trata de nostalgia, sino del simple archivo de una larga vida. Del material con el que luego uno escribe novelas y algunas noches, desvelado en la oscuridad, paga el precio de haber mirado tanto tiempo al ser humano sin apartar los ojos».	Tapa Dura	{Biografía,Ensayo}	https://imagessl8.casadellibro.com/a/l/s7/78/9788420470078.webp	1	1
2	Kiss me - Prohibido enamorarse	Elle	9788410425224	10.95	2	Hacer un trato con un chico malo nunca sentó tan bien\n\n\nHannah Wells ha encontrado por fin un chico que le gusta, pero se siente insegura en la seducción y el sexo. Si quiere conseguir que el chico que le interesa le preste atención, va a tener que salir de su zona de confort… Incluso si eso significa ser la tutora de Garrett Graham, el insoportable y arrogante capitán del equipo de hockey, a cambio de que finja salir con ella para así dejar de ser la chica invisible de la universidad.\n\n\nGarrett, por su parte, sueña con ser jugador de hockey profesional, pero sus malas notas ponen en peligro su futuro. Ese es el único motivo por el que accede a ayudar a Hannah a poner celoso a otro. Pero cuando un beso inesperado conduce al sexo más salvaje de su vida, a Garrett le queda claro que no le basta con fingir. El problema ahora es que tiene que conseguir que Hannah se enamore de él.	Bolsillo	{Novela,"Novela Romántica"}	https://imagessl4.casadellibro.com/a/l/s7/24/9788410425224.webp	2	1
3	Antes de que todo cambie	Manel Loureiro	9788408319962	22.90	2	Manel Loureiro ha escrito un thriller adictivo, una carrera imparable de venganza, poder y culpa que conduce a un desenlace tan explosivo como inevitable.\n\nLa vida de Samuel Hoyos, un hombre de turbio pasado, quedó marcada para siempre por una tragedia familiar que lo empujó a una espiral de autodestrucción. Poco después, aislado y sin nada que perder, una mujer tan poderosa como enigmática le hace una propuesta impensable: asesinar en un golpe magistral a todos los mandatarios de la Unión Europea durante una cumbre extraordinaria que se celebrará en la isla de A Toxa.\n\nPara Sam, la misión es tan suicida como seductora. Movido por el rencor y por la certeza de que sus habilidades lo convierten en la única persona capaz de llevarla a cabo, acepta un plan que desafía toda lógica y pone en jaque la seguridad del continente. Cada movimiento exige precisión absoluta; cada error puede ser fatal.\n\nMientras tanto, la inspectora Julia Duarte inicia una investigación que avanza contra reloj. Sin saberlo, su persecución no solo la acerca peligrosamente al responsable del complot, sino también a un pasado que creía enterrado. A medida que las piezas encajan, Duarte descubre que tras la amenaza se oculta una compleja trama de intereses, secretos y traiciones en la que nada es lo que parece y nadie está a salvo.\n\nCon el atentado cada vez más cerca, Samuel y Julia se verán atrapados en una angustiosa carrera contra el tiempo, donde la frontera entre víctima y verdugo se difumina y cada decisión puede cambiar el destino de millones de personas.	Tapa Blanda	{Thriller,Novela,"Novela Negra"}	https://imagessl2.casadellibro.com/a/l/s7/62/9788408319962.webp	3	2
4	El juicio	Luis Zueco	9788466682947	24.90	0	LA GRAN NOVELA DE LA INQUISICIÓN CONTRA GOYA.\n\nLuis Zueco nos embarca en uno de los episodios más desconocidos y fascinantes de la vida del pintor universal para descubrirnos que el arte puede ser el arma más peligrosa.\n\n¿PUEDE UN PINTOR JUZGAR AL MUNDO? ¿PUEDE EL MUNDO JUZGAR A UN GENIO?\n\n1799, Madrid. Francisco de Goya y Lucientes, pintor de cámara del rey, anuncia la puesta en venta de un lujoso libro de estampas titulado los Caprichos. Aunque las ventas son un éxito, dos semanas después de publicarlo, Goya lo retira del mercado. Durante los meses siguientes su escandaloso contenido comienza a correr como la pólvora. ¿Por qué Goya esconde su obra más personal? ¿De qué tiene miedo?\n\nEs entonces cuando la joven Angélica Díez llega junto a su padre a Madrid para empezar una nueva vida. La capital se ha convertido en un lugar de contrastes, donde convergen las ideas ilustradas que se propagan por Europa e instituciones como la Santa Inquisición, que se resiste a morir.\n\nPara darse a conocer en la sociedad madrileña, Angélica acude a Goya y le pide un retrato. Sin embargo, la joven ignora que este los unirá en una peligrosa trama relacionada con la Inquisición, los Caprichos y un rumor que podría acabar con el maestro: se dice que Goya ha pintado a una mujer al desnudo.\n\nMientras la Inquisición intenta juzgar al pintor como un último golpe de efecto para mostrar su poder, Angélica descubrirá algo que Goya siempre supo… No hay arma más afilada que el arte para cambiar la Historia.	Tapa Dura	{Novela,"Ficción Histórica"}	https://imagessl7.casadellibro.com/a/l/s7/47/9788466682947.webp	4	2
\.


--
-- Data for Name: customer; Type: TABLE DATA; Schema: public; Owner: bookstore
--

COPY public.customer (id, name, phone, email) FROM stdin;
1	Héctor Gámiz	652185397	hectorgamiz@gmail.com
\.


--
-- Data for Name: customer_order; Type: TABLE DATA; Schema: public; Owner: bookstore
--

COPY public.customer_order (id, isbn, quantity, "customerId") FROM stdin;
1	9788466682947	1	1
\.


--
-- Data for Name: provider; Type: TABLE DATA; Schema: public; Owner: bookstore
--

COPY public.provider (id, name, publishers) FROM stdin;
1	Penguin Random House	{Alfaguara,Wonderbooks}
2	Planeta	{"Editorial Planeta","Ediciones B",SUMA}
\.


--
-- Data for Name: provider_return; Type: TABLE DATA; Schema: public; Owner: bookstore
--

COPY public.provider_return (id, reference, "providerId", "publisherId", items, status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: publisher; Type: TABLE DATA; Schema: public; Owner: bookstore
--

COPY public.publisher (id, "publisherName") FROM stdin;
1	Alfaguara
2	Wonderbooks
3	Editorial Planeta
4	Ediciones B
5	SUMA
\.


--
-- Data for Name: sale; Type: TABLE DATA; Schema: public; Owner: bookstore
--

COPY public.sale (id, quantity, "unitPrice", total, "createdAt", "bookId") FROM stdin;
1	1	10.95	10.95	2026-05-26 08:05:47.811147	2
2	2	22.90	45.80	2026-05-26 08:05:52.857163	3
3	1	23.90	23.90	2026-05-26 08:05:58.31321	1
4	1	22.90	22.90	2026-05-26 08:05:58.31321	3
5	1	22.90	22.90	2026-05-26 08:05:58.31321	5
6	1	10.95	10.95	2026-05-26 08:06:04.52153	2
7	1	22.90	22.90	2026-05-26 08:06:11.457076	5
8	1	22.90	22.90	2026-05-26 08:06:15.008556	5
9	-1	22.90	-22.90	2026-05-26 08:07:07.46016	5
10	1	24.90	24.90	2026-05-26 08:12:25.29564	4
11	1	24.90	24.90	2026-05-26 08:12:31.453996	4
\.


--
-- Data for Name: setting; Type: TABLE DATA; Schema: public; Owner: bookstore
--

COPY public.setting (id, key, value) FROM stdin;
1	admin_password	$2b$10$lHbWbTCyTc7v9Ht79lAj0ukRsoB78gaRBqrWflK4BjVTe/ttNv3ke
2	user_password	$2b$10$0iFwS6TgyAXSIoMvKqVqY.l45cZzyqWUcgJ8RNtRnjQsgiZGvHHfq
\.


--
-- Data for Name: stock_movement; Type: TABLE DATA; Schema: public; Owner: bookstore
--

COPY public.stock_movement (id, isbn, quantity, type, reference, "createdAt") FROM stdin;
1	9788420470078	3	stock captured	pedidoinicial26052026	2026-05-26 08:05:35.899117
2	9788410425224	4	stock captured	pedidoinicial26052026	2026-05-26 08:05:35.899117
3	9788408319962	5	stock captured	pedidoinicial26052026	2026-05-26 08:05:35.899117
4	9788466682947	2	stock captured	pedidoinicial26052026	2026-05-26 08:05:35.899117
5	9788491298366	6	stock captured	pedidoinicial26052026	2026-05-26 08:05:35.899117
6	9788410425224	-1	Sale	260520261	2026-05-26 08:05:47.860359
7	9788408319962	-2	Sale	260520262	2026-05-26 08:05:52.901258
8	9788420470078	-1	Sale	260520263	2026-05-26 08:05:58.361392
9	9788408319962	-1	Sale	260520263	2026-05-26 08:05:58.361392
10	9788491298366	-1	Sale	260520263	2026-05-26 08:05:58.361392
11	9788410425224	-1	Sale	260520264	2026-05-26 08:06:04.564951
12	9788491298366	-1	Sale	260520265	2026-05-26 08:06:11.500677
13	9788491298366	-1	Sale	260520266	2026-05-26 08:06:15.052867
14	9788491298366	1	return	260520265	2026-05-26 08:07:07.46016
15	9788491298366	-1	Inventory adjustment	\N	2026-05-26 08:07:30.758428
16	9788491298366	3	stock captured	refuerzonovedades26052026	2026-05-26 08:08:44.13535
17	9788420470078	3	stock captured	refuerzonovedades26052026	2026-05-26 08:08:44.13535
18	9788466682947	-1	Sale	260520267	2026-05-26 08:12:25.355189
19	9788466682947	-1	Sale	260520268	2026-05-26 08:12:31.500626
20	9788408318705	3	stock captured	novedades26052026	2026-05-26 08:13:56.794631
21	9791387640231	2	stock captured	novedades26052026	2026-05-26 08:13:56.794631
\.


--
-- Data for Name: stock_receipt_order; Type: TABLE DATA; Schema: public; Owner: bookstore
--

COPY public.stock_receipt_order (id, "orderNo", "createdAt") FROM stdin;
1	pedidoinicial26052026	2026-05-26 08:05:35.899117
2	refuerzonovedades26052026	2026-05-26 08:08:44.13535
3	novedades26052026	2026-05-26 08:13:56.794631
\.


--
-- Data for Name: stock_receipt_order_item; Type: TABLE DATA; Schema: public; Owner: bookstore
--

COPY public.stock_receipt_order_item (id, "orderId", isbn, stock) FROM stdin;
1	1	9788420470078	3
2	1	9788410425224	4
3	1	9788408319962	5
4	1	9788466682947	2
5	1	9788491298366	6
6	2	9788491298366	3
7	2	9788420470078	3
8	3	9788408318705	3
9	3	9791387640231	2
\.


--
-- Data for Name: ticket; Type: TABLE DATA; Schema: public; Owner: bookstore
--

COPY public.ticket (id, "ticketNo", "createdAt", "totalAmount", status) FROM stdin;
1	260520261	2026-05-26 08:05:47.834555	10.95	completed
2	260520262	2026-05-26 08:05:52.879541	45.80	completed
3	260520263	2026-05-26 08:05:58.339659	69.70	completed
4	260520264	2026-05-26 08:06:04.544314	10.95	completed
6	260520266	2026-05-26 08:06:15.030933	22.90	completed
5	260520265	2026-05-26 08:06:11.479307	0.00	returned
7	260520267	2026-05-26 08:12:25.344543	24.90	completed
8	260520268	2026-05-26 08:12:31.475202	24.90	completed
\.


--
-- Data for Name: ticket_item; Type: TABLE DATA; Schema: public; Owner: bookstore
--

COPY public.ticket_item (id, "saleId", "bookId", quantity, "unitPrice", total, "returnedQuantity", "ticketId") FROM stdin;
1	1	2	1	10.95	10.95	0	1
2	2	3	2	22.90	45.80	0	2
3	3	1	1	23.90	23.90	0	3
4	4	3	1	22.90	22.90	0	3
5	5	5	1	22.90	22.90	0	3
6	6	2	1	10.95	10.95	0	4
8	8	5	1	22.90	22.90	0	6
7	7	5	1	22.90	22.90	1	5
9	10	4	1	24.90	24.90	0	7
10	11	4	1	24.90	24.90	0	8
\.


--
-- Data for Name: uncatalogued; Type: TABLE DATA; Schema: public; Owner: bookstore
--

COPY public.uncatalogued (id, isbn, stock) FROM stdin;
1	9788408318705	3
2	9791387640231	2
\.


--
-- Name: book_id_seq; Type: SEQUENCE SET; Schema: public; Owner: bookstore
--

SELECT pg_catalog.setval('public.book_id_seq', 5, true);


--
-- Name: customer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: bookstore
--

SELECT pg_catalog.setval('public.customer_id_seq', 1, true);


--
-- Name: customer_order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: bookstore
--

SELECT pg_catalog.setval('public.customer_order_id_seq', 1, true);


--
-- Name: provider_id_seq; Type: SEQUENCE SET; Schema: public; Owner: bookstore
--

SELECT pg_catalog.setval('public.provider_id_seq', 2, true);


--
-- Name: provider_return_id_seq; Type: SEQUENCE SET; Schema: public; Owner: bookstore
--

SELECT pg_catalog.setval('public.provider_return_id_seq', 1, false);


--
-- Name: publisher_id_seq; Type: SEQUENCE SET; Schema: public; Owner: bookstore
--

SELECT pg_catalog.setval('public.publisher_id_seq', 5, true);


--
-- Name: sale_id_seq; Type: SEQUENCE SET; Schema: public; Owner: bookstore
--

SELECT pg_catalog.setval('public.sale_id_seq', 11, true);


--
-- Name: setting_id_seq; Type: SEQUENCE SET; Schema: public; Owner: bookstore
--

SELECT pg_catalog.setval('public.setting_id_seq', 2, true);


--
-- Name: stock_movement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: bookstore
--

SELECT pg_catalog.setval('public.stock_movement_id_seq', 21, true);


--
-- Name: stock_receipt_order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: bookstore
--

SELECT pg_catalog.setval('public.stock_receipt_order_id_seq', 3, true);


--
-- Name: stock_receipt_order_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: bookstore
--

SELECT pg_catalog.setval('public.stock_receipt_order_item_id_seq', 9, true);


--
-- Name: ticket_id_seq; Type: SEQUENCE SET; Schema: public; Owner: bookstore
--

SELECT pg_catalog.setval('public.ticket_id_seq', 8, true);


--
-- Name: ticket_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: bookstore
--

SELECT pg_catalog.setval('public.ticket_item_id_seq', 10, true);


--
-- Name: uncatalogued_id_seq; Type: SEQUENCE SET; Schema: public; Owner: bookstore
--

SELECT pg_catalog.setval('public.uncatalogued_id_seq', 2, true);


--
-- Name: provider PK_6ab2f66d8987bf1bfdd6136a2d5; Type: CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.provider
    ADD CONSTRAINT "PK_6ab2f66d8987bf1bfdd6136a2d5" PRIMARY KEY (id);


--
-- Name: publisher PK_70a5936b43177f76161724da3e6; Type: CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.publisher
    ADD CONSTRAINT "PK_70a5936b43177f76161724da3e6" PRIMARY KEY (id);


--
-- Name: ticket_item PK_7443afebd911b9d34bf55a02382; Type: CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.ticket_item
    ADD CONSTRAINT "PK_7443afebd911b9d34bf55a02382" PRIMARY KEY (id);


--
-- Name: provider_return PK_9ac23749fa35eed8150e2ec1942; Type: CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.provider_return
    ADD CONSTRAINT "PK_9ac23749fa35eed8150e2ec1942" PRIMARY KEY (id);


--
-- Name: uncatalogued PK_9cca29a637f44bfb92fd7a8a631; Type: CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.uncatalogued
    ADD CONSTRAINT "PK_9cca29a637f44bfb92fd7a8a631" PRIMARY KEY (id);


--
-- Name: stock_movement PK_9fe1232f916686ae8cf00294749; Type: CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.stock_movement
    ADD CONSTRAINT "PK_9fe1232f916686ae8cf00294749" PRIMARY KEY (id);


--
-- Name: book PK_a3afef72ec8f80e6e5c310b28a4; Type: CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.book
    ADD CONSTRAINT "PK_a3afef72ec8f80e6e5c310b28a4" PRIMARY KEY (id);


--
-- Name: customer PK_a7a13f4cacb744524e44dfdad32; Type: CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.customer
    ADD CONSTRAINT "PK_a7a13f4cacb744524e44dfdad32" PRIMARY KEY (id);


--
-- Name: stock_receipt_order_item PK_b4533beff19b2fc5ca1a5f8b8c0; Type: CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.stock_receipt_order_item
    ADD CONSTRAINT "PK_b4533beff19b2fc5ca1a5f8b8c0" PRIMARY KEY (id);


--
-- Name: customer_order PK_c70aef746523b2c4a0af0945209; Type: CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.customer_order
    ADD CONSTRAINT "PK_c70aef746523b2c4a0af0945209" PRIMARY KEY (id);


--
-- Name: sale PK_d03891c457cbcd22974732b5de2; Type: CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.sale
    ADD CONSTRAINT "PK_d03891c457cbcd22974732b5de2" PRIMARY KEY (id);


--
-- Name: ticket PK_d9a0835407701eb86f874474b7c; Type: CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.ticket
    ADD CONSTRAINT "PK_d9a0835407701eb86f874474b7c" PRIMARY KEY (id);


--
-- Name: stock_receipt_order PK_e2afb5e7cf010dd09613f5c1b8b; Type: CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.stock_receipt_order
    ADD CONSTRAINT "PK_e2afb5e7cf010dd09613f5c1b8b" PRIMARY KEY (id);


--
-- Name: setting PK_fcb21187dc6094e24a48f677bed; Type: CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.setting
    ADD CONSTRAINT "PK_fcb21187dc6094e24a48f677bed" PRIMARY KEY (id);


--
-- Name: publisher UQ_16bdd28dad5679ec30c297df695; Type: CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.publisher
    ADD CONSTRAINT "UQ_16bdd28dad5679ec30c297df695" UNIQUE ("publisherName");


--
-- Name: setting UQ_1c4c95d773004250c157a744d6e; Type: CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.setting
    ADD CONSTRAINT "UQ_1c4c95d773004250c157a744d6e" UNIQUE (key);


--
-- Name: ticket UQ_37a771b4a5ecee14de63b7f4a9f; Type: CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.ticket
    ADD CONSTRAINT "UQ_37a771b4a5ecee14de63b7f4a9f" UNIQUE ("ticketNo");


--
-- Name: provider UQ_39c1a7b4cdd7cfb27b9ee9e5002; Type: CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.provider
    ADD CONSTRAINT "UQ_39c1a7b4cdd7cfb27b9ee9e5002" UNIQUE (name);


--
-- Name: stock_receipt_order UQ_a2942cb21b75e66bdd90540bf77; Type: CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.stock_receipt_order
    ADD CONSTRAINT "UQ_a2942cb21b75e66bdd90540bf77" UNIQUE ("orderNo");


--
-- Name: provider_return FK_2dfbfd459a5a0c2aa00e674f090; Type: FK CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.provider_return
    ADD CONSTRAINT "FK_2dfbfd459a5a0c2aa00e674f090" FOREIGN KEY ("publisherId") REFERENCES public.publisher(id);


--
-- Name: ticket_item FK_5ec69cdb2d87cb6eeee2b6cecf8; Type: FK CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.ticket_item
    ADD CONSTRAINT "FK_5ec69cdb2d87cb6eeee2b6cecf8" FOREIGN KEY ("ticketId") REFERENCES public.ticket(id);


--
-- Name: stock_receipt_order_item FK_66634fdebc6a72d3281e36a2656; Type: FK CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.stock_receipt_order_item
    ADD CONSTRAINT "FK_66634fdebc6a72d3281e36a2656" FOREIGN KEY ("orderId") REFERENCES public.stock_receipt_order(id);


--
-- Name: sale FK_68376dcd2f103892238c8d0bb55; Type: FK CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.sale
    ADD CONSTRAINT "FK_68376dcd2f103892238c8d0bb55" FOREIGN KEY ("bookId") REFERENCES public.book(id) ON DELETE SET NULL;


--
-- Name: customer_order FK_703d3a35764b6a3aef6e968d55f; Type: FK CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.customer_order
    ADD CONSTRAINT "FK_703d3a35764b6a3aef6e968d55f" FOREIGN KEY ("customerId") REFERENCES public.customer(id);


--
-- Name: book FK_73fab9a4f4fc82cbf7193827298; Type: FK CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.book
    ADD CONSTRAINT "FK_73fab9a4f4fc82cbf7193827298" FOREIGN KEY ("providerId") REFERENCES public.provider(id);


--
-- Name: ticket_item FK_8a341a3f291e16cd05af27a01ac; Type: FK CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.ticket_item
    ADD CONSTRAINT "FK_8a341a3f291e16cd05af27a01ac" FOREIGN KEY ("bookId") REFERENCES public.book(id) ON DELETE SET NULL;


--
-- Name: book FK_b8988524dd01b5dcb67b4b3ede7; Type: FK CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.book
    ADD CONSTRAINT "FK_b8988524dd01b5dcb67b4b3ede7" FOREIGN KEY ("publisherId") REFERENCES public.publisher(id);


--
-- Name: provider_return FK_f4e6dd0507800a6fc547f1f94c4; Type: FK CONSTRAINT; Schema: public; Owner: bookstore
--

ALTER TABLE ONLY public.provider_return
    ADD CONSTRAINT "FK_f4e6dd0507800a6fc547f1f94c4" FOREIGN KEY ("providerId") REFERENCES public.provider(id);


--
-- PostgreSQL database dump complete
--

\unrestrict gLWJvdkSk7pFsBrd05m26BRUDYqG4z9B6IMWoiLZS4Au4xQltK738ufbPofDVfh

--
-- Database "postgres" dump
--

\connect postgres

--
-- PostgreSQL database dump
--

\restrict A1EXQbdRc9z06X0CKUeHTL2eOSi7BuQrVACmuRL0Y7da6aedaBFnlXQjA03P3dY

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

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
-- PostgreSQL database dump complete
--

\unrestrict A1EXQbdRc9z06X0CKUeHTL2eOSi7BuQrVACmuRL0Y7da6aedaBFnlXQjA03P3dY

--
-- PostgreSQL database cluster dump complete
--

