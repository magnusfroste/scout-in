-- Re-enable RLS on lab tables for demo security
ALTER TABLE public.lab_company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_prospect_research ENABLE ROW LEVEL SECURITY;