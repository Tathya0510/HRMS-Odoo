import { cn } from '@/lib/utils';
import { AttendanceStatus, LeaveStatus } from '@/types/database';

interface StatusBadgeProps {
  status: AttendanceStatus | LeaveStatus;
  className?: string;
}

const statusStyles: Record<string, string> = {
  present: 'status-present',
  absent: 'status-absent',
  half_day: 'status-half-day',
  leave: 'status-leave',
  pending: 'status-pending',
  approved: 'status-approved',
  rejected: 'status-rejected',
};

const statusLabels: Record<string, string> = {
  present: 'Present',
  absent: 'Absent',
  half_day: 'Half Day',
  leave: 'On Leave',
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn('status-badge', statusStyles[status], className)}>
      {statusLabels[status]}
    </span>
  );
}
