import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { signInSchema, signUpSchema, SignInFormData, SignUpFormData } from '@/lib/validations/auth';
import { ArrowLeft } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Sign In form state
  const [signInData, setSignInData] = useState<SignInFormData>({
    email: '',
    password: '',
  });
  const [signInErrors, setSignInErrors] = useState<Partial<Record<keyof SignInFormData, string>>>({});

  // Sign Up form state
  const [signUpData, setSignUpData] = useState<SignUpFormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [signUpErrors, setSignUpErrors] = useState<Partial<Record<keyof SignUpFormData, string>>>({});

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInErrors({});

    const validation = signInSchema.safeParse(signInData);
    if (!validation.success) {
      const errors: Partial<Record<keyof SignInFormData, string>> = {};
      validation.error.errors.forEach((error) => {
        if (error.path[0]) {
          errors[error.path[0] as keyof SignInFormData] = error.message;
        }
      });
      setSignInErrors(errors);
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(signInData.email, signInData.password);
    setIsLoading(false);

    if (!error) {
      navigate('/dashboard');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpErrors({});

    const validation = signUpSchema.safeParse(signUpData);
    if (!validation.success) {
      const errors: Partial<Record<keyof SignUpFormData, string>> = {};
      validation.error.errors.forEach((error) => {
        if (error.path[0]) {
          errors[error.path[0] as keyof SignUpFormData] = error.message;
        }
      });
      setSignUpErrors(errors);
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(
      signUpData.email,
      signUpData.password,
      signUpData.firstName,
      signUpData.lastName
    );
    setIsLoading(false);

    if (!error) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Button>

        <Card>
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-primary to-[hsl(var(--scout-orange))] bg-clip-text text-transparent">
                Scout-In
              </span>
            </CardTitle>
            <CardDescription>
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="name@example.com"
                      value={signInData.email}
                      onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                      disabled={isLoading}
                    />
                    {signInErrors.email && (
                      <p className="text-sm text-destructive">{signInErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={signInData.password}
                      onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                      disabled={isLoading}
                    />
                    {signInErrors.password && (
                      <p className="text-sm text-destructive">{signInErrors.password}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or
                      </span>
                    </div>
                  </div>

                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-firstname">First Name</Label>
                      <Input
                        id="signup-firstname"
                        type="text"
                        placeholder="John"
                        value={signUpData.firstName}
                        onChange={(e) => setSignUpData({ ...signUpData, firstName: e.target.value })}
                        disabled={isLoading}
                      />
                      {signUpErrors.firstName && (
                        <p className="text-sm text-destructive">{signUpErrors.firstName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-lastname">Last Name</Label>
                      <Input
                        id="signup-lastname"
                        type="text"
                        placeholder="Doe"
                        value={signUpData.lastName}
                        onChange={(e) => setSignUpData({ ...signUpData, lastName: e.target.value })}
                        disabled={isLoading}
                      />
                      {signUpErrors.lastName && (
                        <p className="text-sm text-destructive">{signUpErrors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="name@example.com"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                      disabled={isLoading}
                    />
                    {signUpErrors.email && (
                      <p className="text-sm text-destructive">{signUpErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Min. 6 characters"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                      disabled={isLoading}
                    />
                    {signUpErrors.password && (
                      <p className="text-sm text-destructive">{signUpErrors.password}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
