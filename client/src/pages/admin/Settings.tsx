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
import { Switch } from '../../components/ui/Switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';
import { Separator } from '../../components/ui/Separator';

// Icons
import { Save, Bell, Globe, Shield, Mail, Phone, RefreshCw } from 'lucide-react';

const settingsSchema = z.object({
  systemName: z.string().min(3, 'System name is required'),
  supportEmail: z.string().email('Invalid email address'),
  supportPhone: z.string().optional(),
  defaultLanguage: z.string(),
  enableSmsNotifications: z.boolean(),
  enableEmailNotifications: z.boolean(),
  applicationDeadline: z.string().optional(),
  maxFileSize: z.number().min(1, 'File size must be at least 1MB'),
  autoArchiveDays: z.number().min(1, 'Days must be at least 1'),
  requireVerification: z.boolean(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const Settings = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      systemName: 'Bishop Stuart University Admission System',
      supportEmail: 'admissions@bsu.ac.ug',
      supportPhone: '+256 700 123456',
      defaultLanguage: 'en',
      enableSmsNotifications: true,
      enableEmailNotifications: true,
      applicationDeadline: '',
      maxFileSize: 5,
      autoArchiveDays: 90,
      requireVerification: true,
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .limit(1)
          .single();

        if (error) throw error;
        
        if (data) {
          reset(data);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error(t('settings.fetchError'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [reset, t]);

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      setIsLoading(true);
      
      // Log the action
      await supabase.from('audit_logs').insert({
        user_id: user?.id,
        action: 'UPDATE_SETTINGS',
        entity_type: 'settings',
        details: data,
      });

      // Update settings
      const { error } = await supabase
        .from('settings')
        .update(data)
        .eq('id', 1);

      if (error) throw error;
      
      toast.success(t('settings.saveSuccess'));
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(t('settings.saveError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    reset();
    toast.success(t('settings.resetSuccess'));
  };

  return (
    <div className="container px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h1>
        <p className="text-gray-500">{t('settings.description')}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe size={16} />
            {t('settings.tabs.general')}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell size={16} />
            {t('settings.tabs.notifications')}
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield size={16} />
            {t('settings.tabs.security')}
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit(onSubmit)}>
          <TabsContent value="general">
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-medium mb-4">{t('settings.general.title')}</h2>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="systemName" className="text-sm font-medium text-gray-700">
                      {t('settings.general.systemName')}
                    </label>
                    <Input
                      id="systemName"
                      {...register('systemName')}
                      error={errors.systemName?.message}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="defaultLanguage" className="text-sm font-medium text-gray-700">
                      {t('settings.general.defaultLanguage')}
                    </label>
                    <Select
                      defaultValue="en"
                      onValueChange={(value) => setValue('defaultLanguage', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('settings.general.selectLanguage')} />
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

                  <div className="space-y-2">
                    <label htmlFor="supportEmail" className="text-sm font-medium text-gray-700">
                      {t('settings.general.supportEmail')}
                    </label>
                    <Input
                      id="supportEmail"
                      type="email"
                      {...register('supportEmail')}
                      error={errors.supportEmail?.message}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="supportPhone" className="text-sm font-medium text-gray-700">
                      {t('settings.general.supportPhone')}
                    </label>
                    <Input
                      id="supportPhone"
                      {...register('supportPhone')}
                      error={errors.supportPhone?.message}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="applicationDeadline" className="text-sm font-medium text-gray-700">
                      {t('settings.general.applicationDeadline')}
                    </label>
                    <Input
                      id="applicationDeadline"
                      type="date"
                      {...register('applicationDeadline')}
                      error={errors.applicationDeadline?.message}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="maxFileSize" className="text-sm font-medium text-gray-700">
                      {t('settings.general.maxFileSize')} (MB)
                    </label>
                    <Input
                      id="maxFileSize"
                      type="number"
                      {...register('maxFileSize', { valueAsNumber: true })}
                      error={errors.maxFileSize?.message}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-medium mb-4">{t('settings.notifications.title')}</h2>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">
                        {t('settings.notifications.enableEmail')}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {t('settings.notifications.enableEmailDescription')}
                      </p>
                    </div>
                    <Switch
                      checked={Boolean(register('enableEmailNotifications').value)}
                      onCheckedChange={(checked) => setValue('enableEmailNotifications', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">
                        {t('settings.notifications.enableSms')}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {t('settings.notifications.enableSmsDescription')}
                      </p>
                    </div>
                    <Switch
                      checked={Boolean(register('enableSmsNotifications').value)}
                      onCheckedChange={(checked) => setValue('enableSmsNotifications', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <label htmlFor="autoArchiveDays" className="text-sm font-medium text-gray-700">
                      {t('settings.notifications.autoArchiveDays')}
                    </label>
                    <Input
                      id="autoArchiveDays"
                      type="number"
                      {...register('autoArchiveDays', { valueAsNumber: true })}
                      error={errors.autoArchiveDays?.message}
                    />
                    <p className="text-sm text-gray-500">
                      {t('settings.notifications.autoArchiveDaysDescription')}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-medium mb-4">{t('settings.security.title')}</h2>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">
                        {t('settings.security.requireVerification')}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {t('settings.security.requireVerificationDescription')}
                      </p>
                    </div>
                    <Switch
                      checked={Boolean(register('requireVerification').value)}
                      onCheckedChange={(checked) => setValue('requireVerification', checked)}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <div className="mt-6 flex items-center justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              <RefreshCw size={16} />
              {t('settings.resetButton')}
            </Button>
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
              {t('settings.saveButton')}
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  );
};

export default Settings;