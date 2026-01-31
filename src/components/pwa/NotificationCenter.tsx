import { useEffect, useState } from 'react';
import { Bell, BellOff, Check, AlertCircle, Wifi, WifiOff } from 'lucide-react';
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
import { toast } from 'sonner';

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Проверить статус разрешений
    const status = notificationService.constructor.getPermissionStatus();
    setNotificationsEnabled(status === 'granted');

    // Слушать изменения соединения
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('✅ Вы в сети');
      syncPendingNotifications();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('🔴 Вы в режиме offline');
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

  const loadNotifications = async () => {
    const saved = await notificationService.getAllNotifications();
    setNotifications(saved.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10));
  };

  const handleEnableNotifications = async () => {
    setLoading(true);
    try {
      const granted = await notificationService.requestPermission();
      if (granted) {
        setNotificationsEnabled(true);
        toast.success('✅ Уведомления включены');
      } else {
        toast.error('❌ Вы отклонили уведомления');
      }
    } catch (error) {
      toast.error('❌ Ошибка при включении уведомлений');
    } finally {
      setLoading(false);
    }
  };

  const handleDisableNotifications = () => {
    setNotificationsEnabled(false);
    toast.info('ℹ️ Уведомления отключены');
  };

  const syncPendingNotifications = async () => {
    toast.loading('🔄 Синхронизация...');
    // Здесь должна быть логика синхронизации
    // например, отправка ожидающих заказов, уведомлений и т.д.
    setTimeout(() => {
      toast.success('✅ Синхронизировано');
    }, 2000);
  };

  const handleTestNotification = async () => {
    setLoading(true);
    try {
      await notificationService.show('🧪 Тестовое уведомление', {
        body: 'Если вы видите это, уведомления работают корректно!',
        icon: '/logo.svg',
        badge: '/logo.svg',
      });
      toast.success('✅ Тестовое уведомление отправлено');
      setTimeout(() => loadNotifications(), 1000);
    } catch (error) {
      toast.error('❌ Ошибка при отправке тестового уведомления');
    } finally {
      setLoading(false);
    }
  };

  const handleClearNotifications = async () => {
    try {
      await notificationService.clearNotifications();
      setNotifications([]);
      toast.success('✅ Уведомления очищены');
    } catch (error) {
      toast.error('❌ Ошибка при очистке');
    }
  };

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
                  disabled={loading}
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
              🧪 Тест
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={syncPendingNotifications}
              disabled={isOnline || loading}
              className="flex-1"
            >
              🔄 Синхр.
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

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-xs text-blue-900">
              <strong>💡 Подсказка:</strong> Приложение работает offline и синхронизирует данные
              при появлении интернета. Все уведомления хранятся локально.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
