import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();

  return (
    <header className="bg-primary text-primary-foreground shadow">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl font-bold">
            BSU Refugee System
          </Link>
          
          <nav className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm">{user.email}</span>
                <button
                  onClick={signOut}
                  className="text-sm hover:text-primary-foreground/80"
                >
                  {t('auth.signOut')}
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="text-sm hover:text-primary-foreground/80"
              >
                {t('auth.signIn')}
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 