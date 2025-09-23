-- Remove foreign key constraints for demo purposes
ALTER TABLE public.lab_company_profiles DROP CONSTRAINT IF EXISTS lab_company_profiles_user_id_fkey;
ALTER TABLE public.lab_user_profiles DROP CONSTRAINT IF EXISTS lab_user_profiles_user_id_fkey;
ALTER TABLE public.lab_prospect_research DROP CONSTRAINT IF EXISTS lab_prospect_research_user_id_fkey;