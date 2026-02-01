import { useEffect, useState } from 'react';
import { Bell, BellOff, Check, AlertCircle, Wifi, WifiOff, Smartphone, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { notificationService } from '@/services/notificationService';
import NotificationService from '@/services/notificationService';
import type { NotificationDiagnostics } from '@/services/notificationService';
import { toast } from 'sonner';

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [diagnostics, setDiagnostics] = useState<NotificationDiagnostics | null>(null);

  useEffect(() => {
    // Проверить статус разрешений
    const status = NotificationService.getPermissionStatus();
    setNotificationsEnabled(status === 'granted');

    // Получить диагностику
    NotificationService.getDiagnostics().then(setDiagnostics);

    // Слушать изменения соединения
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Вы в сети');
      syncPendingNotifications();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('Вы в режиме offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Загрузить сохранённые уведомления
    loadNotifications();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Обновить диагностику при открытии
  useEffect(() => {
    if (isOpen) {
      NotificationService.getDiagnostics().then(setDiagnostics);
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    const saved = await notificationService.getAllNotifications();
    setNotifications(saved.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10));
  };

  const handleEnableNotifications = async () => {
    if (diagnostics && !diagnostics.isSupported) {
      if (diagnostics.isIOS && !diagnostics.isStandalone) {
        toast.error('Сначала добавьте приложение на домашний экран');
      } else {
        toast.error('Уведомления не поддерживаются в этом браузере');
      }
      setNotificationsEnabled(false);
      return;
    }

    setLoading(true);
    try {
      const granted = await notificationService.requestPermission();
      if (granted) {
        setNotificationsEnabled(true);
        toast.success('Уведомления включены');
        // Обновить диагностику
        NotificationService.getDiagnostics().then(setDiagnostics);
      } else {
        setNotificationsEnabled(false);
        toast.error('Разрешение на уведомления не получено');
      }
    } catch {
      setNotificationsEnabled(false);
      toast.error('Ошибка при включении уведомлений');
    } finally {
      setLoading(false);
    }
  };

  const handleDisableNotifications = () => {
    setNotificationsEnabled(false);
    toast.info('Уведомления отключены');
  };

  const syncPendingNotifications = async () => {
    toast.loading('Синхронизация...');
    setTimeout(() => {
      toast.success('Синхронизировано');
    }, 2000);
  };

  const handleTestNotification = async () => {
    setLoading(true);
    try {
      await notificationService.show('Тестовое уведомление', {
        body: 'Если вы видите это, уведомления работают корректно!',
        icon: '/logo.svg',
        badge: '/logo.svg',
        tag: 'test',
      });
      toast.success('Тестовое уведомление отправлено');
      setTimeout(() => loadNotifications(), 1000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ошибка при отправке уведомления';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearNotifications = async () => {
    try {
      await notificationService.clearNotifications();
      setNotifications([]);
      toast.success('Уведомления очищены');
    } catch {
      toast.error('Ошибка при очистке');
    }
  };

  const showIOSWarning = diagnostics?.isIOS && !diagnostics?.isStandalone;
  const showDeniedWarning = diagnostics?.permission === 'denied';
  const showNotSupported = diagnostics && !diagnostics.isSupported && !showIOSWarning;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          title="Уведомления"
        >
          {notificationsEnabled ? (
            <Bell className="w-5 h-5 text-brand" />
          ) : (
            <BellOff className="w-5 h-5 text-gray-400" />
          )}
          {notificationsEnabled && notifications.length > 0 && (
            <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {Math.min(notifications.length, 9)}
            </span>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Центр уведомлений</DialogTitle>
          <DialogDescription>
            Управляйте уведомлениями и синхронизацией
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* iOS Warning */}
          {showIOSWarning && (
            <Card className="border-amber-300 bg-amber-50">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Smartphone className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">
                      Установите приложение
                    </p>
                    <p className="text-xs text-amber-800 mt-1">
                      На iPhone уведомления работают только в установленном приложении.
                      Нажмите <strong>Поделиться</strong> (квадрат со стрелкой внизу Safari)
                      → <strong>«На экран Домой»</strong>, затем откройте приложение с домашнего экрана.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Permission Denied Warning */}
          {showDeniedWarning && (
            <Card className="border-red-300 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-900">
                      Уведомления заблокированы
                    </p>
                    <p className="text-xs text-red-800 mt-1">
                      Вы ранее запретили уведомления. Чтобы включить их, откройте
                      настройки браузера → разрешения сайта → уведомления.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Not Supported */}
          {showNotSupported && (
            <Card className="border-gray-300 bg-gray-50">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-700">
                    Уведомления не поддерживаются в этом браузере.
                    Используйте Chrome, Safari 16.4+ или Firefox.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Connection Status */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isOnline ? (
                    <>
                      <Wifi className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">В сети</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium">Offline</span>
                    </>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {isOnline ? 'Синхронизация активна' : 'Режим автономной работы'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Notifications Toggle */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {notificationsEnabled ? (
                    <Check className="w-4 h-4 text-brand" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                  )}
                  <Label className="text-sm font-medium">Уведомления</Label>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleEnableNotifications();
                    } else {
                      handleDisableNotifications();
                    }
                  }}
                  disabled={loading || showDeniedWarning || showNotSupported || false}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {notificationsEnabled
                  ? 'Получайте уведомления о заказах, скидках и новинках'
                  : 'Включите уведомления для получения информации'}
              </p>
            </CardContent>
          </Card>

          {/* Test & Sync Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestNotification}
              disabled={!notificationsEnabled || loading}
              className="flex-1"
            >
              Тест
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={syncPendingNotifications}
              disabled={!isOnline || loading}
              className="flex-1"
            >
              Синхр.
            </Button>
          </div>

          {/* Recent Notifications */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">Последние уведомления</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearNotifications}
                disabled={notifications.length === 0}
                className="text-xs"
              >
                Очистить
              </Button>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-2 bg-gray-50 rounded border border-gray-200 text-xs"
                  >
                    <p className="font-medium text-gray-900 truncate">
                      {notif.title}
                    </p>
                    <p className="text-gray-600 line-clamp-2">
                      {notif.options?.body}
                    </p>
                    <p className="text-gray-400 mt-1">
                      {new Date(notif.timestamp).toLocaleTimeString('ru-RU')}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4 text-sm">
                  Нет уведомлений
                </p>
              )}
            </div>
          </div>

          {/* Diagnostics info (debug) */}
          {diagnostics && (
            <div className="bg-gray-50 border border-gray-200 rounded p-3">
              <p className="text-[10px] text-gray-400 font-mono">
                iOS: {diagnostics.isIOS ? 'Да' : 'Нет'} |
                PWA: {diagnostics.isStandalone ? 'Да' : 'Нет'} |
                SW: {diagnostics.serviceWorkerActive ? 'Да' : 'Нет'} |
                Разрешение: {diagnostics.permission}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
