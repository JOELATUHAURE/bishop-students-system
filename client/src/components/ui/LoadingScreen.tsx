import { CircleNotch } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const LoadingScreen: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <motion.div
        className="flex flex-col items-center justify-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          <CircleNotch className="h-12 w-12 text-primary" />
        </motion.div>
        <h2 className="text-xl font-semibold text-foreground">
          {t('common.loading')}
        </h2>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;