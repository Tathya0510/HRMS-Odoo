import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Attendance } from '@/types/database';
import { Calendar, Clock, Loader2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend } from 'date-fns';

export default function EmployeeAttendance() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    if (user) {
      fetchAttendance();
    }
  }, [user, selectedMonth]);

  const fetchAttendance = async () => {
    setLoading(true);
    const start = format(startOfMonth(selectedMonth), 'yyyy-MM-dd');
    const end = format(endOfMonth(selectedMonth), 'yyyy-MM-dd');

    const { data } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', user!.id)
      .gte('date', start)
      .lte('date', end)
      .order('date', { ascending: false });

    if (data) {
      setAttendance(data as Attendance[]);
    }
    setLoading(false);
  };

  const getAttendanceForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return attendance.find((a) => a.date === dateStr);
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(selectedMonth),
    end: endOfMonth(selectedMonth),
  });

  const stats = {
    present: attendance.filter((a) => a.status === 'present').length,
    absent: attendance.filter((a) => a.status === 'absent').length,
    halfDay: attendance.filter((a) => a.status === 'half_day').length,
    leaves: attendance.filter((a) => a.status === 'leave').length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Attendance</h1>
            <p className="text-muted-foreground mt-1">Track your daily attendance records</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="month"
              value={format(selectedMonth, 'yyyy-MM')}
              onChange={(e) => setSelectedMonth(new Date(e.target.value))}
              className="px-4 py-2 rounded-lg border bg-card"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-success/5 border-success/20">
            <CardContent className="pt-6">
              <p className="text-sm text-success font-medium">Present</p>
              <p className="text-3xl font-display font-bold text-success">{stats.present}</p>
            </CardContent>
          </Card>
          <Card className="bg-destructive/5 border-destructive/20">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive font-medium">Absent</p>
              <p className="text-3xl font-display font-bold text-destructive">{stats.absent}</p>
            </CardContent>
          </Card>
          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="pt-6">
              <p className="text-sm text-accent font-medium">Half Day</p>
              <p className="text-3xl font-display font-bold text-accent">{stats.halfDay}</p>
            </CardContent>
          </Card>
          <Card className="bg-muted">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground font-medium">On Leave</p>
              <p className="text-3xl font-display font-bold">{stats.leaves}</p>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {format(selectedMonth, 'MMMM yyyy')}
            </CardTitle>
            <CardDescription>Your attendance records for this month</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Day</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {daysInMonth.map((date) => {
                    const record = getAttendanceForDate(date);
                    const isWeekendDay = isWeekend(date);
                    const isPast = date <= new Date();

                    if (!isPast && !record) return null;

                    return (
                      <TableRow key={date.toISOString()} className={isWeekendDay ? 'bg-muted/30' : ''}>
                        <TableCell className="font-medium">
                          {format(date, 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className={isWeekendDay ? 'text-muted-foreground' : ''}>
                          {format(date, 'EEEE')}
                        </TableCell>
                        <TableCell>
                          {record?.check_in ? (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(new Date(record.check_in), 'hh:mm a')}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {record?.check_out ? (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(new Date(record.check_out), 'hh:mm a')}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {record?.check_in && record?.check_out ? (
                            (() => {
                              const diff = new Date(record.check_out).getTime() - new Date(record.check_in).getTime();
                              const hours = Math.floor(diff / (1000 * 60 * 60));
                              const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                              return `${hours}h ${minutes}m`;
                            })()
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {record ? (
                            <StatusBadge status={record.status} />
                          ) : isWeekendDay ? (
                            <span className="text-muted-foreground text-sm">Weekend</span>
                          ) : isPast ? (
                            <StatusBadge status="absent" />
                          ) : null}
                        </TableCell>
                      </TableRow>
                    );
                  }).filter(Boolean)}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
