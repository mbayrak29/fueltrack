CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: ev_stations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ev_stations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    station_name text NOT NULL,
    provider text NOT NULL,
    city text NOT NULL,
    district text NOT NULL,
    address text,
    price_per_kwh numeric(10,4) NOT NULL,
    charger_type text DEFAULT 'DC Fast'::text,
    power_kw integer DEFAULT 50,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: fuel_stations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fuel_stations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    station_name text NOT NULL,
    brand text NOT NULL,
    city text NOT NULL,
    district text NOT NULL,
    address text,
    fuel_type text NOT NULL,
    price_per_liter numeric(10,4) NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT fuel_stations_fuel_type_check CHECK ((fuel_type = ANY (ARRAY['gasoline'::text, 'diesel'::text, 'lpg'::text])))
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    email text,
    full_name text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ev_stations ev_stations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ev_stations
    ADD CONSTRAINT ev_stations_pkey PRIMARY KEY (id);


--
-- Name: fuel_stations fuel_stations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fuel_stations
    ADD CONSTRAINT fuel_stations_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- Name: ev_stations update_ev_stations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_ev_stations_updated_at BEFORE UPDATE ON public.ev_stations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: fuel_stations update_fuel_stations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_fuel_stations_updated_at BEFORE UPDATE ON public.fuel_stations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: ev_stations ev_stations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ev_stations
    ADD CONSTRAINT ev_stations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: fuel_stations fuel_stations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fuel_stations
    ADD CONSTRAINT fuel_stations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: ev_stations Users can delete their own EV stations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own EV stations" ON public.ev_stations FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: fuel_stations Users can delete their own fuel stations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own fuel stations" ON public.fuel_stations FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: ev_stations Users can insert their own EV stations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own EV stations" ON public.ev_stations FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: fuel_stations Users can insert their own fuel stations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own fuel stations" ON public.fuel_stations FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: ev_stations Users can update their own EV stations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own EV stations" ON public.ev_stations FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: fuel_stations Users can update their own fuel stations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own fuel stations" ON public.fuel_stations FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: ev_stations Users can view their own EV stations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own EV stations" ON public.ev_stations FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: fuel_stations Users can view their own fuel stations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own fuel stations" ON public.fuel_stations FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: ev_stations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ev_stations ENABLE ROW LEVEL SECURITY;

--
-- Name: fuel_stations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.fuel_stations ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;