import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { getApplication, getApplicationDocuments } from '../../services/api';
import { formatDate } from '../../utils/formatters';

// Components
import { Badge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import DocumentList from '../../components/application/DocumentList';
import ApplicationTimeline from '../../components/application/ApplicationTimeline';
import ApplicationComments from '../../components/application/ApplicationComments';

// Status badge variants
const statusVariants = {
  draft: 'default',
  submitted: 'secondary',
  inReview: 'warning',
  approved: 'success',
  rejected: 'destructive',
};

const ApplicationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: application, isLoading: isLoadingApp } = useQuery({
    queryKey: ['application', id],
    queryFn: () => getApplication(id as string),
    enabled: !!id,
  });

  const { data: documents, isLoading: isLoadingDocs } = useQuery({
    queryKey: ['application-documents', id],
    queryFn: () => getApplicationDocuments(id as string),
    enabled: !!id,
  });

  const handleEdit = () => {
    navigate(`/applications/${id}/form`);
  };

  if (isLoadingApp) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-60" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800">
        <p>{t('error.applicationNotFound')}</p>
      </div>
    );
  }

  const canEdit = application.status === 'draft' || application.status === 'rejected';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center">
        <div>
          <h1 className="text-2xl font-bold">{t('application.details')}</h1>
          <div className="flex items-center mt-2">
            <Badge variant={statusVariants[application.status as keyof typeof statusVariants] as any}>
              {t(`application.status.${application.status}`)}
            </Badge>
            <p className="text-sm text-gray-500 ml-4">
              {application.submittedAt 
                ? `${t('application.submitted')}: ${formatDate(application.submittedAt)}`
                : t('application.notSubmitted')}
            </p>
          </div>
        </div>
        
        {canEdit && (
          <Button 
            onClick={handleEdit} 
            className="mt-4 md:mt-0"
          >
            {t('common.edit')}
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{application.program}</CardTitle>
          <CardDescription>
            {t('application.programType')}: {t(`application.${application.programType}`)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">{t('application.applicationId')}</dt>
              <dd className="mt-1 text-sm">{application.id}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">{t('application.appliedOn')}</dt>
              <dd className="mt-1 text-sm">
                {application.createdAt ? formatDate(application.createdAt) : '-'}
              </dd>
            </div>
            {application.updatedAt && (
              <div>
                <dt className="text-sm font-medium text-gray-500">{t('application.lastUpdated')}</dt>
                <dd className="mt-1 text-sm">{formatDate(application.updatedAt)}</dd>
              </div>
            )}
            {application.reviewedAt && (
              <div>
                <dt className="text-sm font-medium text-gray-500">{t('application.reviewedOn')}</dt>
                <dd className="mt-1 text-sm">{formatDate(application.reviewedAt)}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <Tabs defaultValue="details">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="details">{t('application.personalDetails')}</TabsTrigger>
          <TabsTrigger value="documents">{t('application.documents')}</TabsTrigger>
          <TabsTrigger value="timeline">{t('application.timeline')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('application.personalInformation')}</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">{t('application.name')}</dt>
                  <dd className="mt-1 text-sm">
                    {application.personalInfo?.firstName} {application.personalInfo?.lastName}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">{t('application.email')}</dt>
                  <dd className="mt-1 text-sm">{application.personalInfo?.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">{t('application.phone')}</dt>
                  <dd className="mt-1 text-sm">{application.personalInfo?.phone || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">{t('application.dateOfBirth')}</dt>
                  <dd className="mt-1 text-sm">
                    {application.personalInfo?.dateOfBirth 
                      ? formatDate(application.personalInfo.dateOfBirth)
                      : '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">{t('application.nationality')}</dt>
                  <dd className="mt-1 text-sm">{application.personalInfo?.nationality || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">{t('application.refugee')}</dt>
                  <dd className="mt-1 text-sm">
                    {application.personalInfo?.refugee 
                      ? t('common.yes') 
                      : t('common.no')}
                  </dd>
                </div>
                {application.personalInfo?.refugee && application.personalInfo?.refugeeId && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">{t('application.refugeeId')}</dt>
                    <dd className="mt-1 text-sm">{application.personalInfo.refugeeId}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('application.educationBackground')}</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">{t('application.highSchool')}</dt>
                  <dd className="mt-1 text-sm">{application.education?.highSchool || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">{t('application.graduationYear')}</dt>
                  <dd className="mt-1 text-sm">{application.education?.graduationYear || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">{t('application.qualification')}</dt>
                  <dd className="mt-1 text-sm">{application.education?.qualification || '-'}</dd>
                </div>
              </dl>
              
              {application.education?.otherQualifications && 
               application.education.otherQualifications.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    {t('application.otherQualifications')}
                  </h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {application.education.otherQualifications.map((qual, index) => (
                      <li key={index} className="text-sm">{qual}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>{t('application.uploadedDocuments')}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingDocs ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <DocumentList documents={documents || []} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>{t('application.applicationTimeline')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ApplicationTimeline application={application} />
            </CardContent>
          </Card>
          
          {(application.status === 'inReview' || 
            application.status === 'approved' || 
            application.status