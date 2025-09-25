export interface ProcessingHints {
  research_depth: 'standard' | 'quick' | 'deep';
  focus_areas: string[];
  communication_style: 'professional' | 'casual' | 'consultative';
  industry_context?: string;
  priority_level: 'normal' | 'high' | 'urgent';
}

export interface PayloadMetadata {
  payload_version: string;
  created_by: string;
  processing_context: {
    user_experience_level: 'beginner' | 'intermediate' | 'expert';
    company_maturity: 'startup' | 'growth' | 'enterprise';
    target_market_focus: string[];
  };
}

export interface EnhancedWebhookPayload {
  prospect_data: {
    company_name: string;
    website_url: string;
    linkedin_url: string;
    research_type: string;
    notes: string;
  };
  company_profile: any;
  user_profile: any;
  timestamp: string;
  research_id: string | null;
  processing_hints: ProcessingHints;
  metadata: PayloadMetadata;
}

/**
 * Enhances the webhook payload with intelligent processing hints for n8n workflows
 */
export function enhanceWebhookPayload(
  prospectData: any,
  companyProfile: any,
  userProfile: any,
  researchId: string | null = null
): EnhancedWebhookPayload {
  const researchType = prospectData.research_type || 'standard';
  
  // Generate processing hints based on research type and profiles
  const processingHints: ProcessingHints = {
    research_depth: researchType as 'standard' | 'quick' | 'deep',
    focus_areas: generateFocusAreas(researchType, companyProfile, userProfile),
    communication_style: deriveCommunicationStyle(companyProfile, userProfile),
    industry_context: companyProfile?.industry?.toLowerCase(),
    priority_level: researchType === 'quick' ? 'high' : 'normal'
  };

  // Generate metadata with context
  const metadata: PayloadMetadata = {
    payload_version: '2.0',
    created_by: 'lovable_research_app',
    processing_context: {
      user_experience_level: deriveExperienceLevel(userProfile),
      company_maturity: deriveCompanyMaturity(companyProfile),
      target_market_focus: companyProfile?.target_industries || []
    }
  };

  return {
    prospect_data: {
      company_name: prospectData.company_name,
      website_url: prospectData.website_url,
      linkedin_url: prospectData.linkedin_url,
      research_type: researchType,
      notes: prospectData.notes || ''
    },
    company_profile: companyProfile,
    user_profile: userProfile,
    timestamp: new Date().toISOString(),
    research_id: researchId,
    processing_hints: processingHints,
    metadata
  };
}

function generateFocusAreas(researchType: string, companyProfile: any, userProfile: any): string[] {
  const baseFocusAreas = ['decision_makers', 'pain_points'];
  
  switch (researchType) {
    case 'quick':
      return [...baseFocusAreas, 'contact_info'];
    case 'deep':
      return [...baseFocusAreas, 'competitive_landscape', 'financial_health', 'growth_opportunities'];
    default: // standard
      return [...baseFocusAreas, 'business_fit', 'value_proposition_alignment'];
  }
}

function deriveCommunicationStyle(companyProfile: any, userProfile: any): 'professional' | 'casual' | 'consultative' {
  const userCommStyle = userProfile?.communication_style?.toLowerCase() || '';
  const companyCommStyle = companyProfile?.communication_style?.toLowerCase() || '';
  
  if (userCommStyle.includes('casual') || companyCommStyle.includes('casual')) {
    return 'casual';
  }
  if (userCommStyle.includes('consultative') || companyCommStyle.includes('consultative')) {
    return 'consultative';
  }
  return 'professional';
}

function deriveExperienceLevel(userProfile: any): 'beginner' | 'intermediate' | 'expert' {
  const experience = userProfile?.outreach_experience?.toLowerCase() || '';
  
  if (experience.includes('expert') || experience.includes('5+ years') || experience.includes('advanced')) {
    return 'expert';
  }
  if (experience.includes('intermediate') || experience.includes('2-5 years') || experience.includes('some')) {
    return 'intermediate';
  }
  return 'beginner';
}

function deriveCompanyMaturity(companyProfile: any): 'startup' | 'growth' | 'enterprise' {
  const yearsActive = companyProfile?.years_active || '';
  const companySize = companyProfile?.company_size?.toLowerCase() || '';
  
  if (companySize.includes('large') || companySize.includes('enterprise') || yearsActive.includes('10+')) {
    return 'enterprise';
  }
  if (companySize.includes('medium') || yearsActive.includes('3-10') || yearsActive.includes('5-10')) {
    return 'growth';
  }
  return 'startup';
}