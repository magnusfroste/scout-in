-- Create webhook_testing table for global webhook URL configuration
CREATE TABLE public.webhook_testing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS but allow public read access
ALTER TABLE public.webhook_testing ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read webhook URLs
CREATE POLICY "Allow public read access to webhook_testing" 
ON public.webhook_testing 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_webhook_testing_updated_at
BEFORE UPDATE ON public.webhook_testing
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert a default webhook URL
INSERT INTO public.webhook_testing (webhook_url, is_active) 
VALUES ('https://your-n8n-instance.com/webhook/prompt-evaluation', true);