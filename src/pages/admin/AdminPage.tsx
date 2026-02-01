import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  DollarSign,
} from 'lucide-react';

interface RealStats {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  recentOrders: any[];
}

const statusColors: Record<string, string> = {
  completed: 'bg-brand-100 text-green-800',
  confirmed: 'bg-brand-100 text-green-800',
  processing: 'bg-blue-100 text-blue-800',
  pending: 'bg-yellow-100 text-yellow-800',
  shipped: 'bg-purple-100 text-purple-800',
};

const statusLabels: Record<string, string> = {
  completed: 'Выполнен',
  confirmed: 'Подтвержден',
  processing: 'В обработке',
  pending: 'Ожидает',
  shipped: 'Отправлен',
};

const lowStockProducts = [
  { id: '1', name: 'Шоколад молочный', sku: 'CH-001', stock: 5, minStock: 10 },
  { id: '2', name: 'Чай зеленый', sku: 'TEA-002', stock: 3, minStock: 15 },
  { id: '3', name: 'Кофе растворимый', sku: 'COF-003', stock: 8, minStock: 20 },
];

export function AdminPage() {
  const [stats, setStats] = useState<RealStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/api/admin/stats/real')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch stats:', err);
        setLoading(false);
      });
  }, []);

  // Format order for display
  const formatOrder = (order: any) => ({
    id: order.id,
    number: `ORD-${order.id.slice(0, 6).toUpperCase()}`,
    customer: order.shipping_info?.contact?.firstName || order.user_phone || 'Гость',
    total: order.total || 0,
    status: order.status || 'pending',
    date: new Date(order.created_at).toLocaleDateString('ru-RU'),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">Fix Price Pro</h1>
                <p className="text-sm text-gray-500">Панель управления</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" asChild>
                <a href="/">На сайт</a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="dashboard">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Обзор
            </TabsTrigger>
            <TabsTrigger value="products">
              <Package className="w-4 h-4 mr-2" />
              Товары
            </TabsTrigger>
            <TabsTrigger value="orders">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Заказы
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              Пользователи
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Grid */}
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-xl" />)}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Заказы</p>
                        <p className="text-2xl font-bold">{(stats?.totalOrders || 0).toLocaleString('ru-RU')}</p>
                      </div>
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Выручка</p>
                        <p className="text-2xl font-bold">{(stats?.totalRevenue || 0).toLocaleString('ru-RU')} ₽</p>
                      </div>
                      <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-brand" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Пользователи</p>
                        <p className="text-2xl font-bold">{(stats?.totalUsers || 0).toLocaleString('ru-RU')}</p>
                      </div>
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Товары (импорт)</p>
                        <p className="text-2xl font-bold">~600</p>
                      </div>
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Последние заказы</CardTitle>
                  <Button variant="ghost" size="sm">Все заказы</Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(stats?.recentOrders || []).map((order: any) => {
                      const formattedOrder = formatOrder(order);
                      return (
                        <div key={formattedOrder.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{formattedOrder.number}</p>
                            <p className="text-sm text-gray-500">{formattedOrder.customer}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formattedOrder.total.toLocaleString('ru-RU')} ₽</p>
                            <Badge className={statusColors[formattedOrder.status] || 'bg-gray-100'} variant="secondary">
                              {statusLabels[formattedOrder.status] || formattedOrder.status}
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                    {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                      <p className="text-gray-500 text-center py-4">Заказов пока нет</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Low Stock */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Заканчивающиеся товары</CardTitle>
                  <Button variant="ghost" size="sm">Все товары</Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {lowStockProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.sku}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={product.stock < 5 ? 'destructive' : 'secondary'}>
                            {product.stock} шт
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">мин. {product.minStock}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Импорт товаров с Fix Price</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-500">
                  Запустите парсер для автоматического импорта товаров с сайта fix-price.com
                </p>
                <div className="flex gap-4">
                  <Button
                    onClick={async () => {
                      try {
                        await fetch('http://localhost:3001/api/admin/import', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ categoriesLimit: 3, productsPerCategory: 15 })
                        });
                        alert('Импорт запущен! Следите за прогрессом.');
                      } catch (e) {
                        alert('Ошибка: убедитесь что сервер запущен (node server/index.js)');
                      }
                    }}
                    className="bg-brand hover:bg-brand-dark"
                  >
                    🚀 Запустить импорт
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        const res = await fetch('http://localhost:3001/api/admin/import/status');
                        const data = await res.json();
                        alert(`Статус: ${JSON.stringify(data.progress, null, 2)}`);
                      } catch (e) {
                        alert('Ошибка подключения к серверу');
                      }
                    }}
                  >
                    📊 Проверить статус
                  </Button>

                  <Button
                    variant="secondary"
                    onClick={async () => {
                      try {
                        await fetch('http://localhost:3001/api/admin/import-json', { method: 'POST' });
                        alert('Импорт из JSON запущен!');
                      } catch (e) {
                        alert('Ошибка запуска импорта из JSON');
                      }
                    }}
                  >
                    📂 Импорт из JSON
                  </Button>
                </div>
                <p className="text-sm text-gray-400">
                  Примечание: сервер должен быть запущен командой <code className="bg-gray-100 px-1 rounded">node server/index.js</code>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Управление товарами</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Функционал управления товарами будет здесь</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Управление заказами</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Функционал управления заказами будет здесь</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Управление пользователями</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Функционал управления пользователями будет здесь</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
