import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Profile, Attendance, LeaveRequest } from '@/types/database';
import { Users, Clock, Calendar, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    pendingLeaves: 0,
    onLeaveToday: 0,
  });
  const [recentAttendance, setRecentAttendance] = useState<(Attendance & { profiles?: Profile })[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<(LeaveRequest & { profiles?: Profile })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    const today = format(new Date(), 'yyyy-MM-dd');

    // Fetch total employees
    const { count: employeeCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Fetch today's attendance
    const { data: todayAttendance } = await supabase
      .from('attendance')
      .select('*, profiles(*)')
      .eq('date', today);

    // Fetch pending leave requests
    const { data: pendingLeavesData } = await supabase
      .from('leave_requests')
      .select('*, profiles(*)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    // Fetch on leave today
    const { data: onLeaveData } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('status', 'approved')
      .lte('start_date', today)
      .gte('end_date', today);

    setStats({
      totalEmployees: employeeCount || 0,
      presentToday: todayAttendance?.filter(a => a.status === 'present').length || 0,
      pendingLeaves: pendingLeavesData?.length || 0,
      onLeaveToday: onLeaveData?.length || 0,
    });

    setRecentAttendance((todayAttendance || []) as unknown as (Attendance & { profiles?: Profile })[]);
    setPendingLeaves((pendingLeavesData || []).slice(0, 5) as unknown as (LeaveRequest & { profiles?: Profile })[]);
    setLoading(false);
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

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of HR operations for {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Employees"
            value={stats.totalEmployees}
            icon={<Users className="w-6 h-6" />}
          />
          <StatCard
            title="Present Today"
            value={stats.presentToday}
            icon={<CheckCircle className="w-6 h-6" />}
          />
          <StatCard
            title="On Leave Today"
            value={stats.onLeaveToday}
            icon={<Calendar className="w-6 h-6" />}
          />
          <StatCard
            title="Pending Approvals"
            value={stats.pendingLeaves}
            icon={<AlertCircle className="w-6 h-6" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Attendance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Today's Attendance
              </CardTitle>
              <CardDescription>Employee check-ins for today</CardDescription>
            </CardHeader>
            <CardContent>
              {recentAttendance.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No attendance records for today</p>
              ) : (
                <div className="space-y-3">
                  {recentAttendance.slice(0, 6).map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-medium text-primary">
                            {record.profiles?.first_name?.[0]}{record.profiles?.last_name?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {record.profiles?.first_name} {record.profiles?.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {record.check_in && format(new Date(record.check_in), 'hh:mm a')}
                            {record.check_out && ` - ${format(new Date(record.check_out), 'hh:mm a')}`}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={record.status} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Leave Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Pending Leave Requests
              </CardTitle>
              <CardDescription>Requests awaiting your approval</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingLeaves.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No pending leave requests</p>
              ) : (
                <div className="space-y-3">
                  {pendingLeaves.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-warning" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {request.profiles?.first_name} {request.profiles?.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {request.leave_type} leave • {format(new Date(request.start_date), 'MMM d')} - {format(new Date(request.end_date), 'MMM d')}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={request.status} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
