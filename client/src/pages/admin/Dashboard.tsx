import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, Users, FileCheck, FileX, Clock, PieChart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingReview: 0,
    approved: 0,
    rejected: 0,
    waitlisted: 0,
    bySettlement: {
      rwamwanja: 0,
      kyangwali: 0,
      nakivale: 0,
    },
  });

  const { data: statsData, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => api.admin.getStats(),
  });

  useEffect(() => {
    if (statsData) {
      setStats(statsData);
    }
  }, [statsData]);

  const statCards = [
    {
      title: t('admin.totalApplications'),
      value: stats.totalApplications,
      icon: FileCheck,
      color: 'bg-primary',
    },
    {
      title: t('admin.pendingReview'),
      value: stats.pendingReview,
      icon: Clock,
      color: 'bg-warning',
    },
    {
      title: t('admin.approved'),
      value: stats.approved,
      icon: FileCheck,
      color: 'bg-success',
    },
    {
      title: t('admin.rejected'),
      value: stats.rejected,
      icon: FileX,
      color: 'bg-destructive',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="rounded-lg bg-white p-6 shadow-md"
          >
            <div className="flex items-center">
              <div className={`rounded-full ${stat.color} p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {t('admin.bySettlement')}
          </h3>
          <div className="space-y-4">
            {Object.entries(stats.bySettlement).map(([site, count]) => (
              <div key={site} className="flex items-center justify-between">
                <span className="text-gray-600">{t(`settlements.${site}`)}</span>
                <span className="text-gray-900 font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {t('admin.recentActivity')}
          </h3>
          {/* Add recent activity list here */}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;