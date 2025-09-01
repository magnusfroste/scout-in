-- Create a simple prompts table for storing and sharing prompts
CREATE TABLE public.prompts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  user_prompt text NOT NULL,
  master_prompt text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- No RLS policies - make it publicly accessible for easy sharing
-- Anyone can read, create, and update prompts
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read prompts" 
ON public.prompts 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create prompts" 
ON public.prompts 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update prompts" 
ON public.prompts 
FOR UPDATE 
USING (true);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_prompts_updated_at
BEFORE UPDATE ON public.prompts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();