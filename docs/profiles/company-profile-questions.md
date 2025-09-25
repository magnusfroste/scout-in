# Company Profile Questions

Complete reference for all company profile questions used in the Research Engine forms.

## Basic Information

### 1. Company Name
- **Field**: `company_name`
- **Type**: Text (required)
- **Validation**: 1-100 characters
- **Purpose**: Primary identifier for the company

### 2. Website URL
- **Field**: `website_url`
- **Type**: URL
- **Validation**: Valid URL format
- **Purpose**: Company website for research context

### 3. Industry
- **Field**: `industry`
- **Type**: Text
- **Purpose**: Industry classification for targeted research

### 4. Company Size
- **Field**: `company_size`
- **Type**: Select dropdown
- **Options**:
  - Solo (1 person)
  - Startup (2-10 people)
  - Small Business (11-50 people)
  - Medium Business (51-200 people)
  - Large Business (201-1000 people)
  - Enterprise (1000+ people)
- **Purpose**: Context for company scale and resources

### 5. Geographic Focus
- **Field**: `geographic_focus`
- **Type**: Multi-select array
- **Options**:
  - Local/Regional
  - National
  - International
  - Global
- **Purpose**: Understanding market reach and expansion context

## Mission & Vision

### 6. Mission Statement
- **Field**: `mission`
- **Type**: Textarea
- **Purpose**: Core purpose and values for research alignment

### 7. Vision Statement
- **Field**: `vision`
- **Type**: Textarea
- **Purpose**: Future aspirations and strategic direction

### 8. Core Problem Solved
- **Field**: `core_problem_solved`
- **Type**: Textarea
- **Purpose**: Primary value proposition and market need addressed

## Values & Culture

### 9. Company Values
- **Field**: `values`
- **Type**: Multi-select checkboxes array
- **Options**:
  - Innovation
  - Quality
  - Customer Service
  - Sustainability
  - Transparency
  - Collaboration
  - Excellence
  - Integrity
  - Growth
  - Community Impact
- **Purpose**: Cultural alignment for communication style

### 10. Work Culture
- **Field**: `work_culture`
- **Type**: Multi-select checkboxes array
- **Options**:
  - Remote-First
  - Hybrid
  - In-Person
  - Flexible Hours
  - Results-Oriented
  - Collaborative
  - Fast-Paced
  - Innovation-Focused
- **Purpose**: Understanding organizational dynamics

## Offerings & Services

### 11. Offering Type
- **Field**: `offering_type`
- **Type**: Multi-select checkboxes array
- **Options**:
  - Products
  - Services
  - Software
  - Consulting
  - E-commerce
  - SaaS
  - Hardware
  - Content
- **Purpose**: Categorizing business model for relevant research

### 12. Key Products/Services
- **Field**: `key_products_services`
- **Type**: Textarea
- **Purpose**: Detailed description of main offerings

### 13. Target Market
- **Field**: `target_market`
- **Type**: Textarea
- **Purpose**: Primary customer segments and demographics

### 14. Competitive Advantages
- **Field**: `competitive_advantages`
- **Type**: Textarea
- **Purpose**: Unique selling propositions and differentiators

## Market Position & Strategy

### 15. Market Position
- **Field**: `market_position`
- **Type**: Select dropdown
- **Options**:
  - Market Leader
  - Strong Competitor
  - Growing Player
  - Niche Specialist
  - New Entrant
  - Challenger Brand
- **Purpose**: Understanding competitive landscape position

### 16. Business Model
- **Field**: `business_model`
- **Type**: Multi-select checkboxes array
- **Options**:
  - B2B
  - B2C
  - B2B2C
  - Marketplace
  - Subscription
  - Freemium
  - Transaction-based
  - License-based
- **Purpose**: Revenue model understanding for market research

### 17. Growth Stage
- **Field**: `growth_stage`
- **Type**: Select dropdown
- **Options**:
  - Idea/Concept
  - MVP Development
  - Early Stage
  - Growth Stage
  - Scale Stage
  - Mature
  - Pivot/Transition
- **Purpose**: Company lifecycle context for research focus

## Goals & Objectives

### 18. Primary Business Goals
- **Field**: `primary_business_goals`
- **Type**: Multi-select checkboxes array
- **Options**:
  - Revenue Growth
  - Market Expansion
  - Product Development
  - Customer Acquisition
  - Operational Efficiency
  - Team Building
  - Brand Awareness
  - Strategic Partnerships
- **Purpose**: Strategic priorities for research alignment

### 19. Success Metrics
- **Field**: `success_metrics`
- **Type**: Textarea
- **Purpose**: Key performance indicators and measurement criteria

### 20. Timeline & Milestones
- **Field**: `timeline_milestones`
- **Type**: Textarea
- **Purpose**: Strategic timeline for contextualizing research urgency

## Additional Context

### 21. Key Stakeholders
- **Field**: `key_stakeholders`
- **Type**: Textarea
- **Purpose**: Important parties in decision-making process

### 22. Budget Considerations
- **Field**: `budget_considerations`
- **Type**: Textarea
- **Purpose**: Financial constraints and investment capacity

### 23. Technology Stack
- **Field**: `technology_stack`
- **Type**: Textarea
- **Purpose**: Technical infrastructure and capabilities

### 24. Regulatory Environment
- **Field**: `regulatory_environment`
- **Type**: Textarea
- **Purpose**: Compliance requirements and industry regulations

### 25. Additional Notes
- **Field**: `additional_notes`
- **Type**: Textarea
- **Purpose**: Any other relevant context or special considerations

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