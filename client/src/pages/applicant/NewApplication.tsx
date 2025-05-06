import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { School, Building2, Calendar, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../components/ui/Toaster';

const NewApplication = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    program: '',
    department: '',
    academicYear: '',
    semester: '',
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => api.applications.create(data),
    onSuccess: (data) => {
      showToast(t('Application created successfully'), 'success');
      navigate(`/applications/${data.id}/form`);
    },
    onError: () => {
      showToast(t('errors.generic'), 'error');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync(formData);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            {t('application.newApplication')}
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {t('Please fill in the basic information to start your application')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="program"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t('application.program')} *
                </label>
                <div className="mt-1 relative">
                  <School className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    id="program"
                    value={formData.program}
                    onChange={(e) =>
                      setFormData({ ...formData, program: e.target.value })
                    }
                    className="form-input pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="department"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t('application.department')} *
                </label>
                <div className="mt-1 relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    id="department"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    className="form-input pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="academicYear"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t('application.academicYear')} *
                </label>
                <div className="mt-1 relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    id="academicYear"
                    value={formData.academicYear}
                    onChange={(e) =>
                      setFormData({ ...formData, academicYear: e.target.value })
                    }
                    className="form-input pl-10"
                    required
                    placeholder="2024/2025"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="semester"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t('application.semester')} *
                </label>
                <select
                  id="semester"
                  value={formData.semester}
                  onChange={(e) =>
                    setFormData({ ...formData, semester: e.target.value })
                  }
                  className="form-select"
                  required
                >
                  <option value="">{t('common.select')}</option>
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {createMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                t('common.continue')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewApplication;