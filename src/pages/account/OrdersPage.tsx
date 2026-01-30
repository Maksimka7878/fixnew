import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Truck, CheckCircle, Clock, ChevronRight, MapPin } from 'lucide-react';
import { useMockOrdersApi } from '@/api/mock';
import type { Order } from '@/types';

const statusConfig: Record<string, { label: string; color: string; icon: typeof Package }> = {
  new: { label: 'Новый', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  confirmed: { label: 'Подтвержден', color: 'bg-blue-100 text-blue-800', icon: Package },
  processing: { label: 'В обработке', color: 'bg-purple-100 text-purple-800', icon: Package },
  ready: { label: 'Готов к выдаче', color: 'bg-brand-100 text-green-800', icon: Package },
  delivering: { label: 'В пути', color: 'bg-indigo-100 text-indigo-800', icon: Truck },
  completed: { label: 'Выполнен', color: 'bg-brand-100 text-green-800', icon: CheckCircle },
  cancelled: { label: 'Отменен', color: 'bg-red-100 text-red-800', icon: Clock },
  returned: { label: 'Возврат', color: 'bg-red-100 text-red-800', icon: Clock },
};

export function OrdersPage() {
  const { user } = useAuthStore();
  const { getOrders } = useMockOrdersApi();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (user) {
      getOrders(user.id).then(response => {
        if (response.success && response.data) {
          setOrders(response.data);
        }
        setLoading(false);
      });
    }
  }, [user, getOrders]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Package className="w-12 h-12 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">У вас пока нет заказов</h1>
        <p className="text-gray-600 mb-6">Сделайте первый заказ в нашем магазине</p>
        <Button className="bg-red-600 hover:bg-red-700" asChild>
          <a href="/catalog">Перейти в каталог</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Мои заказы</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Orders List */}
        <div className="lg:col-span-2 space-y-4">
          {orders.map((order) => {
            const status = statusConfig[order.status];
            const StatusIcon = status.icon;

            return (
              <Card
                key={order.id}
                className={`cursor-pointer hover:shadow-md transition-shadow ${selectedOrder?.id === order.id ? 'ring-2 ring-red-600' : ''
                  }`}
                onClick={() => setSelectedOrder(order)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-lg">Заказ #{order.orderNumber}</span>
                        <Badge className={status.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        От {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.items.length} товаров на {order.summary.total.toFixed(2)} ₽
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Order Details */}
        <div className="lg:col-span-1">
          {selectedOrder ? (
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Детали заказа #{selectedOrder.orderNumber}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status */}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Статус</p>
                  <Badge className={statusConfig[selectedOrder.status].color}>
                    {statusConfig[selectedOrder.status].label}
                  </Badge>
                </div>

                {/* Items */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Товары</p>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="line-clamp-1 flex-1">{item.productName} x{item.quantity}</span>
                        <span className="font-medium ml-2">{item.total.toFixed(2)} ₽</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery */}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Доставка</p>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 text-gray-400" />
                    <span className="text-sm">
                      {selectedOrder.delivery.address ? `${selectedOrder.delivery.address.city}, ${selectedOrder.delivery.address.street}, ${selectedOrder.delivery.address.building}` : selectedOrder.delivery.storeName || 'Адрес не указан'}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="border-t pt-4">
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Товары</span>
                      <span>{selectedOrder.summary.subtotal.toFixed(2)} ₽</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Доставка</span>
                      <span>{selectedOrder.summary.deliveryCost === 0 ? 'Бесплатно' : `${selectedOrder.summary.deliveryCost.toFixed(2)} ₽`}</span>
                    </div>
                    {selectedOrder.summary.discount > 0 && (
                      <div className="flex justify-between text-brand">
                        <span>Скидка</span>
                        <span>-{selectedOrder.summary.discount.toFixed(2)} ₽</span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between mt-4 pt-4 border-t">
                    <span className="font-bold">Итого</span>
                    <span className="font-bold text-lg text-red-600">{selectedOrder.summary.total.toFixed(2)} ₽</span>
                  </div>
                </div>

                {/* Actions */}
                {selectedOrder.status === 'new' && (
                  <Button variant="outline" className="w-full text-red-600">
                    Отменить заказ
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-24">
              <CardContent className="p-8 text-center">
                <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Выберите заказ для просмотра деталей</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
