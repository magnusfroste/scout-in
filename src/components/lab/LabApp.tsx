import React, { useState } from 'react';
import { ResearchDashboard } from './ResearchDashboard';
import { CompanyProfileWizard } from './CompanyProfileWizard';
import { ResearchInitiator } from './ResearchInitiator';
import { UserProfileWizard } from './UserProfileWizard';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { enhanceWebhookPayload } from '@/lib/webhookPayloadUtils';

type ViewMode = 'dashboard' | 'company-profile' | 'user-profile' | 'research';

// Dummy user ID for POC demo without authentication
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000000';

export const LabApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();

  const handleSaveCompanyProfile = async (data: any) => {
    try {
      setIsLoading(true);
      
      const companyPayload = {
        user_id: DEMO_USER_ID,
        is_complete: true,
        company_name: data.company_name ?? data.companyName ?? '',
        website_url: data.website_url ?? data.websiteUrl ?? '',
        linkedin_url: data.linkedin_url ?? data.linkedinUrl ?? null,
        business_registration: data.business_registration ?? null,
        industry: data.industry ?? '',
        years_active: data.years_active ?? '',
        company_size: data.company_size ?? '',
        mission: data.mission ?? '',
        vision: data.vision ?? null,
        values: data.values ?? [],
        offering_type: data.offering_type ?? [],
        main_offerings: data.main_offerings ?? [],
        unique_differentiators: data.unique_differentiators ?? [],
        typical_results: data.typical_results ?? [],
        ideal_client_size: data.ideal_client_size ?? [],
        target_industries: data.target_industries ?? [],
        project_scope: data.project_scope ?? '',
        geographic_markets: data.geographic_markets ?? [],
        pricing_positioning: data.pricing_positioning ?? '',
        delivery_model: data.delivery_model ?? [],
        success_story: data.success_story ?? null,
        known_clients: data.known_clients ?? false,
        known_clients_list: data.known_clients_list ?? null,
        credentials: data.credentials ?? [],
        organizational_personality: data.organizational_personality ?? [],
        communication_style: data.communication_style ?? ''
      };

      const { error } = await supabase
        .from('lab_company_profiles')
        .upsert(companyPayload, { onConflict: 'user_id' });

      if (error) throw error;

      toast({
        title: "Profile saved successfully",
        description: "Your company profile has been updated."
      });
      
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Error saving company profile:', error);
      toast({
        title: "Error saving profile",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveUserProfile = async (data: any) => {
    try {
      setIsLoading(true);
      
      const userPayload = {
        user_id: DEMO_USER_ID,
        is_complete: true,
        full_name: data.full_name ?? data.fullName ?? '',
        linkedin_profile: data.linkedin_profile ?? data.linkedinProfile ?? null,
        current_location: data.current_location ?? data.currentLocation ?? null,
        birthplace: data.birthplace ?? null,
        role_in_organization: data.role_in_organization ?? data.roleInOrganization ?? '',
        outreach_experience: data.outreach_experience ?? data.outreachExperience ?? '',
        prospects_per_week: data.prospects_per_week ?? data.prospectsPerWeek ?? '',
        communication_style: data.communication_style ?? data.communicationStyle ?? '',
        introduction_style: data.introduction_style ?? data.introductionStyle ?? '',
        credibility_preference: data.credibility_preference ?? [],
        preferred_contact_channel: data.preferred_contact_channel ?? [],
        followup_timing: data.followup_timing ?? data.followUpTiming ?? '',
        nonresponse_handling: data.nonresponse_handling ?? data.nonResponseHandling ?? '',
        pain_points_focus: data.pain_points_focus ?? [],
        expertise_positioning: data.expertise_positioning ?? '',
        objection_handling: data.objection_handling ?? [],
        meeting_format: data.meeting_format ?? [],
        meeting_duration: data.meeting_duration ?? '',
        success_metrics: data.success_metrics ?? []
      };

      const { error } = await supabase
        .from('lab_user_profiles')
        .upsert(userPayload, { onConflict: 'user_id' });

      if (error) throw error;

      toast({
        title: "Profile saved successfully",
        description: "Your user profile has been updated."
      });
      
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Error saving user profile:', error);
      toast({
        title: "Error saving profile",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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

      // Prepare the enhanced webhook payload for n8n development
      const enhancedPayload = enhanceWebhookPayload(
        data,
        companyProfile.data,
        userProfile.data,
        null // Will be filled after database insert
      );

      // Enhanced payload ready for N8N (system prompt managed in N8N)
      const webhookPayload = enhancedPayload;

      // Create the research record with FIXED field mapping
      const { data: researchRecord, error: insertError } = await supabase
        .from('lab_prospect_research')
        .insert({
          user_id: DEMO_USER_ID,
          company_profile_id: companyProfile.data.id,
          user_profile_id: userProfile.data.id,
          prospect_company_name: data.company_name,  // FIXED: correct field name
          prospect_website_url: data.website_url,    // FIXED: correct field name
          prospect_linkedin_url: data.linkedin_url,  // FIXED: correct field name
          research_type: data.research_type || 'standard', // FIXED: correct field name
          notes: data.notes || '',
          webhook_url: webhookUrl,
          status: 'pending'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Update payload with research ID
      enhancedPayload.research_id = researchRecord.id;
      
      // Final webhook payload with research ID
      const finalWebhookPayload = enhancedPayload;

      // Send POST request to webhook endpoint
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(finalWebhookPayload)
        });

        if (response.ok) {
          console.log('✅ Webhook sent successfully');
          toast({
            title: "Research Started",
            description: `Webhook sent to n8n successfully. Research ID: ${researchRecord.id}`,
            duration: 5000
          });
        } else {
          throw new Error(`Webhook failed: ${response.status}`);
        }
      } catch (webhookError) {
        console.error('Webhook error:', webhookError);
        toast({
          title: "Research Started (Webhook Failed)",
          description: `Research created but webhook failed. Check console for details. Research ID: ${researchRecord.id}`,
          variant: "destructive",
          duration: 8000
        });
      }

      setCurrentView('dashboard');
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

  const renderView = () => {
    switch (currentView) {
      case 'company-profile':
        return (
          <CompanyProfileWizard
            onSave={handleSaveCompanyProfile}
            onCancel={() => setCurrentView('dashboard')}
          />
        );
        
      case 'user-profile':
        return (
          <UserProfileWizard
            onSave={handleSaveUserProfile}
            onCancel={() => setCurrentView('dashboard')}
          />
        );
        
      case 'research':
        return (
          <ResearchInitiator
            onSubmit={handleStartResearch}
            onCancel={() => setCurrentView('dashboard')}
            isLoading={isLoading}
          />
        );
        
      default:
        return (
          <ResearchDashboard
            onStartResearch={() => setCurrentView('research')}
            onSetupCompanyProfile={() => setCurrentView('company-profile')}
            onSetupUserProfile={() => setCurrentView('user-profile')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {renderView()}
      </div>
    </div>
  );
};