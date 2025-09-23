import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Save, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserProfileData {
  // Personal Information
  full_name: string;
  linkedin_profile: string;
  current_location: string;
  birthplace: string;
  date_of_birth: string;
  
  // Role & Context
  role_in_organization: string;
  outreach_experience: string;
  prospects_per_week: string;
  
  // Communication Style & Personality
  communication_style: string;
  introduction_style: string;
  credibility_preference: string[];
  
  // Outreach Preferences
  preferred_contact_channel: string[];
  followup_timing: string;
  nonresponse_handling: string;
  
  // Value Proposition & Messaging
  pain_points_focus: string[];
  expertise_positioning: string;
  objection_handling: string[];
  
  // Meeting & Conversion Preferences
  meeting_format: string[];
  meeting_duration: string;
  success_metrics: string[];
}

interface UserProfileWizardProps {
  onSave: (data: UserProfileData) => void;
  onCancel: () => void;
  initialData?: Partial<UserProfileData>;
}

const TOTAL_STEPS = 6;

export const UserProfileWizard: React.FC<UserProfileWizardProps> = ({
  onSave,
  onCancel,
  initialData = {}
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<UserProfileData>({
    full_name: '',
    linkedin_profile: '',
    current_location: '',
    birthplace: '',
    date_of_birth: '',
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
    ...initialData
  });

  const { toast } = useToast();

  const progress = (currentStep / TOTAL_STEPS) * 100;

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayField = (field: string, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field as keyof UserProfileData] as string[]), value]
        : (prev[field as keyof UserProfileData] as string[]).filter(item => item !== value)
    }));
  };

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = () => {
    const requiredFields = ['full_name', 'role_in_organization', 'communication_style'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof UserProfileData]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields before saving.",
        variant: "destructive"
      });
      return;
    }

    onSave(formData);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => updateField('full_name', e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <Label htmlFor="linkedin_profile">LinkedIn Profile URL</Label>
                <Input
                  id="linkedin_profile"
                  type="url"
                  value={formData.linkedin_profile}
                  onChange={(e) => updateField('linkedin_profile', e.target.value)}
                  placeholder="https://linkedin.com/in/your-profile"
                />
              </div>
              
              <div>
                <Label htmlFor="current_location">Current City/Location</Label>
                <Input
                  id="current_location"
                  value={formData.current_location}
                  onChange={(e) => updateField('current_location', e.target.value)}
                  placeholder="e.g. Amsterdam, Netherlands"
                />
              </div>
              
              <div>
                <Label htmlFor="birthplace">Birthplace/Hometown (Optional)</Label>
                <Input
                  id="birthplace"
                  value={formData.birthplace}
                  onChange={(e) => updateField('birthplace', e.target.value)}
                  placeholder="For shared background connections"
                />
              </div>
              
              <div>
                <Label htmlFor="date_of_birth">Date of Birth (Optional)</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => updateField('date_of_birth', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="role_in_organization">Role within Organization *</Label>
                <Select value={formData.role_in_organization} onValueChange={(value) => updateField('role_in_organization', value)}>
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
              </div>
              
              <div>
                <Label>Outreach/Prospecting Experience</Label>
                <RadioGroup 
                  value={formData.outreach_experience} 
                  onValueChange={(value) => updateField('outreach_experience', value)}
                  className="mt-2"
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
              </div>
              
              <div>
                <Label>Prospects Approached per Week</Label>
                <RadioGroup 
                  value={formData.prospects_per_week} 
                  onValueChange={(value) => updateField('prospects_per_week', value)}
                  className="mt-2"
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
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Communication Style *</Label>
                <RadioGroup 
                  value={formData.communication_style} 
                  onValueChange={(value) => updateField('communication_style', value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="direct" id="comm-direct" />
                    <Label htmlFor="comm-direct">Direct & to-the-point (business first)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="relational" id="comm-relational" />
                    <Label htmlFor="comm-relational">Relational & personal (connection first)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="analytical" id="comm-analytical" />
                    <Label htmlFor="comm-analytical">Analytical & data-driven (facts first)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="inspiring" id="comm-inspiring" />
                    <Label htmlFor="comm-inspiring">Inspiring & visionary (possibilities first)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="consultative" id="comm-consultative" />
                    <Label htmlFor="comm-consultative">Consultative & advisory (questions first)</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <Label>Introduction Style</Label>
                <RadioGroup 
                  value={formData.introduction_style} 
                  onValueChange={(value) => updateField('introduction_style', value)}
                  className="mt-2"
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
                    <Label htmlFor="intro-interest">"Hi [name], I thought this might be interesting for you..."</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="based-on" id="intro-based" />
                    <Label htmlFor="intro-based">"Dear [name], based on your [observation]..."</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="recent-post" id="intro-post" />
                    <Label htmlFor="intro-post">"Hi [name], I saw your recent [post/update] about..."</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <Label>Credibility Building Preference</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {[
                    'Case studies & concrete examples',
                    'Methodology & frameworks',
                    'Team credentials & experience',
                    'Client testimonials & references',
                    'Industry awards & recognition',
                    'Personal expertise & track record'
                  ].map(pref => (
                    <div key={pref} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cred-${pref}`}
                        checked={formData.credibility_preference.includes(pref)}
                        onCheckedChange={(checked) => handleArrayField('credibility_preference', pref, checked as boolean)}
                      />
                      <Label htmlFor={`cred-${pref}`} className="text-sm">{pref}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Preferred Contact Channel</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {[
                    'LinkedIn message',
                    'Email outreach',
                    'Phone call',
                    'Referral introduction',
                    'Social media (Twitter, etc.)',
                    'Event/networking meeting'
                  ].map(channel => (
                    <div key={channel} className="flex items-center space-x-2">
                      <Checkbox
                        id={`channel-${channel}`}
                        checked={formData.preferred_contact_channel.includes(channel)}
                        onCheckedChange={(checked) => handleArrayField('preferred_contact_channel', channel, checked as boolean)}
                      />
                      <Label htmlFor={`channel-${channel}`} className="text-sm">{channel}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label>Follow-up Timing Preference</Label>
                <RadioGroup 
                  value={formData.followup_timing} 
                  onValueChange={(value) => updateField('followup_timing', value)}
                  className="mt-2"
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
              </div>
              
              <div>
                <Label>Non-response Handling</Label>
                <RadioGroup 
                  value={formData.nonresponse_handling} 
                  onValueChange={(value) => updateField('nonresponse_handling', value)}
                  className="mt-2"
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
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Pain Points Usually Addressed First</Label>
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
                        checked={formData.pain_points_focus.includes(pain)}
                        onCheckedChange={(checked) => handleArrayField('pain_points_focus', pain, checked as boolean)}
                      />
                      <Label htmlFor={`pain-${pain}`} className="text-sm">{pain}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label>Expertise Positioning</Label>
                <RadioGroup 
                  value={formData.expertise_positioning} 
                  onValueChange={(value) => updateField('expertise_positioning', value)}
                  className="mt-2"
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
              </div>
              
              <div>
                <Label>Objection Handling Approach</Label>
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
                        checked={formData.objection_handling.includes(approach)}
                        onCheckedChange={(checked) => handleArrayField('objection_handling', approach, checked as boolean)}
                      />
                      <Label htmlFor={`objection-${approach}`} className="text-sm">{approach}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Preferred Meeting Format</Label>
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
                        checked={formData.meeting_format.includes(format)}
                        onCheckedChange={(checked) => handleArrayField('meeting_format', format, checked as boolean)}
                      />
                      <Label htmlFor={`meeting-${format}`} className="text-sm">{format}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label>Typical Meeting Duration</Label>
                <RadioGroup 
                  value={formData.meeting_duration} 
                  onValueChange={(value) => updateField('meeting_duration', value)}
                  className="mt-2"
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
              </div>
              
              <div>
                <Label>Success Metrics for Outreach</Label>
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
                        checked={formData.success_metrics.includes(metric)}
                        onCheckedChange={(checked) => handleArrayField('success_metrics', metric, checked as boolean)}
                      />
                      <Label htmlFor={`metric-${metric}`} className="text-sm">{metric}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const stepTitles = [
    'Personal Information',
    'Role & Experience',
    'Communication Style',
    'Outreach Preferences',
    'Value Proposition',
    'Meeting Preferences'
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <User className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">User Profile Setup</h1>
          <p className="text-muted-foreground">
            Configure your personal research and outreach preferences
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Step {currentStep} of {TOTAL_STEPS}: {stepTitles[currentStep - 1]}</CardTitle>
              <CardDescription>
                Fill in your personal preferences for this section
              </CardDescription>
            </div>
            <div className="text-sm text-muted-foreground">
              {Math.round(progress)}% complete
            </div>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
        
        <CardContent>
          {renderStep()}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={currentStep === 1 ? onCancel : prevStep}
          className="flex items-center gap-2"
        >
          {currentStep === 1 ? (
            "Cancel"
          ) : (
            <>
              <ArrowLeft className="h-4 w-4" />
              Previous
            </>
          )}
        </Button>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Draft
          </Button>
          
          {currentStep < TOTAL_STEPS ? (
            <Button onClick={nextStep} className="flex items-center gap-2">
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Complete Profile
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};