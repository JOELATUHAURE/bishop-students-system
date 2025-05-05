import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { getApplicationStats, getRecentApplications } from '../../services/api';
import { formatDate } from '../../utils/formatters';

// Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { Badge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { Link } from 'react-router-dom';
import ApplicationStatChart from '../../components/admin/ApplicationStatChart';

const statusVariants = {
  draft: 'default',
  submitted: 'secondary',
  inReview: 'warning',
  approved: 'success',
  rejected: 'destructive',
};

type DateFilter = 'today' | 'thisWeek' | 'thisMonth' | 'thisYear' | 'all';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [dateFilter, setDateFilter] = useState<DateFilter>('thisWeek');

  // Fetch application stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['application-stats', dateFilter],
    queryFn: () => getApplicationStats(dateFilter),
  });

  // Fetch recent applications
  const { data: recentApplications, isLoading: isLoadingApps } = useQuery({
    queryKey: ['recent-applications'],
    queryFn: () => getRecentApplications(),
  });

  // Summary metrics from stats
  const [metrics, setMetrics] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    refugeeApplications: 0,
  });

  useEffect(() => {
    if (stats) {
      setMetrics({
        total: stats.totalCount || 0,
        pending: (stats.submitted || 0) + (stats.inReview || 0),
        approved: stats.approved || 0,
        rejected: stats.rejected || 0,
        refugeeApplications: stats.refugeeCount || 0,
      });
    }
  }, [stats]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('adminDashboard.title')}</h1>
        <p className="text-gray-500">{t('adminDashboard.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title={t('adminDashboard.totalApplications')}
          value={metrics.total}
          description={t('adminDashboard.allTime')}
          loading={isLoadingStats}
        />
        
        <StatCard 
          title={t('adminDashboard.pendingReview')}
          value={metrics.pending}
          description={t('adminDashboard.needsAttention')}
          loading={isLoadingStats}
          highlight
        />
        
        <StatCard 
          title={t('adminDashboard.approved')}
          value={metrics.approved}
          description={t('adminDashboard.approvedDesc')}
          loading={isLoadingStats}
        />
        
        <StatCard 
          title={t('adminDashboard.refugeeApplicants')}
          value={metrics.refugeeApplications}
          description={t('adminDashboard.refugeeDesc')}
          loading={isLoadingStats}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>{t('adminDashboard.applicationTrends')}</CardTitle>
              <CardDescription>{t('adminDashboard.trendsDesc')}</CardDescription>
            </div>
            <Tabs 
              value={dateFilter} 
              onValueChange={(value) => setDateFilter(value as DateFilter)}
              className="w-[400px]"
            >
              <TabsList className="grid grid-cols-5">
                <TabsTrigger value="today">{t('common.today')}</TabsTrigger>
                <TabsTrigger value="thisWeek">{t('common.thisWeek')}</TabsTrigger>
                <TabsTrigger value="thisMonth">{t('common.thisMonth')}</TabsTrigger>
                <TabsTrigger value="thisYear">{t('common.thisYear')}</TabsTrigger>
                <TabsTrigger value="all">{t('common.all')}</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoadingStats ? (
              <Skeleton className="h-[350px] w-full" />
            ) : stats ? (
              <ApplicationStatChart data={stats.timeSeriesData || []} />
            ) : (
              <div className="flex items-center justify-center h-[350px]">
                <p>{t('common.noData')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('adminDashboard.recentApplications')}</CardTitle>
            <CardDescription>{t('adminDashboard.recentDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingApps ? (
              <div className="space-y-4">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : recentApplications && recentApplications.length > 0 ? (
              <div className="space-y-4">
                {recentApplications.map((app) => (
                  <div key={app.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <div className="font-medium">
                        {app.personalInfo?.firstName} {app.personalInfo?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {app.program?.substring(0, 25)}{app.program?.length > 25 ? '...' : ''}
                      </div>
                      <div className="flex items-center mt-1">
                        <Badge variant={statusVariants[app.status as keyof typeof statusVariants] as any}>
                          {t(`application.status.${app.status}`)}
                        </Badge>
                        <span className="text-xs text-gray-500 ml-2">
                          {formatDate(app.updatedAt || app.createdAt)}
                        </span>
                      </div>
                    </div>
                    <Link to={`/admin/applications/${app.id}`}>
                      <Button variant="ghost" size="sm">
                        {t('common.view')}
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {t('adminDashboard.noRecentApplications')}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('adminDashboard.applicationsByProgram')}</CardTitle>
          <CardDescription>{t('adminDashboard.programDistribution')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingStats ? (
            <Skeleton className="h-[200px] w-full" />
          ) : stats && stats.programStats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(stats.programStats).map(([program, count]) => (
                <div key={program} className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                  <div className="truncate mr-4 flex-1">
                    <div className="font-medium">{program}</div>
                    <div className="text-sm text-gray-500">{count} {t('common.applications')}</div>
                  </div>
                  <div className="text-2xl font-bold">
                    {((count / metrics.total) * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {t('common.noData')}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Helper component for stats
const StatCard = ({ 
  title, 
  value, 
  description, 
  loading,
  highlight = false
}: { 
  title: string; 
  value: number; 
  description: string; 
  loading: boolean;
  highlight?: boolean;
}) => {
  return (
    <Card className={highlight ? 'border-blue-500 shadow-md' : ''}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        <p className="text-xs text-gray-500">{description}</p>
      </CardContent>
    </Card>
  );
};

export default AdminDashboard;