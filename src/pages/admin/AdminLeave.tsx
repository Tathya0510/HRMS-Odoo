import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/ui/status-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LeaveRequest, Profile, LeaveStatus } from '@/types/database';
import { Calendar, Loader2, Check, X, MessageSquare } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function AdminLeave() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [leaveRequests, setLeaveRequests] = useState<(LeaveRequest & { profiles?: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest & { profiles?: Profile } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [adminComments, setAdminComments] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchLeaveRequests();
  }, [filter]);

  const fetchLeaveRequests = async () => {
    setLoading(true);
    let query = supabase
      .from('leave_requests')
      .select('*, profiles(*)')
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data } = await query;
    if (data) {
      setLeaveRequests(data as unknown as (LeaveRequest & { profiles?: Profile })[]);
    }
    setLoading(false);
  };

  const handleAction = (request: LeaveRequest & { profiles?: Profile }) => {
    setSelectedRequest(request);
    setAdminComments(request.admin_comments || '');
    setIsDialogOpen(true);
  };

  const updateStatus = async (newStatus: LeaveStatus) => {
    if (!selectedRequest) return;
    
    setIsUpdating(true);
    const { error } = await supabase
      .from('leave_requests')
      .update({
        status: newStatus,
        admin_comments: adminComments || null,
        reviewed_by: user!.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', selectedRequest.id);

    setIsUpdating(false);

    if (error) {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: `Request ${newStatus === 'approved' ? 'Approved' : 'Rejected'}`,
        description: `Leave request has been ${newStatus}.`,
      });
      setIsDialogOpen(false);
      fetchLeaveRequests();
    }
  };

  const stats = {
    pending: leaveRequests.filter((r) => r.status === 'pending').length,
    approved: leaveRequests.filter((r) => r.status === 'approved').length,
    rejected: leaveRequests.filter((r) => r.status === 'rejected').length,
  };

  const getInitials = (profile?: Profile) => {
    if (!profile) return 'U';
    return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Leave Management</h1>
            <p className="text-muted-foreground mt-1">Review and manage leave requests</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              onClick={() => setFilter(status)}
              className="capitalize"
            >
              {status}
              {status !== 'all' && (
                <span className="ml-2 bg-background/20 px-2 py-0.5 rounded-full text-xs">
                  {stats[status]}
                </span>
              )}
            </Button>
          ))}
        </div>

        {/* Leave Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Leave Requests
            </CardTitle>
            <CardDescription>
              {filter === 'all' ? 'All leave requests' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} requests`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : leaveRequests.length === 0 ? (
              <p className="text-center py-12 text-muted-foreground">
                No {filter !== 'all' ? filter : ''} leave requests found.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied On</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={request.profiles?.photo_url || ''} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(request.profiles)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {request.profiles?.first_name} {request.profiles?.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground">{request.profiles?.employee_id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{request.leave_type}</TableCell>
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
                      <TableCell className="text-muted-foreground">
                        {format(new Date(request.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleAction(request)}>
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Review Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Review Leave Request</DialogTitle>
              <DialogDescription>
                {selectedRequest?.profiles?.first_name} {selectedRequest?.profiles?.last_name} - {selectedRequest?.leave_type} leave
              </DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4 mt-4">
                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">
                      {format(new Date(selectedRequest.start_date), 'MMM d')} - {format(new Date(selectedRequest.end_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Days</span>
                    <span className="font-medium">
                      {differenceInDays(new Date(selectedRequest.end_date), new Date(selectedRequest.start_date)) + 1} day(s)
                    </span>
                  </div>
                  {selectedRequest.remarks && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground">Remarks:</p>
                      <p className="text-sm">{selectedRequest.remarks}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Admin Comments (Optional)</label>
                  <Textarea
                    value={adminComments}
                    onChange={(e) => setAdminComments(e.target.value)}
                    placeholder="Add any comments..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  {selectedRequest.status === 'pending' ? (
                    <>
                      <Button
                        variant="destructive"
                        onClick={() => updateStatus('rejected')}
                        disabled={isUpdating}
                      >
                        {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <X className="w-4 h-4 mr-2" />}
                        Reject
                      </Button>
                      <Button
                        onClick={() => updateStatus('approved')}
                        disabled={isUpdating}
                        className="bg-success hover:bg-success/90"
                      >
                        {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                        Approve
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Close
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
