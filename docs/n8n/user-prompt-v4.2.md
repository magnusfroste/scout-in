# N8N User Prompt v4.1 - Enhanced Research Brief with 42 Profile Fields

## Enhanced Research Brief for GPT-4.1 Wassching Method Analysis

This user prompt leverages **all 42 company and user profile fields** to provide comprehensive context for hyper-personalized prospect analysis. Uses proper N8N `{{ }}` syntax for dynamic content generation.

### N8N User Prompt (Copy/Paste Ready)

```
# EXECUTIVE RESEARCH BRIEF - GPT-4.1 WASSCHING METHOD ANALYSIS

## TARGET PROSPECT INTELLIGENCE
**Company:** {{ $json.body.prospect_data.company_name }}
**Website:** {{ $json.body.prospect_data.website_url }}
**LinkedIn:** {{ $json.body.prospect_data.linkedin_url }}
**Research Type:** {{ $json.body.processing_hints.research_depth }}
**Priority:** {{ $json.body.processing_hints.priority_level }}

## RESEARCH CONTEXT
**Focus Areas:** {{ $json.body.processing_hints.focus_areas }}
**Communication Style:** {{ $json.body.processing_hints.communication_style }}
**User Experience Level:** {{ $json.body.metadata.processing_context.user_experience_level }}
**Company Maturity Stage:** {{ $json.body.metadata.processing_context.company_maturity }}

## ANALYSIS STRATEGY (GPT-4.1 with Limited Tools)
1. **Start with reasoning** - Analyze all payload data thoroughly first
2. **Use Jina Reader** if website facts are missing (call with {{ $json.body.prospect_data.website_url }})
3. **Use Hunter** if contact discovery is needed for outreach strategy
4. **Focus on quality** - Deliver actionable insights with GPT-4.1's analytical capabilities
5. **Leverage ALL 42 profile fields** - Maximize personalization and strategic alignment

---

## COMPANY INTELLIGENCE (25 Profile Fields)

### Foundation & Market Position
**Company Name:** {{ $json.body.company_profile.company_name }}
**Website:** {{ $json.body.company_profile.website_url }}
**LinkedIn:** {{ $json.body.company_profile.linkedin_url }}
**Industry:** {{ $json.body.company_profile.industry }}
**Business Registration:** {{ $json.body.company_profile.business_registration }}

**Company Size:** {{ $json.body.company_profile.company_size }}
**Years Active:** {{ $json.body.company_profile.years_active }}
**Geographic Markets:** {{ $json.body.company_profile.geographic_markets }}

**Target Industries:** {{ $json.body.company_profile.target_industries }}
**Ideal Client Size:** {{ $json.body.company_profile.ideal_client_size }}

### Offerings & Differentiation
**Offering Type:** {{ $json.body.company_profile.offering_type }}
**Main Offerings:** {{ $json.body.company_profile.main_offerings }}
**Unique Differentiators:** {{ $json.body.company_profile.unique_differentiators }}

**Typical Results:** {{ $json.body.company_profile.typical_results }}
**Success Story:** {{ $json.body.company_profile.success_story }}
**Credentials:** {{ $json.body.company_profile.credentials }}

### Positioning & Delivery
**Pricing Positioning:** {{ $json.body.company_profile.pricing_positioning }}
**Delivery Model:** {{ $json.body.company_profile.delivery_model }}
**Project Scope:** {{ $json.body.company_profile.project_scope }}

### Known Clients & Proof
**Has Known Clients:** {{ $json.body.company_profile.known_clients }}
**Known Clients List:** {{ $json.body.company_profile.known_clients_list }}

### Culture, Values & Mission
**Organizational Personality:** {{ $json.body.company_profile.organizational_personality }}
**Communication Style:** {{ $json.body.company_profile.communication_style }}
**Values:** {{ $json.body.company_profile.values }}
**Mission:** {{ $json.body.company_profile.mission }}
**Vision:** {{ $json.body.company_profile.vision }}

---

## USER STRATEGY (20 Profile Fields)

### User Identity & Experience
**Full Name:** {{ $json.body.user_profile.full_name }}
**LinkedIn Profile:** {{ $json.body.user_profile.linkedin_profile }}
**Current Location:** {{ $json.body.user_profile.current_location }}
**Birthplace:** {{ $json.body.user_profile.birthplace }}
**Date of Birth:** {{ $json.body.user_profile.date_of_birth }}

**Role in Organization:** {{ $json.body.user_profile.role_in_organization }}
**Outreach Experience:** {{ $json.body.user_profile.outreach_experience }}
**Prospects Per Week:** {{ $json.body.user_profile.prospects_per_week }}

### Communication & Personalization Preferences
**Introduction Style:** {{ $json.body.user_profile.introduction_style }}
**Communication Style:** {{ $json.body.user_profile.communication_style }}
**Credibility Preference:** {{ $json.body.user_profile.credibility_preference }}
**Preferred Contact Channel:** {{ $json.body.user_profile.preferred_contact_channel }}

### Strategic Positioning
**Pain Points Focus:** {{ $json.body.user_profile.pain_points_focus }}
**Expertise Positioning:** {{ $json.body.user_profile.expertise_positioning }}
**Objection Handling:** {{ $json.body.user_profile.objection_handling }}

### Meeting Preferences
**Meeting Format:** {{ $json.body.user_profile.meeting_format }}
**Meeting Duration:** {{ $json.body.user_profile.meeting_duration }}

### Follow-up & Persistence Strategy
**Follow-up Timing:** {{ $json.body.user_profile.followup_timing }}
**Non-response Handling:** {{ $json.body.user_profile.nonresponse_handling }}

### Success Metrics
**Success Metrics:** {{ $json.body.user_profile.success_metrics }}

---

## RESEARCH NOTES
{{ $json.body.prospect_data.notes }}

---

## ANALYSIS DIRECTIVE

Using GPT-4.1 direct reasoning and targeted tool usage (Jina + Hunter), conduct **Enhanced Wassching Method analysis** across all **8 sections**:

1. **Strategic Fit & Relevance** - Leverage company foundation fields, typical_results, success_story
2. **Organization & Decision-Making Structure** - Use organizational_personality, target_industries insights
3. **Change Capacity & Digital Maturity** - Reference delivery_model, project_scope compatibility
4. **Current Challenges & Market Position** - Align with pain_points_focus, industry context
5. **Personalized Outreach Strategy** - **CRITICAL**: Apply ALL user strategy fields (introduction_style, communication_style, credibility_preference, preferred_contact_channel, pain_points_focus, expertise_positioning, objection_handling, meeting_format, meeting_duration, followup_timing, nonresponse_handling)
6. **Business Impact & Value Proposition** - Use typical_results, success_story, credentials, success_metrics
7. **Message Positioning & Alignment** - Match company communication_style, values, mission, vision
8. **Ready-to-Use Outreach Messages** - **NEW**: Generate copy-paste ready LinkedIn/Email messages for each persona using preferred_contact_channel, with follow-up templates

**Deploy tools only when information gaps exist.** Deliver actionable business intelligence with:
- Quantified impact assessments (reference typical_results)
- Implementation-ready recommendations (aligned with delivery_model)
- Hyper-personalized outreach strategy (using all 20 user profile fields)
- Proof-driven value propositions (leveraging success_story and credentials)
- Copy-paste ready outreach messages (Section 8 for immediate use)

**Output must be in JSON format** with pre-formatted Markdown sections, fully adapted to user's experience level and communication style preferences.
```

