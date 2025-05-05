import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';

// Components
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { toast } from '../../components/ui/Toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Avatar } from '../../components/ui/Avatar';
import { Spinner } from '../../components/ui/Spinner';

// Utils & Hooks
import { useAuth } from '../../contexts/AuthContext';

// Profile schema with validation rules
const profileSchema = z.object({
  fullName: z.string().min(3, { message: 'Full name must be at least 3 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().optional(),
  preferredLanguage: z.enum(['en', 'sw', 'fr', 'ar', 'ny']),
  address: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  dateOfBirth: z.string().refine(value => {
    const date = new Date(value);
    return !isNaN(date.getTime());
  }, { message: 'Please enter a valid date' }),
});

// Password schema for security tab
const passwordSchema = z.object({
  currentPassword: z.string().min(6, { message: 'Current password is required' }),
  newPassword: z.string().min(8, { message: 'Password must be at least 8 characters' })
    .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/, {
      message: 'Password must contain at least one letter and one number',
    }),
  confirmPassword: z.string().min(8, { message: 'Please confirm your password' }),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const Profile = () => {
  const { t } = useTranslation();
  const { user, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  // Profile form
  const {
    register: profileRegister,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfileForm,
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      preferredLanguage: 'en',
      address: '',
      gender: 'prefer_not_to_say',
      dateOfBirth: '',
    },
  });

  // Password form
  const {
    register: passwordRegister,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          resetProfileForm({
            fullName: data.full_name || '',
            email: user.email || '',
            phone: data.phone || '',
            preferredLanguage: data.preferred_language || 'en',
            address: data.address || '',
            gender: data.gender || 'prefer_not_to_say',
            dateOfBirth: data.date_of_birth ? new Date(data.date_of_birth).toISOString().split('T')[0] : '',
          });

          setAvatarUrl(data.avatar_url);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: t('error'),
          description: t('profile.fetch_error'),
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, resetProfileForm, t]);

  // Update profile handler
  const onUpdateProfile = async (data) => {
    try {
      setIsLoading(true);
      
      const profileData = {
        full_name: data.fullName,
        phone: data.phone || null,
        preferred_language: data.preferredLanguage,
        address: data.address || null,
        gender: data.gender,
        date_of_birth: data.dateOfBirth || null,
        updated_at: new Date(),
      };

      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update email if changed
      if (data.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: data.email,
        });

        if (emailError) throw emailError;
      }

      // Update context
      updateUserProfile({
        ...user,
        email: data.email,
        user_metadata: {
          ...user.user_metadata,
          full_name: data.fullName,
        },
      });

      toast({
        title: t('success'),
        description: t('profile.update_success'),
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: t('error'),
        description: t('profile.update_error'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update password handler
  const onUpdatePassword = async (data) => {
    try {
      setIsLoading(true);

      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (error) throw error;

      resetPasswordForm();
      
      toast({
        title: t('success'),
        description: t('profile.password_updated'),
      });
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: t('error'),
        description: t('profile.password_update_error'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Avatar upload handler
  const handleAvatarUpload = async (event) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type and size
      const fileExt = file.name.split('.').pop();
      const allowedTypes = ['jpg', 'jpeg', 'png', 'webp'];
      
      if (!allowedTypes.includes(fileExt.toLowerCase())) {
        toast({
          title: t('error'),
          description: t('profile.invalid_file_type'),
          variant: 'destructive',
        });
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: t('error'),
          description: t('profile.file_too_large'),
          variant: 'destructive',
        });
        return;
      }

      setIsUploading(true);
      
      // Upload file to storage
      const fileName = `avatar_${user.id}_${Math.random().toString(36).substring(2)}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const avatarUrl = urlData.publicUrl;

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(avatarUrl);
      
      toast({
        title: t('success'),
        description: t('profile.avatar_updated'),
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: t('error'),
        description: t('profile.avatar_update_error'),
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  if (isLoading && !user) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="container max-w-4xl mx-auto px-4 py-8"
    >
      <h1 className="text-2xl font-bold mb-6">{t('profile.title')}</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="personal">{t('profile.tabs.personal')}</TabsTrigger>
          <TabsTrigger value="security">{t('profile.tabs.security')}</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card className="p-6">
            <div className="mb-8 flex flex-col items-center">
              <div className="relative mb-4">
                <Avatar 
                  src={avatarUrl} 
                  alt={user?.user_metadata?.full_name || user?.email} 
                  className="w-24 h-24"
                />
                {isUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <Spinner size="sm" />
                  </div>
                )}
              </div>
              
              <div className="flex items-center">
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  <div className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    {t('profile.change_photo')}
                  </div>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit(onUpdateProfile)}>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="fullName" className="block text-sm font-medium">
                    {t('profile.fields.full_name')}*
                  </label>
                  <Input
                    id="fullName"
                    {...profileRegister('fullName')}
                    error={profileErrors.fullName?.message}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium">
                    {t('profile.fields.email')}*
                  </label>
                  <Input
                    id="email"
                    type="email"
                    {...profileRegister('email')}
                    error={profileErrors.email?.message}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-medium">
                    {t('profile.fields.phone')}
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    {...profileRegister('phone')}
                    error={profileErrors.phone?.message}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="preferredLanguage" className="block text-sm font-medium">
                    {t('profile.fields.preferred_language')}*
                  </label>
                  <Select
                    id="preferredLanguage"
                    {...profileRegister('preferredLanguage')}
                    error={profileErrors.preferredLanguage?.message}
                  >
                    <option value="en">{t('languages.english')}</option>
                    <option value="sw">{t('languages.swahili')}</option>
                    <option value="fr">{t('languages.french')}</option>
                    <option value="ar">{t('languages.arabic')}</option>
                    <option value="ny">{t('languages.runyankole')}</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="gender" className="block text-sm font-medium">
                    {t('profile.fields.gender')}*
                  </label>
                  <Select
                    id="gender"
                    {...profileRegister('gender')}
                    error={profileErrors.gender?.message}
                  >
                    <option value="male">{t('profile.gender_options.male')}</option>
                    <option value="female">{t('profile.gender_options.female')}</option>
                    <option value="other">{t('profile.gender_options.other')}</option>
                    <option value="prefer_not_to_say">{t('profile.gender_options.prefer_not_to_say')}</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium">
                    {t('profile.fields.date_of_birth')}
                  </label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    {...profileRegister('dateOfBirth')}
                    error={profileErrors.dateOfBirth?.message}
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label htmlFor="address" className="block text-sm font-medium">
                    {t('profile.fields.address')}
                  </label>
                  <Input
                    id="address"
                    {...profileRegister('address')}
                    error={profileErrors.address?.message}
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Spinner size="sm" className="mr-2" /> : null}
                  {t('profile.save_changes')}
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">{t('profile.change_password')}</h2>
            
            <form onSubmit={handlePasswordSubmit(onUpdatePassword)}>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="currentPassword" className="block text-sm font-medium">
                    {t('profile.fields.current_password')}*
                  </label>
                  <Input
                    id="currentPassword"
                    type="password"
                    {...passwordRegister('currentPassword')}
                    error={passwordErrors.currentPassword?.message}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="newPassword" className="block text-sm font-medium">
                    {t('profile.fields.new_password')}*
                  </label>
                  <Input
                    id="newPassword"
                    type="password"
                    {...passwordRegister('newPassword')}
                    error={passwordErrors.newPassword?.message}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium">
                    {t('profile.fields.confirm_password')}*
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...passwordRegister('confirmPassword')}
                    error={passwordErrors.confirmPassword?.message}
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Spinner size="sm" className="mr-2" /> : null}
                  {t('profile.update_password')}
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default Profile;