import { 
  LayoutDashboard, 
  User, 
  Clock, 
  Calendar, 
  DollarSign, 
  Users, 
  LogOut,
  Building2
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const employeeNavItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Profile', url: '/profile', icon: User },
  { title: 'Attendance', url: '/attendance', icon: Clock },
  { title: 'Leave Requests', url: '/leave', icon: Calendar },
  { title: 'Payroll', url: '/payroll', icon: DollarSign },
];

const adminNavItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Employees', url: '/admin/employees', icon: Users },
  { title: 'Attendance', url: '/admin/attendance', icon: Clock },
  { title: 'Leave Requests', url: '/admin/leave', icon: Calendar },
  { title: 'Payroll', url: '/admin/payroll', icon: DollarSign },
];

export function AppSidebar() {
  const { profile, role, signOut } = useAuth();
  const navigate = useNavigate();

  const navItems = role === 'admin' ? adminNavItems : employeeNavItems;

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getInitials = () => {
    if (profile) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    return 'U';
  };

  return (
    <aside className="w-64 min-h-screen bg-sidebar flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center">
            <Building2 className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold text-sidebar-foreground">HR Portal</h1>
            <p className="text-xs text-sidebar-foreground/60 capitalize">{role} Access</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            className={({ isActive }) =>
              cn('nav-link', isActive && 'active')
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.title}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-4 px-2">
          <Avatar className="w-10 h-10">
            <AvatarImage src={profile?.photo_url || ''} />
            <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {profile ? `${profile.first_name} ${profile.last_name}` : 'Loading...'}
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              {profile?.employee_id}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={handleSignOut}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
