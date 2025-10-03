import { ResearchInitiator } from "@/components/lab/ResearchInitiator";
import { useNavigate } from "react-router-dom";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { enhanceWebhookPayload } from '@/lib/webhookPayloadUtils';
import { parseAndSaveN8nResponse } from '@/lib/researchResponseUtils';
import { useAuth } from '@/contexts/AuthContext';

const ResearchPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleStartResearch = async (data: any) => {
    try {
      if (!user) {
        throw new Error('You must be logged in to start research');
      }

      // Check user credits first
      const { data: userProfile, error: profileError } = await supabase
        .from('lab_user_profiles')
        .select('credits')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!userProfile || userProfile.credits < 1) {
        toast({
          title: "Insufficient Credits",
          description: "You need at least 1 credit to start research.",
          variant: "destructive",
          action: (
            <button
              onClick={() => navigate('/user-profile')}
              className="px-3 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Buy Credits
            </button>
          ),
        });
        return;
      }

      // Get the user's company and user profiles
      const [companyProfile, fullUserProfile] = await Promise.all([
        supabase.from('lab_company_profiles').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('lab_user_profiles').select('*').eq('user_id', user.id).maybeSingle()
      ]);

      if (companyProfile.error || fullUserProfile.error) {
        throw new Error('Error fetching profiles. Please try again.');
      }

      if (!companyProfile.data || !fullUserProfile.data) {
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
          user_id: user.id,
          company_profile_id: companyProfile.data.id,
          user_profile_id: fullUserProfile.data.id,
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

      // Deduct credit and log transaction
      const { error: creditError } = await supabase
        .from('lab_user_profiles')
        .update({ credits: userProfile.credits - 1 })
        .eq('user_id', user.id);

      if (creditError) {
        console.error('Error updating credits:', creditError);
      }

      // Log credit transaction
      const { error: transactionError } = await supabase
        .from('lab_credit_transactions')
        .insert({
          user_id: user.id,
          amount: -1,
          description: `Research: ${data.company_name}`,
          research_id: researchRecord.id
        });

      if (transactionError) {
        console.error('Error logging transaction:', transactionError);
      }

      // Show success message and redirect immediately
      toast({
        title: "Research Started!",
        description: `Research started for ${data.company_name}. 1 credit used.`,
        duration: 5000
      });

      // Redirect to dashboard immediately
      navigate('/');

      // Send webhook request in background (fire-and-forget)
      const webhookPayload = enhanceWebhookPayload(
        data,
        companyProfile.data,
        fullUserProfile.data,
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
          
          // Keep status as pending but log error for resend
          await supabase
            .from('lab_prospect_research')
            .update({ 
              error_message: `Webhook failed: ${response.status} - ${errorText}. Click "Resend" to retry.` 
            })
            .eq('id', researchRecord.id);
        }
      }).catch(async (webhookError) => {
        console.error('🚨 Fetch error:', webhookError);
        
        // Keep status as pending but log error for resend
        let errorMessage = 'Unknown webhook error';
        if (webhookError instanceof TypeError && webhookError.message.includes('Failed to fetch')) {
          errorMessage = `Cannot reach ${webhookUrl} - likely CORS or n8n not running. Activate n8n workflow and click "Resend".`;
        } else {
          errorMessage = `${webhookError.message || 'Webhook request failed'}. Click "Resend" to retry.`;
        }
        
        await supabase
          .from('lab_prospect_research')
          .update({ 
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
    }
  };

  return (
    <ResearchInitiator
      onSubmit={handleStartResearch}
      onCancel={() => navigate('/')}
    />
  );
};

export default ResearchPage;