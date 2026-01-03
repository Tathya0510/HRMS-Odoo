import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Attendance, LeaveRequest } from '@/types/database';
import { Clock, Calendar, CheckCircle, AlertCircle, Play, Square, Timer } from 'lucide-react';
import { format, isToday, differenceInHours, differenceInMinutes } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function EmployeeDashboard() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [attendanceStats, setAttendanceStats] = useState({ present: 0, absent: 0, leaves: 0 });
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user) {
      fetchTodayAttendance();
      fetchLeaveRequests();
      fetchAttendanceStats();
    }
  }, [user]);

  const fetchTodayAttendance = async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const { data } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', user!.id)
      .eq('date', today)
      .single();
    
    if (data) {
      setTodayAttendance(data as Attendance);
    }
  };

  const fetchLeaveRequests = async () => {
    const { data } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (data) {
      setLeaveRequests(data as LeaveRequest[]);
    }
  };

  const fetchAttendanceStats = async () => {
    const startOfMonth = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd');
    const { data } = await supabase
      .from('attendance')
      .select('status')
      .eq('user_id', user!.id)
      .gte('date', startOfMonth);
    
    if (data) {
      const stats = data.reduce(
        (acc, record) => {
          const typedRecord = record as { status: string };
          if (typedRecord.status === 'present') acc.present++;
          else if (typedRecord.status === 'absent') acc.absent++;
          else if (typedRecord.status === 'leave') acc.leaves++;
          return acc;
        },
        { present: 0, absent: 0, leaves: 0 }
      );
      setAttendanceStats(stats);
    }
  };

  const handleCheckIn = async () => {
    setIsCheckingIn(true);
    const today = format(new Date(), 'yyyy-MM-dd');
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('attendance')
      .insert({
        user_id: user!.id,
        date: today,
        check_in: now,
        status: 'present',
      })
      .select()
      .single();

    setIsCheckingIn(false);

    if (error) {
      toast({
        title: 'Check-in Failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setTodayAttendance(data as Attendance);
      toast({
        title: 'Checked In!',
        description: `You checked in at ${format(new Date(), 'hh:mm a')}`,
      });
    }
  };

  const handleCheckOut = async () => {
    if (!todayAttendance) return;

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('attendance')
      .update({ check_out: now })
      .eq('id', todayAttendance.id)
      .select()
      .single();

    if (error) {
      toast({
        title: 'Check-out Failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setTodayAttendance(data as Attendance);
      toast({
        title: 'Checked Out!',
        description: `You checked out at ${format(new Date(), 'hh:mm a')}`,
      });
    }
  };

  const getWorkDuration = () => {
    if (!todayAttendance?.check_in) return null;
    const checkIn = new Date(todayAttendance.check_in);
    const endTime = todayAttendance.check_out ? new Date(todayAttendance.check_out) : currentTime;
    const hours = differenceInHours(endTime, checkIn);
    const minutes = differenceInMinutes(endTime, checkIn) % 60;
    return `${hours}h ${minutes}m`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {profile?.first_name}!
          </h1>
          <p className="text-muted-foreground mt-1">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>

        {/* Time & Check-in Card */}
        <Card className="overflow-hidden">
          <div className="gradient-primary p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Current Time</p>
                <p className="text-4xl font-display font-bold mt-1">
                  {format(currentTime, 'hh:mm:ss a')}
                </p>
              </div>
              <div className="flex items-center gap-4">
                {!todayAttendance ? (
                  <Button
                    size="lg"
                    onClick={handleCheckIn}
                    disabled={isCheckingIn}
                    className="bg-white text-primary hover:bg-white/90"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Check In
                  </Button>
                ) : !todayAttendance.check_out ? (
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-white/80 text-xs">Working for</p>
                      <p className="text-xl font-bold flex items-center gap-2">
                        <Timer className="w-5 h-5" />
                        {getWorkDuration()}
                      </p>
                    </div>
                    <Button
                      size="lg"
                      onClick={handleCheckOut}
                      variant="destructive"
                      className="bg-white/20 hover:bg-white/30 border-white/30"
                    >
                      <Square className="w-5 h-5 mr-2" />
                      Check Out
                    </Button>
                  </div>
                ) : (
                  <div className="text-right">
                    <p className="text-white/80 text-xs">Total Work Duration</p>
                    <p className="text-xl font-bold flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      {getWorkDuration()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          {todayAttendance && (
            <CardContent className="p-4 bg-card">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Check-in:</span>
                  <span className="font-medium">
                    {format(new Date(todayAttendance.check_in!), 'hh:mm a')}
                  </span>
                </div>
                {todayAttendance.check_out && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Check-out:</span>
                    <span className="font-medium">
                      {format(new Date(todayAttendance.check_out), 'hh:mm a')}
                    </span>
                  </div>
                )}
                <StatusBadge status={todayAttendance.status} />
              </div>
            </CardContent>
          )}
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Days Present"
            value={attendanceStats.present}
            icon={<CheckCircle className="w-6 h-6" />}
          />
          <StatCard
            title="Days Absent"
            value={attendanceStats.absent}
            icon={<AlertCircle className="w-6 h-6" />}
          />
          <StatCard
            title="Leaves Taken"
            value={attendanceStats.leaves}
            icon={<Calendar className="w-6 h-6" />}
          />
        </div>

        {/* Recent Leave Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display">Recent Leave Requests</CardTitle>
            <CardDescription>Your latest leave applications</CardDescription>
          </CardHeader>
          <CardContent>
            {leaveRequests.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No leave requests yet
              </p>
            ) : (
              <div className="space-y-4">
                {leaveRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium capitalize">{request.leave_type} Leave</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(request.start_date), 'MMM d')} - {format(new Date(request.end_date), 'MMM d, yyyy')}
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
    </DashboardLayout>
  );
}
