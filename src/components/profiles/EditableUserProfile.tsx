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
import { User, Save, Edit, Check, X, Settings, Coins } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { UserProfileWizard } from '@/components/lab/UserProfileWizard';
import { useAuth } from '@/contexts/AuthContext';
import { CreditPurchaseDialog } from '@/components/lab/CreditPurchaseDialog';
import { useSearchParams } from 'react-router-dom';

interface UserProfile {
  id?: string;
  full_name: string;
  linkedin_profile?: string;
  current_location?: string;
  birthplace?: string;
  date_of_birth?: string;
  role_in_organization: string;
  outreach_experience: string;
  prospects_per_week: string;
  communication_style: string;
  introduction_style: string;
  credibility_preference: string[];
  preferred_contact_channel: string[];
  followup_timing: string;
  nonresponse_handling: string;
  pain_points_focus: string[];
  expertise_positioning: string;
  objection_handling: string[];
  meeting_format: string[];
  meeting_duration: string;
  success_metrics: string[];
  is_complete: boolean;
  credits?: number;
}

interface CreditTransaction {
  id: string;
  amount: number;
  description: string;
  research_id: string | null;
  created_at: string;
}

export function EditableUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [creditHistory, setCreditHistory] = useState<CreditTransaction[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showCreditPurchase, setShowCreditPurchase] = useState(false);
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadProfile();
    loadCreditHistory();
    
    // Check for successful purchase
    if (searchParams.get('success') === 'true') {
      toast({
        title: "Purchase Successful!",
        description: "Your credits have been added to your account.",
        duration: 5000,
      });
      // Remove the success parameter from URL
      window.history.replaceState({}, '', '/user-profile');
    }
  }, [searchParams]);

  const loadProfile = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('lab_user_profiles')
        .select('*, credits')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setProfile(data);
      } else {
        // Create default empty profile
        setProfile({
          full_name: '',
          linkedin_profile: '',
          current_location: '',
          role_in_organization: '',
          outreach_experience: '',
          prospects_per_week: '',
          communication_style: '',
          introduction_style: '',
          credibility_preference: [],
          preferred_contact_channel: [],
          followup_timing: '',
          nonresponse_handling: '',
          pain_points_focus: [],
          expertise_positioning: '',
          objection_handling: [],
          meeting_format: [],
          meeting_duration: '',
          success_metrics: [],
          is_complete: false,
          credits: 5
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

  const loadCreditHistory = async () => {
    try {
      if (!user) return;
      
      setLoadingHistory(true);
      const { data, error } = await supabase
        .from('lab_credit_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      setCreditHistory(data || []);
    } catch (error) {
      console.error('Error loading credit history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const saveProfile = async () => {
    if (!profile || !user) return;

    try {
      setIsSaving(true);
      
      const profileData = {
        user_id: user.id,
        ...profile,
        is_complete: !!(profile.full_name && profile.role_in_organization && profile.communication_style)
      };

      const { error } = await supabase
        .from('lab_user_profiles')
        .upsert(profileData, { onConflict: 'user_id' });

      if (error) throw error;

      toast({
        title: "Profile saved",
        description: "Your user profile has been updated successfully."
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

  const updateField = (field: keyof UserProfile, value: any) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
  };

  const handleArrayField = (field: keyof UserProfile, value: string, checked: boolean) => {
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
      is_complete: !!(data.full_name && data.role_in_organization && data.communication_style)
    };

    try {
      const { error } = await supabase
        .from('lab_user_profiles')
        .upsert(profileData, { onConflict: 'user_id' });

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your user profile has been updated from the wizard."
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
    const requiredFields = ['full_name', 'role_in_organization', 'communication_style'];
    const completedRequired = requiredFields.filter(field => profile[field as keyof UserProfile]).length;
    
    const optionalFields = [
      'linkedin_profile', 
      'outreach_experience', 
      'prospects_per_week', 
      'introduction_style',
      'followup_timing',
      'nonresponse_handling',
      'expertise_positioning',
      'meeting_duration'
    ];
    const completedOptional = optionalFields.filter(field => {
      const value = profile[field as keyof UserProfile];
      return Array.isArray(value) ? value.length > 0 : !!value;
    }).length;

    const arrayFields = [
      'preferred_contact_channel',
      'credibility_preference',
      'pain_points_focus',
      'objection_handling',
      'meeting_format',
      'success_metrics'
    ];
    const completedArrays = arrayFields.filter(field => {
      const value = profile[field as keyof UserProfile] as string[];
      return Array.isArray(value) && value.length > 0;
    }).length;
    
    const totalOptional = optionalFields.length + arrayFields.length;
    const totalCompleted = completedOptional + completedArrays;
    
    return Math.round(((completedRequired / requiredFields.length) * 60) + ((totalCompleted / totalOptional) * 40));
  })();

  if (showWizard) {
    return (
      <UserProfileWizard
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
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">User Profile</h1>
              <p className="text-muted-foreground">
                {profile.is_complete ? 'Profile complete' : `${completionPercentage}% complete`}
              </p>
            </div>
          </div>
          {profile.is_complete && (
            <Badge variant="secondary" className="bg-accent text-accent-foreground">
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
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Basic personal and contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              {isEditing ? (
                <Input
                  id="full_name"
                  value={profile.full_name}
                  onChange={(e) => updateField('full_name', e.target.value)}
                  placeholder="Enter your full name"
                />
              ) : (
                <p className="py-2 px-3 border rounded-md bg-muted/30">{profile.full_name || 'Not specified'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin_profile">LinkedIn Profile</Label>
              {isEditing ? (
                <Input
                  id="linkedin_profile"
                  type="url"
                  value={profile.linkedin_profile || ''}
                  onChange={(e) => updateField('linkedin_profile', e.target.value)}
                  placeholder="https://linkedin.com/in/your-profile"
                />
              ) : (
                <p className="py-2 px-3 border rounded-md bg-muted/30">
                  {profile.linkedin_profile ? (
                    <a href={profile.linkedin_profile} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {profile.linkedin_profile}
                    </a>
                  ) : 'Not specified'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_location">Current Location</Label>
              {isEditing ? (
                <Input
                  id="current_location"
                  value={profile.current_location || ''}
                  onChange={(e) => updateField('current_location', e.target.value)}
                  placeholder="e.g., Amsterdam, Netherlands"
                />
              ) : (
                <p className="py-2 px-3 border rounded-md bg-muted/30">{profile.current_location || 'Not specified'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthplace">Birthplace/Hometown</Label>
              {isEditing ? (
                <Input
                  id="birthplace"
                  value={profile.birthplace || ''}
                  onChange={(e) => updateField('birthplace', e.target.value)}
                  placeholder="e.g., Oslo, Norway"
                />
              ) : (
                <p className="py-2 px-3 border rounded-md bg-muted/30">{profile.birthplace || 'Not specified'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              {isEditing ? (
                <Input
                  id="date_of_birth"
                  type="date"
                  value={profile.date_of_birth || ''}
                  onChange={(e) => updateField('date_of_birth', e.target.value)}
                />
              ) : (
                <p className="py-2 px-3 border rounded-md bg-muted/30">{profile.date_of_birth || 'Not specified'}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Professional Role */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Role</CardTitle>
            <CardDescription>Your role and experience level</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role_in_organization">Role in Organization *</Label>
              {isEditing ? (
                <Select value={profile.role_in_organization} onValueChange={(value) => updateField('role_in_organization', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ceo-founder">CEO/Founder</SelectItem>
                    <SelectItem value="sales-director">Sales Director/Manager</SelectItem>
                    <SelectItem value="business-development">Business Development Manager</SelectItem>
                    <SelectItem value="marketing-director">Marketing Director/Manager</SelectItem>
                    <SelectItem value="operations-manager">Operations Manager</SelectItem>
                    <SelectItem value="partner">Partner/Co-founder</SelectItem>
                    <SelectItem value="consultant">Consultant/Advisor</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="py-2 px-3 border rounded-md bg-muted/30">{profile.role_in_organization || 'Not specified'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Outreach Experience</Label>
              {isEditing ? (
                <RadioGroup 
                  value={profile.outreach_experience} 
                  onValueChange={(value) => updateField('outreach_experience', value)}
                  className="grid grid-cols-1 gap-2 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="new" id="exp-new" />
                    <Label htmlFor="exp-new">New (less than 1 year)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="beginner" id="exp-beginner" />
                    <Label htmlFor="exp-beginner">Beginner (1-2 years)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="experienced" id="exp-experienced" />
                    <Label htmlFor="exp-experienced">Experienced (3-5 years)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="expert" id="exp-expert" />
                    <Label htmlFor="exp-expert">Expert (5+ years)</Label>
                  </div>
                </RadioGroup>
              ) : (
                <p className="py-2 px-3 border rounded-md bg-muted/30">{profile.outreach_experience || 'Not specified'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Prospects per Week</Label>
              {isEditing ? (
                <RadioGroup 
                  value={profile.prospects_per_week} 
                  onValueChange={(value) => updateField('prospects_per_week', value)}
                  className="grid grid-cols-1 gap-2 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1-5" id="prospects-1-5" />
                    <Label htmlFor="prospects-1-5">1-5</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="6-15" id="prospects-6-15" />
                    <Label htmlFor="prospects-6-15">6-15</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="16-30" id="prospects-16-30" />
                    <Label htmlFor="prospects-16-30">16-30</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="30+" id="prospects-30-plus" />
                    <Label htmlFor="prospects-30-plus">30+</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="variable" id="prospects-variable" />
                    <Label htmlFor="prospects-variable">Variable</Label>
                  </div>
                </RadioGroup>
              ) : (
                <p className="py-2 px-3 border rounded-md bg-muted/30">{profile.prospects_per_week || 'Not specified'}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Communication Style */}
        <Card>
          <CardHeader>
            <CardTitle>Communication Style</CardTitle>
            <CardDescription>How you prefer to communicate and approach prospects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Communication Style *</Label>
              {isEditing ? (
                <RadioGroup 
                  value={profile.communication_style} 
                  onValueChange={(value) => updateField('communication_style', value)}
                  className="grid grid-cols-1 gap-2 mt-2"
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
                    <RadioGroupItem value="consultative" id="comm-consultative" />
                    <Label htmlFor="comm-consultative">Consultative & advisory</Label>
                  </div>
                </RadioGroup>
              ) : (
                <p className="py-2 px-3 border rounded-md bg-muted/30">{profile.communication_style || 'Not specified'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Introduction Style</Label>
              {isEditing ? (
                <RadioGroup 
                  value={profile.introduction_style} 
                  onValueChange={(value) => updateField('introduction_style', value)}
                  className="grid grid-cols-1 gap-2 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="direct-help" id="intro-direct" />
                    <Label htmlFor="intro-direct">"Hi [name], I'm [your name] from [company]. We help..."</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="observation" id="intro-observation" />
                    <Label htmlFor="intro-observation">"Hello [name], I noticed you're working on..."</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="interest" id="intro-interest" />
                    <Label htmlFor="intro-interest">"Hi [name], I thought this might be interesting..."</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="based-on" id="intro-based" />
                    <Label htmlFor="intro-based">"Dear [name], based on your [observation]..."</Label>
                  </div>
                </RadioGroup>
              ) : (
                <p className="py-2 px-3 border rounded-md bg-muted/30">{profile.introduction_style || 'Not specified'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Preferred Contact Channels</Label>
              {isEditing ? (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {[
                    'LinkedIn message',
                    'Email outreach',
                    'Phone call',
                    'Referral introduction',
                    'Social media',
                    'Event/networking'
                  ].map(channel => (
                    <div key={channel} className="flex items-center space-x-2">
                      <Checkbox
                        id={`channel-${channel}`}
                        checked={profile.preferred_contact_channel.includes(channel)}
                        onCheckedChange={(checked) => handleArrayField('preferred_contact_channel', channel, checked as boolean)}
                      />
                      <Label htmlFor={`channel-${channel}`} className="text-sm">{channel}</Label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-2 px-3 border rounded-md bg-muted/30 min-h-[40px]">
                  {profile.preferred_contact_channel.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {profile.preferred_contact_channel.map((channel, index) => (
                        <Badge key={index} variant="secondary">{channel}</Badge>
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

        {/* Outreach Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Outreach Preferences</CardTitle>
            <CardDescription>Your preferences for follow-up and contact approach</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Follow-up Timing Preference</Label>
              {isEditing ? (
                <RadioGroup 
                  value={profile.followup_timing} 
                  onValueChange={(value) => updateField('followup_timing', value)}
                  className="grid grid-cols-1 gap-2 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="quick" id="timing-quick" />
                    <Label htmlFor="timing-quick">Quick & persistent (within 3 days)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="moderate" id="timing-moderate" />
                    <Label htmlFor="timing-moderate">Moderate & respectful (within 1 week)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="patient" id="timing-patient" />
                    <Label htmlFor="timing-patient">Patient & strategic (within 2 weeks)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="varies" id="timing-varies" />
                    <Label htmlFor="timing-varies">Varies per prospect</Label>
                  </div>
                </RadioGroup>
              ) : (
                <p className="py-2 px-3 border rounded-md bg-muted/30">{profile.followup_timing || 'Not specified'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Non-response Handling</Label>
              {isEditing ? (
                <RadioGroup 
                  value={profile.nonresponse_handling} 
                  onValueChange={(value) => updateField('nonresponse_handling', value)}
                  className="grid grid-cols-1 gap-2 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="persistent" id="response-persistent" />
                    <Label htmlFor="response-persistent">Multiple follow-ups until clear 'no'</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="moderate" id="response-moderate" />
                    <Label htmlFor="response-moderate">2-3 attempts then move on</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="minimal" id="response-minimal" />
                    <Label htmlFor="response-minimal">1 follow-up then stop</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="depends" id="response-depends" />
                    <Label htmlFor="response-depends">Depends on prospect value/fit</Label>
                  </div>
                </RadioGroup>
              ) : (
                <p className="py-2 px-3 border rounded-md bg-muted/30">{profile.nonresponse_handling || 'Not specified'}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Value Proposition & Messaging */}
        <Card>
          <CardHeader>
            <CardTitle>Value Proposition & Messaging</CardTitle>
            <CardDescription>How you position your expertise and handle objections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Pain Points Usually Addressed First</Label>
              {isEditing ? (
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {[
                    'Cost/efficiency issues',
                    'Growth/scaling challenges',
                    'Technology/digital gaps',
                    'Compliance/risk issues',
                    'Process/operational friction',
                    'Team/organizational challenges',
                    'Customer experience problems'
                  ].map(pain => (
                    <div key={pain} className="flex items-center space-x-2">
                      <Checkbox
                        id={`pain-${pain}`}
                        checked={profile.pain_points_focus.includes(pain)}
                        onCheckedChange={(checked) => handleArrayField('pain_points_focus', pain, checked as boolean)}
                      />
                      <Label htmlFor={`pain-${pain}`} className="text-sm">{pain}</Label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-2 px-3 border rounded-md bg-muted/30 min-h-[40px]">
                  {profile.pain_points_focus.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {profile.pain_points_focus.map((pain, index) => (
                        <Badge key={index} variant="secondary">{pain}</Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Not specified</span>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Expertise Positioning</Label>
              {isEditing ? (
                <RadioGroup 
                  value={profile.expertise_positioning} 
                  onValueChange={(value) => updateField('expertise_positioning', value)}
                  className="grid grid-cols-1 gap-2 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="specialist" id="pos-specialist" />
                    <Label htmlFor="pos-specialist">As industry specialist/expert</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="problem-solver" id="pos-problem" />
                    <Label htmlFor="pos-problem">As problem solver/consultant</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="partner" id="pos-partner" />
                    <Label htmlFor="pos-partner">As strategic partner/advisor</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="innovator" id="pos-innovator" />
                    <Label htmlFor="pos-innovator">As innovative solution provider</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="implementer" id="pos-implementer" />
                    <Label htmlFor="pos-implementer">As results-driven implementer</Label>
                  </div>
                </RadioGroup>
              ) : (
                <p className="py-2 px-3 border rounded-md bg-muted/30">{profile.expertise_positioning || 'Not specified'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Objection Handling Approach</Label>
              {isEditing ? (
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {[
                    'Address upfront in initial message',
                    'Respond when objections arise',
                    'Use social proof to preempt',
                    'Ask questions to understand concerns',
                    'Provide alternatives/flexibility'
                  ].map(approach => (
                    <div key={approach} className="flex items-center space-x-2">
                      <Checkbox
                        id={`objection-${approach}`}
                        checked={profile.objection_handling.includes(approach)}
                        onCheckedChange={(checked) => handleArrayField('objection_handling', approach, checked as boolean)}
                      />
                      <Label htmlFor={`objection-${approach}`} className="text-sm">{approach}</Label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-2 px-3 border rounded-md bg-muted/30 min-h-[40px]">
                  {profile.objection_handling.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {profile.objection_handling.map((approach, index) => (
                        <Badge key={index} variant="secondary">{approach}</Badge>
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

        {/* Meeting & Conversion Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Meeting & Conversion Preferences</CardTitle>
            <CardDescription>Your preferences for meetings and success tracking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Preferred Meeting Format</Label>
              {isEditing ? (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {[
                    'Video call (Teams/Zoom)',
                    'Phone call',
                    'In-person meeting',
                    'Coffee meeting (informal)',
                    "Prospect's office visit",
                    'Flexible - prospect choice'
                  ].map(format => (
                    <div key={format} className="flex items-center space-x-2">
                      <Checkbox
                        id={`meeting-${format}`}
                        checked={profile.meeting_format.includes(format)}
                        onCheckedChange={(checked) => handleArrayField('meeting_format', format, checked as boolean)}
                      />
                      <Label htmlFor={`meeting-${format}`} className="text-sm">{format}</Label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-2 px-3 border rounded-md bg-muted/30 min-h-[40px]">
                  {profile.meeting_format.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {profile.meeting_format.map((format, index) => (
                        <Badge key={index} variant="outline">{format}</Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Not specified</span>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Typical Meeting Duration</Label>
              {isEditing ? (
                <RadioGroup 
                  value={profile.meeting_duration} 
                  onValueChange={(value) => updateField('meeting_duration', value)}
                  className="grid grid-cols-1 gap-2 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="15-30" id="duration-15-30" />
                    <Label htmlFor="duration-15-30">15-30 minutes (quick qualification)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="30-45" id="duration-30-45" />
                    <Label htmlFor="duration-30-45">30-45 minutes (standard discovery)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="45-60" id="duration-45-60" />
                    <Label htmlFor="duration-45-60">45-60 minutes (deep dive)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="60+" id="duration-60-plus" />
                    <Label htmlFor="duration-60-plus">60+ minutes (comprehensive)</Label>
                  </div>
                </RadioGroup>
              ) : (
                <p className="py-2 px-3 border rounded-md bg-muted/30">{profile.meeting_duration || 'Not specified'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Success Metrics for Outreach</Label>
              {isEditing ? (
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {[
                    'Response rate %',
                    'Meeting booking rate %',
                    'Qualified opportunities',
                    'Conversion to proposal',
                    'Closed deals',
                    'All of the above'
                  ].map(metric => (
                    <div key={metric} className="flex items-center space-x-2">
                      <Checkbox
                        id={`metric-${metric}`}
                        checked={profile.success_metrics.includes(metric)}
                        onCheckedChange={(checked) => handleArrayField('success_metrics', metric, checked as boolean)}
                      />
                      <Label htmlFor={`metric-${metric}`} className="text-sm">{metric}</Label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-2 px-3 border rounded-md bg-muted/30 min-h-[40px]">
                  {profile.success_metrics.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {profile.success_metrics.map((metric, index) => (
                        <Badge key={index} variant="secondary">{metric}</Badge>
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
      
      {/* Credits Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            Credits & History
          </CardTitle>
          <CardDescription>View your current credit balance and usage history</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Available Credits</p>
              <p className="text-3xl font-bold">{profile.credits || 0}</p>
            </div>
            <Button
              onClick={() => setShowCreditPurchase(true)}
              variant="default"
              className="gap-2"
            >
              <Coins className="h-4 w-4" />
              Buy Credits
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-base font-semibold">Recent Transactions</Label>
            {loadingHistory ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : creditHistory.length > 0 ? (
              <div className="space-y-2">
                {creditHistory.map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString()} at{' '}
                        {new Date(transaction.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge 
                      variant={transaction.amount < 0 ? "destructive" : "default"}
                      className="ml-4"
                    >
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4">No credit transactions yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Credit Purchase Dialog */}
      <CreditPurchaseDialog
        open={showCreditPurchase}
        onOpenChange={setShowCreditPurchase}
        currentCredits={profile?.credits || 0}
      />
    </div>
  );
}