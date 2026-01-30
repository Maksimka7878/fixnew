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
  ArrowUpRight,
  ArrowDownRight,
  Settings, LogOut, Search, Bell, Menu, X, Home,
  ShoppingBag, BarChart3, Plus, Edit, Trash2
} from 'lucide-react';

// Mock admin data
const stats = {
  totalOrders: 1234,
  totalRevenue: 456780,
  totalUsers: 5678,
  totalProducts: 890,
  ordersChange: 12.5,
  revenueChange: 8.3,
  usersChange: 23.1,
  productsChange: -2.4,
};

const recentOrders = [
  { id: '1', number: 'ORD-001', customer: 'Иван Иванов', total: 2345, status: 'completed', date: '2024-01-15' },
  { id: '2', number: 'ORD-002', customer: 'Мария Петрова', total: 1567, status: 'processing', date: '2024-01-15' },
  { id: '3', number: 'ORD-003', customer: 'Алексей Сидоров', total: 3890, status: 'pending', date: '2024-01-14' },
  { id: '4', number: 'ORD-004', customer: 'Ольга Козлова', total: 890, status: 'completed', date: '2024-01-14' },
  { id: '5', number: 'ORD-005', customer: 'Дмитрий Новиков', total: 4567, status: 'shipped', date: '2024-01-13' },
];

const lowStockProducts = [
  { id: '1', name: 'Шоколад молочный', sku: 'CH-001', stock: 5, minStock: 10 },
  { id: '2', name: 'Чай зеленый', sku: 'TEA-002', stock: 3, minStock: 15 },
  { id: '3', name: 'Кофе растворимый', sku: 'COF-003', stock: 8, minStock: 20 },
];

const statusColors: Record<string, string> = {
  completed: 'bg-green-100 text-green-800',
  processing: 'bg-blue-100 text-blue-800',
  pending: 'bg-yellow-100 text-yellow-800',
  shipped: 'bg-purple-100 text-purple-800',
};

const statusLabels: Record<string, string> = {
  completed: 'Выполнен',
  processing: 'В обработке',
  pending: 'Ожидает',
  shipped: 'Отправлен',
};

export function AdminPage() {
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
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Заказы</p>
                      <p className="text-2xl font-bold">{stats.totalOrders.toLocaleString('ru-RU')}</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex items-center mt-2 text-sm">
                    <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-green-600">+{stats.ordersChange}%</span>
                    <span className="text-gray-500 ml-1">за месяц</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Выручка</p>
                      <p className="text-2xl font-bold">{stats.totalRevenue.toLocaleString('ru-RU')} ₽</p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <div className="flex items-center mt-2 text-sm">
                    <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-green-600">+{stats.revenueChange}%</span>
                    <span className="text-gray-500 ml-1">за месяц</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Пользователи</p>
                      <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString('ru-RU')}</p>
                    </div>
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                  <div className="flex items-center mt-2 text-sm">
                    <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-green-600">+{stats.usersChange}%</span>
                    <span className="text-gray-500 ml-1">за месяц</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Товары</p>
                      <p className="text-2xl font-bold">{stats.totalProducts.toLocaleString('ru-RU')}</p>
                    </div>
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-orange-600" />
                    </div>
                  </div>
                  <div className="flex items-center mt-2 text-sm">
                    <ArrowDownRight className="w-4 h-4 text-red-600 mr-1" />
                    <span className="text-red-600">{stats.productsChange}%</span>
                    <span className="text-gray-500 ml-1">за месяц</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Последние заказы</CardTitle>
                  <Button variant="ghost" size="sm">Все заказы</Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{order.number}</p>
                          <p className="text-sm text-gray-500">{order.customer}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{order.total.toLocaleString('ru-RU')} ₽</p>
                          <Badge className={statusColors[order.status]} variant="secondary">
                            {statusLabels[order.status]}
                          </Badge>
                        </div>
                      </div>
                    ))}
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

          <TabsContent value="products">
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
