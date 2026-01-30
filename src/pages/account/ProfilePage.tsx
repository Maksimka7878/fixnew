import { useState } from 'react';
import { useAuthStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Mail, Phone, MapPin, Edit2, Save } from 'lucide-react';
import { toast } from 'sonner';

export function ProfilePage() {
  const { user, logout } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const handleSave = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Профиль обновлен');
    setEditing(false);
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    toast.success('Вы вышли из аккаунта');
    window.location.href = '/';
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Требуется авторизация</h1>
        <p className="text-gray-600 mb-6">Войдите в аккаунт, чтобы просмотреть профиль</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Мой профиль</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Личные данные</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => editing ? setEditing(false) : setEditing(true)}
            >
              {editing ? (
                <>Отмена</>
              ) : (
                <>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Редактировать
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarFallback className="bg-red-100 text-red-600 text-2xl">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user.firstName} {user.lastName}</p>
                <p className="text-sm text-gray-500">{user.phone}</p>
              </div>
            </div>

            {/* Form */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Имя</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    disabled={!editing}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Фамилия</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    disabled={!editing}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Телефон</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!editing}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!editing}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {editing && (
              <Button
                onClick={handleSave}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Сохранение...' : 'Сохранить изменения'}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Region */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Регион</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium">{user.region?.name || 'Не выбран'}</p>
                  <p className="text-sm text-gray-500">{user.region?.timezone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Быстрые ссылки</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/account/orders">Мои заказы</a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/account/loyalty">Программа лояльности</a>
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-600" onClick={handleLogout}>
                Выйти
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
