import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Save, Edit, Check, X, Settings } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { CompanyProfileWizard } from '@/components/lab/CompanyProfileWizard';
import { useAuth } from '@/contexts/AuthContext';

interface CompanyProfile {
  id?: string;
  company_name: string;
  website_url: string;
  linkedin_url?: string;
  business_registration?: string;
  industry: string;
  years_active: string;
  company_size: string;
  mission: string;
  vision?: string;
  values: string[];
  offering_type: string[];
  main_offerings: string[];
  unique_differentiators: string[];
  typical_results: string[];
  ideal_client_size: string[];
  target_industries: string[];
  project_scope: string;
  geographic_markets: string[];
  pricing_positioning: string;
  delivery_model: string[];
  known_clients: boolean;
  known_clients_list?: string;
  credentials: string[];
  organizational_personality: string[];
  communication_style: string;
  success_story?: string;
  is_complete: boolean;
}

export function EditableCompanyProfile() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('lab_company_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setProfile(data);
      } else {
        // Create default empty profile
        setProfile({
          company_name: '',
          website_url: '',
          linkedin_url: '',
          business_registration: '',
          industry: '',
          years_active: '',
          company_size: '',
          mission: '',
          vision: '',
          values: [],
          offering_type: [],
          main_offerings: [],
          unique_differentiators: [],
          typical_results: [],
          ideal_client_size: [],
          target_industries: [],
          project_scope: '',
          geographic_markets: [],
          pricing_positioning: '',
          delivery_model: [],
          known_clients: false,
          known_clients_list: '',
          credentials: [],
          organizational_personality: [],
          communication_style: '',
          success_story: '',
          is_complete: false
        });
        setIsEditing(true); // Start in edit mode for new profiles
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error loading profile",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!profile || !user) return;

    try {
      setIsSaving(true);
      
      const profileData = {
        user_id: user.id,
        ...profile,
        is_complete: !!(profile.company_name && profile.website_url && profile.industry && profile.mission),
        project_scope: profile.project_scope || '',
        years_active: profile.years_active || '',
        business_registration: profile.business_registration || '',
        delivery_model: profile.delivery_model || [],
        ideal_client_size: profile.ideal_client_size || [],
        known_clients: profile.known_clients || false,
        known_clients_list: profile.known_clients_list || '',
        offering_type: profile.offering_type || [],
        typical_results: profile.typical_results || [],
        pricing_positioning: profile.pricing_positioning || ''
      };

      const { error } = await supabase
        .from('lab_company_profiles')
        .upsert(profileData, { onConflict: 'user_id' });

      if (error) throw error;

      toast({
        title: "Profile saved",
        description: "Your company profile has been updated successfully."
      });
      
      setIsEditing(false);
      loadProfile(); // Reload to get the updated data
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error saving profile",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof CompanyProfile, value: any) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
  };

  const handleArrayField = (field: keyof CompanyProfile, value: string, checked: boolean) => {
    if (!profile) return;
    const currentArray = (profile[field] as string[]) || [];
    const newArray = checked 
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value);
    setProfile({ ...profile, [field]: newArray });
  };

  const handleWizardSave = async (data: any) => {
    if (!user) return;
    
    setProfile({ ...profile, ...data });
    setShowWizard(false);
    
    // Auto-save the profile
    const profileData = {
      user_id: user.id,
      ...profile,
      ...data,
      is_complete: !!(data.company_name && data.website_url && data.industry && data.mission)
    };

    try {
      const { error } = await supabase
        .from('lab_company_profiles')
        .upsert(profileData, { onConflict: 'user_id' });

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your company profile has been updated from the wizard."
      });
      
      loadProfile();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error saving profile",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-20" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const completionPercentage = (() => {
    const requiredFields = ['company_name', 'website_url', 'industry', 'company_size', 'mission'];
    const completedRequired = requiredFields.filter(field => profile[field as keyof CompanyProfile]).length;
    const optionalFields = ['vision', 'linkedin_url', 'values', 'main_offerings'];
    const completedOptional = optionalFields.filter(field => {
      const value = profile[field as keyof CompanyProfile];
      return Array.isArray(value) ? value.length > 0 : !!value;
    }).length;
    
    return Math.round(((completedRequired / requiredFields.length) * 70) + ((completedOptional / optionalFields.length) * 30));
  })();

  if (showWizard) {
    return (
      <CompanyProfileWizard
        initialData={profile || {}}
        onSave={handleWizardSave}
        onCancel={() => setShowWizard(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Company Profile</h1>
              <p className="text-muted-foreground">
                {profile.is_complete ? 'Profile complete' : `${completionPercentage}% complete`}
              </p>
            </div>
          </div>
          {profile.is_complete && (
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              <Check className="h-3 w-3 mr-1" />
              Complete
            </Badge>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowWizard(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Re-run Setup Wizard
          </Button>
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditing(false);
                  loadProfile();
                }}
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={saveProfile} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Core company details and identity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name *</Label>
              {isEditing ? (
                <Input
                  id="company_name"
                  value={profile.company_name}
                  onChange={(e) => updateField('company_name', e.target.value)}
                  placeholder="Enter your company name"
                />
              ) : (
                <p className="py-2 px-3 border rounded-md bg-muted/30">{profile.company_name || 'Not specified'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website_url">Website URL *</Label>
              {isEditing ? (
                <Input
                  id="website_url"
                  type="url"
                  value={profile.website_url}
                  onChange={(e) => updateField('website_url', e.target.value)}
                  placeholder="https://your-website.com"
                />
              ) : (
                <p className="py-2 px-3 border rounded-md bg-muted/30">
                  {profile.website_url ? (
                    <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {profile.website_url}
                    </a>
                  ) : 'Not specified'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry *</Label>
              {isEditing ? (
                <Select value={profile.industry} onValueChange={(value) => updateField('industry', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="real-estate">Real Estate</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="py-2 px-3 border rounded-md bg-muted/30">{profile.industry || 'Not specified'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_size">Company Size *</Label>
              {isEditing ? (
                <Select value={profile.company_size} onValueChange={(value) => updateField('company_size', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201-500">201-500 employees</SelectItem>
                    <SelectItem value="501-1000">501-1000 employees</SelectItem>
                    <SelectItem value="1000+">1000+ employees</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="py-2 px-3 border rounded-md bg-muted/30">{profile.company_size || 'Not specified'}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Mission & Vision */}
        <Card>
          <CardHeader>
            <CardTitle>Mission & Vision</CardTitle>
            <CardDescription>Your company's purpose and direction</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mission">Mission Statement *</Label>
              {isEditing ? (
                <Textarea
                  id="mission"
                  value={profile.mission}
                  onChange={(e) => updateField('mission', e.target.value)}
                  placeholder="Describe your company's core mission"
                  className="min-h-[100px]"
                />
              ) : (
                <p className="py-2 px-3 border rounded-md bg-muted/30 min-h-[100px] whitespace-pre-wrap">
                  {profile.mission || 'Not specified'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="vision">Vision Statement</Label>
              {isEditing ? (
                <Textarea
                  id="vision"
                  value={profile.vision || ''}
                  onChange={(e) => updateField('vision', e.target.value)}
                  placeholder="Describe your company's future vision"
                  className="min-h-[80px]"
                />
              ) : (
                <p className="py-2 px-3 border rounded-md bg-muted/30 min-h-[80px] whitespace-pre-wrap">
                  {profile.vision || 'Not specified'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Values & Culture */}
        <Card>
          <CardHeader>
            <CardTitle>Values & Culture</CardTitle>
            <CardDescription>Company values and personality</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Company Values (Select up to 3)</Label>
              {isEditing ? (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {['Integrity', 'Innovation', 'Customer Focus', 'Excellence', 'Collaboration', 'Transparency', 'Sustainability', 'Growth'].map(value => (
                    <div key={value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`value-${value}`}
                        checked={profile.values.includes(value)}
                        onCheckedChange={(checked) => handleArrayField('values', value, checked as boolean)}
                        disabled={!profile.values.includes(value) && profile.values.length >= 3}
                      />
                      <Label htmlFor={`value-${value}`} className="text-sm">{value}</Label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-2 px-3 border rounded-md bg-muted/30 min-h-[40px]">
                  {profile.values.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {profile.values.map((value, index) => (
                        <Badge key={index} variant="secondary">{value}</Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Not specified</span>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Organizational Personality</Label>
              {isEditing ? (
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {[
                    'Professional & analytical',
                    'Innovative & visionary',
                    'Personal & relationship-focused',
                    'Pragmatic & results-oriented',
                    'Creative & out-of-the-box'
                  ].map(personality => (
                    <div key={personality} className="flex items-center space-x-2">
                      <Checkbox
                        id={`personality-${personality}`}
                        checked={profile.organizational_personality.includes(personality)}
                        onCheckedChange={(checked) => handleArrayField('organizational_personality', personality, checked as boolean)}
                      />
                      <Label htmlFor={`personality-${personality}`} className="text-sm">{personality}</Label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-2 px-3 border rounded-md bg-muted/30 min-h-[40px]">
                  {profile.organizational_personality.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {profile.organizational_personality.map((personality, index) => (
                        <Badge key={index} variant="secondary">{personality}</Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Not specified</span>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Communication Style</Label>
              {isEditing ? (
                <RadioGroup 
                  value={profile.communication_style} 
                  onValueChange={(value) => updateField('communication_style', value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="direct" id="comm-direct" />
                    <Label htmlFor="comm-direct">Direct & to-the-point</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="relational" id="comm-relational" />
                    <Label htmlFor="comm-relational">Relational & personal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="analytical" id="comm-analytical" />
                    <Label htmlFor="comm-analytical">Analytical & data-driven</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="inspiring" id="comm-inspiring" />
                    <Label htmlFor="comm-inspiring">Inspiring & visionary</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="diplomatic" id="comm-diplomatic" />
                    <Label htmlFor="comm-diplomatic">Diplomatic & international</Label>
                  </div>
                </RadioGroup>
              ) : (
                <p className="py-2 px-3 border rounded-md bg-muted/30">
                  {profile.communication_style || 'Not specified'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Offerings & Services */}
        <Card>
          <CardHeader>
            <CardTitle>Offerings & Services</CardTitle>
            <CardDescription>What your company provides</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Type of Offering</Label>
              {isEditing ? (
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {[
                    'Primarily services',
                    'Primarily products', 
                    'Software/SaaS solutions',
                    'Combination services + products',
                    'Other'
                  ].map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`offering-${type}`}
                        checked={profile.offering_type.includes(type)}
                        onCheckedChange={(checked) => handleArrayField('offering_type', type, checked as boolean)}
                      />
                      <Label htmlFor={`offering-${type}`} className="text-sm">{type}</Label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-2 px-3 border rounded-md bg-muted/30 min-h-[40px]">
                  {profile.offering_type.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {profile.offering_type.map((type, index) => (
                        <Badge key={index} variant="secondary">{type}</Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Not specified</span>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Main Offerings</Label>
              {isEditing ? (
                <Textarea
                  value={profile.main_offerings.join('\n')}
                  onChange={(e) => updateField('main_offerings', e.target.value.split('\n').filter(Boolean))}
                  placeholder="List your main products/services (one per line)"
                  className="min-h-[100px]"
                />
              ) : (
                <div className="py-2 px-3 border rounded-md bg-muted/30 min-h-[100px]">
                  {profile.main_offerings.length > 0 ? (
                    <ul className="space-y-1">
                      {profile.main_offerings.map((offering, index) => (
                        <li key={index} className="text-sm">• {offering}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-muted-foreground">Not specified</span>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>What makes you unique? (Select all that apply)</Label>
              {isEditing ? (
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {[
                    'Specialized expertise/niche focus',
                    'Proven methodology/framework',
                    'Cutting-edge technology/innovation',
                    'Personal approach & service',
                    'Speed of delivery/implementation',
                    'Cost effectiveness/value',
                    'Industry experience/credentials'
                  ].map(diff => (
                    <div key={diff} className="flex items-center space-x-2">
                      <Checkbox
                        id={`diff-${diff}`}
                        checked={profile.unique_differentiators.includes(diff)}
                        onCheckedChange={(checked) => handleArrayField('unique_differentiators', diff, checked as boolean)}
                      />
                      <Label htmlFor={`diff-${diff}`} className="text-sm">{diff}</Label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-2 px-3 border rounded-md bg-muted/30 min-h-[40px]">
                  {profile.unique_differentiators.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {profile.unique_differentiators.map((diff, index) => (
                        <Badge key={index} variant="outline">{diff}</Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Not specified</span>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Typical Results Delivered</Label>
              {isEditing ? (
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {[
                    'Cost reduction (% or € savings)',
                    'Revenue/sales increase',
                    'Time/efficiency savings',
                    'Quality improvements',
                    'Risk mitigation/compliance',
                    'Process/operational optimization',
                    'Customer satisfaction increase'
                  ].map(result => (
                    <div key={result} className="flex items-center space-x-2">
                      <Checkbox
                        id={`result-${result}`}
                        checked={profile.typical_results.includes(result)}
                        onCheckedChange={(checked) => handleArrayField('typical_results', result, checked as boolean)}
                      />
                      <Label htmlFor={`result-${result}`} className="text-sm">{result}</Label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-2 px-3 border rounded-md bg-muted/30 min-h-[40px]">
                  {profile.typical_results.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {profile.typical_results.map((result, index) => (
                        <Badge key={index} variant="outline">{result}</Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Not specified</span>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Target Market & Positioning */}
        <Card>
          <CardHeader>
            <CardTitle>Target Market & Positioning</CardTitle>
            <CardDescription>Your ideal clients and market approach</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Ideal Client Size</Label>
              {isEditing ? (
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {[
                    'Startups/scale-ups (<50 employees)',
                    'SME (50-250 employees)',
                    'Mid-market (250-1000 employees)',
                    'Enterprise (1000+ employees)',
                    'Government/non-profit'
                  ].map(size => (
                    <div key={size} className="flex items-center space-x-2">
                      <Checkbox
                        id={`client-${size}`}
                        checked={profile.ideal_client_size.includes(size)}
                        onCheckedChange={(checked) => handleArrayField('ideal_client_size', size, checked as boolean)}
                      />
                      <Label htmlFor={`client-${size}`} className="text-sm">{size}</Label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-2 px-3 border rounded-md bg-muted/30 min-h-[40px]">
                  {profile.ideal_client_size.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {profile.ideal_client_size.map((size, index) => (
                        <Badge key={index} variant="secondary">{size}</Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Not specified</span>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Target Industries</Label>
              {isEditing ? (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {[
                    'Technology/IT',
                    'Manufacturing/Industry',
                    'Healthcare/Life Sciences',
                    'Financial Services',
                    'Retail/E-commerce',
                    'Professional Services',
                    'Government/Public sector',
                    'All sectors'
                  ].map(industry => (
                    <div key={industry} className="flex items-center space-x-2">
                      <Checkbox
                        id={`target-${industry}`}
                        checked={profile.target_industries.includes(industry)}
                        onCheckedChange={(checked) => handleArrayField('target_industries', industry, checked as boolean)}
                      />
                      <Label htmlFor={`target-${industry}`} className="text-sm">{industry}</Label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-2 px-3 border rounded-md bg-muted/30 min-h-[40px]">
                  {profile.target_industries.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {profile.target_industries.map((industry, index) => (
                        <Badge key={index} variant="secondary">{industry}</Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Not specified</span>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Typical Project/Engagement Scope</Label>
              {isEditing ? (
                <RadioGroup 
                  value={profile.project_scope} 
                  onValueChange={(value) => updateField('project_scope', value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sprint" id="scope-sprint" />
                    <Label htmlFor="scope-sprint">Sprint projects (2-8 weeks)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="quarterly" id="scope-quarterly" />
                    <Label htmlFor="scope-quarterly">Quarterly programs (2-4 months)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="transformation" id="scope-transformation" />
                    <Label htmlFor="scope-transformation">Transformation programs (6+ months)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ongoing" id="scope-ongoing" />
                    <Label htmlFor="scope-ongoing">Ongoing partnerships/subscriptions</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="product" id="scope-product" />
                    <Label htmlFor="scope-product">Product sales (one-time)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="variable" id="scope-variable" />
                    <Label htmlFor="scope-variable">Variable per client</Label>
                  </div>
                </RadioGroup>
              ) : (
                <p className="py-2 px-3 border rounded-md bg-muted/30">
                  {profile.project_scope || 'Not specified'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Geographic Markets</Label>
              {isEditing ? (
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {[
                    'Local (specific city/region)',
                    'National',
                    'Regional (multiple countries)',
                    'European',
                    'International/Global'
                  ].map(market => (
                    <div key={market} className="flex items-center space-x-2">
                      <Checkbox
                        id={`geo-${market}`}
                        checked={profile.geographic_markets.includes(market)}
                        onCheckedChange={(checked) => handleArrayField('geographic_markets', market, checked as boolean)}
                      />
                      <Label htmlFor={`geo-${market}`} className="text-sm">{market}</Label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-2 px-3 border rounded-md bg-muted/30 min-h-[40px]">
                  {profile.geographic_markets.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {profile.geographic_markets.map((market, index) => (
                        <Badge key={index} variant="secondary">{market}</Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Not specified</span>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Pricing/Investment Level Positioning</Label>
              {isEditing ? (
                <RadioGroup 
                  value={profile.pricing_positioning} 
                  onValueChange={(value) => updateField('pricing_positioning', value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="premium" id="price-premium" />
                    <Label htmlFor="price-premium">Premium positioning (top 20% market price)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="quality" id="price-quality" />
                    <Label htmlFor="price-quality">Quality positioning (market conform)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="value" id="price-value" />
                    <Label htmlFor="price-value">Value positioning (competitively priced)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="budget" id="price-budget" />
                    <Label htmlFor="price-budget">Budget positioning (lowest price segment)</Label>
                  </div>
                </RadioGroup>
              ) : (
                <p className="py-2 px-3 border rounded-md bg-muted/30">
                  {profile.pricing_positioning || 'Not specified'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Delivery/Service Model</Label>
              {isEditing ? (
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {[
                    'Consulting/advisory services',
                    'Done-for-you implementation',
                    'Training/knowledge transfer',
                    'Software/SaaS platform',
                    'Physical products',
                    'Hybrid/combination model'
                  ].map(model => (
                    <div key={model} className="flex items-center space-x-2">
                      <Checkbox
                        id={`delivery-${model}`}
                        checked={profile.delivery_model.includes(model)}
                        onCheckedChange={(checked) => handleArrayField('delivery_model', model, checked as boolean)}
                      />
                      <Label htmlFor={`delivery-${model}`} className="text-sm">{model}</Label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-2 px-3 border rounded-md bg-muted/30 min-h-[40px]">
                  {profile.delivery_model.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {profile.delivery_model.map((model, index) => (
                        <Badge key={index} variant="secondary">{model}</Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Not specified</span>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Credibility & Proof */}
        <Card>
          <CardHeader>
            <CardTitle>Credibility & Social Proof</CardTitle>
            <CardDescription>Success stories and credentials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="success_story">Best Success Story</Label>
              {isEditing ? (
                <Textarea
                  id="success_story"
                  value={profile.success_story || ''}
                  onChange={(e) => updateField('success_story', e.target.value)}
                  placeholder="For [type of client] we achieved [specific result] in [timeframe]"
                  maxLength={200}
                  className="min-h-[100px]"
                />
              ) : (
                <p className="py-2 px-3 border rounded-md bg-muted/30 min-h-[100px] whitespace-pre-wrap">
                  {profile.success_story || 'Not specified'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="known_clients"
                    checked={profile.known_clients}
                    onCheckedChange={(checked) => updateField('known_clients', checked)}
                  />
                  <Label htmlFor="known_clients">We have well-known clients/brands we can mention</Label>
                </div>
              ) : (
                <Label>Known Clients</Label>
              )}
              
              {(isEditing && profile.known_clients) || (!isEditing && profile.known_clients_list) ? (
                isEditing ? (
                  <Input
                    value={profile.known_clients_list || ''}
                    onChange={(e) => updateField('known_clients_list', e.target.value)}
                    placeholder="List your notable clients"
                    className="mt-2"
                  />
                ) : (
                  <p className="py-2 px-3 border rounded-md bg-muted/30">
                    {profile.known_clients_list || 'Not specified'}
                  </p>
                )
              ) : !isEditing ? (
                <p className="py-2 px-3 border rounded-md bg-muted/30">
                  No known clients specified
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Credentials that strengthen credibility</Label>
              {isEditing ? (
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {[
                    'Industry certifications/partnerships',
                    'Awards/recognition',
                    'Published case studies/white papers',
                    'Speaking engagements/thought leadership',
                    'University partnerships/research',
                    'Media coverage/press mentions',
                    'Client testimonials/reviews'
                  ].map(credential => (
                    <div key={credential} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cred-${credential}`}
                        checked={profile.credentials.includes(credential)}
                        onCheckedChange={(checked) => handleArrayField('credentials', credential, checked as boolean)}
                      />
                      <Label htmlFor={`cred-${credential}`} className="text-sm">{credential}</Label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-2 px-3 border rounded-md bg-muted/30 min-h-[40px]">
                  {profile.credentials.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {profile.credentials.map((credential, index) => (
                        <Badge key={index} variant="secondary">{credential}</Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Not specified</span>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}