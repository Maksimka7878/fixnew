import { useState } from 'react';
import { Download, X, Share, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useInstallPrompt } from '@/hooks/use-install-prompt';

export function InstallPrompt() {
  const { isInstallable, isInstalled, isIOS, showIOSInstall, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || isInstalled) return null;

  const showBanner = isInstallable || showIOSInstall;
  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm"
      >
        <div className="bg-white rounded-xl shadow-2xl border p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900">Установить Fix Price</h3>
              {isIOS ? (
                <p className="text-sm text-gray-500 mt-1">
                  Нажмите <Share className="inline w-4 h-4" /> затем <Plus className="inline w-4 h-4" /> «На экран Домой»
                </p>
              ) : (
                <p className="text-sm text-gray-500 mt-1">
                  Добавьте приложение на главный экран для быстрого доступа
                </p>
              )}
            </div>
            <button onClick={() => setDismissed(true)} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          {!isIOS && (
            <Button
              className="w-full mt-3 bg-green-600 hover:bg-green-700 transition-all active:scale-[0.98]"
              onClick={promptInstall}
            >
              <Download className="w-4 h-4 mr-2" />
              Установить
            </Button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
