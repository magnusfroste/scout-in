import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Save, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CompanyProfileData {
  // Section 1: Company Identity
  company_name: string;
  website_url: string;
  linkedin_url: string;
  business_registration: string;
  industry: string;
  years_active: string;
  company_size: string;
  
  // Section 2: Mission, Vision & Values
  mission: string;
  vision: string;
  values: string[];
  
  // Section 3: Offering & Proposition
  offering_type: string[];
  main_offerings: string[];
  unique_differentiators: string[];
  typical_results: string[];
  
  // Section 4: Target Market & Clients
  ideal_client_size: string[];
  target_industries: string[];
  project_scope: string;
  geographic_markets: string[];
  
  // Section 5: Market Positioning
  pricing_positioning: string;
  delivery_model: string[];
  
  // Section 6: Credibility & Social Proof
  success_story: string;
  known_clients: boolean;
  known_clients_list: string;
  credentials: string[];
  
  // Section 7: Organizational Culture
  organizational_personality: string[];
  communication_style: string;
}

interface CompanyProfileWizardProps {
  onSave: (data: CompanyProfileData) => void;
  onCancel: () => void;
  initialData?: Partial<CompanyProfileData>;
}

const TOTAL_STEPS = 7;

export const CompanyProfileWizard: React.FC<CompanyProfileWizardProps> = ({
  onSave,
  onCancel,
  initialData = {}
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CompanyProfileData>({
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
    success_story: '',
    known_clients: false,
    known_clients_list: '',
    credentials: [],
    organizational_personality: [],
    communication_style: '',
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
        ? [...(prev[field as keyof CompanyProfileData] as string[]), value]
        : (prev[field as keyof CompanyProfileData] as string[]).filter(item => item !== value)
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
    // Validate required fields
    const requiredFields = ['company_name', 'website_url', 'industry', 'years_active', 'company_size', 'mission'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof CompanyProfileData]);
    
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
                <Label htmlFor="company_name">Organization Name *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => updateField('company_name', e.target.value)}
                  placeholder="Enter your organization name"
                />
              </div>
              
              <div>
                <Label htmlFor="website_url">Website URL *</Label>
                <Input
                  id="website_url"
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => updateField('website_url', e.target.value)}
                  placeholder="https://your-website.com"
                />
              </div>
              
              <div>
                <Label htmlFor="linkedin_url">LinkedIn Company Page</Label>
                <Input
                  id="linkedin_url"
                  type="url"
                  value={formData.linkedin_url}
                  onChange={(e) => updateField('linkedin_url', e.target.value)}
                  placeholder="https://linkedin.com/company/your-company"
                />
              </div>
              
              <div>
                <Label htmlFor="business_registration">Business Registration Number</Label>
                <Input
                  id="business_registration"
                  value={formData.business_registration}
                  onChange={(e) => updateField('business_registration', e.target.value)}
                  placeholder="Chamber of Commerce ID or registration number"
                />
              </div>
              
              <div>
                <Label htmlFor="industry">Industry/Sector *</Label>
                <Select value={formData.industry} onValueChange={(value) => updateField('industry', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="professional-services">Professional Services</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="years_active">Years Active *</Label>
                <Select value={formData.years_active} onValueChange={(value) => updateField('years_active', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="How long has your organization been active?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="<1-year">Less than 1 year</SelectItem>
                    <SelectItem value="1-3-years">1-3 years</SelectItem>
                    <SelectItem value="4-10-years">4-10 years</SelectItem>
                    <SelectItem value="11-20-years">11-20 years</SelectItem>
                    <SelectItem value="20+-years">20+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Company Size *</Label>
                <RadioGroup 
                  value={formData.company_size} 
                  onValueChange={(value) => updateField('company_size', value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1-2" id="size-1-2" />
                    <Label htmlFor="size-1-2">1-2 people</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3-10" id="size-3-10" />
                    <Label htmlFor="size-3-10">3-10 people</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="11-25" id="size-11-25" />
                    <Label htmlFor="size-11-25">11-25 people</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="26-50" id="size-26-50" />
                    <Label htmlFor="size-26-50">26-50 people</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="51-100" id="size-51-100" />
                    <Label htmlFor="size-51-100">51-100 people</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="100+" id="size-100-plus" />
                    <Label htmlFor="size-100-plus">100+ people</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="mission">Core Mission *</Label>
                <Textarea
                  id="mission"
                  value={formData.mission}
                  onChange={(e) => updateField('mission', e.target.value)}
                  placeholder="We help [who] to [achieve what] through [how you do it]"
                  maxLength={200}
                  className="min-h-[100px]"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.mission.length}/200 characters
                </p>
              </div>
              
              <div>
                <Label htmlFor="vision">Vision (3-5 years)</Label>
                <Textarea
                  id="vision"
                  value={formData.vision}
                  onChange={(e) => updateField('vision', e.target.value)}
                  placeholder="Where do you want to be in 3-5 years?"
                  maxLength={150}
                  className="min-h-[80px]"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.vision.length}/150 characters
                </p>
              </div>
              
              <div>
                <Label>Company Values (Select up to 3)</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {['Integrity', 'Innovation', 'Customer Focus', 'Excellence', 'Collaboration', 'Transparency', 'Sustainability', 'Growth'].map(value => (
                    <div key={value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`value-${value}`}
                        checked={formData.values.includes(value)}
                        onCheckedChange={(checked) => handleArrayField('values', value, checked as boolean)}
                        disabled={!formData.values.includes(value) && formData.values.length >= 3}
                      />
                      <Label htmlFor={`value-${value}`} className="text-sm">{value}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Type of Offering</Label>
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
                        checked={formData.offering_type.includes(type)}
                        onCheckedChange={(checked) => handleArrayField('offering_type', type, checked as boolean)}
                      />
                      <Label htmlFor={`offering-${type}`} className="text-sm">{type}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label>Main Offerings (up to 3)</Label>
                {[0, 1, 2].map(index => (
                  <Input
                    key={index}
                    value={formData.main_offerings[index] || ''}
                    onChange={(e) => {
                      const newOfferings = [...formData.main_offerings];
                      newOfferings[index] = e.target.value;
                      updateField('main_offerings', newOfferings.filter(Boolean));
                    }}
                    placeholder={`Main offering ${index + 1}`}
                    className="mt-2"
                    maxLength={100}
                  />
                ))}
              </div>
              
              <div>
                <Label>What makes you unique? (Select all that apply)</Label>
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
                        checked={formData.unique_differentiators.includes(diff)}
                        onCheckedChange={(checked) => handleArrayField('unique_differentiators', diff, checked as boolean)}
                      />
                      <Label htmlFor={`diff-${diff}`} className="text-sm">{diff}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label>Typical Results Delivered</Label>
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
                        checked={formData.typical_results.includes(result)}
                        onCheckedChange={(checked) => handleArrayField('typical_results', result, checked as boolean)}
                      />
                      <Label htmlFor={`result-${result}`} className="text-sm">{result}</Label>
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
                <Label>Ideal Client Size</Label>
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
                        checked={formData.ideal_client_size.includes(size)}
                        onCheckedChange={(checked) => handleArrayField('ideal_client_size', size, checked as boolean)}
                      />
                      <Label htmlFor={`client-${size}`} className="text-sm">{size}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label>Target Industries</Label>
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
                        checked={formData.target_industries.includes(industry)}
                        onCheckedChange={(checked) => handleArrayField('target_industries', industry, checked as boolean)}
                      />
                      <Label htmlFor={`target-${industry}`} className="text-sm">{industry}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label>Typical Project/Engagement Scope</Label>
                <RadioGroup 
                  value={formData.project_scope} 
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
              </div>
              
              <div>
                <Label>Geographic Markets</Label>
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
                        checked={formData.geographic_markets.includes(market)}
                        onCheckedChange={(checked) => handleArrayField('geographic_markets', market, checked as boolean)}
                      />
                      <Label htmlFor={`geo-${market}`} className="text-sm">{market}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Pricing/Investment Level Positioning</Label>
                <RadioGroup 
                  value={formData.pricing_positioning} 
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
              </div>
              
              <div>
                <Label>Delivery/Service Model</Label>
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
                        checked={formData.delivery_model.includes(model)}
                        onCheckedChange={(checked) => handleArrayField('delivery_model', model, checked as boolean)}
                      />
                      <Label htmlFor={`delivery-${model}`} className="text-sm">{model}</Label>
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
                <Label htmlFor="success_story">Best Success Story</Label>
                <Textarea
                  id="success_story"
                  value={formData.success_story}
                  onChange={(e) => updateField('success_story', e.target.value)}
                  placeholder="For [type of client] we achieved [specific result] in [timeframe]"
                  maxLength={200}
                  className="min-h-[100px]"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.success_story.length}/200 characters
                </p>
              </div>
              
              <div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="known_clients"
                    checked={formData.known_clients}
                    onCheckedChange={(checked) => updateField('known_clients', checked)}
                  />
                  <Label htmlFor="known_clients">We have well-known clients/brands we can mention</Label>
                </div>
                
                {formData.known_clients && (
                  <Input
                    value={formData.known_clients_list}
                    onChange={(e) => updateField('known_clients_list', e.target.value)}
                    placeholder="List your notable clients"
                    className="mt-2"
                  />
                )}
              </div>
              
              <div>
                <Label>Credentials that strengthen credibility</Label>
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
                        checked={formData.credentials.includes(credential)}
                        onCheckedChange={(checked) => handleArrayField('credentials', credential, checked as boolean)}
                      />
                      <Label htmlFor={`cred-${credential}`} className="text-sm">{credential}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Organizational Personality</Label>
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
                        checked={formData.organizational_personality.includes(personality)}
                        onCheckedChange={(checked) => handleArrayField('organizational_personality', personality, checked as boolean)}
                      />
                      <Label htmlFor={`personality-${personality}`} className="text-sm">{personality}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label>Preferred Communication Style towards Clients</Label>
                <RadioGroup 
                  value={formData.communication_style} 
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
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const stepTitles = [
    'Company Identity',
    'Mission & Values',
    'Offerings & Proposition',
    'Target Market',
    'Market Positioning',
    'Credibility & Proof',
    'Culture & Style'
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Building2 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Company Profile Setup</h1>
          <p className="text-muted-foreground">
            Complete your company profile to enable personalized research
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Step {currentStep} of {TOTAL_STEPS}: {stepTitles[currentStep - 1]}</CardTitle>
              <CardDescription>
                Fill in the details for this section
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