# Development Guide

This guide provides comprehensive development guidelines, best practices, and procedures for working with the Research Engine codebase.

## Development Principles

### 1. Code Organization
- **Component Structure**: Small, focused, reusable components
- **File Naming**: Descriptive, consistent naming conventions
- **Import/Export**: Clear module boundaries and explicit exports
- **Type Safety**: Comprehensive TypeScript usage throughout

### 2. Architecture Guidelines
- **Single Responsibility**: Each component/function has one clear purpose  
- **Composition over Inheritance**: Favor component composition
- **Immutable Data**: Use immutable patterns for state management
- **Error Boundaries**: Comprehensive error handling and user feedback

## Project Structure

```
src/
├── components/           # React components
│   ├── lab/             # Lab-specific components  
│   ├── layout/          # Layout components
│   ├── profiles/        # Profile management
│   └── ui/              # Shared UI components (shadcn)
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
├── pages/               # Route components  
├── integrations/        # External service integrations
└── main.tsx            # Application entry point

docs/
├── architecture/        # System architecture documentation
├── n8n/                # N8N integration guides  
├── payload/            # Payload structure documentation
├── development/        # Development guidelines
└── README.md           # Documentation index
```

## Development Workflow

### 1. Feature Development Process
1. **Planning**: Document requirements and approach
2. **Design**: Create component interfaces and data structures
3. **Implementation**: Build components with tests
4. **Integration**: Connect with existing systems
5. **Documentation**: Update relevant docs
6. **Review**: Code review and testing

### 2. Component Development Guidelines

#### React Component Structure
```typescript
// Component template
import React from 'react';
import { ComponentProps } from './types';
import { useCustomHook } from '@/hooks/useCustomHook';

interface Props extends ComponentProps {
  // Component-specific props
}

export const ComponentName: React.FC<Props> = ({ 
  prop1, 
  prop2,
  ...rest 
}) => {
  // Hooks
  const { data, loading, error } = useCustomHook();
  
  // Event handlers
  const handleEvent = (event: Event) => {
    // Handle event
  };
  
  // Render guards
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;
  
  return (
    <div className="component-container" {...rest}>
      {/* Component content */}
    </div>
  );
};
```

#### Custom Hook Pattern
```typescript
// Custom hook template  
import { useState, useEffect } from 'react';

interface UseCustomHookResult {
  data: DataType | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useCustomHook = (
  param1: string,
  options?: HookOptions
): UseCustomHookResult => {
  const [data, setData] = useState<DataType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await apiCall(param1, options);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, [param1, options]);
  
  return { data, loading, error, refetch: fetchData };
};
```

## State Management

### 1. Local State (useState/useReducer)
- Use for component-specific state
- Keep state as close to usage as possible
- Avoid prop drilling beyond 2 levels

### 2. Server State (React Query/SWR)
- Use for API data fetching and caching
- Implement proper error handling and loading states
- Configure appropriate cache policies

### 3. Global State (Context/Zustand)
- Use sparingly for truly global state
- Prefer composition over complex state trees
- Document state shape and update patterns

## API Integration Guidelines

### 1. Supabase Integration
```typescript
// Supabase client usage
import { supabase } from '@/integrations/supabase/client';

export const apiService = {
  async fetchUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error) throw error;
    return data;
  },
  
  async saveResearchRecord(record: ResearchRecord) {
    const { data, error } = await supabase
      .from('research_records')
      .insert(record)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
};
```

### 2. Webhook Integration
```typescript
// Webhook payload sending
export const sendWebhookPayload = async (
  webhookUrl: string,
  payload: EnhancedWebhookPayload
): Promise<any> => {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Webhook error:', error);
    throw error;
  }
};
```

## Error Handling Standards

### 1. Component Error Boundaries
```typescript
class ComponentErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Component error:', error, errorInfo);
    // Log to monitoring service
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

### 2. API Error Handling
```typescript
// Standardized error handling
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
};

// Usage in components
const { data, error } = useQuery('userData', fetchUserData, {
  onError: (error) => {
    toast.error(handleApiError(error));
  }
});
```

## Design System Integration

### 1. Component Styling
```typescript
// Use design system tokens
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

### 2. Color Usage
```typescript
// Always use semantic tokens from design system
// ❌ Wrong
<div className="bg-blue-500 text-white">

// ✅ Correct  
<div className="bg-primary text-primary-foreground">
```

## Testing Guidelines

### 1. Component Testing
```typescript
// Component test template
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders with required props', () => {
    render(<ComponentName prop1="value" />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
  
  it('handles user interactions', () => {
    const mockHandler = jest.fn();
    render(<ComponentName onEvent={mockHandler} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockHandler).toHaveBeenCalledTimes(1);
  });
});
```

### 2. Integration Testing
- Test complete user workflows
- Mock external dependencies (APIs, webhooks)
- Test error scenarios and edge cases
- Validate payload structures and transformations

## Performance Guidelines

### 1. React Performance
- Use `React.memo` for expensive components
- Implement `useMemo` and `useCallback` appropriately
- Avoid unnecessary re-renders
- Profile components with React DevTools

### 2. Bundle Optimization
- Implement code splitting for routes
- Lazy load heavy components
- Optimize bundle size with tree shaking
- Monitor bundle analysis reports

## Security Considerations

### 1. Input Validation
```typescript
// Validate all user inputs
import { z } from 'zod';

const profileSchema = z.object({
  company_name: z.string().min(1).max(100),
  website_url: z.string().url().optional(),
  industry: z.string().min(1),
});

export const validateProfile = (data: unknown) => {
  return profileSchema.parse(data);
};
```

### 2. API Security
- Validate all API responses
- Sanitize user inputs before API calls
- Handle authentication errors properly
- Implement proper CORS policies

## Deployment and Environment

### 1. Environment Configuration
```typescript
// Environment variable handling
export const config = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL!,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY!,
  webhookUrl: import.meta.env.VITE_WEBHOOK_URL || '',
};

// Validate required env vars on startup
if (!config.supabaseUrl || !config.supabaseAnonKey) {
  throw new Error('Missing required environment variables');
}
```

### 2. Build Process
- Ensure TypeScript compilation passes
- Run linting and formatting checks
- Execute test suite
- Validate build artifacts

## Debugging Guidelines

### 1. Development Tools
- Use React DevTools for component debugging
- Leverage browser DevTools for network and performance
- Implement structured logging for complex flows
- Use debugger statements strategically

### 2. Production Debugging
- Implement error boundary logging
- Use structured error reporting
- Monitor API performance and errors
- Track user interaction patterns

## Documentation Requirements

### 1. Code Documentation
- Document complex business logic
- Add JSDoc comments for public APIs
- Maintain README files for modules
- Document component props and usage

### 2. Architecture Documentation
- Keep architecture docs up to date
- Document integration patterns
- Maintain API documentation
- Update deployment guides