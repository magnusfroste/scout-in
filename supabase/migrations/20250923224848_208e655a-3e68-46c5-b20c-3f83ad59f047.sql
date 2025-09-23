-- Create lab_company_profiles table
CREATE TABLE public.lab_company_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Section 1: Company Identity
  company_name TEXT NOT NULL,
  website_url TEXT NOT NULL,
  linkedin_url TEXT,
  business_registration TEXT,
  industry TEXT NOT NULL,
  years_active TEXT NOT NULL,
  company_size TEXT NOT NULL,
  
  -- Section 2: Mission, Vision & Values
  mission TEXT NOT NULL,
  vision TEXT,
  values TEXT[] NOT NULL DEFAULT '{}',
  
  -- Section 3: Offering & Proposition
  offering_type TEXT[] NOT NULL DEFAULT '{}',
  main_offerings TEXT[] NOT NULL DEFAULT '{}',
  unique_differentiators TEXT[] NOT NULL DEFAULT '{}',
  typical_results TEXT[] NOT NULL DEFAULT '{}',
  
  -- Section 4: Target Market & Clients
  ideal_client_size TEXT[] NOT NULL DEFAULT '{}',
  target_industries TEXT[] NOT NULL DEFAULT '{}',
  project_scope TEXT NOT NULL,
  geographic_markets TEXT[] NOT NULL DEFAULT '{}',
  
  -- Section 5: Market Positioning
  pricing_positioning TEXT NOT NULL,
  delivery_model TEXT[] NOT NULL DEFAULT '{}',
  
  -- Section 6: Credibility & Social Proof
  success_story TEXT,
  known_clients BOOLEAN DEFAULT false,
  known_clients_list TEXT,
  credentials TEXT[] NOT NULL DEFAULT '{}',
  
  -- Section 7: Organizational Culture
  organizational_personality TEXT[] NOT NULL DEFAULT '{}',
  communication_style TEXT NOT NULL,
  
  -- Metadata
  is_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lab_user_profiles table
CREATE TABLE public.lab_user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Personal Information
  full_name TEXT NOT NULL,
  linkedin_profile TEXT,
  current_location TEXT,
  birthplace TEXT,
  date_of_birth DATE,
  
  -- Role & Context
  role_in_organization TEXT NOT NULL,
  outreach_experience TEXT NOT NULL,
  prospects_per_week TEXT NOT NULL,
  
  -- Communication Style & Personality
  communication_style TEXT NOT NULL,
  introduction_style TEXT NOT NULL,
  credibility_preference TEXT[] NOT NULL DEFAULT '{}',
  
  -- Outreach Preferences
  preferred_contact_channel TEXT[] NOT NULL DEFAULT '{}',
  followup_timing TEXT NOT NULL,
  nonresponse_handling TEXT NOT NULL,
  
  -- Value Proposition & Messaging
  pain_points_focus TEXT[] NOT NULL DEFAULT '{}',
  expertise_positioning TEXT NOT NULL,
  objection_handling TEXT[] NOT NULL DEFAULT '{}',
  
  -- Meeting & Conversion Preferences
  meeting_format TEXT[] NOT NULL DEFAULT '{}',
  meeting_duration TEXT NOT NULL,
  success_metrics TEXT[] NOT NULL DEFAULT '{}',
  
  -- Metadata
  is_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lab_prospect_research table
CREATE TABLE public.lab_prospect_research (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_profile_id UUID NOT NULL REFERENCES public.lab_company_profiles(id) ON DELETE CASCADE,
  user_profile_id UUID NOT NULL REFERENCES public.lab_user_profiles(id) ON DELETE CASCADE,
  
  -- Prospect Input
  prospect_company_name TEXT NOT NULL,
  prospect_website_url TEXT NOT NULL,
  prospect_linkedin_url TEXT,
  
  -- Research Configuration
  research_type TEXT NOT NULL DEFAULT 'standard',
  webhook_url TEXT NOT NULL,
  
  -- Research Results
  research_results JSONB,
  fit_score INTEGER,
  decision_makers JSONB,
  contact_strategy JSONB,
  value_proposition JSONB,
  
  -- Status & Tracking
  status TEXT NOT NULL DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  is_starred BOOLEAN DEFAULT false,
  exported_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lab_research_templates table
CREATE TABLE public.lab_research_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  master_prompt TEXT NOT NULL,
  research_type TEXT NOT NULL DEFAULT 'custom',
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.lab_company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_prospect_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_research_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lab_company_profiles
CREATE POLICY "Users can manage their own company profiles"
ON public.lab_company_profiles
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for lab_user_profiles
CREATE POLICY "Users can manage their own user profiles"
ON public.lab_user_profiles
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for lab_prospect_research
CREATE POLICY "Users can manage their own research"
ON public.lab_prospect_research
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for lab_research_templates
CREATE POLICY "Users can manage their own templates"
ON public.lab_research_templates
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_lab_company_profiles_user_id ON public.lab_company_profiles(user_id);
CREATE INDEX idx_lab_user_profiles_user_id ON public.lab_user_profiles(user_id);
CREATE INDEX idx_lab_prospect_research_user_id ON public.lab_prospect_research(user_id);
CREATE INDEX idx_lab_prospect_research_status ON public.lab_prospect_research(status);
CREATE INDEX idx_lab_research_templates_user_id ON public.lab_research_templates(user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_lab_company_profiles_updated_at
BEFORE UPDATE ON public.lab_company_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lab_user_profiles_updated_at
BEFORE UPDATE ON public.lab_user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lab_prospect_research_updated_at
BEFORE UPDATE ON public.lab_prospect_research
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lab_research_templates_updated_at
BEFORE UPDATE ON public.lab_research_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();