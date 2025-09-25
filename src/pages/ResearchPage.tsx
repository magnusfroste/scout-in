import { ResearchInitiator } from "@/components/lab/ResearchInitiator";
import { useNavigate } from "react-router-dom";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { enhanceWebhookPayload } from '@/lib/webhookPayloadUtils';
import { parseAndSaveN8nResponse } from '@/lib/researchResponseUtils';

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
          status: 'pending',
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Show success message and redirect immediately
      toast({
        title: "Research Started!",
        description: `Research initiated for ${data.company_name}. You can track progress in the dashboard.`,
        duration: 5000
      });

      // Redirect to dashboard immediately
      navigate('/');

      // Send webhook request in background (fire-and-forget)
      const webhookPayload = enhanceWebhookPayload(
        data,
        companyProfile.data,
        userProfile.data,
        researchRecord.id
      );

      console.log('🚀 Sending webhook to:', webhookUrl);
      console.log('📦 Payload:', JSON.stringify(webhookPayload, null, 2));
      
      // Background webhook processing - don't await this
      fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
        mode: 'cors'
      }).then(async (response) => {
        console.log('📡 Response status:', response.status);
        console.log('📡 Response ok:', response.ok);

        if (response.ok) {
          const responseText = await response.text();
          console.log('✅ Webhook response:', responseText);
          
          // Parse and save the n8n analysis response
          await parseAndSaveN8nResponse(
            responseText, 
            researchRecord.id, 
            data.company_name
          );
        } else {
          const errorText = await response.text();
          console.error('❌ Webhook error response:', errorText);
          
          // Update research record with error
          await supabase
            .from('lab_prospect_research')
            .update({ 
              status: 'failed', 
              error_message: `Webhook failed: ${response.status} - ${errorText}` 
            })
            .eq('id', researchRecord.id);
        }
      }).catch(async (webhookError) => {
        console.error('🚨 Fetch error:', webhookError);
        
        // Update research record with error
        let errorMessage = 'Unknown webhook error';
        if (webhookError instanceof TypeError && webhookError.message.includes('Failed to fetch')) {
          errorMessage = `Cannot reach ${webhookUrl} - likely a CORS issue. Check n8n webhook settings.`;
        } else {
          errorMessage = webhookError.message || 'Webhook request failed';
        }
        
        await supabase
          .from('lab_prospect_research')
          .update({ 
            status: 'failed', 
            error_message: errorMessage 
          })
          .eq('id', researchRecord.id);
      });

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