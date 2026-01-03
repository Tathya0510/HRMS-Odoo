import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LeaveRequest, LeaveType } from '@/types/database';
import { Calendar, Plus, Loader2 } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function EmployeeLeave() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [leaveType, setLeaveType] = useState<LeaveType>('paid');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (user) {
      fetchLeaveRequests();
    }
  }, [user]);

  const fetchLeaveRequests = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (data) {
      setLeaveRequests(data as LeaveRequest[]);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (new Date(endDate) < new Date(startDate)) {
      toast({
        title: 'Invalid Dates',
        description: 'End date cannot be before start date.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.from('leave_requests').insert({
      user_id: user!.id,
      leave_type: leaveType,
      start_date: startDate,
      end_date: endDate,
      remarks: remarks || null,
    });

    setIsSubmitting(false);

    if (error) {
      toast({
        title: 'Request Failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Leave Request Submitted',
        description: 'Your leave request has been submitted for approval.',
      });
      setIsDialogOpen(false);
      setLeaveType('paid');
      setStartDate('');
      setEndDate('');
      setRemarks('');
      fetchLeaveRequests();
    }
  };

  const stats = {
    pending: leaveRequests.filter((r) => r.status === 'pending').length,
    approved: leaveRequests.filter((r) => r.status === 'approved').length,
    rejected: leaveRequests.filter((r) => r.status === 'rejected').length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Leave Requests</h1>
            <p className="text-muted-foreground mt-1">Apply and track your leave applications</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Apply for Leave
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Apply for Leave</DialogTitle>
                <DialogDescription>Submit a new leave request for approval</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Leave Type</Label>
                  <Select value={leaveType} onValueChange={(v) => setLeaveType(v as LeaveType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid Leave</SelectItem>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
                {startDate && endDate && new Date(endDate) >= new Date(startDate) && (
                  <p className="text-sm text-muted-foreground">
                    Duration: {differenceInDays(new Date(endDate), new Date(startDate)) + 1} day(s)
                  </p>
                )}
                <div className="space-y-2">
                  <Label>Remarks (Optional)</Label>
                  <Textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Provide any additional details..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Submit Request
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-warning/5 border-warning/20">
            <CardContent className="pt-6">
              <p className="text-sm text-warning font-medium">Pending</p>
              <p className="text-3xl font-display font-bold text-warning">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card className="bg-success/5 border-success/20">
            <CardContent className="pt-6">
              <p className="text-sm text-success font-medium">Approved</p>
              <p className="text-3xl font-display font-bold text-success">{stats.approved}</p>
            </CardContent>
          </Card>
          <Card className="bg-destructive/5 border-destructive/20">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive font-medium">Rejected</p>
              <p className="text-3xl font-display font-bold text-destructive">{stats.rejected}</p>
            </CardContent>
          </Card>
        </div>

        {/* Leave Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              All Leave Requests
            </CardTitle>
            <CardDescription>Your complete leave request history</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : leaveRequests.length === 0 ? (
              <p className="text-center py-12 text-muted-foreground">
                No leave requests yet. Click "Apply for Leave" to submit your first request.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Admin Comments</TableHead>
                    <TableHead>Applied On</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium capitalize">{request.leave_type} Leave</TableCell>
                      <TableCell>
                        {format(new Date(request.start_date), 'MMM d')} - {format(new Date(request.end_date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        {differenceInDays(new Date(request.end_date), new Date(request.start_date)) + 1}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {request.remarks || '-'}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={request.status} />
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {request.admin_comments || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(request.created_at), 'MMM d, yyyy')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
