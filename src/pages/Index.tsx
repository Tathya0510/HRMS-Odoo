import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Building2, Users, Clock, Calendar, DollarSign, Shield, ArrowRight, Loader2 } from 'lucide-react';

export default function Index() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && role) {
      navigate(role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [user, role, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const features = [
    {
      icon: Users,
      title: 'Employee Management',
      description: 'Comprehensive profiles with personal, job, and document details',
    },
    {
      icon: Clock,
      title: 'Attendance Tracking',
      description: 'Real-time check-in/out with daily and weekly views',
    },
    {
      icon: Calendar,
      title: 'Leave Management',
      description: 'Apply for leave, track status, and manage approvals',
    },
    {
      icon: DollarSign,
      title: 'Payroll Visibility',
      description: 'View salary breakdowns and compensation details',
    },
    {
      icon: Shield,
      title: 'Role-Based Access',
      description: 'Secure access controls for employees and admins',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="gradient-hero">
        <div className="container mx-auto px-6 py-8">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-display font-bold text-white">HR Portal</h1>
            </div>
            <Button 
              onClick={() => navigate('/auth')} 
              className="bg-white text-primary hover:bg-white/90"
            >
              Sign In
            </Button>
          </nav>

          <div className="mt-24 max-w-3xl">
            <h2 className="text-4xl md:text-6xl font-display font-bold text-white leading-tight animate-fade-in">
              Simplify Your Daily HR Operations
            </h2>
            <p className="mt-6 text-lg md:text-xl text-white/80 max-w-2xl animate-fade-in" style={{ animationDelay: '0.1s' }}>
              A complete solution for managing employees, attendance, leave requests, and payroll - all in one powerful platform.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="bg-white text-primary hover:bg-white/90 text-lg px-8"
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-transparent border-white/30 text-white hover:bg-white/10 text-lg px-8"
                onClick={() => navigate('/auth')}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="h-24 mt-24">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M0 50L48 45.7C96 41.3 192 32.7 288 29.2C384 25.7 480 27.3 576 35.8C672 44.3 768 59.7 864 62.5C960 65.3 1056 55.7 1152 50.8C1248 46 1344 46 1392 46L1440 46V100H1392C1344 100 1248 100 1152 100C1056 100 960 100 864 100C768 100 672 100 576 100C480 100 384 100 288 100C192 100 96 100 48 100H0V50Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h3 className="text-3xl md:text-4xl font-display font-bold">
            Everything You Need for HR Management
          </h3>
          <p className="mt-4 text-lg text-muted-foreground">
            Streamline your HR processes with our comprehensive suite of tools
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="p-8 rounded-2xl bg-card border card-hover animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 rounded-xl gradient-accent flex items-center justify-center mb-6">
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h4 className="text-xl font-display font-semibold mb-3">{feature.title}</h4>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="gradient-primary rounded-3xl p-12 md:p-16 text-center">
          <h3 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
            Ready to Transform Your HR Operations?
          </h3>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-10">
            Join thousands of companies that trust our platform for their daily HR needs.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/auth')}
            className="bg-white text-primary hover:bg-white/90 text-lg px-10"
          >
            Start Free Today
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-semibold">HR Portal</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 HR Portal. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
