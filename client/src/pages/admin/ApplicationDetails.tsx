import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Clock, FileText, User, School } from 'lucide-react';
import api from '../../services/api';
import LoadingScreen from "../../components/ui/LoadingScreen";

const AdminApplicationDetails = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [reviewData, setReviewData] = useState({
    status: '',
    comments: '',
    rejectionReason: '',
  });

  // Query to fetch application data
  const { data: application, isLoading, isError, error } = useQuery({
    queryKey: ['application', id],
    queryFn: () => api.admin.getApplication(id!),
  });

  // Mutation for reviewing the application
  const reviewMutation = useMutation({
    mutationFn: (data: typeof reviewData) => api.admin.reviewApplication(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', id] });
    },
  });

  const handleReview = async () => {
    try {
      await reviewMutation.mutateAsync(reviewData);
    } catch (error) {
      console.error('Review error:', error);
    }
  };

  // ✅ Use your animated LoadingScreen component for loading state
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">
          {t('admin.applicationDetails')} - {application?.applicationNumber}
        </h2>
        <div className="flex items-center space-x-4">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium
              ${application?.status === 'approved' ? 'bg-green-100 text-green-800' :
                application?.status === 'rejected' ? 'bg-red-100 text-red-800' :
                application?.status === 'waitlisted' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}
          >
            {t(`dashboard.${application?.status}`)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Applicant Information */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <User className="h-5 w-5 mr-2" />
            {t('admin.applicantInfo')}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                {t('auth.firstName')}
              </label>
              <p className="mt-1 text-sm text-gray-900">{application?.user.firstName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                {t('auth.lastName')}
              </label>
              <p className="mt-1 text-sm text-gray-900">{application?.user.lastName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                {t('auth.email')}
              </label>
              <p className="mt-1 text-sm text-gray-900">{application?.user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                {t('auth.phone')}
              </label>
              <p className="mt-1 text-sm text-gray-900">{application?.user.phone}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                {t('auth.settlementSite')}
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {t(`settlements.${application?.user.settlementSite.toLowerCase()}`)}
              </p>
            </div>
          </div>
        </div>

        {/* Application Information */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            {t('admin.applicationInfo')}
          </h3>
          <div className="space-y-4">
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
              <p className="mt-1 text-sm text-gray-900">{application?.department}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                {t('application.academicYear')}
              </label>
              <p className="mt-1 text-sm text-gray-900">{application?.academicYear}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                {t('application.submissionDate')}
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(application?.submittedAt).toLocaleDateString()}
              </p>
            </div>
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
                <h4 className="font-medium text-gray-900">{record.institutionName}</h4>
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

        {/* Review Section */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {t('admin.reviewApplication')}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                {t('common.status')}
              </label>
              <select
                value={reviewData.status}
                onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                className="form-select mt-1"
              >
                <option value="">{t('common.select')}</option>
                <option value="under_review">{t('dashboard.under_review')}</option>
                <option value="approved">{t('dashboard.approved')}</option>
                <option value="rejected">{t('dashboard.rejected')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                {t('admin.comments')}
              </label>
              <textarea
                value={reviewData.comments}
                onChange={(e) => setReviewData({ ...reviewData, comments: e.target.value })}
                className="form-textarea mt-1"
                placeholder={t('admin.commentsPlaceholder')}
              />
            </div>
            {reviewData.status === 'rejected' && (
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  {t('admin.rejectionReason')}
                </label>
                <textarea
                  value={reviewData.rejectionReason}
                  onChange={(e) => setReviewData({ ...reviewData, rejectionReason: e.target.value })}
                  className="form-textarea mt-1"
                  placeholder={t('admin.rejectionReasonPlaceholder')}
                />
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleReview}
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md"
              >
                {t('common.submitReview')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminApplicationDetails;
