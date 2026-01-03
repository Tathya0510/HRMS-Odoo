import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Salary, Profile } from '@/types/database';
import { DollarSign, Loader2, Edit, Search, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function AdminPayroll() {
  const { toast } = useToast();
  const [salaries, setSalaries] = useState<(Salary & { profiles?: Profile })[]>([]);
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSalary, setSelectedSalary] = useState<(Salary & { profiles?: Profile }) | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Profile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    basic_salary: '',
    allowances: '',
    deductions: '',
    currency: 'USD',
    effective_date: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    const [salariesRes, employeesRes] = await Promise.all([
      supabase.from('salaries').select('*, profiles(*)').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*'),
    ]);

    if (salariesRes.data) {
      setSalaries(salariesRes.data as unknown as (Salary & { profiles?: Profile })[]);
    }
    if (employeesRes.data) {
      setEmployees(employeesRes.data as Profile[]);
    }
    setLoading(false);
  };

  const employeesWithoutSalary = employees.filter(
    (emp) => !salaries.some((sal) => sal.user_id === emp.id)
  );

  const handleEdit = (salary: Salary & { profiles?: Profile }) => {
    setSelectedSalary(salary);
    setSelectedEmployee(null);
    setIsCreating(false);
    setFormData({
      basic_salary: salary.basic_salary.toString(),
      allowances: (salary.allowances || 0).toString(),
      deductions: (salary.deductions || 0).toString(),
      currency: salary.currency,
      effective_date: salary.effective_date,
    });
    setIsDialogOpen(true);
  };

  const handleCreate = (employee: Profile) => {
    setSelectedEmployee(employee);
    setSelectedSalary(null);
    setIsCreating(true);
    setFormData({
      basic_salary: '',
      allowances: '0',
      deductions: '0',
      currency: 'USD',
      effective_date: format(new Date(), 'yyyy-MM-dd'),
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    const basicSalary = parseFloat(formData.basic_salary);
    if (isNaN(basicSalary) || basicSalary <= 0) {
      toast({
        title: 'Invalid Input',
        description: 'Please enter a valid basic salary.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    if (isCreating && selectedEmployee) {
      const { error } = await supabase.from('salaries').insert({
        user_id: selectedEmployee.id,
        basic_salary: basicSalary,
        allowances: parseFloat(formData.allowances) || 0,
        deductions: parseFloat(formData.deductions) || 0,
        currency: formData.currency,
        effective_date: formData.effective_date,
      });

      setIsSaving(false);

      if (error) {
        toast({
          title: 'Creation Failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Salary Created',
          description: `Salary record has been created for ${selectedEmployee.first_name} ${selectedEmployee.last_name}.`,
        });
        setIsDialogOpen(false);
        fetchData();
      }
    } else if (selectedSalary) {
      const { error } = await supabase
        .from('salaries')
        .update({
          basic_salary: basicSalary,
          allowances: parseFloat(formData.allowances) || 0,
          deductions: parseFloat(formData.deductions) || 0,
          currency: formData.currency,
          effective_date: formData.effective_date,
        })
        .eq('id', selectedSalary.id);

      setIsSaving(false);

      if (error) {
        toast({
          title: 'Update Failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Salary Updated',
          description: 'Salary details have been updated successfully.',
        });
        setIsDialogOpen(false);
        fetchData();
      }
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const getInitials = (profile?: Profile) => {
    if (!profile) return 'U';
    return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
  };

  const filteredSalaries = salaries.filter((sal) =>
    `${sal.profiles?.first_name} ${sal.profiles?.last_name} ${sal.profiles?.employee_id}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Payroll Management</h1>
            <p className="text-muted-foreground mt-1">Manage employee salaries and compensation</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-4">
          <Card className="flex-1">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or employee ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>
          {employeesWithoutSalary.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{employeesWithoutSalary.length} employees without salary records</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Employees Without Salary */}
        {employeesWithoutSalary.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-warning">
                <Plus className="w-5 h-5" />
                Employees Without Salary Records
              </CardTitle>
              <CardDescription>Click to add salary information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {employeesWithoutSalary.map((emp) => (
                  <Button
                    key={emp.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleCreate(emp)}
                    className="gap-2"
                  >
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={emp.photo_url || ''} />
                      <AvatarFallback className="text-xs">{getInitials(emp)}</AvatarFallback>
                    </Avatar>
                    {emp.first_name} {emp.last_name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Salary Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Salary Records ({filteredSalaries.length})
            </CardTitle>
            <CardDescription>All employee salary information</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredSalaries.length === 0 ? (
              <p className="text-center py-12 text-muted-foreground">
                {searchQuery ? 'No salary records match your search.' : 'No salary records found.'}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Basic Salary</TableHead>
                    <TableHead>Allowances</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Salary</TableHead>
                    <TableHead>Effective Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSalaries.map((salary) => (
                    <TableRow key={salary.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={salary.profiles?.photo_url || ''} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(salary.profiles)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {salary.profiles?.first_name} {salary.profiles?.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground">{salary.profiles?.employee_id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(salary.basic_salary, salary.currency)}</TableCell>
                      <TableCell className="text-success">
                        +{formatCurrency(salary.allowances || 0, salary.currency)}
                      </TableCell>
                      <TableCell className="text-destructive">
                        -{formatCurrency(salary.deductions || 0, salary.currency)}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(salary.net_salary, salary.currency)}
                      </TableCell>
                      <TableCell>
                        {format(new Date(salary.effective_date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(salary)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit/Create Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{isCreating ? 'Create Salary Record' : 'Edit Salary'}</DialogTitle>
              <DialogDescription>
                {isCreating && selectedEmployee
                  ? `Add salary information for ${selectedEmployee.first_name} ${selectedEmployee.last_name}`
                  : `Update salary for ${selectedSalary?.profiles?.first_name} ${selectedSalary?.profiles?.last_name}`
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Basic Salary</Label>
                <Input
                  type="number"
                  value={formData.basic_salary}
                  onChange={(e) => setFormData({ ...formData, basic_salary: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Allowances</Label>
                  <Input
                    type="number"
                    value={formData.allowances}
                    onChange={(e) => setFormData({ ...formData, allowances: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Deductions</Label>
                  <Input
                    type="number"
                    value={formData.deductions}
                    onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Input
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    placeholder="USD"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Effective Date</Label>
                  <Input
                    type="date"
                    value={formData.effective_date}
                    onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                  />
                </div>
              </div>

              {formData.basic_salary && (
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Net Salary Preview</p>
                  <p className="text-2xl font-display font-bold">
                    {formatCurrency(
                      parseFloat(formData.basic_salary || '0') +
                      parseFloat(formData.allowances || '0') -
                      parseFloat(formData.deductions || '0'),
                      formData.currency
                    )}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isCreating ? 'Create' : 'Update'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
