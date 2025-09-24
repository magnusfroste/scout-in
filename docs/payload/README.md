# Enhanced Payload Structure Documentation

This document describes the enhanced webhook payload structure used by the Research Engine to provide intelligent context and processing hints to the N8N workflow.

## Overview

The enhanced payload combines prospect data, user profiles, company profiles, and intelligent processing hints to enable context-aware AI analysis. This structure allows for personalized, adaptive research that adjusts based on user experience, company maturity, and specific focus areas.

## Complete Payload Structure

```typescript
interface EnhancedWebhookPayload {
  prospect_data: ProspectData;
  company_profile: CompanyProfile;
  user_profile: UserProfile;
  processing_hints: ProcessingHints;
  metadata: PayloadMetadata;
}
```

## Core Data Components

### 1. Prospect Data
```typescript
interface ProspectData {
  company_name: string;
  website_url: string;
  research_type: 'quick' | 'standard' | 'deep';
  notes?: string;
}
```

**Purpose**: Basic information about the target company being researched.

### 2. Company Profile
```typescript
interface CompanyProfile {
  company_name: string;
  website_url?: string;
  industry: string;
  company_size: string;
  years_active: number;
  target_market: string;
  core_services: string[];
  unique_differentiators: string[];
  credentials_certifications: string[];
  typical_results: string[];
  // Additional profile fields...
}
```

**Purpose**: Complete profile of the research requestor's company, used for strategic alignment analysis.

### 3. User Profile  
```typescript
interface UserProfile {
  full_name: string;
  job_title: string;
  email: string;
  outreach_experience: string;
  communication_style: string;
  preferred_meeting_format: string;
  geographic_focus: string;
  pain_focus_areas: string[];
  // Additional profile fields...
}
```

**Purpose**: User's complete profile for personalizing analysis tone, depth, and recommendations.

## Intelligence Components

### 4. Processing Hints
```typescript
interface ProcessingHints {
  research_depth: 'quick' | 'standard' | 'deep';
  focus_areas: string[];
  communication_style: 'professional' | 'casual' | 'consultative';
  industry_context?: string;
  priority_level: 'low' | 'medium' | 'high';
}
```

**Purpose**: Intelligent processing guidance derived from user and company profiles.

#### Focus Areas
Possible values include:
- `decision_makers` - Enhanced decision-making structure analysis
- `pain_points` - Deep challenge identification and positioning
- `contact_info` - Prioritized contact strategy and personas
- `competitive_landscape` - Competitive positioning analysis
- `financial_health` - Business impact and ROI projections
- `growth_opportunities` - Strategic initiative alignment

#### Communication Style Derivation
```javascript
// Logic for determining communication style
function deriveCommunicationStyle(userProfile, companyProfile) {
  if (userProfile.communication_style?.includes('formal') || 
      companyProfile.company_size === 'Enterprise (500+)') {
    return 'professional';
  }
  if (companyProfile.company_size === 'Startup (1-10)' || 
      userProfile.communication_style?.includes('casual')) {
    return 'casual';
  }
  return 'consultative'; // default
}
```

### 5. Metadata
```typescript
interface PayloadMetadata {
  version: string;
  creator: string;
  processing_context: {
    user_experience_level: 'beginner' | 'intermediate' | 'expert';
    company_maturity: 'startup' | 'growth' | 'enterprise';
    target_market_focus: string;
  };
}
```

**Purpose**: Contextual information for analysis adaptation and personalization.

#### Experience Level Derivation
```javascript
function deriveExperienceLevel(outreachExperience) {
  const experience = outreachExperience?.toLowerCase() || '';
  if (experience.includes('new') || experience.includes('beginner') || 
      experience.includes('less than 1')) {
    return 'beginner';
  }
  if (experience.includes('expert') || experience.includes('senior') || 
      experience.includes('10+') || experience.includes('extensive')) {
    return 'expert';
  }
  return 'intermediate';
}
```

#### Company Maturity Derivation
```javascript
function deriveCompanyMaturity(companySize, yearsActive) {
  if (companySize?.includes('Startup') || yearsActive < 3) {
    return 'startup';
  }
  if (companySize?.includes('Enterprise') || yearsActive > 10) {
    return 'enterprise';
  }
  return 'growth';
}
```

## Payload Generation Process

### 1. Data Collection
- Fetch user profile from Supabase
- Fetch company profile from Supabase  
- Collect prospect data from user input

### 2. Intelligence Generation
- Generate focus areas based on research type and user preferences
- Derive communication style from profiles
- Determine experience level and company maturity
- Set priority level based on research type

### 3. Payload Assembly
```typescript
function enhanceWebhookPayload(
  prospectData: any, 
  companyProfile: any, 
  userProfile: any,
  researchId: string | null = null
): EnhancedWebhookPayload {
  const processing_hints = {
    research_depth: prospectData.research_type,
    focus_areas: generateFocusAreas(prospectData.research_type, userProfile, companyProfile),
    communication_style: deriveCommunicationStyle(userProfile, companyProfile),
    industry_context: companyProfile?.industry,
    priority_level: prospectData.research_type === 'deep' ? 'high' : 
                   prospectData.research_type === 'quick' ? 'low' : 'medium'
  };

  const metadata = {
    version: '1.0.0',
    creator: 'Research Engine v1.0',
    processing_context: {
      user_experience_level: deriveExperienceLevel(userProfile?.outreach_experience),
      company_maturity: deriveCompanyMaturity(companyProfile?.company_size, companyProfile?.years_active),
      target_market_focus: companyProfile?.target_market || 'General Market'
    }
  };

  return {
    prospect_data: prospectData,
    company_profile: companyProfile,
    user_profile: userProfile,
    processing_hints,
    metadata
  };
}
```

## Usage in N8N

### 1. Accessing Payload Data
```javascript
// In N8N nodes, access payload data:
const prospectName = $json.prospect_data.company_name;
const researchDepth = $json.processing_hints.research_depth;
const userExperience = $json.metadata.processing_context.user_experience_level;
const focusAreas = $json.processing_hints.focus_areas;
```

### 2. Dynamic Processing
```javascript
// Adapt processing based on hints:
if ($json.processing_hints.research_depth === 'quick') {
  // Use faster model, focus on key sections
} else if ($json.processing_hints.research_depth === 'deep') {
  // Use advanced model, comprehensive analysis
}

// Prioritize analysis sections:
const focusedSections = $json.processing_hints.focus_areas.includes('decision_makers') 
  ? ['organization_decision_making', 'contact_strategy'] 
  : ['strategic_fit', 'business_impact'];
```

## Validation and Error Handling

### 1. Required Fields Validation
```typescript
function validatePayload(payload: EnhancedWebhookPayload): boolean {
  return !!(
    payload.prospect_data?.company_name &&
    payload.prospect_data?.website_url &&
    payload.processing_hints?.research_depth &&
    payload.metadata?.version
  );
}
```

### 2. Default Value Handling
```typescript
// Provide sensible defaults for missing data
const safePayload = {
  ...payload,
  processing_hints: {
    research_depth: 'standard',
    focus_areas: ['strategic_fit', 'decision_makers'],
    communication_style: 'professional',
    priority_level: 'medium',
    ...payload.processing_hints
  }
};
```

## Best Practices

1. **Always Validate**: Check for required fields before sending payload
2. **Provide Defaults**: Handle missing profile data gracefully
3. **Version Tracking**: Include version in metadata for compatibility
4. **Context Preservation**: Maintain processing context throughout workflow
5. **Error Recovery**: Implement fallback strategies for missing intelligence data