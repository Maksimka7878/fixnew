import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  Eye,
  Printer,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  phone: string;
  date: Date;
  items: number;
  total: number;
  paymentMethod: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'completed';
}

interface OrdersTableProps {
  onViewDetails?: (id: string) => void;
  onPrint?: (id: string) => void;
}

const ITEMS_PER_PAGE = 15;

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-cyan-100 text-cyan-800',
  completed: 'bg-green-100 text-green-800',
};

const statusLabels: Record<string, string> = {
  pending: 'Ожидание',
  confirmed: 'Подтверждён',
  processing: 'Обработка',
  shipped: 'Отправлен',
  completed: 'Доставлен',
};

export function OrdersTable({ onViewDetails, onPrint }: OrdersTableProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Mock data
  useEffect(() => {
    const mockOrders: Order[] = [
      {
        id: '1',
        orderNumber: 'ORD-001234',
        customer: 'Иван Петров',
        phone: '+7 (999) 123-45-67',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        items: 3,
        total: 1250,
        paymentMethod: 'Карта',
        status: 'completed',
      },
      {
        id: '2',
        orderNumber: 'ORD-001233',
        customer: 'Мария Сидорова',
        phone: '+7 (999) 234-56-78',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        items: 2,
        total: 890,
        paymentMethod: 'Переводом',
        status: 'shipped',
      },
      {
        id: '3',
        orderNumber: 'ORD-001232',
        customer: 'Алексей Кузнецов',
        phone: '+7 (999) 345-67-89',
        date: new Date(Date.now() - 6 * 60 * 60 * 1000),
        items: 5,
        total: 2340,
        paymentMethod: 'Карта',
        status: 'processing',
      },
      {
        id: '4',
        orderNumber: 'ORD-001231',
        customer: 'Ольга Морозова',
        phone: '+7 (999) 456-78-90',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000),
        items: 1,
        total: 450,
        paymentMethod: 'Наличные',
        status: 'confirmed',
      },
      {
        id: '5',
        orderNumber: 'ORD-001230',
        customer: 'Виктор Иванов',
        phone: '+7 (999) 567-89-01',
        date: new Date(Date.now() - 30 * 60 * 1000),
        items: 4,
        total: 1780,
        paymentMethod: 'Карта',
        status: 'pending',
      },
    ];

    const timer = setTimeout(() => {
      setOrders(mockOrders);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const filteredOrders = orders.filter(o => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.phone.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Заказы</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Управление заказами ({orders.length})</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Поиск по номеру, клиенту, телефону..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border rounded-lg text-sm min-w-48"
          >
            <option value="all">Все статусы</option>
            <option value="pending">Ожидание</option>
            <option value="confirmed">Подтверждён</option>
            <option value="processing">Обработка</option>
            <option value="shipped">Отправлен</option>
            <option value="completed">Доставлен</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3 font-medium">Заказ</th>
                <th className="text-left p-3 font-medium">Клиент</th>
                <th className="text-left p-3 font-medium">Дата</th>
                <th className="text-center p-3 font-medium">Товаров</th>
                <th className="text-right p-3 font-medium">Сумма</th>
                <th className="text-left p-3 font-medium">Оплата</th>
                <th className="text-center p-3 font-medium">Статус</th>
                <th className="text-center p-3 font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-8 text-gray-500">
                    Заказов не найдено
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order, idx) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-3">
                      <div className="font-medium text-gray-900">{order.orderNumber}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-gray-900">{order.customer}</div>
                      <div className="text-xs text-gray-500">{order.phone}</div>
                    </td>
                    <td className="p-3 text-gray-600 text-xs">
                      {order.date.toLocaleDateString('ru-RU')}
                      <br />
                      {order.date.toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="p-3 text-center font-medium">{order.items}</td>
                    <td className="p-3 text-right font-bold text-lg">
                      {order.total.toLocaleString('ru-RU')} ₽
                    </td>
                    <td className="p-3 text-sm">{order.paymentMethod}</td>
                    <td className="p-3 text-center">
                      <Badge
                        variant="secondary"
                        className={statusColors[order.status]}
                      >
                        {statusLabels[order.status]}
                      </Badge>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => onViewDetails?.(order.id)}
                          className="p-1.5 hover:bg-blue-100 rounded transition"
                          title="Просмотр"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => onPrint?.(order.id)}
                          className="p-1.5 hover:bg-gray-100 rounded transition"
                          title="Печать"
                        >
                          <Printer className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <span className="text-sm text-gray-600">
              Страница {currentPage} из {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="pt-4 border-t grid grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-brand">{orders.length}</div>
            <div className="text-gray-600">Всего заказов</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {orders.filter(o => o.status === 'pending').length}
            </div>
            <div className="text-gray-600">В ожидании</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {orders.filter(o => o.status === 'processing').length}
            </div>
            <div className="text-gray-600">Обработка</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {orders.reduce((sum, o) => sum + o.total, 0).toLocaleString('ru-RU')} ₽
            </div>
            <div className="text-gray-600">Выручка</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
