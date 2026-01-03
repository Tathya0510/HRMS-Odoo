export type AppRole = 'employee' | 'admin';
export type AttendanceStatus = 'present' | 'absent' | 'half_day' | 'leave';
export type LeaveType = 'paid' | 'sick' | 'unpaid';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface Profile {
  id: string;
  employee_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  address: string | null;
  photo_url: string | null;
  department: string | null;
  position: string | null;
  hire_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
}

export interface Attendance {
  id: string;
  user_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: AttendanceStatus;
  notes: string | null;
  created_at: string;
}

export interface LeaveRequest {
  id: string;
  user_id: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  remarks: string | null;
  status: LeaveStatus;
  admin_comments: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface Salary {
  id: string;
  user_id: string;
  basic_salary: number;
  allowances: number | null;
  deductions: number | null;
  net_salary: number;
  currency: string;
  effective_date: string;
  created_at: string;
  updated_at: string;
}
