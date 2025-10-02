# N8N User Prompt v4.0 - GPT-4.1 Research Brief

## Enhanced Research Brief with N8N Syntax

This user prompt uses proper N8N `{{ }}` syntax for dynamic content generation, creating a focused research brief for GPT-4.1 analysis.

### N8N User Prompt (Copy/Paste Ready)

```
# EXECUTIVE RESEARCH BRIEF - GPT-4.1 WASSCHING METHOD ANALYSIS

## TARGET PROSPECT INTELLIGENCE
**Company:** {{ $json.body.prospect_data.company_name }}
**Website:** {{ $json.body.prospect_data.website_url }}
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

## COMPANY PROFILE CONTEXT
**Industry:** {{ $json.body.company_profile.industry }}
**Size:** {{ $json.body.company_profile.company_size }}
**Target Market:** {{ $json.body.company_profile.target_market }}
**Value Props:** {{ $json.body.company_profile.value_propositions }}
**Challenges:** {{ $json.body.company_profile.current_challenges }}

## USER PROFILE CONTEXT  
**Role:** {{ $json.body.user_profile.job_title }}
**Experience:** {{ $json.body.user_profile.years_experience }} years
**Outreach Style:** {{ $json.body.user_profile.outreach_experience }}
**Success Metrics:** {{ $json.body.user_profile.success_metrics }}

## RESEARCH NOTES
{{ $json.body.prospect_data.notes }}

## COMPLETE PAYLOAD ACCESS
{{ JSON.stringify($json.body, null, 2) }}

## ANALYSIS DIRECTIVE
Using GPT-4.1 direct reasoning and targeted tool usage (Jina + Hunter), conduct Enhanced Wassching Method analysis across all 7 sections. Deploy tools only when information gaps exist. Deliver actionable business intelligence with quantified impact assessments and implementation-ready recommendations.
```

### Key Features

#### **GPT-4.1 Direct Reasoning Approach**
- **Simplified Tool Strategy**: Only Jina Reader (website) and Hunter (contacts)
- **Quality Focus**: Emphasizes actionable insights with targeted data gathering
- **No Complex Orchestration**: Avoids GPT-5 timeout issues in N8N

#### **Proper N8N Syntax**
- **Simple Variables**: `{{ $json.body.field }}` instead of complex JavaScript
- **Direct Access**: Clean, readable variable interpolation
- **No Functions**: Eliminates complex helper function dependencies

#### **Token Optimization**
- **Reduced Complexity**: ~450 tokens (minimal tool orchestration)
- **Essential Context**: All payload data mapped without redundant instructions
- **Efficient Structure**: Clean research brief focused on WHAT to analyze

#### **Strategic Intelligence**
- **Context-Aware**: Company and user profile integration
- **Priority-Driven**: Clear research parameters and focus areas
- **Action-Oriented**: Emphasis on implementation-ready analysis

### Implementation Benefits

**Performance Improvements:**
- **Stable execution**: Avoids GPT-5 timeout issues with tool calling in N8N
- **Simplified workflow**: Only 2 tools (Jina + Hunter) reduce complexity
- **Focused resource usage**: Targeted data gathering with GPT-4.1 reasoning

**Quality Enhancements:**
- **Direct analysis**: GPT-4.1 analytical capabilities for strategic insights
- **Reliable automation**: Proven stable workflow with limited tools
- **Actionable output**: Full 7-section Wassching Method maintained

### Usage Instructions

1. **Copy the user prompt** from the code block above
2. **Set N8N variable**: Use `Set` node with `user_prompt` variable
3. **Connect to AI node**: Pass `user_prompt` to your GPT-4.1 AI node
4. **System prompt**: Use System Prompt v4.0 for optimal results
5. **Enable tools**: Jina Reader and Hunter in N8N AI node configuration

---

**Version**: 4.0 | **Compatibility**: GPT-4.1 | **Tools**: Jina + Hunter | **Syntax**: Pure N8N {{ }} | **Focus**: Stable & Actionable