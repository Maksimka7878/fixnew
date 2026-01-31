import { useEffect, useState } from 'react';
import { AlertCircle, Download, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface UpdateReadyEvent extends Event {
  detail?: {
    registration: ServiceWorkerRegistration;
  };
}

export function UpdatePrompt() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      console.log('⚠️ Service Workers не поддерживаются');
      return;
    }

    // Слушать обновления
    const handleUpdateAvailable = (event: Event) => {
      const customEvent = event as UpdateReadyEvent;
      const reg = customEvent.detail?.registration || (event.target as any).registration;

      if (reg) {
        setRegistration(reg);
        setUpdateAvailable(true);
        toast.info('📦 Доступно обновление приложения', {
          duration: 0, // Не автозакрывать
        });
      }
    };

    // Слушать стандартное событие (vite-plugin-pwa)
    if ('__VITE_PLUGIN_PWA__' in window) {
      window.addEventListener('vite:pwaUpdateReady', handleUpdateAvailable);
    }

    // Слушать sw:updated событие (fallback)
    document.addEventListener('sw:updated', handleUpdateAvailable);

    // Проверить обновления каждые 60 секунд
    const updateCheckInterval = setInterval(() => {
      if (navigator.serviceWorker?.controller) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((reg) => {
            reg.update().catch((error) => {
              console.warn('❌ Ошибка при проверке обновлений:', error);
            });
          });
        });
      }
    }, 60000);

    return () => {
      window.removeEventListener('vite:pwaUpdateReady', handleUpdateAvailable);
      document.removeEventListener('sw:updated', handleUpdateAvailable);
      clearInterval(updateCheckInterval);
    };
  }, []);

  const handleUpdate = async () => {
    if (!registration?.waiting) {
      console.warn('⚠️ Нет доступного обновления');
      return;
    }

    setIsUpdating(true);
    toast.loading('🔄 Обновление приложения...', { duration: 0 });

    try {
      // Отправить сообщение Service Worker о необходимости обновления
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });

      // Слушать активацию нового Service Worker
      let refreshing = false;
      navigator.serviceWorker?.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    } catch (error) {
      console.error('❌ Ошибка при обновлении:', error);
      toast.error('❌ Ошибка при обновлении приложения');
      setIsUpdating(false);
    }
  };

  const handleLater = () => {
    setUpdateAvailable(false);
    toast.success('✅ Обновление отложено');
  };

  const handleCheckForUpdates = async () => {
    toast.loading('🔍 Проверка обновлений...');
    try {
      const registrations = await navigator.serviceWorker?.getRegistrations() || [];
      let foundUpdate = false;

      for (const reg of registrations) {
        const updateRequest = await reg.update();
        if (reg.waiting) {
          foundUpdate = true;
          setRegistration(reg);
          setUpdateAvailable(true);
        }
      }

      if (foundUpdate) {
        toast.success('📦 Найдено обновление');
      } else {
        toast.info('✨ Приложение в актуальном состоянии');
      }
    } catch (error) {
      console.error('❌ Ошибка при проверке:', error);
      toast.error('❌ Ошибка при проверке обновлений');
    }
  };

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 z-50 animate-in slide-in-from-bottom">
      <Card className="border-brand shadow-lg">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <Download className="w-5 h-5 text-brand animate-pulse" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                📦 Доступно обновление
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Новая версия приложения готова к установке
              </p>
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="bg-brand hover:bg-brand-600"
                >
                  {isUpdating ? (
                    <>
                      <RotateCw className="w-4 h-4 mr-1 animate-spin" />
                      Обновляю...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-1" />
                      Обновить
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleLater}
                  disabled={isUpdating}
                >
                  Позже
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Вспомогательный компонент для кнопки проверки обновлений
export function UpdateCheckButton() {
  const [checking, setChecking] = useState(false);

  const handleCheck = async () => {
    setChecking(true);
    try {
      const registrations = await navigator.serviceWorker?.getRegistrations() || [];
      for (const reg of registrations) {
        await reg.update();
      }
      toast.success('✨ Проверка завершена');
    } catch (error) {
      toast.error('❌ Ошибка при проверке');
    } finally {
      setChecking(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={handleCheck}
      disabled={checking}
      title="Проверить обновления"
    >
      {checking ? (
        <RotateCw className="w-4 h-4 animate-spin" />
      ) : (
        <RotateCw className="w-4 h-4" />
      )}
    </Button>
  );
}
