import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getApplication, updateApplication, uploadDocument } from '../../services/api';
import { useToast } from '../../hooks/useToast';

// Components
import PersonalInfoForm from '../../components/application/PersonalInfoForm';
import EducationForm from '../../components/application/EducationForm';
import DocumentUploadForm from '../../components/application/DocumentUploadForm';
import ReviewSubmit from '../../components/application/ReviewSubmit';
import StepIndicator from '../../components/application/StepIndicator';
import Button from '../../components/ui/Button';
import LoadingScreen from '../../components/ui/LoadingScreen';

const steps = ['personal', 'education', 'documents', 'review'];

const ApplicationForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      nationality: '',
      address: '',
      city: '',
      country: '',
      refugee: false,
      refugeeId: '',
    },
    education: {
      highSchool: '',
      graduationYear: '',
      qualification: '',
      otherQualifications: [],
    },
    documents: {
      identificationDoc: null,
      academicTranscript: null,
      refugeeStatusDoc: null,
      otherDocs: [],
    }
  });
  
  // Fetch application data
  const { data: application, isLoading, error } = useQuery({
    queryKey: ['application', id],
    queryFn: () => getApplication(id as string),
    enabled: !!id,
  });

  // Update application data
  const updateMutation = useMutation({
    mutationFn: (data: any) => updateApplication(id as string, data),
    onSuccess: () => {
      toast({
        title: t('application.saved'),
        description: t('application.dataSaved'),
      });
    },
    onError: () => {
      toast({
        title: t('error.title'),
        description: t('error.savingData'),
        variant: 'destructive',
      });
    },
  });

  // Upload document
  const uploadMutation = useMutation({
    mutationFn: ({ file, type }: { file: File, type: string }) => 
      uploadDocument(id as string, file, type),
    onSuccess: () => {
      toast({
        title: t('document.uploaded'),
        description: t('document.uploadSuccess'),
      });
    },
    onError: () => {
      toast({
        title: t('error.title'),
        description: t('error.uploadingDocument'),
        variant: 'destructive',
      });
    },
  });

  // Load application data when available
  useEffect(() => {
    if (application) {
      setFormData({
        personalInfo: application.personalInfo || formData.personalInfo,
        education: application.education || formData.education,
        documents: application.documents || formData.documents,
      });
    }
  }, [application]);

  // Save data when changing steps (auto-save)
  const handleStepChange = async (stepIndex: number) => {
    if (stepIndex > currentStep) {
      // Save current step data before proceeding
      await updateMutation.mutateAsync(formData);
    }
    setCurrentStep(stepIndex);
  };

  const handleUpdateFormData = (section: string, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        ...data
      }
    }));
  };

  const handleDocumentUpload = async (file: File, type: string) => {
    await uploadMutation.mutateAsync({ file, type });
  };

  const handleSubmit = async () => {
    try {
      await updateMutation.mutateAsync({
        ...formData,
        status: 'submitted',
        submittedAt: new Date().toISOString(),
      });
      toast({
        title: t('application.submitted'),
        description: t('application.submissionSuccess'),
      });
      navigate(`/applications/${id}`);
    } catch (error) {
      toast({
        title: t('error.title'),
        description: t('error.submittingApplication'),
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800">
        <p>{t('error.loadingApplication')}</p>
        <p className="text-sm mt-2">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('application.form')}</h1>
          <p className="text-gray-500">{application?.program}</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button
            variant="outline"
            onClick={() => navigate(`/applications/${id}`)}
          >
            {t('common.cancel')}
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <StepIndicator 
          steps={steps.map(step => t(`application.steps.${step}`))} 
          currentStep={currentStep}
          onStepClick={handleStepChange}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        {currentStep === 0 && (
          <PersonalInfoForm 
            data={formData.personalInfo} 
            onChange={(data) => handleUpdateFormData('personalInfo', data)} 
          />
        )}
        
        {currentStep === 1 && (
          <EducationForm 
            data={formData.education} 
            onChange={(data) => handleUpdateFormData('education', data)} 
          />
        )}
        
        {currentStep === 2 && (
          <DocumentUploadForm 
            data={formData.documents} 
            onChange={(data) => handleUpdateFormData('documents', data)}
            onUpload={handleDocumentUpload}
            isUploading={uploadMutation.isPending}
          />
        )}
        
        {currentStep === 3 && (
          <ReviewSubmit 
            formData={formData} 
            onSubmit={handleSubmit} 
            isSubmitting={updateMutation.isPending}
          />
        )}

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => handleStepChange(currentStep - 1)}
            disabled={currentStep === 0 || updateMutation.isPending}
          >
            {t('common.previous')}
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button
              onClick={() => handleStepChange(currentStep + 1)}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? t('common.saving') : t('common.next')}
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? t('common.submitting') : t('application.submit')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;