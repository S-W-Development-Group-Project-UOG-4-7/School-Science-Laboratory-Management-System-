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
  Mail, 
  Smartphone,
  Camera,
  Save,
  Eye,
  EyeOff,
  Check
} from 'lucide-react';
import { motion } from 'framer-motion';

interface UserType {
  name: string;
  email: string;
  role: string;
}

interface SettingsPageProps {
  user: UserType;
  onProfileUpdate?: (imageUrl: string) => void;
}

export function SettingsPage({ user, onProfileUpdate }: SettingsPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Account settings state
  const [fullName, setFullName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState('+94 71 234 5678');
  const [profileImage, setProfileImage] = useState<string>('');
  const [savedProfileImageUrl, setSavedProfileImageUrl] = useState<string>('');
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  
  // Security settings state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [practicalReminders, setPracticalReminders] = useState(true);
  const [inventoryAlerts, setInventoryAlerts] = useState(true);

  // Ref for file input
  let fileInputRef: HTMLInputElement | null = null;

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/users/profile?userId=${encodeURIComponent(user.email)}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched profile data:', data); // Debug log
          
          if (data.user.profileImageUrl) {
            console.log('Setting profile image to:', data.user.profileImageUrl); // Debug log
            setSavedProfileImageUrl(data.user.profileImageUrl);
            setProfileImage(data.user.profileImageUrl);
          }
          // Update other fields if needed
          if (data.user.fullName) setFullName(data.user.fullName);
          if (data.user.phone) setPhone(data.user.phone);
        } else {
          console.error('Failed to fetch profile:', response.status);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user.email]);

  const handleSave = async () => {
    try {
      // First, upload the image if a new one was selected
      let imageUrl = savedProfileImageUrl; // Use the existing saved URL
      
      if (profileImageFile) {
        setUploading(true);
        
        const formData = new FormData();
        formData.append('profileImage', profileImageFile);
        formData.append('userId', user.email); // Using email as userId
        
        console.log('Uploading image for user:', user.email); // Debug log
        
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
        console.log('Image uploaded successfully:', imageUrl); // Debug log
        
        setSavedProfileImageUrl(imageUrl); // Update saved URL
        setProfileImage(imageUrl); // Make sure to update the display
        setUploading(false);
      }
      
      console.log('Saving profile with imageUrl:', imageUrl); // Debug log
      
      // Then update the profile with all information
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
      console.log('Profile saved successfully:', responseData); // Debug log
      
      // Notify parent component about the profile update
      if (onProfileUpdate && imageUrl) {
        onProfileUpdate(imageUrl);
      }
      
      // Also emit a custom event for other components to listen to
      if (imageUrl) {
        const event = new CustomEvent('profileUpdated', { 
          detail: { profileImageUrl: imageUrl } 
        });
        window.dispatchEvent(event);
      }
      
      // Clear the file selection after successful save
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
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }

      // Store the actual file for uploading later
      setProfileImageFile(file);

      // Read and preview the image
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
                {/* Profile Picture */}
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
                        {user.name.charAt(0)}
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
                    <p className="font-medium text-gray-900 mb-1">Profile Picture</p>
                    <p className="text-sm text-gray-600 mb-3">JPG, PNG or GIF. Max size 2MB</p>
                    <Button variant="outline" size="sm" onClick={triggerFileInput} type="button">
                      <Camera className="w-4 h-4 mr-2" />
                      Upload Photo
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Form Fields */}
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
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handleSave}
                      disabled={uploading}
                      className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50"
                    >
                      {uploading ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
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

            {/* Two-Factor Authentication */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Two-Factor Authentication
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Add an extra layer of security to your account
                    </CardDescription>
                  </div>
                  <Badge className={twoFactorEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                    {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-600 rounded-lg">
                      <Smartphone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">SMS Authentication</p>
                      <p className="text-sm text-gray-600">Receive codes via SMS</p>
                    </div>
                  </div>
                  <Switch
                    checked={twoFactorEnabled}
                    onCheckedChange={setTwoFactorEnabled}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-600 rounded-lg">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Email Authentication</p>
                      <p className="text-sm text-gray-600">Receive codes via email</p>
                    </div>
                  </div>
                  <Switch checked={false} />
                </div>
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
                        <p className="font-medium text-gray-900">Email Notifications</p>
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
                        <p className="font-medium text-gray-900">SMS Notifications</p>
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
                        <p className="font-medium text-gray-900">Practical Reminders</p>
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
                        <p className="font-medium text-gray-900">Inventory Alerts</p>
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

// Demo wrapper
export default function SettingsDemo() {
  const demoUser = {
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@medlab.com',
    role: 'laboratory technician'
  };

  return <SettingsPage user={demoUser} />;
}