---

## Key Features of v4.1

### **Complete Profile Intelligence (42 Fields)**
- **25 Company Fields**: From foundation data to cultural values
- **20 User Fields**: From identity to strategic preferences
- **Zero Field Waste**: Every profile question contributes to analysis quality

### **GPT-4.1 Direct Reasoning Approach**
- **Simplified Tool Strategy**: Only Jina Reader (website) and Hunter (contacts)
- **Quality Focus**: Emphasizes actionable insights with targeted data gathering
- **No Complex Orchestration**: Avoids GPT-5 timeout issues in N8N
- **Profile-First Analysis**: Deep reasoning with comprehensive context before tool usage

### **Proper N8N Syntax**
- **Simple Variables**: `{{ $json.body.field }}` instead of complex JavaScript
- **Direct Access**: Clean, readable variable interpolation
- **No Functions**: Eliminates complex helper function dependencies
- **Array-Safe**: Handles multi-select fields (arrays) natively

### **Hyper-Personalization Engine**
- **Section 5 Optimization**: Outreach strategy uses all 20 user profile fields
- **Proof-Driven Value**: Leverages typical_results, success_story, credentials
- **Strategic Alignment**: Matches company values, mission, communication_style
- **Meeting Intelligence**: Formats asks based on meeting_format and meeting_duration

