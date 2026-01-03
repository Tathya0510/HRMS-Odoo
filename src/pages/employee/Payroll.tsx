import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Salary } from '@/types/database';
import { DollarSign, TrendingUp, TrendingDown, Wallet, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function EmployeePayroll() {
  const { user } = useAuth();
  const [salary, setSalary] = useState<Salary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSalary();
    }
  }, [user]);

  const fetchSalary = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('salaries')
      .select('*')
      .eq('user_id', user!.id)
      .single();

    if (data) {
      setSalary(data as Salary);
    }
    setLoading(false);
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!salary) {
    return (
      <DashboardLayout>
        <div className="space-y-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-display font-bold">Payroll</h1>
            <p className="text-muted-foreground mt-1">View your salary details</p>
          </div>
          <Card>
            <CardContent className="py-12 text-center">
              <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-display font-semibold">No Salary Information</h2>
              <p className="text-muted-foreground mt-2">
                Your salary details have not been set up yet. Please contact HR for assistance.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold">Payroll</h1>
          <p className="text-muted-foreground mt-1">View your salary and compensation details</p>
        </div>

        {/* Net Salary Card */}
        <Card className="overflow-hidden">
          <div className="gradient-primary p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Net Monthly Salary</p>
                <p className="text-5xl font-display font-bold mt-2">
                  {formatCurrency(salary.net_salary, salary.currency)}
                </p>
                <p className="text-white/60 text-sm mt-2">
                  Effective from {format(new Date(salary.effective_date), 'MMMM d, yyyy')}
                </p>
              </div>
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
                <Wallet className="w-10 h-10" />
              </div>
            </div>
          </div>
        </Card>

        {/* Salary Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Basic Salary</p>
                  <p className="text-2xl font-display font-bold mt-1">
                    {formatCurrency(salary.basic_salary, salary.currency)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Allowances</p>
                  <p className="text-2xl font-display font-bold mt-1 text-success">
                    +{formatCurrency(salary.allowances || 0, salary.currency)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Deductions</p>
                  <p className="text-2xl font-display font-bold mt-1 text-destructive">
                    -{formatCurrency(salary.deductions || 0, salary.currency)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Salary Details */}
        <Card>
          <CardHeader>
            <CardTitle>Salary Details</CardTitle>
            <CardDescription>Complete breakdown of your compensation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-muted-foreground">Basic Salary</span>
                <span className="font-medium">{formatCurrency(salary.basic_salary, salary.currency)}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-muted-foreground">Allowances</span>
                <span className="font-medium text-success">
                  +{formatCurrency(salary.allowances || 0, salary.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-muted-foreground">Deductions</span>
                <span className="font-medium text-destructive">
                  -{formatCurrency(salary.deductions || 0, salary.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 bg-muted/50 rounded-lg px-4 -mx-4">
                <span className="font-semibold">Net Salary</span>
                <span className="font-display font-bold text-xl">
                  {formatCurrency(salary.net_salary, salary.currency)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-sm text-muted-foreground text-center">
          For any queries regarding your salary, please contact the HR department.
        </p>
      </div>
    </DashboardLayout>
  );
}
