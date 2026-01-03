import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { User, Mail, Phone, MapPin, Building, Briefcase, Calendar, IdCard, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function EmployeeProfile() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [phone, setPhone] = useState(profile?.phone || '');
  const [address, setAddress] = useState(profile?.address || '');

  const handleSave = async () => {
    if (!profile) return;
    
    setIsSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ phone, address })
      .eq('id', profile.id);

    setIsSaving(false);

    if (error) {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      await refreshProfile();
      setIsEditing(false);
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
    }
  };

  const getInitials = () => {
    if (profile) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    return 'U';
  };

  if (!profile) {
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
          <h1 className="text-3xl font-display font-bold">My Profile</h1>
          <p className="text-muted-foreground mt-1">View and manage your personal information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardContent className="pt-8 text-center">
              <Avatar className="w-24 h-24 mx-auto">
                <AvatarImage src={profile.photo_url || ''} />
                <AvatarFallback className="text-2xl font-display bg-primary text-primary-foreground">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <h2 className="mt-4 text-xl font-display font-bold">
                {profile.first_name} {profile.last_name}
              </h2>
              <p className="text-muted-foreground">{profile.position || 'Employee'}</p>
              <p className="text-sm text-muted-foreground mt-1">{profile.department || 'Not assigned'}</p>
              
              <div className="mt-6 pt-6 border-t space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <IdCard className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">ID:</span>
                  <span className="font-medium">{profile.employee_id}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Joined:</span>
                  <span className="font-medium">
                    {profile.hire_date ? format(new Date(profile.hire_date), 'MMM d, yyyy') : 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details Card */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your contact and personal details</CardDescription>
              </div>
              {!isEditing ? (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <User className="w-4 h-4" />
                    First Name
                  </Label>
                  <Input value={profile.first_name} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Last Name
                  </Label>
                  <Input value={profile.last_name} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <Input value={profile.email} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone
                  </Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter phone number"
                    className={!isEditing ? 'bg-muted' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Department
                  </Label>
                  <Input value={profile.department || 'Not assigned'} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Position
                  </Label>
                  <Input value={profile.position || 'Not assigned'} disabled className="bg-muted" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Address
                </Label>
                <Textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter your address"
                  className={!isEditing ? 'bg-muted resize-none' : 'resize-none'}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
