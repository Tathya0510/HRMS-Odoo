import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Building2, Loader2, Mail, Lock, User, IdCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AppRole } from '@/types/database';
import { z } from 'zod';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  employeeId: z.string().min(3, 'Employee ID must be at least 3 characters').max(50),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
});

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [selectedRole, setSelectedRole] = useState<AppRole>('employee');
  
  const { signIn, signUp, user, role } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user && role) {
      navigate(role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [user, role, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = signInSchema.safeParse({ email: signInEmail, password: signInPassword });
    if (!validation.success) {
      toast({
        title: 'Validation Error',
        description: validation.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(signInEmail, signInPassword);
    setIsLoading(false);

    if (error) {
      toast({
        title: 'Sign In Failed',
        description: error.message === 'Invalid login credentials' 
          ? 'Invalid email or password. Please try again.'
          : error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = signUpSchema.safeParse({
      email: signUpEmail,
      password: signUpPassword,
      employeeId,
      firstName,
      lastName,
    });
    
    if (!validation.success) {
      toast({
        title: 'Validation Error',
        description: validation.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(signUpEmail, signUpPassword, employeeId, firstName, lastName, selectedRole);
    setIsLoading(false);

    if (error) {
      let message = error.message;
      if (error.message?.includes('already registered')) {
        message = 'This email is already registered. Please sign in instead.';
      } else if (error.message?.includes('employee_id')) {
        message = 'This Employee ID is already taken. Please use a different one.';
      }
      toast({
        title: 'Sign Up Failed',
        description: message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Account Created!',
        description: 'You can now sign in with your credentials.',
      });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero p-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold text-white">HR Portal</h1>
        </div>
        
        <div className="space-y-6">
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-white leading-tight">
            Streamline Your<br />HR Operations
          </h2>
          <p className="text-lg text-white/80 max-w-md">
            Manage attendance, leave requests, payroll, and employee profiles all in one place.
          </p>
        </div>

        <p className="text-sm text-white/60">
          © 2024 HR Portal. All rights reserved.
        </p>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-display font-bold">HR Portal</h1>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <Card className="border-0 shadow-soft-lg">
                <CardHeader className="space-y-1 pb-4">
                  <CardTitle className="text-2xl font-display">Welcome back</CardTitle>
                  <CardDescription>Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="name@company.com"
                          value={signInEmail}
                          onChange={(e) => setSignInEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signin-password"
                          type="password"
                          placeholder="••••••••"
                          value={signInPassword}
                          onChange={(e) => setSignInPassword(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Sign In
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup">
              <Card className="border-0 shadow-soft-lg">
                <CardHeader className="space-y-1 pb-4">
                  <CardTitle className="text-2xl font-display">Create account</CardTitle>
                  <CardDescription>Enter your details to get started</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="firstName"
                            placeholder="John"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employeeId">Employee ID</Label>
                      <div className="relative">
                        <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="employeeId"
                          placeholder="EMP001"
                          value={employeeId}
                          onChange={(e) => setEmployeeId(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="name@company.com"
                          value={signUpEmail}
                          onChange={(e) => setSignUpEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="Min. 6 characters"
                          value={signUpPassword}
                          onChange={(e) => setSignUpPassword(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label>Account Type</Label>
                      <RadioGroup
                        value={selectedRole}
                        onValueChange={(value) => setSelectedRole(value as AppRole)}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="employee" id="employee" />
                          <Label htmlFor="employee" className="font-normal cursor-pointer">Employee</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="admin" id="admin" />
                          <Label htmlFor="admin" className="font-normal cursor-pointer">Admin/HR</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Create Account
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
