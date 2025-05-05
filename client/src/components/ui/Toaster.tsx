import React, { createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, X, XCircle } from 'lucide-react';

// Types
interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: Toast['type'], duration?: number) => void;
}

// Create context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Icons mapping
const icons = {
  success: <CheckCircle className="w-5 h-5" />,
  error: <XCircle className="w-5 h-5" />,
  warning: <AlertCircle className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />,
};

// Colors mapping
const colors = {
  success: 'bg-success text-white',
  error: 'bg-destructive text-white',
  warning: 'bg-warning text-white',
  info: 'bg-primary text-white',
};

// Provider component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: Toast['type'] = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prevToasts => [...prevToasts, { id, message, type, duration }]);

    // Auto remove toast after duration
    setTimeout(() => {
      setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-0 right-0 p-4 z-50 flex flex-col gap-2 max-w-md w-full">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              className={`rounded-lg shadow-lg p-4 flex items-center gap-3 ${colors[toast.type]}`}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <span>{icons[toast.type]}</span>
              <span className="flex-1">{toast.message}</span>
              <button
                className="text-white hover:text-white/80 transition-colors"
                onClick={() => removeToast(toast.id)}
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

// Hook
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Component
export const Toaster: React.FC = () => {
  return <ToastProvider>{null}</ToastProvider>;
};