
-- ============ lab_user_profiles ============
CREATE TABLE public.lab_user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  linkedin_profile text,
  current_location text,
  birthplace text,
  date_of_birth date,
  role_in_organization text NOT NULL DEFAULT '',
  outreach_experience text NOT NULL DEFAULT '',
  prospects_per_week text NOT NULL DEFAULT '',
  communication_style text NOT NULL DEFAULT '',
  introduction_style text NOT NULL DEFAULT '',
  credibility_preference text[] NOT NULL DEFAULT '{}',
  preferred_contact_channel text[] NOT NULL DEFAULT '{}',
  followup_timing text NOT NULL DEFAULT '',
  nonresponse_handling text NOT NULL DEFAULT '',
  pain_points_focus text[] NOT NULL DEFAULT '{}',
  expertise_positioning text NOT NULL DEFAULT '',
  objection_handling text[] NOT NULL DEFAULT '{}',
  meeting_format text[] NOT NULL DEFAULT '{}',
  meeting_duration text NOT NULL DEFAULT '',
  success_metrics text[] NOT NULL DEFAULT '{}',
  credits integer NOT NULL DEFAULT 5,
  is_complete boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.lab_user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own user profile" ON public.lab_user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own user profile" ON public.lab_user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own user profile" ON public.lab_user_profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_lab_user_profiles_updated_at
  BEFORE UPDATE ON public.lab_user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ lab_company_profiles ============
CREATE TABLE public.lab_company_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL DEFAULT '',
  website_url text NOT NULL DEFAULT '',
  linkedin_url text,
  business_registration text,
  industry text NOT NULL DEFAULT '',
  years_active text,
  company_size text NOT NULL DEFAULT '',
  geographic_markets text[] NOT NULL DEFAULT '{}',
  mission text NOT NULL DEFAULT '',
  vision text,
  "values" text[] NOT NULL DEFAULT '{}',
  organizational_personality text[] NOT NULL DEFAULT '{}',
  offering_type text[] NOT NULL DEFAULT '{}',
  main_offerings text[] NOT NULL DEFAULT '{}',
  target_industries text[] NOT NULL DEFAULT '{}',
  ideal_client_size text[] NOT NULL DEFAULT '{}',
  project_scope text NOT NULL DEFAULT '',
  unique_differentiators text[] NOT NULL DEFAULT '{}',
  credentials text[] NOT NULL DEFAULT '{}',
  typical_results text[] NOT NULL DEFAULT '{}',
  known_clients boolean DEFAULT false,
  known_clients_list text,
  success_story text,
  delivery_model text[] NOT NULL DEFAULT '{}',
  pricing_positioning text NOT NULL DEFAULT '',
  communication_style text NOT NULL DEFAULT '',
  is_complete boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.lab_company_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own company profile" ON public.lab_company_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own company profile" ON public.lab_company_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own company profile" ON public.lab_company_profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_lab_company_profiles_updated_at
  BEFORE UPDATE ON public.lab_company_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ lab_prospect_research ============
CREATE TABLE public.lab_prospect_research (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_profile_id uuid REFERENCES public.lab_company_profiles(id),
  user_profile_id uuid REFERENCES public.lab_user_profiles(id),
  prospect_company_name text NOT NULL,
  prospect_website_url text,
  prospect_linkedin_url text,
  research_type text NOT NULL DEFAULT 'standard',
  notes text,
  webhook_url text,
  status text NOT NULL DEFAULT 'pending',
  fit_score integer,
  research_results jsonb,
  tags text[] DEFAULT '{}',
  is_starred boolean DEFAULT false,
  error_message text,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.lab_prospect_research ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own research" ON public.lab_prospect_research FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own research" ON public.lab_prospect_research FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own research" ON public.lab_prospect_research FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own research" ON public.lab_prospect_research FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_lab_prospect_research_updated_at
  BEFORE UPDATE ON public.lab_prospect_research
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ lab_credit_transactions ============
CREATE TABLE public.lab_credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  description text NOT NULL,
  research_id uuid REFERENCES public.lab_prospect_research(id),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.lab_credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions" ON public.lab_credit_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own transactions" ON public.lab_credit_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============ webhook_testing ============
CREATE TABLE public.webhook_testing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_url text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.webhook_testing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active webhooks" ON public.webhook_testing FOR SELECT USING (true);
