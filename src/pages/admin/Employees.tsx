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
import { Profile } from '@/types/database';
import { Users, Search, Edit, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function AdminEmployees() {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Profile | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    department: '',
    position: '',
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    const filtered = employees.filter((emp) =>
      `${emp.first_name} ${emp.last_name} ${emp.employee_id} ${emp.email}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
    setFilteredEmployees(filtered);
  }, [searchQuery, employees]);

  const fetchEmployees = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setEmployees(data as Profile[]);
      setFilteredEmployees(data as Profile[]);
    }
    setLoading(false);
  };

  const handleEdit = (employee: Profile) => {
    setSelectedEmployee(employee);
    setEditForm({
      first_name: employee.first_name,
      last_name: employee.last_name,
      phone: employee.phone || '',
      address: employee.address || '',
      department: employee.department || '',
      position: employee.position || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedEmployee) return;
    
    setIsSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        phone: editForm.phone || null,
        address: editForm.address || null,
        department: editForm.department || null,
        position: editForm.position || null,
      })
      .eq('id', selectedEmployee.id);

    setIsSaving(false);

    if (error) {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Employee Updated',
        description: 'Employee details have been updated successfully.',
      });
      setIsEditDialogOpen(false);
      fetchEmployees();
    }
  };

  const getInitials = (employee: Profile) => {
    return `${employee.first_name[0]}${employee.last_name[0]}`.toUpperCase();
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Employees</h1>
            <p className="text-muted-foreground mt-1">Manage all employee records</p>
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, employee ID, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Employees Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              All Employees ({filteredEmployees.length})
            </CardTitle>
            <CardDescription>Complete list of all registered employees</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredEmployees.length === 0 ? (
              <p className="text-center py-12 text-muted-foreground">
                {searchQuery ? 'No employees match your search.' : 'No employees found.'}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Hire Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={employee.photo_url || ''} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(employee)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{employee.first_name} {employee.last_name}</p>
                            <p className="text-sm text-muted-foreground">{employee.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{employee.employee_id}</TableCell>
                      <TableCell>{employee.department || '-'}</TableCell>
                      <TableCell>{employee.position || '-'}</TableCell>
                      <TableCell>
                        {employee.hire_date ? format(new Date(employee.hire_date), 'MMM d, yyyy') : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(employee)}>
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

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Employee</DialogTitle>
              <DialogDescription>Update employee information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input
                    value={editForm.first_name}
                    onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    value={editForm.last_name}
                    onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Input
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  placeholder="Enter department"
                />
              </div>
              <div className="space-y-2">
                <Label>Position</Label>
                <Input
                  value={editForm.position}
                  onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                  placeholder="Enter position"
                />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  placeholder="Enter address"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
