import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MainHeader } from "@/components/layout/main-header";
import { MainFooter } from "@/components/layout/main-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { RecentQuotes } from "@/components/account/RecentQuotes";

export default function AccountPage() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Profile form state
  const [firstName, setFirstName] = useState(profile?.first_name || "");
  const [lastName, setLastName] = useState(profile?.last_name || "");
  const [company, setCompany] = useState(profile?.company || "");
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // If not logged in, redirect to login
  if (!user) {
    navigate("/login");
    return null;
  }

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setIsUpdating(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          company: company
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    
    try {
      setIsChangingPassword(true);
      
      // Using Supabase auth to update password
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) throw error;
      
      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      toast.success("Password updated successfully");
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error(error.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  // Handle account logout
  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
      toast.success("Logged out successfully");
    } catch (error: any) {
      console.error("Error logging out:", error);
      toast.error(error.message || "Failed to log out");
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MainHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-primary mb-8">My Account</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* User Summary Card */}
            <Card className="md:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Account Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-3">
                  <Avatar className="h-24 w-24">
                    <AvatarFallback className="text-lg bg-primary text-white">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h3 className="font-medium">{firstName} {lastName}</h3>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                    {company && <p className="text-sm">{company}</p>}
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Role:</span> {profile?.role === 'admin' ? 'Administrator' : 'Customer'}</p>
                </div>
                <div className="mt-4">
                  <Button variant="destructive" size="sm" onClick={handleLogout} className="w-full">
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Settings Card */}
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account information and password
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="profile">
                  <TabsList className="mb-4">
                    <TabsTrigger value="profile">Profile Information</TabsTrigger>
                    <TabsTrigger value="password">Change Password</TabsTrigger>
                  </TabsList>
                  
                  {/* Profile Tab */}
                  <TabsContent value="profile">
                    <form onSubmit={handleProfileUpdate}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Enter your first name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Enter your last name"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-6">
                        <Label htmlFor="company">Company (Optional)</Label>
                        <Input
                          id="company"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="Enter your company name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          value={user?.email || ""}
                          disabled
                          className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Email address cannot be changed
                        </p>
                      </div>
                      
                      <div className="mt-6">
                        <Button type="submit" disabled={isUpdating}>
                          {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </TabsContent>
                  
                  {/* Password Tab */}
                  <TabsContent value="password">
                    <form onSubmit={handlePasswordChange}>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <Input
                            id="currentPassword"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter your current password"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter your new password"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Password must be at least 8 characters long
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your new password"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <Button 
                          type="submit" 
                          disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                        >
                          {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Change Password
                        </Button>
                      </div>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Quotes Section */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Recent Quotes</CardTitle>
              <CardDescription>
                Your most recent quote requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentQuotes />
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button variant="outline" onClick={() => navigate("/quotes")}>
                View All Quotes
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <MainFooter />
    </div>
  );
} 