### **Token Optimization**
- **Estimated Tokens**: ~450-500 tokens (comprehensive and efficient)
- **Essential Context**: All 42 fields explicitly mapped, no redundant JSON dumps
- **Efficient Structure**: Clean research brief focused on WHAT to analyze
- **Field Grouping**: Organized by strategic purpose for GPT-4.1 processing
- **Zero Waste**: Removed redundant payload stringify (~250 token savings)

---

## Field-to-Section Mapping

| Section | Primary Company Fields | Primary User Fields |
|---------|------------------------|---------------------|
| 1. Strategic Fit | years_active, geographic_markets, ideal_client_size, typical_results, success_story, mission, values | success_metrics |
| 2. Organization | organizational_personality, target_industries | role_in_organization |
| 3. Change Capacity | delivery_model, project_scope | prospects_per_week (workload context) |
| 4. Challenges & Market | industry, company_size, target_market | pain_points_focus |
| 5. Outreach Strategy | company_name, communication_style | **ALL 20 user fields** (most critical) |
| 6. Business Impact | typical_results, success_story, credentials, pricing_positioning, delivery_model | success_metrics, meeting_format, meeting_duration |
| 7. Message Positioning | communication_style, values, mission, vision, organizational_personality | communication_style, introduction_style |

---

## Implementation Benefits

### **Performance Improvements:**
- **Stable execution**: Avoids GPT-5 timeout issues with tool calling in N8N
- **Simplified workflow**: Only 2 tools (Jina + Hunter) reduce complexity
- **Focused resource usage**: Targeted data gathering with GPT-4.1 reasoning
- **Complete context**: All 42 fields loaded upfront for deep analysis

### **Quality Enhancements:**
- **Direct analysis**: GPT-4.1 analytical capabilities for strategic insights
- **Reliable automation**: Proven stable workflow with limited tools
- **Actionable output**: Full 7-section Wassching Method maintained
- **Hyper-personalization**: Every profile question enhances analysis precision

### **Personalization Depth:**
- **10x Outreach Quality**: Section 5 leverages introduction_style, credibility_preference, objection_handling
- **Proof-Driven Proposals**: Uses typical_results and success_story for quantified value
- **Cultural Alignment**: Matches organizational_personality and values
- **Strategic Sequencing**: Follows followup_timing and nonresponse_handling playbooks

---

## Usage Instructions

1. **Copy the user prompt** from the code block above
2. **Set N8N variable**: Use `Set` node with `user_prompt` variable
3. **Connect to AI node**: Pass `user_prompt` to your GPT-4.1 AI node
4. **System prompt**: Use **System Prompt v4.1** for optimal results
5. **Enable tools**: Jina Reader and Hunter in N8N AI node configuration
6. **Verify payload structure**: Ensure frontend sends all 42 fields via `enhanceWebhookPayload`

---

## Example Field Usage in Analysis

### Strategic Fit (Section 1)
```
"Based on [company typical_results] showing 30% efficiency gains in similar 
organizations, and their [years_active] track record of 8+ years serving 
[target_industries], there's strong alignment with prospect's [industry] needs."
```

### Outreach Strategy (Section 5)
```
"Given [user introduction_style: 'Problem-Solution Storytelling'] and 
[credibility_preference: 'Data-driven case studies'], open with quantified 
results from [company success_story]. Contact via [preferred_contact_channel: 'LinkedIn'] 
with [communication_style: 'Professional-consultative']. Request [meeting_format: 'Virtual'] 
for [meeting_duration: '30 minutes']. If no response within [followup_timing: '3-5 days'], 
deploy [nonresponse_handling: 'Value-add content sharing']."
```

### Business Impact (Section 6)
```
"Leveraging [company delivery_model: 'Hybrid consulting + technology'] and proven 
[typical_results: '40% cost reduction, 25% time savings'], estimate €150k-250k annual 
impact for prospect based on their [company_size: 'Mid-market, 100-500 employees']. 
Success tracked via [user success_metrics: 'Meeting-to-proposal conversion rate']."
```

---

**Version**: 4.1 | **Compatibility**: GPT-4.1 | **Tools**: Jina + Hunter | **Syntax**: Pure N8N {{ }} | **Focus**: Hyper-Personalized & Actionable | **Profile Intelligence**: 42 Fields
