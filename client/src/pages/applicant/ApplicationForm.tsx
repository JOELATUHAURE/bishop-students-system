import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  School,
  FileText,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Save,
  Upload,
  Loader2,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../components/ui/Toaster';

const ApplicationForm = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    personalInfo: {
      disabilityStatus: false,
      disabilityType: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelationship: '',
    },
    education: {
      institutionName: '',
      institutionType: '',
      country: '',
      city: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      isCurrentlyStudying: false,
      grade: '',
      description: '',
    },
  });

  const { data: application, isLoading } = useQuery({
    queryKey: ['application', id],
    queryFn: () => api.applications.get(id!),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.applications.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', id] });
      showToast(t('application.autosaveSuccess'), 'success');
    },
  });

  const submitMutation = useMutation({
    mutationFn: () => api.applications.submit(id!),
    onSuccess: () => {
      showToast(t('application.submissionSuccess'), 'success');
      navigate('/dashboard');
    },
  });

  useEffect(() => {
    if (application) {
      setCurrentStep(application.currentStep);
      // Populate form data from application
    }
  }, [application]);

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        ...formData,
        currentStep,
      });
    } catch (error) {
      showToast(t('errors.generic'), 'error');
    }
  };

  const handleSubmit = async () => {
    try {
      await submitMutation.mutateAsync();
    } catch (error) {
      showToast(t('errors.generic'), 'error');
    }
  };

  const steps = [
    {
      number: 1,
      title: t('application.personalInfo'),
      icon: School,
    },
    {
      number: 2,
      title: t('application.educationBackground'),
      icon: School,
    },
    {
      number: 3,
      title: t('application.documents'),
      icon: FileText,
    },
    {
      number: 4,
      title: t('application.review'),
      icon: CheckCircle,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-6">
        {/* Progress Steps */}
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {steps.map((step, stepIdx) => (
              <li
                key={step.title}
                className={`${
                  stepIdx !== steps.length - 1 ? 'flex-1' : ''
                } relative`}
              >
                <div
                  className="group flex items-center"
                  aria-current={currentStep === step.number ? 'step' : undefined}
                >
                  <span className="flex items-center px-6 py-4 text-sm font-medium">
                    <span
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                        currentStep > step.number
                          ? 'bg-primary'
                          : currentStep === step.number
                          ? 'border-2 border-primary'
                          : 'border-2 border-gray-300'
                      }`}
                    >
                      <step.icon
                        className={`h-6 w-6 ${
                          currentStep > step.number
                            ? 'text-white'
                            : currentStep === step.number
                            ? 'text-primary'
                            : 'text-gray-500'
                        }`}
                        aria-hidden="true"
                      />
                    </span>
                    <span
                      className={`ml-4 text-sm font-medium ${
                        currentStep === step.number
                          ? 'text-primary'
                          : 'text-gray-500'
                      }`}
                    >
                      {step.title}
                    </span>
                  </span>
                </div>

                {stepIdx !== steps.length - 1 && (
                  <div
                    className={`absolute right-0 top-0 hidden h-full w-5 md:block ${
                      currentStep > step.number ? 'bg-primary' : 'bg-gray-200'
                    }`}
                    aria-hidden="true"
                  />
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* Form Content */}
        <div className="bg-white shadow-md rounded-lg p-6">
          {/* Step content here */}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t('common.previous')}
          </button>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {updateMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  {t('application.saveAndExit')}
                </>
              )}
            </button>

            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.min(steps.length, prev + 1))}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
              >
                {t('common.next')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
              >
                {submitMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    {t('common.submit')}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;