import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FileText, Plus } from 'lucide-react';
import api from '../../services/api';
import LoadingScreen from "../../components/ui/LoadingScreen";

const Dashboard = () => {
  const { t } = useTranslation();

  // Query to fetch applications
  const { data: applications = [], isLoading, isError, error } = useQuery({
    queryKey: ['applications'],
    queryFn: () => api.applications.list(),
  });

  // ✅ Use your animated LoadingScreen component
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Handle errors
  if (isError) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          {t('common.error', 'Something went wrong!')}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {error instanceof Error ? error.message : 'Error occurred while fetching data.'}
        </p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'waitlisted':
        return 'bg-yellow-100 text-yellow-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">
          {t('dashboard.title', 'My Applications')}
        </h2>
        <Link
          to="/applications/new"
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          {t('dashboard.startApplication', 'Start New Application')}
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {t('dashboard.noApplications', 'No applications yet')}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {t('dashboard.startNow', 'Get started by creating a new application.')}
          </p>
          <div className="mt-6">
            <Link
              to="/applications/new"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t('dashboard.startApplication', 'Start New Application')}
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('application.applicationNumber', 'Application ID')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('application.program', 'Program')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.status', 'Status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('application.submissionDate', 'Submitted')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.actions', 'Actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map((application: any) => (
                  <tr key={application.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {application.applicationNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {application.program}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          application.status
                        )}`}
                      >
                        {t(`dashboard.${application.status}`, application.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {application.submittedAt
                        ? new Date(application.submittedAt).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/applications/${application.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        {application.status === 'draft'
                          ? t('dashboard.continueApplication', 'Continue')
                          : t('common.view', 'View')}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
