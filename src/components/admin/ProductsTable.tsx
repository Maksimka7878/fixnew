import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  Edit,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive';
  image?: string;
}

interface ProductsTableProps {
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
  onAdd?: () => void;
}

const ITEMS_PER_PAGE = 20;

export function ProductsTable({ onEdit, onDelete, onAdd }: ProductsTableProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Mock data for now (replace with real API call)
  useEffect(() => {
    const mockProducts: Product[] = [
      { id: '1', name: 'Шоколад молочный 100г', sku: 'CH-001', category: 'Кондитерия', price: 45, stock: 150, status: 'active', image: '🍫' },
      { id: '2', name: 'Чай зеленый 50g', sku: 'TEA-002', category: 'Напитки', price: 120, stock: 5, status: 'active', image: '🍵' },
      { id: '3', name: 'Кофе растворимый', sku: 'COF-003', category: 'Напитки', price: 280, stock: 8, status: 'active', image: '☕' },
      { id: '4', name: 'Печенье сдобное', sku: 'BIS-004', category: 'Кондитерия', price: 65, stock: 200, status: 'active', image: '🍪' },
      { id: '5', name: 'Арахис жареный 200g', sku: 'NUT-005', category: 'Закуски', price: 150, stock: 0, status: 'inactive', image: '🥜' },
      { id: '6', name: 'Конфеты ассорти 300g', sku: 'CNF-006', category: 'Кондитерия', price: 199, stock: 50, status: 'active', image: '🍬' },
      { id: '7', name: 'Сок апельсиновый 1L', sku: 'JUI-007', category: 'Напитки', price: 89, stock: 120, status: 'active', image: '🧃' },
      { id: '8', name: 'Хлеб ржаной', sku: 'BRD-008', category: 'Хлеб', price: 45, stock: 45, status: 'active', image: '🍞' },
    ];

    // Simulate API call
    const timer = setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aVal = a[sortBy as keyof Product];
    let bVal = b[sortBy as keyof Product];

    if (aVal === undefined || bVal === undefined) return 0;

    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleDelete = async (id: string) => {
    if (window.confirm('Удалить товар?')) {
      setProducts(products.filter(p => p.id !== id));
      onDelete?.(id);
      toast.success('Товар удалён');
    }
  };

  const handleToggleStatus = (product: Product) => {
    setProducts(products.map(p =>
      p.id === product.id
        ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' }
        : p
    ));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Товары</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Управление товарами ({products.length})</CardTitle>
        <Button
          onClick={onAdd}
          className="bg-brand hover:bg-brand-dark"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Добавить товар
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Поиск по названию, SKU, категории..."
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
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="name">По названию</option>
            <option value="price">По цене</option>
            <option value="stock">По остатку</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3 font-medium">Фото</th>
                <th className="text-left p-3 font-medium">SKU / Название</th>
                <th className="text-left p-3 font-medium">Категория</th>
                <th className="text-right p-3 font-medium">Цена</th>
                <th className="text-right p-3 font-medium">Остаток</th>
                <th className="text-center p-3 font-medium">Статус</th>
                <th className="text-center p-3 font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-gray-500">
                    Товаров не найдено
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product, idx) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg">
                        {product.image || <ImageIcon className="w-5 h-5 text-gray-400" />}
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-xs text-gray-500">{product.sku}</div>
                      </div>
                    </td>
                    <td className="p-3 text-gray-600">{product.category}</td>
                    <td className="p-3 text-right font-medium">{product.price} ₽</td>
                    <td className="p-3 text-right">
                      <span className={product.stock < 10 ? 'text-red-600 font-medium' : ''}>
                        {product.stock} шт
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <Badge
                        variant={product.status === 'active' ? 'default' : 'secondary'}
                        className="cursor-pointer hover:opacity-80"
                        onClick={() => handleToggleStatus(product)}
                      >
                        {product.status === 'active' ? '✓ Активен' : '⊗ Неактивен'}
                      </Badge>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => onEdit?.(product)}
                          className="p-1.5 hover:bg-blue-100 rounded transition"
                          title="Редактировать"
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 hover:bg-red-100 rounded transition"
                          title="Удалить"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
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
        <div className="pt-4 border-t grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-brand">{products.length}</div>
            <div className="text-gray-600">Всего товаров</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {products.filter(p => p.stock < 10).length}
            </div>
            <div className="text-gray-600">Мало остатка</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-400">
              {products.filter(p => p.status === 'inactive').length}
            </div>
            <div className="text-gray-600">Неактивных</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
