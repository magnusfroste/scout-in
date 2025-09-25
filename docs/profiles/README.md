# Profile System Documentation

This directory contains comprehensive documentation for the Research Engine's profile system, including all questions, form structures, and design rationale.

## Overview

The profile system captures essential information about users and companies to provide context-aware research. It consists of two main components:

- **Company Profile**: 25+ questions about the user's company, offerings, and market position
- **User Profile**: 20+ questions about the individual user's role, preferences, and research needs

## Documentation Structure

### Profile Questions
- **[Company Profile Questions](./company-profile-questions.md)** - Complete list of company profile questions with field types and validation
- **[User Profile Questions](./user-profile-questions.md)** - Complete list of user profile questions with field types and options
- **[Original Company Questions](./original-company-questions.md)** - Source document with all original company profile questions

### Form Implementation
- **[Form Components Guide](./form-components.md)** - How questions map to React form components
- **[Validation Rules](./validation-rules.md)** - Validation logic and requirements for each field

## Design Principles

### Question Selection Rationale
1. **Context-Driven**: Questions are designed to provide maximum context for AI-powered research
2. **Progressive Disclosure**: Forms use wizards to break complex profiles into manageable steps
3. **Smart Defaults**: Many fields are optional with intelligent defaults
4. **Validation Balance**: Required fields are minimal but sufficient for basic functionality

### Profile Completeness
- Profiles track completion percentage to encourage full setup
- Core functionality works with minimal required fields
- Advanced features unlock with more complete profiles

### Data Structure
- All profile data is stored in Supabase with proper typing
- Fields support various data types: text, arrays, booleans, enums
- Flexible schema allows for future question additions

## Usage in Research Engine

The profile data is used to:
1. **Personalize Research**: Tailor research approaches based on company/user context
2. **Generate Context**: Provide rich context to N8N workflows
3. **Improve Relevance**: Filter and focus research based on industry/role
4. **Enable Automation**: Pre-fill forms and suggestions based on profile data

## Future Enhancements

When adding new profile questions:
1. Review existing questions to avoid duplication
2. Consider the research context value of each question
3. Update TypeScript interfaces and validation schemas
4. Test with various user personas
5. Document the rationale for new questions

## Quick Reference

- **Total Company Questions**: 25+ fields covering company basics, offerings, culture, and goals
- **Total User Questions**: 20+ fields covering role, preferences, and research needs
- **Required Fields**: Minimal set for basic functionality
- **Optional Fields**: Enhanced context for advanced features