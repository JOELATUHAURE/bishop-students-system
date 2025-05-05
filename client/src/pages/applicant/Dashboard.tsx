import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getUserApplications } from '../../services/api';
import { Application } from '../../types/application';

// Components
import ApplicationCard from '../../components/application/ApplicationCard';
import StatusChart from '../../components/dashboard/StatusChart';
import RecentActivity from '../../components/dashboard/RecentActivity';
import Button from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    draft: 0,
    submitted: 0,
    inReview: 0,
    approved: 0,
    rejected: 0,
  });

  const { data: applications, isLoading, error } = useQuery({
    queryKey: ['applications'],
    queryFn: getUserApplications,
  });

  useEffect(() => {
    if (applications) {
      const newStats = applications.reduce(
        (acc, app) => {
          acc[app.status.toLowerCase()]++;
          return acc;
        },
        { draft: 0, submitted: 0, inReview: 0, approved: 0, rejected: 0 }
      );
      setStats(newStats);
    }
  }, [applications]);

  const handleNewApplication = () => {
    navigate('/applications/new');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-60" />
          <Skeleton className="h-10 w-40" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800">
        <p>{t('error.loadingApplications')}</p>
        <p className="text-sm mt-2">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('dashboard.welcome')}</h1>
        <Button onClick={handleNewApplication}>
          {t('dashboard.newApplication')}
        </Button>
      </div>

      {applications && applications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h2 className="text-xl font-medium mb-2">{t('dashboard.noApplications')}</h2>
          <p className="text-gray-600 mb-6">{t('dashboard.startApplication')}</p>
          <Button onClick={handleNewApplication}>
            {t('dashboard.newApplication')}
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium mb-4">{t('dashboard.status')}</h2>
                <StatusChart stats={stats} />
              </div>
            </div>

            <div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium mb-4">{t('dashboard.recentActivity')}</h2>
                <RecentActivity applications={applications || []} />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium mb-4">{t('dashboard.yourApplications')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {applications?.map((application: Application) => (
                <ApplicationCard 
                  key={application.id} 
                  application={application} 
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;