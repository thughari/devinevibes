-- This script drops all tables in the public schema.
-- WARNING: This will permanently delete all data.
-- Use this to clear the DB so Hibernate can recreate the schema with String primary keys.

DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;
