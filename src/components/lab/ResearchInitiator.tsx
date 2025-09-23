import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Search, Zap, ArrowRight, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  isLoading: boolean;
}

export const ResearchInitiator: React.FC<ResearchInitiatorProps> = ({
  onSubmit,
  onCancel,
  isLoading
}) => {
  const [formData, setFormData] = useState<ProspectData>({
    company_name: '',
    website_url: '',
    linkedin_url: '',
    research_type: 'standard',
    notes: ''
  });
  
  const [validation, setValidation] = useState<{[key: string]: string}>({});
  const [companyProfile, setCompanyProfile] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  
  const { toast } = useToast();

  useEffect(() => {
    checkProfiles();
  }, []);

  const checkProfiles = async () => {
    try {
      // Check company profile
      const { data: companyData } = await supabase
        .from('lab_company_profiles')
        .select('*')
        .single();

      // Check user profile
      const { data: userData } = await supabase
        .from('lab_user_profiles')
        .select('*')
        .single();

      setCompanyProfile(companyData);
      setUserProfile(userData);
    } catch (error) {
      console.error('Error checking profiles:', error);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before submitting.",
        variant: "destructive"
      });
      return;
    }

    // Normalize URLs
    const normalizedData = {
      ...formData,
      website_url: normalizeUrl(formData.website_url),
      linkedin_url: normalizeUrl(formData.linkedin_url)
    };

    onSubmit(normalizedData);
  };

  const canSubmit = companyProfile && userProfile;

  if (!canSubmit) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <AlertCircle className="h-5 w-5" />
            Setup Required
          </CardTitle>
          <CardDescription>
            You need to complete your profiles before starting research
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-medium text-orange-800 mb-2">Missing Profiles:</h4>
            <ul className="list-disc list-inside space-y-1 text-orange-700">
              {!companyProfile && <li>Company Profile - Configure your organization details</li>}
              {!userProfile && <li>User Profile - Set up your personal research preferences</li>}
            </ul>
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
                className={validation.company_name ? 'border-red-500' : ''}
              />
              {validation.company_name && (
                <p className="text-sm text-red-600 mt-1">{validation.company_name}</p>
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
                className={validation.website_url ? 'border-red-500' : ''}
              />
              {validation.website_url && (
                <p className="text-sm text-red-600 mt-1">{validation.website_url}</p>
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
                className={validation.linkedin_url ? 'border-red-500' : ''}
              />
              {validation.linkedin_url && (
                <p className="text-sm text-red-600 mt-1">{validation.linkedin_url}</p>
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

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Research will include:</h4>
            <ul className="list-disc list-inside space-y-1 text-blue-700 text-sm">
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
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Starting Research...
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