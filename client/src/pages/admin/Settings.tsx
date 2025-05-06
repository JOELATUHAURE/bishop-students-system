import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings as SettingsIcon, Bell, Users, Shield } from 'lucide-react';
import api from '../../services/api';

const Settings = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    applicationReviewEmails: true,
    documentVerificationEmails: true,
  });

  const handleSettingChange = (key: string, value: boolean) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    try {
      await api.admin.updateSettings(settings);
    } catch (error) {
      console.error('Settings update error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">
          {t('admin.settings')}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* System Settings */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <SettingsIcon className="h-5 w-5 mr-2" />
            {t('admin.systemSettings')}
          </h3>
          <div className="space-y-4">
            {/* Add system settings here */}
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            {t('admin.notificationSettings')}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                {t('Email Notifications')}
              </label>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) =>
                  handleSettingChange('emailNotifications', e.target.checked)
                }
                className="form-checkbox"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                {t('SMS Notifications')}
              </label>
              <input
                type="checkbox"
                checked={settings.smsNotifications}
                onChange={(e) =>
                  handleSettingChange('smsNotifications', e.target.checked)
                }
                className="form-checkbox"
              />
            </div>
          </div>
        </div>

        {/* User Management */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            {t('admin.userManagement')}
          </h3>
          <div className="space-y-4">
            {/* Add user management settings here */}
          </div>
        </div>

        {/* Role Management */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            {t('admin.roleManagement')}
          </h3>
          <div className="space-y-4">
            {/* Add role management settings here */}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          {t('common.save')}
        </button>
      </div>
    </div>
  );
};

export default Settings;