# User Profile Questions

Complete reference for all user profile questions used in the Research Engine forms.

## Basic Information

### 1. Full Name
- **Field**: `full_name`
- **Type**: Text (required)
- **Validation**: 1-100 characters
- **Purpose**: User identification and personalization

### 2. Email
- **Field**: `email`
- **Type**: Email (required)
- **Validation**: Valid email format
- **Purpose**: Primary contact and account identification

### 3. Job Title
- **Field**: `job_title`
- **Type**: Text
- **Purpose**: Role-specific research contextualization

### 4. Department
- **Field**: `department`
- **Type**: Select dropdown
- **Options**:
  - Executive/Leadership
  - Marketing
  - Sales
  - Product Management
  - Engineering/Development
  - Operations
  - Finance
  - Human Resources
  - Customer Success
  - Business Development
  - Strategy
  - Other
- **Purpose**: Department-specific research focus

## Role & Responsibilities

### 5. Role Type
- **Field**: `role_type`
- **Type**: Multi-select checkboxes array
- **Options**:
  - Individual Contributor
  - Team Lead/Manager
  - Director/VP
  - C-Level Executive
  - Founder/Owner
  - Consultant
  - Freelancer
  - Other
- **Purpose**: Understanding decision-making authority and perspective

### 6. Years of Experience
- **Field**: `years_of_experience`
- **Type**: Select dropdown
- **Options**:
  - 0-2 years
  - 3-5 years
  - 6-10 years
  - 11-15 years
  - 16-20 years
  - 20+ years
- **Purpose**: Experience level for research depth and complexity

### 7. Key Responsibilities
- **Field**: `key_responsibilities`
- **Type**: Textarea
- **Purpose**: Specific duties for targeted research relevance

### 8. Decision Making Authority
- **Field**: `decision_making_authority`
- **Type**: Multi-select checkboxes array
- **Options**:
  - Budget Approval
  - Vendor Selection
  - Strategic Planning
  - Team Hiring
  - Product Decisions
  - Technology Choices
  - Partnership Approvals
  - Limited Authority
- **Purpose**: Understanding influence level for research recommendations

## Research Preferences

### 9. Research Focus Areas
- **Field**: `research_focus_areas`
- **Type**: Multi-select checkboxes array
- **Options**:
  - Market Analysis
  - Competitive Intelligence
  - Industry Trends
  - Customer Insights
  - Technology Research
  - Financial Analysis
  - Regulatory Updates
  - Partnership Opportunities
- **Purpose**: Customizing research types and priorities

### 10. Communication Style
- **Field**: `communication_style`
- **Type**: Select dropdown
- **Options**:
  - Executive Summary (High-level overview)
  - Detailed Analysis (Comprehensive insights)
  - Data-Driven (Charts and metrics focus)
  - Actionable Insights (Practical recommendations)
  - Narrative Style (Story-driven presentation)
- **Purpose**: Tailoring research presentation format

### 11. Urgency Preference
- **Field**: `urgency_preference`
- **Type**: Select dropdown
- **Options**:
  - Immediate (Within hours)
  - Same Day
  - Within 2-3 days
  - Within a week
  - No specific timeline
- **Purpose**: Setting research delivery expectations

### 12. Research Depth
- **Field**: `research_depth`
- **Type**: Select dropdown
- **Options**:
  - Surface Level (Quick overview)
  - Standard (Moderate detail)
  - Deep Dive (Comprehensive analysis)
  - Expert Level (Industry specialist depth)
- **Purpose**: Determining research thoroughness and complexity

## Goals & Objectives

### 13. Primary Goals
- **Field**: `primary_goals`
- **Type**: Multi-select checkboxes array
- **Options**:
  - Strategic Planning
  - Market Entry
  - Competitive Analysis
  - Product Development
  - Investment Decisions
  - Partnership Evaluation
  - Risk Assessment
  - Opportunity Identification
- **Purpose**: Aligning research with user objectives

### 14. Success Metrics
- **Field**: `success_metrics`
- **Type**: Textarea
- **Purpose**: How user measures research value and impact

### 15. Key Challenges
- **Field**: `key_challenges`
- **Type**: Textarea
- **Purpose**: Current obstacles research should help address

## Preferences & Context

### 16. Industry Expertise
- **Field**: `industry_expertise`
- **Type**: Multi-select checkboxes array
- **Options**:
  - Technology/Software
  - Healthcare/Biotech
  - Financial Services
  - Manufacturing
  - Retail/E-commerce
  - Professional Services
  - Education
  - Government/Public Sector
  - Non-profit
  - Media/Entertainment
  - Other
- **Purpose**: Leveraging domain knowledge for research context

### 17. Geographic Interests
- **Field**: `geographic_interests`
- **Type**: Multi-select checkboxes array
- **Options**:
  - North America
  - Europe
  - Asia-Pacific
  - Latin America
  - Middle East/Africa
  - Specific Countries
  - Global Markets
- **Purpose**: Focusing research on relevant geographic regions

### 18. Language Preferences
- **Field**: `language_preferences`
- **Type**: Multi-select checkboxes array
- **Options**:
  - English
  - Spanish
  - French
  - German
  - Chinese (Mandarin)
  - Japanese
  - Portuguese
  - Other
- **Purpose**: Research source language and presentation preferences

### 19. Information Sources
- **Field**: `preferred_sources`
- **Type**: Multi-select checkboxes array
- **Options**:
  - Industry Reports
  - Academic Research
  - News Articles
  - Company Filings
  - Expert Interviews
  - Social Media
  - Government Data
  - Trade Publications
- **Purpose**: Customizing research source mix and credibility

### 20. Additional Context
- **Field**: `additional_context`
- **Type**: Textarea
- **Purpose**: Any other relevant information for research personalization

## Metadata Fields

### Profile Completion
- **Field**: `is_complete`
- **Type**: Boolean
- **Purpose**: Tracking profile setup status

### Timestamps
- **Field**: `created_at`
- **Type**: Timestamp
- **Purpose**: Profile creation date

- **Field**: `updated_at`
- **Type**: Timestamp
- **Purpose**: Last modification date

### User Association
- **Field**: `user_id`
- **Type**: UUID (required)
- **Purpose**: Link to user account

## Form Implementation Notes

### Progressive Disclosure
- Basic information is collected first
- Advanced preferences are optional
- Profile completion percentage encourages full setup

### Smart Defaults
- Department-appropriate research focus areas
- Role-based decision making authority suggestions
- Experience-level appropriate research depth

### Validation Strategy
- Required fields are minimal (name, email)
- Optional fields provide enhanced personalization
- Real-time validation with helpful error messages

### Data Storage
- All data stored in Supabase `user_profiles` table
- Array fields stored as PostgreSQL arrays
- Proper indexing for search and filtering performance