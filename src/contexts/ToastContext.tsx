import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className={`
                pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border min-w-[300px] max-w-md
                ${toast.type === 'success' ? 'bg-[#16181D] border-emerald-500/30 text-white' : ''}
                ${toast.type === 'error' ? 'bg-[#16181D] border-rose-500/30 text-white' : ''}
                ${toast.type === 'info' ? 'bg-[#16181D] border-[#4F46E5]/30 text-white' : ''}
              `}
            >
              <div className={`p-1.5 rounded-lg ${
                toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-500' : 
                toast.type === 'error' ? 'bg-rose-500/20 text-rose-500' : 
                'bg-[#4F46E5]/20 text-[#4F46E5]'
              }`}>
                {toast.type === 'success' && <CheckCircle className="h-4 w-4" />}
                {toast.type === 'error' && <XCircle className="h-4 w-4" />}
                {toast.type === 'info' && <Info className="h-4 w-4" />}
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-medium leading-tight">{toast.message}</p>
              </div>
              <button 
                onClick={() => removeToast(toast.id)}
                className="text-[#5E6269] hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
