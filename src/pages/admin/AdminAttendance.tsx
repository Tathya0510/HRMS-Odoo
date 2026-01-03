import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { Attendance, Profile } from '@/types/database';
import { Clock, Loader2, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export default function AdminAttendance() {
  const [attendance, setAttendance] = useState<(Attendance & { profiles?: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate, viewMode, selectedMonth]);

  const fetchAttendance = async () => {
    setLoading(true);
    let query = supabase
      .from('attendance')
      .select('*, profiles(*)')
      .order('date', { ascending: false });

    if (viewMode === 'daily') {
      query = query.eq('date', selectedDate);
    } else {
      const start = format(startOfMonth(selectedMonth), 'yyyy-MM-dd');
      const end = format(endOfMonth(selectedMonth), 'yyyy-MM-dd');
      query = query.gte('date', start).lte('date', end);
    }

    const { data } = await query;
    if (data) {
      setAttendance(data as unknown as (Attendance & { profiles?: Profile })[]);
    }
    setLoading(false);
  };

  const stats = {
    present: attendance.filter((a) => a.status === 'present').length,
    absent: attendance.filter((a) => a.status === 'absent').length,
    halfDay: attendance.filter((a) => a.status === 'half_day').length,
    leave: attendance.filter((a) => a.status === 'leave').length,
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
            <h1 className="text-3xl font-display font-bold">Attendance Overview</h1>
            <p className="text-muted-foreground mt-1">Monitor employee attendance records</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex rounded-lg overflow-hidden border">
              <button
                className={`px-4 py-2 text-sm font-medium ${viewMode === 'daily' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}
                onClick={() => setViewMode('daily')}
              >
                Daily
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium ${viewMode === 'monthly' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}
                onClick={() => setViewMode('monthly')}
              >
                Monthly
              </button>
            </div>
            {viewMode === 'daily' ? (
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 rounded-lg border bg-card"
              />
            ) : (
              <input
                type="month"
                value={format(selectedMonth, 'yyyy-MM')}
                onChange={(e) => setSelectedMonth(new Date(e.target.value))}
                className="px-4 py-2 rounded-lg border bg-card"
              />
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-success/5 border-success/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-success" />
                <div>
                  <p className="text-sm text-success font-medium">Present</p>
                  <p className="text-2xl font-display font-bold text-success">{stats.present}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-destructive/5 border-destructive/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-destructive" />
                <div>
                  <p className="text-sm text-destructive font-medium">Absent</p>
                  <p className="text-2xl font-display font-bold text-destructive">{stats.absent}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-sm text-accent font-medium">Half Day</p>
                  <p className="text-2xl font-display font-bold text-accent">{stats.halfDay}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-muted">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground font-medium">On Leave</p>
                  <p className="text-2xl font-display font-bold">{stats.leave}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {viewMode === 'daily' 
                ? `Attendance for ${format(new Date(selectedDate), 'MMMM d, yyyy')}`
                : `Attendance for ${format(selectedMonth, 'MMMM yyyy')}`
              }
            </CardTitle>
            <CardDescription>
              {viewMode === 'daily' ? 'Daily attendance records' : 'Monthly attendance summary'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : attendance.length === 0 ? (
              <p className="text-center py-12 text-muted-foreground">
                No attendance records found for this {viewMode === 'daily' ? 'date' : 'month'}.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    {viewMode === 'monthly' && <TableHead>Date</TableHead>}
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={record.profiles?.photo_url || ''} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(record.profiles)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {record.profiles?.first_name} {record.profiles?.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground">{record.profiles?.employee_id}</p>
                          </div>
                        </div>
                      </TableCell>
                      {viewMode === 'monthly' && (
                        <TableCell>{format(new Date(record.date), 'MMM d, yyyy')}</TableCell>
                      )}
                      <TableCell>
                        {record.check_in ? format(new Date(record.check_in), 'hh:mm a') : '-'}
                      </TableCell>
                      <TableCell>
                        {record.check_out ? format(new Date(record.check_out), 'hh:mm a') : '-'}
                      </TableCell>
                      <TableCell>
                        {record.check_in && record.check_out ? (
                          (() => {
                            const diff = new Date(record.check_out).getTime() - new Date(record.check_in).getTime();
                            const hours = Math.floor(diff / (1000 * 60 * 60));
                            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                            return `${hours}h ${minutes}m`;
                          })()
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={record.status} />
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
