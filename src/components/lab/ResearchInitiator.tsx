import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Search, Zap, ArrowRight, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface ProspectData {
  company_name: string;
  website_url: string;
  linkedin_url: string;
  research_type: string;
  notes: string;
}

interface ResearchInitiatorProps {
  onSubmit: (data: ProspectData) => void;
  onCancel: () => void;
}

export const ResearchInitiator: React.FC<ResearchInitiatorProps> = ({
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<ProspectData>({
    company_name: '',
    website_url: '',
    linkedin_url: '',
    research_type: 'standard',
    notes: ''
  });
  
  const [validation, setValidation] = useState<{[key: string]: string}>({});
  const [companyProfile, setCompanyProfile] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    checkProfiles();
  }, [user?.id]);

  const checkProfiles = async () => {
    try {
      if (!user) {
        setProfilesLoading(false);
        return;
      }

      const [companyRes, userRes] = await Promise.all([
        supabase
          .from('lab_company_profiles')
          .select('id, user_id, company_name, is_complete')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('lab_user_profiles')
          .select('id, user_id, full_name, is_complete, credits')
          .eq('user_id', user.id)
          .maybeSingle()
      ]);

      if (companyRes.error) {
        console.error('Error fetching company profile:', companyRes.error);
      }
      if (userRes.error) {
        console.error('Error fetching user profile:', userRes.error);
      }

      setCompanyProfile(companyRes.data ?? null);
      setUserProfile(userRes.data ?? null);
    } catch (error) {
      console.error('Error checking profiles:', error);
    } finally {
      setProfilesLoading(false);
    }
  };

  const updateField = (field: keyof ProspectData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user starts typing
    if (validation[field]) {
      setValidation(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    if (!formData.company_name.trim()) {
      errors.company_name = 'Company name is required';
    }

    if (!formData.website_url.trim()) {
      errors.website_url = 'Website URL is required';
    } else if (!isValidUrl(formData.website_url)) {
      errors.website_url = 'Please enter a valid URL';
    }

    if (formData.linkedin_url && !isValidUrl(formData.linkedin_url)) {
      errors.linkedin_url = 'Please enter a valid LinkedIn URL';
    }

    setValidation(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const normalizeUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `https://${url}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    // Normalize URLs
    const normalizedData = {
      ...formData,
      website_url: normalizeUrl(formData.website_url),
      linkedin_url: normalizeUrl(formData.linkedin_url)
    };

    try {
      await onSubmit(normalizedData);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (profilesLoading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    );
  }

  const canSubmit = Boolean(companyProfile?.is_complete && userProfile?.is_complete);

  if (!canSubmit) {
    const companyIssue = !companyProfile 
      ? { message: 'Company Profile Missing', action: 'Create your company profile to continue' }
      : !companyProfile.is_complete 
        ? { message: 'Company Profile Incomplete', action: 'Complete your company profile to continue' }
        : null;

    const userIssue = !userProfile
      ? { message: 'User Profile Missing', action: 'Create your user profile to continue' }
      : !userProfile.is_complete
        ? { message: 'User Profile Incomplete', action: 'Complete your user profile to continue' }
        : null;

    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-scout-orange">
            <AlertCircle className="h-5 w-5" />
            Setup Required
          </CardTitle>
          <CardDescription>
            Complete your profiles before starting research
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="bg-scout-orange/10 border border-scout-orange/20 rounded-lg p-4">
              <h4 className="font-medium text-scout-orange mb-3">Profile Issues:</h4>
              <div className="space-y-3">
                {companyIssue && (
                  <div className="space-y-2">
                    <p className="text-scout-orange font-medium">{companyIssue.message}</p>
                    <p className="text-sm text-scout-orange/80">{companyIssue.action}</p>
                  <Button 
                    size="sm" 
                    onClick={() => navigate('/company-profile')}
                    className="mt-1"
                  >
                    Go to Company Profile
                  </Button>
                </div>
              )}
              {userIssue && (
                <div className="space-y-2">
                  <p className="text-scout-orange font-medium">{userIssue.message}</p>
                    <p className="text-sm text-scout-orange/80">{userIssue.action}</p>
                  <Button 
                    size="sm" 
                    onClick={() => navigate('/user-profile')}
                    className="mt-1"
                  >
                    Go to User Profile
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Start New Research
        </CardTitle>
        <CardDescription>
          Enter prospect company details to begin personalized research analysis
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="company_name">
                Company Name *
              </Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => updateField('company_name', e.target.value)}
                placeholder="Enter the prospect company name"
                className={validation.company_name ? 'border-destructive' : ''}
              />
              {validation.company_name && (
                <p className="text-sm text-destructive mt-1">{validation.company_name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="website_url">
                Website URL *
              </Label>
              <Input
                id="website_url"
                value={formData.website_url}
                onChange={(e) => updateField('website_url', e.target.value)}
                placeholder="company-website.com or https://company-website.com"
                className={validation.website_url ? 'border-destructive' : ''}
              />
              {validation.website_url && (
                <p className="text-sm text-destructive mt-1">{validation.website_url}</p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                Enter with or without https:// - we'll normalize it automatically
              </p>
            </div>

            <div>
              <Label htmlFor="linkedin_url">
                LinkedIn Company Page
              </Label>
              <Input
                id="linkedin_url"
                value={formData.linkedin_url}
                onChange={(e) => updateField('linkedin_url', e.target.value)}
                placeholder="linkedin.com/company/company-name (optional)"
                className={validation.linkedin_url ? 'border-destructive' : ''}
              />
              {validation.linkedin_url && (
                <p className="text-sm text-destructive mt-1">{validation.linkedin_url}</p>
              )}
            </div>

            <div>
              <Label htmlFor="research_type">
                Research Type
              </Label>
              <Select value={formData.research_type} onValueChange={(value) => updateField('research_type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Standard Research</div>
                        <div className="text-sm text-muted-foreground">Comprehensive company analysis</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="quick">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Quick Scan</div>
                        <div className="text-sm text-muted-foreground">Basic fit assessment</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="deep">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Deep Analysis</div>
                        <div className="text-sm text-muted-foreground">Detailed strategic assessment</div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">
                Research Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="Add any specific research focus or context..."
                className="min-h-[80px]"
              />
            </div>
          </div>

          <div className="bg-scout-light-blue/10 border border-scout-light-blue/20 rounded-lg p-4">
            <h4 className="font-medium text-scout-light-blue mb-2">Research will include:</h4>
            <ul className="list-disc list-inside space-y-1 text-scout-light-blue/80 text-sm">
              <li>Strategic fit analysis with your company profile</li>
              <li>Decision maker identification and contact strategy</li>
              <li>Personalized outreach recommendations</li>
              <li>Value proposition alignment assessment</li>
              <li>EBITDA impact projections based on your typical results</li>
            </ul>
          </div>

          <div className="flex justify-between gap-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                  Submitting...
                </>
              ) : (
                <>
                  Start Research
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};