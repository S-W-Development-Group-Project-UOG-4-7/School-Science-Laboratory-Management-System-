'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { 
  User, 
  Lock, 
  Bell, 
  Shield, 
  Camera,
  Save,
  Eye,
  EyeOff,
  Check,
  Smartphone,
  Key,
  RefreshCw,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { User as UserType } from '@/src/app/lib/types';
import { TwoFactorSetupPage } from './TwoFactorSetupPage';

interface SettingsPageProps {
  user: UserType;
  onUserUpdate?: (user: UserType) => void;
}

export function SettingsPage({ user, onUserUpdate }: SettingsPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [show2FASetup, setShow2FASetup] = useState(false);
  
  // Account settings state
  const [fullName, setFullName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState<string>('');
  const [savedProfileImageUrl, setSavedProfileImageUrl] = useState<string>('');
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [userId, setUserId] = useState(user.id);
  
  // Security settings state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [practicalReminders, setPracticalReminders] = useState(true);
  const [inventoryAlerts, setInventoryAlerts] = useState(true);

  // Ref for file input
  let fileInputRef: HTMLInputElement | null = null;

  // Fetch user data from database on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Fetch user from database to get current 2FA status
        const response = await fetch(`/api/users?search=${encodeURIComponent(user.email)}`);
        
        if (response.ok) {
          const users = await response.json();
          const userData = users.find((u: any) => u.email === user.email);
          
          if (userData) {
            // Update state with real data from database
            setUserId(userData.id);
            setFullName(userData.name || user.name);
            setEmail(userData.email || user.email);
            setPhone(userData.phone || '');
            
            // IMPORTANT: Set 2FA status from database
            setTwoFactorEnabled(userData.twoFactorEnabled || false);
            
            console.log('User 2FA Status from DB:', userData.twoFactorEnabled);
          } else {
            // Fallback to props if not found
            setTwoFactorEnabled(user.twoFactorEnabled || false);
          }
        }
        
        // Try to fetch profile image
        try {
          const profileResponse = await fetch(`/api/users/profile?userId=${encodeURIComponent(user.email)}`);
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            if (profileData.user?.profileImageUrl) {
              setSavedProfileImageUrl(profileData.user.profileImageUrl);
              setProfileImage(profileData.user.profileImageUrl);
            }
          }
        } catch (profileError) {
          console.log('Profile image not found');
        }
        
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Fallback to props
        setTwoFactorEnabled(user.twoFactorEnabled || false);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user.email, user.name, user.id, user.twoFactorEnabled]);

  // Updated handleSave function with event dispatch
  const handleSave = async () => {
    try {
      let imageUrl = savedProfileImageUrl;
      
      if (profileImageFile) {
        setUploading(true);
        
        const formData = new FormData();
        formData.append('profileImage', profileImageFile);
        formData.append('userId', user.email);
        
        const uploadResponse = await fetch('/api/users/profile/upload', {
          method: 'POST',
          body: formData
        });
        
        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || 'Failed to upload image');
        }
        
        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.imageUrl;
        setSavedProfileImageUrl(imageUrl);
        setUploading(false);
      }
      
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.email,
          fullName,
          email,
          phone,
          profileImageUrl: imageUrl
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const responseData = await response.json();
      
      // ✅ DISPATCH CUSTOM EVENT TO UPDATE DASHBOARD
      const profileUpdateEvent = new CustomEvent('profileUpdated', {
        detail: {
          name: fullName,
          email: email,
          phone: phone,
          profileImageUrl: imageUrl,
        },
      });
      window.dispatchEvent(profileUpdateEvent);
      
      console.log('Profile update event dispatched:', {
        name: fullName,
        email,
        phone,
        profileImageUrl: imageUrl,
      });
      
      setProfileImageFile(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert(`Failed to save profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setUploading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }

      setProfileImageFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef?.click();
  };

  // 2FA Handler Functions
  const handleDisable2FA = async () => {
    try {
      console.log('Disabling 2FA for user:', userId);
      
      const response = await fetch('/api/auth/totp/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId }),
      });

      const data = await response.json();
      console.log('Disable 2FA response:', data);

      if (response.ok) {
        setTwoFactorEnabled(false);
        if (onUserUpdate) {
          onUserUpdate({ ...user, twoFactorEnabled: false });
        }
        alert('2FA has been disabled successfully');
      } else {
        alert(data.error || 'Failed to disable 2FA');
      }
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      alert('An error occurred while disabling 2FA');
    }
  };

  const handleReset2FA = async () => {
    try {
      await handleDisable2FA();
      // Wait a bit for the database to update
      setTimeout(() => {
        setShow2FASetup(true);
      }, 500);
    } catch (error) {
      console.error('Error resetting 2FA:', error);
    }
  };

  const handle2FASetupComplete = async () => {
    setShow2FASetup(false);
    setTwoFactorEnabled(true);
    
    if (onUserUpdate) {
      onUserUpdate({ ...user, twoFactorEnabled: true });
    }
    
    alert('Two-factor authentication has been enabled successfully!');
    
    // Refresh the page to sync state
    window.location.reload();
  };

  // Show 2FA setup page if user clicked enable
  if (show2FASetup) {
    return (
      <TwoFactorSetupPage
        user={{ ...user, id: userId }}
        onComplete={handle2FASetupComplete}
        onCancel={() => setShow2FASetup(false)}
      />
    );
  }

  // Show loading while fetching user data
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="ml-3 text-gray-600">Loading your profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Settings</h2>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </motion.div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
        </TabsList>

        {/* Account Settings */}
        <TabsContent value="account" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information and profile picture</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <input
                    ref={(ref) => { fileInputRef = ref; }}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="relative group">
                    <Avatar className="w-24 h-24 border-4 border-emerald-100">
                      <AvatarImage src={profileImage} />
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
                        {fullName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <motion.button
                      onClick={triggerFileInput}
                      type="button"
                      className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Camera className="w-6 h-6 text-white" />
                    </motion.button>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Profile Picture</p>
                    <p className="text-sm text-gray-600 mb-3">JPG, PNG or GIF. Max size 2MB</p>
                    <Button variant="outline" size="sm" onClick={triggerFileInput} type="button">
                      <Camera className="w-4 h-4 mr-2" />
                      Upload Photo
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="transition-all hover:border-blue-400 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      value={user.role}
                      disabled
                      className="capitalize bg-gray-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="transition-all hover:border-blue-400 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="transition-all hover:border-emerald-400 focus:border-emerald-500"
                      placeholder="+94 71 234 5678"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handleSave}
                      disabled={uploading}
                      className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : saved ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Saved!
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Change Password */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Change Password
                </CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? 'text' : 'password'}
                      className="pr-10 transition-all hover:border-blue-400 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    className="transition-all hover:border-blue-400 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    className="transition-all hover:border-emerald-400 focus:border-emerald-500"
                  />
                </div>
                <Button className="w-full md:w-auto bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800">
                  Update Password
                </Button>
              </CardContent>
            </Card>

            {/* Two-Factor Authentication (TOTP) */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Two-Factor Authentication (TOTP)
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Use Google Authenticator or similar app for extra security
                    </CardDescription>
                  </div>
                  <Badge className={twoFactorEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                    {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {!twoFactorEnabled ? (
                  <div className="p-6 bg-blue-50 rounded-lg border border-blue-200 text-center space-y-4">
                    <div className="flex justify-center">
                      <div className="p-3 bg-blue-600 rounded-full">
                        <Smartphone className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-gray-900 font-medium mb-2">Secure Your Account</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Add an extra layer of security with Google Authenticator. 
                        It's free, works offline, and takes only 1 minute to setup.
                      </p>
                      <Button
                        onClick={() => setShow2FASetup(true)}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Enable 2FA
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-600 rounded-lg">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-gray-900 font-medium">2FA Active</p>
                          <p className="text-sm text-gray-600">Your account is protected</p>
                        </div>
                      </div>
                      <Switch
                        checked={twoFactorEnabled}
                        onCheckedChange={(checked) => {
                          if (!checked) {
                            if (confirm('Are you sure you want to disable 2FA? This will make your account less secure.')) {
                              handleDisable2FA();
                            }
                          }
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          alert('Backup codes were provided during setup. Contact admin if you need new codes.');
                        }}
                        className="justify-start"
                      >
                        <Key className="w-4 h-4 mr-2" />
                        View Backup Codes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (confirm('Reset 2FA? You will need to scan a new QR code.')) {
                            handleReset2FA();
                          }
                        }}
                        className="justify-start"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reset 2FA
                      </Button>
                    </div>

                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="text-yellow-900 font-medium mb-1">Keep Your Backup Codes Safe</p>
                          <p className="text-yellow-700">
                            Save your backup codes in a secure location. You'll need them if you lose your phone.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Choose how you want to receive updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Communication</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-900">Email Notifications</p>
                        <p className="text-sm text-gray-600">Receive updates via email</p>
                      </div>
                      <Switch
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-900">SMS Notifications</p>
                        <p className="text-sm text-gray-600">Receive updates via SMS</p>
                      </div>
                      <Switch
                        checked={smsNotifications}
                        onCheckedChange={setSmsNotifications}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Activity</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-900">Practical Reminders</p>
                        <p className="text-sm text-gray-600">Get notified before scheduled practicals</p>
                      </div>
                      <Switch
                        checked={practicalReminders}
                        onCheckedChange={setPracticalReminders}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-900">Inventory Alerts</p>
                        <p className="text-sm text-gray-600">Low stock and reorder notifications</p>
                      </div>
                      <Switch
                        checked={inventoryAlerts}
                        onCheckedChange={setInventoryAlerts}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handleSave}
                      className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                    >
                      {saved ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Saved!
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Preferences
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}