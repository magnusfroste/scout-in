import { ResearchInitiator } from "@/components/lab/ResearchInitiator";
import { useNavigate } from "react-router-dom";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { enhanceWebhookPayload } from '@/lib/webhookPayloadUtils';

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000000';

const ResearchPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartResearch = async (data: any) => {
    try {
      setIsLoading(true);

      // Get the user's company and user profiles
      const [companyProfile, userProfile] = await Promise.all([
        supabase.from('lab_company_profiles').select('*').eq('user_id', DEMO_USER_ID).maybeSingle(),
        supabase.from('lab_user_profiles').select('*').eq('user_id', DEMO_USER_ID).maybeSingle()
      ]);

      if (companyProfile.error || userProfile.error) {
        throw new Error('Error fetching profiles. Please try again.');
      }

      if (!companyProfile.data || !userProfile.data) {
        throw new Error('Missing required profiles. Please complete your company and user profiles first.');
      }

      // Get webhook URL from settings
      const { data: webhookData } = await supabase
        .from('webhook_testing')
        .select('webhook_url')
        .eq('is_active', true)
        .maybeSingle();

      const webhookUrl = webhookData?.webhook_url || 'https://example.com/webhook';

      // Create the research record
      const { data: researchRecord, error: insertError } = await supabase
        .from('lab_prospect_research')
        .insert({
          user_id: DEMO_USER_ID,
          company_profile_id: companyProfile.data.id,
          user_profile_id: userProfile.data.id,
          prospect_company_name: data.company_name,
          prospect_website_url: data.website_url,
          prospect_linkedin_url: data.linkedin_url,
          research_type: data.research_type || 'standard',
          notes: data.notes || '',
          webhook_url: webhookUrl,
          status: 'pending'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Prepare enhanced webhook payload
      const webhookPayload = enhanceWebhookPayload(
        data,
        companyProfile.data,
        userProfile.data,
        researchRecord.id
      );

      // Send POST request to webhook endpoint
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload)
        });

        if (response.ok) {
          console.log('✅ Webhook sent successfully');
          toast({
            title: "Research Started",
            description: `Research initiated successfully. Research ID: ${researchRecord.id}`,
            duration: 5000
          });
        } else {
          throw new Error(`Webhook failed: ${response.status}`);
        }
      } catch (webhookError) {
        console.error('Webhook error:', webhookError);
        toast({
          title: "Research Started (Webhook Failed)",
          description: `Research created but webhook failed. Research ID: ${researchRecord.id}`,
          variant: "destructive",
          duration: 8000
        });
      }

      navigate('/');
    } catch (error) {
      console.error('Error starting research:', error);
      toast({
        title: "Error starting research",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ResearchInitiator
      onSubmit={handleStartResearch}
      onCancel={() => navigate('/')}
      isLoading={isLoading}
    />
  );
};

export default ResearchPage;