import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Home, Search, ShoppingCart, Package } from 'lucide-react';
import { useState } from 'react';

const POPULAR_CATEGORIES = [
  { name: 'Новинки', icon: '✨', path: '/catalog?sort=new' },
  { name: 'Распродажа', icon: '🔥', path: '/promotions' },
  { name: 'Электроника', icon: '📱', path: '/catalog' },
  { name: 'Дом и сад', icon: '🏠', path: '/catalog' },
];

export function NotFoundPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      {/* Header */}
      <header className="border-b py-4 px-4">
        <div className="container mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white font-bold">
              F
            </div>
            <span className="font-bold text-lg hidden sm:inline">Fix Price</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto max-w-4xl px-4 py-12 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-8"
        >
          {/* 404 Illustration */}
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand to-green-400"
          >
            404
          </motion.div>

          {/* Message */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
              Страница не найдена
            </h1>
            <p className="text-lg text-gray-600 max-w-lg mx-auto">
              К сожалению, страница, которую вы ищете, не существует или была удалена.
            </p>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Поиск товаров..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
          </form>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => navigate('/')}
              className="bg-brand hover:bg-brand-dark h-12 px-8 text-base"
            >
              <Home className="w-5 h-5 mr-2" />
              На главную
            </Button>
            <Button
              onClick={() => navigate('/catalog')}
              variant="outline"
              className="h-12 px-8 text-base"
            >
              <Package className="w-5 h-5 mr-2" />
              Каталог
            </Button>
            <Button
              onClick={() => navigate('/cart')}
              variant="outline"
              className="h-12 px-8 text-base"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Корзина
            </Button>
          </div>

          {/* Popular Categories */}
          <div className="space-y-4 mt-12 pt-12 border-t">
            <p className="text-sm font-medium text-gray-600">Популярные категории:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {POPULAR_CATEGORIES.map((category) => (
                <motion.button
                  key={category.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(category.path)}
                  className="p-4 rounded-lg border hover:border-brand hover:bg-brand/5 transition"
                >
                  <div className="text-2xl mb-2">{category.icon}</div>
                  <div className="text-sm font-medium text-gray-900">{category.name}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left max-w-md mx-auto">
            <p className="text-sm text-blue-900">
              <strong>💡 Совет:</strong> Проверьте правильность адреса в строке браузера или используйте поиск для поиска товаров.
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t py-4 text-center text-sm text-gray-500">
        <p>&copy; 2024 Fix Price. Все права защищены.</p>
      </footer>
    </div>
  );
}
