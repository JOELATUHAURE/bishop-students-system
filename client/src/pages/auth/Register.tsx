import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { UserPlus, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/Toaster';

const registerSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
  phone: z.string().optional(),
  settlementSite: z.enum(['Rwamwanja', 'Kyangwali', 'Nakivale', 'Other', 'None']),
  preferredLanguage: z.enum(['english', 'swahili', 'french', 'arabic', 'runyankole']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      settlementSite: 'None',
      preferredLanguage: 'english',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      await registerUser(data);
      showToast(t('auth.accountCreated'), 'success');
      navigate('/dashboard');
    } catch (error) {
      showToast(t('errors.generic'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('auth.register')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('auth.alreadyHaveAccount')}{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary/80">
              {t('auth.login')}
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                {t('auth.firstName')}
              </label>
              <input
                {...register('firstName')}
                type="text"
                className="form-input"
                placeholder={t('auth.firstName')}
              />
              {errors.firstName && (
                <p className="form-error">
                  {t('validation.minLength', { field: t('auth.firstName'), min: 2 })}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                {t('auth.lastName')}
              </label>
              <input
                {...register('lastName')}
                type="text"
                className="form-input"
                placeholder={t('auth.lastName')}
              />
              {errors.lastName && (
                <p className="form-error">
                  {t('validation.minLength', { field: t('auth.lastName'), min: 2 })}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('auth.email')}
              </label>
              <input
                {...register('email')}
                type="email"
                className="form-input"
                placeholder={t('auth.email')}
              />
              {errors.email && (
                <p className="form-error">{t('validation.email')}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('auth.password')}
              </label>
              <input
                {...register('password')}
                type="password"
                className="form-input"
                placeholder={t('auth.password')}
              />
              {errors.password && (
                <p className="form-error">
                  {t('validation.minLength', { field: t('auth.password'), min: 6 })}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                {t('auth.confirmPassword')}
              </label>
              <input
                {...register('confirmPassword')}
                type="password"
                className="form-input"
                placeholder={t('auth.confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="form-error">{t('validation.passwordMatch')}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                {t('auth.phone')}
              </label>
              <input
                {...register('phone')}
                type="tel"
                className="form-input"
                placeholder={t('auth.phone')}
              />
              {errors.phone && (
                <p className="form-error">{t('validation.phoneFormat')}</p>
              )}
            </div>

            <div>
              <label htmlFor="settlementSite" className="block text-sm font-medium text-gray-700">
                {t('auth.settlementSite')}
              </label>
              <select {...register('settlementSite')} className="form-select">
                <option value="None">{t('settlements.none')}</option>
                <option value="Rwamwanja">{t('settlements.rwamwanja')}</option>
                <option value="Kyangwali">{t('settlements.kyangwali')}</option>
                <option value="Nakivale">{t('settlements.nakivale')}</option>
                <option value="Other">{t('settlements.other')}</option>
              </select>
            </div>

            <div>
              <label htmlFor="preferredLanguage" className="block text-sm font-medium text-gray-700">
                {t('auth.preferredLanguage')}
              </label>
              <select {...register('preferredLanguage')} className="form-select">
                <option value="english">{t('languages.english')}</option>
                <option value="swahili">{t('languages.swahili')}</option>
                <option value="french">{t('languages.french')}</option>
                <option value="arabic">{t('languages.arabic')}</option>
                <option value="runyankole">{t('languages.runyankole')}</option>
              </select>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5 mr-2" />
                  {t('auth.createAccount')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;