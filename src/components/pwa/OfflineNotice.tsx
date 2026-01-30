import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store';

export function OfflineNotice() {
  const { isOnline, setOnline } = useAppStore();
  const [showFullScreen, setShowFullScreen] = useState(false);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial state
    setOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnline]);

  // Show full screen offline view after being offline for 3 seconds
  useEffect(() => {
    if (!isOnline) {
      const timer = setTimeout(() => setShowFullScreen(true), 3000);
      return () => clearTimeout(timer);
    } else {
      setShowFullScreen(false);
    }
  }, [isOnline]);

  return (
    <>
      {/* Inline banner for brief offline */}
      <AnimatePresence>
        {!isOnline && !showFullScreen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-amber-500 text-white text-center overflow-hidden"
          >
            <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium">
              <WifiOff className="w-4 h-4" />
              <span>Нет подключения к интернету</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full screen offline view */}
      <AnimatePresence>
        {showFullScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-gray-50 flex items-center justify-center"
          >
            <div className="text-center p-8 max-w-md">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <WifiOff className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              </motion.div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">Нет подключения</h1>
              <p className="text-gray-500 mb-6">
                Проверьте подключение к интернету и попробуйте снова. Ваша корзина и данные сохранены.
              </p>
              <Button
                className="bg-brand hover:bg-brand-600 transition-all active:scale-[0.98]"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Попробовать снова
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
