import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  MessageSquare,
  Ban,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  registrationDate: Date;
  ordersCount: number;
  totalSpent: number;
  status: 'active' | 'blocked';
  avatar?: string;
}

interface UsersTableProps {
  onViewDetails?: (id: string) => void;
  onMessage?: (id: string) => void;
  onToggleBlock?: (id: string) => void;
}

const ITEMS_PER_PAGE = 15;

export function UsersTable({ onViewDetails, onMessage, onToggleBlock }: UsersTableProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'spent' | 'orders' | 'date'>('spent');

  // Mock data
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'Иван Петров',
        phone: '+7 (999) 123-45-67',
        email: 'ivan@example.com',
        registrationDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        ordersCount: 12,
        totalSpent: 5640,
        status: 'active',
        avatar: '👨‍💼',
      },
      {
        id: '2',
        name: 'Мария Сидорова',
        phone: '+7 (999) 234-56-78',
        email: 'maria@example.com',
        registrationDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
        ordersCount: 8,
        totalSpent: 3450,
        status: 'active',
        avatar: '👩‍💼',
      },
      {
        id: '3',
        name: 'Алексей Кузнецов',
        phone: '+7 (999) 345-67-89',
        email: 'alex@example.com',
        registrationDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        ordersCount: 5,
        totalSpent: 2890,
        status: 'active',
        avatar: '👨‍🔧',
      },
      {
        id: '4',
        name: 'Ольга Морозова',
        phone: '+7 (999) 456-78-90',
        email: 'olga@example.com',
        registrationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        ordersCount: 3,
        totalSpent: 1240,
        status: 'active',
        avatar: '👩',
      },
      {
        id: '5',
        name: 'Виктор Иванов',
        phone: '+7 (999) 567-89-01',
        email: 'victor@example.com',
        registrationDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        ordersCount: 1,
        totalSpent: 450,
        status: 'blocked',
        avatar: '👨‍🎓',
      },
    ];

    const timer = setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.phone.includes(searchQuery) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    switch (sortBy) {
      case 'spent':
        return b.totalSpent - a.totalSpent;
      case 'orders':
        return b.ordersCount - a.ordersCount;
      case 'date':
        return b.registrationDate.getTime() - a.registrationDate.getTime();
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = sortedUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Пользователи</CardTitle>
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

  const totalRevenue = users.reduce((sum, u) => sum + u.totalSpent, 0);
  const activeUsers = users.filter(u => u.status === 'active').length;
  const topUser = users.reduce((top, u) => (u.totalSpent > top.totalSpent ? u : top));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Управление пользователями ({users.length})</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Поиск по имени, телефону, email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border rounded-lg text-sm min-w-40"
          >
            <option value="spent">По сумме расходов</option>
            <option value="orders">По кол-во заказов</option>
            <option value="date">По дате регистрации</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3 font-medium">Пользователь</th>
                <th className="text-left p-3 font-medium">Email / Телефон</th>
                <th className="text-center p-3 font-medium">Заказов</th>
                <th className="text-right p-3 font-medium">Потрачено</th>
                <th className="text-left p-3 font-medium">Регистрация</th>
                <th className="text-center p-3 font-medium">Статус</th>
                <th className="text-center p-3 font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-gray-500">
                    Пользователей не найдено
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user, idx) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-lg">
                            {user.avatar || user.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="font-medium text-gray-900">{user.name}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm text-gray-600">{user.email}</div>
                      <div className="text-xs text-gray-500">{user.phone}</div>
                    </td>
                    <td className="p-3 text-center font-medium">{user.ordersCount}</td>
                    <td className="p-3 text-right font-bold">
                      {user.totalSpent.toLocaleString('ru-RU')} ₽
                    </td>
                    <td className="p-3 text-xs text-gray-600">
                      {user.registrationDate.toLocaleDateString('ru-RU')}
                    </td>
                    <td className="p-3 text-center">
                      <Badge
                        variant={user.status === 'active' ? 'default' : 'destructive'}
                      >
                        {user.status === 'active' ? '✓ Активен' : '⊗ Заблокирован'}
                      </Badge>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => onViewDetails?.(user.id)}
                          className="p-1.5 hover:bg-blue-100 rounded transition"
                          title="Просмотр профиля"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => onMessage?.(user.id)}
                          className="p-1.5 hover:bg-green-100 rounded transition"
                          title="Отправить сообщение"
                        >
                          <MessageSquare className="w-4 h-4 text-green-600" />
                        </button>
                        <button
                          onClick={() => onToggleBlock?.(user.id)}
                          className="p-1.5 hover:bg-red-100 rounded transition"
                          title={user.status === 'active' ? 'Заблокировать' : 'Разблокировать'}
                        >
                          <Ban className={`w-4 h-4 ${user.status === 'active' ? 'text-red-600' : 'text-gray-600'}`} />
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
            <div className="text-2xl font-bold text-brand">{users.length}</div>
            <div className="text-gray-600">Всего пользователей</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
            <div className="text-gray-600">Активных</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {totalRevenue.toLocaleString('ru-RU')} ₽
            </div>
            <div className="text-gray-600">Всего потрачено</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">{topUser.name}</div>
            <div className="text-gray-600">Топ клиент</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
