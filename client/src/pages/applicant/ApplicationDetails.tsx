import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  User,
  School,
  Download,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import api from '../../services/api';

const ApplicationDetails = () => {
  const { id } = useParams();
  const { t } = useTranslation();

  const { data: application, isLoading } = useQuery({
    queryKey: ['application', id],
    queryFn: () => api.applications.get(id!),
  });

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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">
          {t('application.applicationDetails')}
        </h2>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
            application?.status
          )}`}
        >
          {t(`dashboard.${application?.status}`)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Application Information */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            {t('application.applicationInfo')}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                {t('application.applicationNumber')}
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {application?.applicationNumber}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                {t('application.program')}
              </label>
              <p className="mt-1 text-sm text-gray-900">{application?.program}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                {t('application.department')}
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {application?.department}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                {t('application.academicYear')}
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {application?.academicYear}
              </p>
            </div>
          </div>
        </div>

        {/* Status Information */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            {t('application.currentStatus')}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                {t('application.submissionDate')}
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {application?.submittedAt
                  ? new Date(application.submittedAt).toLocaleDateString()
                  : '-'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                {t('application.reviewDate')}
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {application?.reviewedAt
                  ? new Date(application.reviewedAt).toLocaleDateString()
                  : '-'}
              </p>
            </div>
            {application?.status === 'rejected' && (
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  {t('application.rejectionReason')}
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {application.rejectionReason}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Education Records */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <School className="h-5 w-5 mr-2" />
            {t('application.educationBackground')}
          </h3>
          <div className="space-y-4">
            {application?.educationRecords?.map((record: any) => (
              <div key={record.id} className="border-b pb-4">
                <h4 className="font-medium text-gray-900">
                  {record.institutionName}
                </h4>
                <p className="text-sm text-gray-600">{record.degree}</p>
                <p className="text-sm text-gray-600">{record.fieldOfStudy}</p>
                <p className="text-sm text-gray-500">
                  {new Date(record.startDate).getFullYear()} -{' '}
                  {record.isCurrentlyStudying
                    ? t('application.currentlyStudying')
                    : new Date(record.endDate).getFullYear()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            {t('application.documents')}
          </h3>
          <div className="space-y-4">
            {application?.documents?.map((document: any) => (
              <div
                key={document.id}
                className="flex items-center justify-between border-b pb-4"
              >
                <div>
                  <h4 className="font-medium text-gray-900">{document.name}</h4>
                  <p className="text-sm text-gray-600">
                    {t(`application.${document.type}`)}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  {document.verified ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Clock className="h-5 w-5 text-yellow-500" />
                  )}
                  <button
                    onClick={() => {
                      // Handle document download
                    }}
                    className="text-primary hover:text-primary/80"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetails;