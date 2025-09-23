import React, { useState } from 'react';
import { ResearchDashboard } from './ResearchDashboard';
import { CompanyProfileWizard } from './CompanyProfileWizard';
import { ResearchInitiator } from './ResearchInitiator';
import { UserProfileWizard } from './UserProfileWizard';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type ViewMode = 'dashboard' | 'company-profile' | 'user-profile' | 'research';

export const LabApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();

  const handleSaveCompanyProfile = async (data: any) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('lab_company_profiles')
        .upsert({
          ...data,
          is_complete: true
        }, {
          onConflict: 'user_id'
        });

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
      
      const { error } = await supabase
        .from('lab_user_profiles')
        .upsert({
          ...data,
          is_complete: true
        }, {
          onConflict: 'user_id'
        });

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

  const handleStartResearch = async (prospectData: any) => {
    try {
      setIsLoading(true);

      // Get profiles
      const { data: companyProfile } = await supabase
        .from('lab_company_profiles')
        .select('id')
        .single();

      const { data: userProfile } = await supabase
        .from('lab_user_profiles')
        .select('id')
        .single();

      if (!companyProfile || !userProfile) {
        throw new Error('Profiles not found');
      }

      // Get webhook URL from existing settings
      const { data: webhookData } = await supabase
        .from('webhook_testing')
        .select('webhook_url')
        .eq('is_active', true)
        .single();

      const webhookUrl = webhookData?.webhook_url || process.env.COMPANY_RESEARCH_WEBHOOK_URL || 'https://default-webhook.com';

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create research record
      const { data: research, error } = await supabase
        .from('lab_prospect_research')
        .insert({
          user_id: user.id,
          company_profile_id: companyProfile.id,
          user_profile_id: userProfile.id,
          prospect_company_name: prospectData.company_name,
          prospect_website_url: prospectData.website_url,
          prospect_linkedin_url: prospectData.linkedin_url,
          research_type: prospectData.research_type,
          webhook_url: webhookUrl,
          notes: prospectData.notes,
          status: 'pending' as const,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // TODO: Call edge function to trigger research
      // For now, just show success message
      
      toast({
        title: "Research started successfully",
        description: `Analysis for ${prospectData.company_name} has been initiated.`
      });
      
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Error starting research:', error);
      toast({
        title: "Error starting research",
        description: "Please try again.",
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