import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Target, Zap, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-[hsl(var(--scout-orange))] bg-clip-text text-transparent">
            Scout-In
          </h1>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
            <Button onClick={() => navigate('/auth')}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Actionable insights in less time
            <br />
            <span className="bg-gradient-to-r from-primary to-[hsl(var(--scout-orange))] bg-clip-text text-transparent">
              with focus on what matters
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your prospect research with AI-powered insights. Get comprehensive company analysis, decision-maker identification, and personalized outreach strategies.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" onClick={() => navigate('/auth')}>
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
              Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="space-y-3 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Targeted Research</h3>
            <p className="text-sm text-muted-foreground">
              Deep dive into prospects with AI-powered analysis of company data, market positioning, and decision-maker insights.
            </p>
          </div>

          <div className="space-y-3 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Lightning Fast</h3>
            <p className="text-sm text-muted-foreground">
              Get comprehensive research reports in minutes, not hours. Automate the tedious work and focus on closing deals.
            </p>
          </div>

          <div className="space-y-3 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Better Results</h3>
            <p className="text-sm text-muted-foreground">
              Personalized value propositions and contact strategies based on your company profile and prospect insights.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-6 bg-gradient-to-br from-primary/5 to-[hsl(var(--scout-orange))]/5 rounded-2xl p-12 border border-border">
          <h3 className="text-3xl font-bold">Ready to transform your research?</h3>
          <p className="text-muted-foreground">
            Join professionals who are saving hours on research and closing more deals.
          </p>
          <Button size="lg" onClick={() => navigate('/auth')}>
            Get Started Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2025 Scout-In. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
