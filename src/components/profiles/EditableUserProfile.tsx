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
import { User, Save, Edit, Check, X, Settings } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { UserProfileWizard } from '@/components/lab/UserProfileWizard';

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000000';

interface UserProfile {
  id?: string;
  full_name: string;
  linkedin_profile?: string;
  current_location?: string;
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
}

export function EditableUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('lab_user_profiles')
        .select('*')
        .eq('user_id', DEMO_USER_ID)
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
    if (!profile) return;

    try {
      setIsSaving(true);
      
      const profileData = {
        user_id: DEMO_USER_ID,
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
    setProfile({ ...profile, ...data });
    setShowWizard(false);
    
    // Auto-save the profile
    const profileData = {
      user_id: DEMO_USER_ID,
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
    const optionalFields = ['linkedin_profile', 'outreach_experience', 'prospects_per_week', 'introduction_style'];
    const completedOptional = optionalFields.filter(field => {
      const value = profile[field as keyof UserProfile];
      return Array.isArray(value) ? value.length > 0 : !!value;
    }).length;
    
    return Math.round(((completedRequired / requiredFields.length) * 70) + ((completedOptional / optionalFields.length) * 30));
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
            <CardDescription>Your preferences for follow-up and meeting formats</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="followup_timing">Follow-up Timing</Label>
              {isEditing ? (
                <Input
                  id="followup_timing"
                  value={profile.followup_timing}
                  onChange={(e) => updateField('followup_timing', e.target.value)}
                  placeholder="e.g., Quick & persistent, Moderate & respectful"
                />
              ) : (
                <p className="py-2 px-3 border rounded-md bg-muted/30">{profile.followup_timing || 'Not specified'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="meeting_duration">Meeting Duration</Label>
              {isEditing ? (
                <Input
                  id="meeting_duration"
                  value={profile.meeting_duration}
                  onChange={(e) => updateField('meeting_duration', e.target.value)}
                  placeholder="e.g., 15 minutes, 30 minutes, 1 hour"
                />
              ) : (
                <p className="py-2 px-3 border rounded-md bg-muted/30">{profile.meeting_duration || 'Not specified'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Meeting Formats</Label>
              {isEditing ? (
                <Input
                  value={profile.meeting_format.join(', ')}
                  onChange={(e) => updateField('meeting_format', e.target.value.split(', ').filter(Boolean))}
                  placeholder="e.g., Video call, In-person, Phone call"
                />
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}