import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

// Components
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Avatar } from '../../components/ui/Avatar';
import { Separator } from '../../components/ui/Separator';

// Icons
import { User, Lock, Phone, Mail, Globe, Save, Upload, RefreshCw } from 'lucide-react';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  language: z.string(),
  bio: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(8, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Please confirm your password'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

const Profile = () => {
  const { t } = useTranslation();
  const { user, updateUserProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: user?.email || '',
      phone: '',
      address: '',
      city: '',
      country: '',
      language: 'en',
      bio: '',
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user?.id)
          .single();

        if (error) throw error;
        
        if (data) {
          reset({
            firstName: data.first_name,
            lastName: data.last_name,
            email: user?.email || '',
            phone: data.phone,
            address: data.address,
            city: data.city,
            country: data.country,
            language: data.language || 'en',
            bio: data.bio,
          });

          setAvatarUrl(data.avatar_url);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error(t('profile.fetchError'));
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      fetchUserProfile();
    }
  }, [user, reset, t]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsLoading(true);
      
      const profileData = {
        user_id: user?.id,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        address: data.address,
        city: data.city,
        country: data.country,
        language: data.language,
        bio: data.bio,
        updated_at: new Date(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData);

      if (error) throw error;
      
      // Update user email if changed
      if (data.email !== user?.email) {
        const { error: updateError } = await supabase.auth.updateUser({
          email: data.email,
        });

        if (updateError) throw updateError;
      }

      // Update auth context
      updateUserProfile({
        firstName: data.firstName,
        lastName: data.lastName,
      });
      
      toast.success(t('profile.saveSuccess'));
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error(t('profile.saveError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (data: PasswordFormValues) => {
    try {
      setIsPasswordLoading(true);
      
      // First verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: data.currentPassword,
      });

      if (signInError) {
        toast.error(t('profile.currentPasswordError'));
        return;
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (error) throw error;
      
      toast.success(t('profile.passwordChangeSuccess'));
      passwordForm.reset();
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(t('profile.passwordChangeError'));
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);

      // Check file size
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('profile.fileSizeError'));
        return;
      }

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      // Update profile with avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('user_id', user?.id);

      if (updateError) throw updateError;

      setAvatarUrl(data.publicUrl);
      toast.success(t('profile.avatarUploadSuccess'));
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error(t('profile.avatarUploadError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('profile.title')}</h1>
        <p className="text-gray-500">{t('profile.description')}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <User size={16} />
            {t('profile.tabs.general')}
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock size={16} />
            {t('profile.tabs.security')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="p-6 md:col-span-1">
              <div className="flex flex-col items-center space-y-4">
                <Avatar
                  src={avatarUrl || '/images/default-avatar.png'}
                  alt={`${user?.user_metadata?.firstName || ''} ${user?.user_metadata?.lastName || ''}`}
                  className="h-32 w-32"
                />
                
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {user?.user_metadata?.firstName || ''} {user?.user_metadata?.lastName || ''}
                  </h2>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>

                <label htmlFor="avatar-upload" className="w-full">
                  <div className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                    <Upload size={16} />
                    {t('profile.changeAvatar')}
                  </div>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={isLoading}
                  />
                </label>
              </div>
            </Card>

            <Card className="p-6 md:col-span-2">
              <form onSubmit={handleSubmit(onSubmit)}>
                <h2 className="text-lg font-medium mb-4">{t('profile.personalInformation')}</h2>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                      {t('profile.firstName')}
                    </label>
                    <Input
                      id="firstName"
                      {...register('firstName')}
                      error={errors.firstName?.message}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                      {t('profile.lastName')}
                    </label>
                    <Input
                      id="lastName"
                      {...register('lastName')}
                      error={errors.lastName?.message}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">
                      {t('profile.email')}
                    </label>
                    <div className="flex items-center">
                      <Mail size={16} className="mr-2 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        {...register('email')}
                        error={errors.email?.message}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                      {t('profile.phone')}
                    </label>
                    <div className="flex items-center">
                      <Phone size={16} className="mr-2 text-gray-400" />
                      <Input
                        id="phone"
                        {...register('phone')}
                        error={errors.phone?.message}
                      />
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <h2 className="text-lg font-medium mb-4">{t('profile.addressInformation')}</h2>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor="address" className="text-sm font-medium text-gray-700">
                      {t('profile.address')}
                    </label>
                    <Input
                      id="address"
                      {...register('address')}
                      error={errors.address?.message}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="city" className="text-sm font-medium text-gray-700">
                      {t('profile.city')}
                    </label>
                    <Input
                      id="city"
                      {...register('city')}
                      error={errors.city?.message}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="country" className="text-sm font-medium text-gray-700">
                      {t('profile.country')}
                    </label>
                    <Input
                      id="country"
                      {...register('country')}
                      error={errors.country?.message}
                    />
                  </div>
                </div>

                <Separator className="my-6" />

                <h2 className="text-lg font-medium mb-4">{t('profile.preferences')}</h2>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="language" className="text-sm font-medium text-gray-700">
                      {t('profile.language')}
                    </label>
                    <div className="flex items-center">
                      <Globe size={16} className="mr-2 text-gray-400" />
                      <Select
                        value={register('language').value}
                        onValueChange={(value) => setValue('language', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('profile.selectLanguage')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="sw">Swahili</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="ar">Arabic</SelectItem>
                          <SelectItem value="ny">Runyankole</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mt-6">
                  <label htmlFor="bio" className="text-sm font-medium text-gray-700">
                    {t('profile.bio')}
                  </label>
                  <Textarea
                    id="bio"
                    rows={4}
                    {...register('bio')}
                    error={errors.bio?.message}
                    placeholder={t('profile.bioPlaceholder')}
                  />
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    type="submit"
                    className="flex items-center gap-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <Save size={16} />
                    )}
                    {t('profile.saveButton')}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <Card className="p-6">
            <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)}>
              <h2 className="text-lg font-medium mb-4">{t('profile.changePassword')}</h2>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">
                    {t('profile.currentPassword')}
                  </label>
                  <Input
                    id="currentPassword"
                    type="password"
                    {...passwordForm.register('currentPassword')}
                    error={passwordForm.formState.errors.currentPassword?.