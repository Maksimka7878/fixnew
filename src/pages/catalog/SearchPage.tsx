import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCatalogStore, useSearchStore, useAppStore } from '@/store';
import { ProductCard } from '@/components/product/ProductCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { Search, X, Clock, TrendingUp, ArrowRight, Trash2 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useMockCatalogApi } from '@/api/mock';
import { useDebounce } from '@/hooks/useDebounce';
import type { Product } from '@/types';

export function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { products, setProducts } = useCatalogStore();
  const { region } = useAppStore();
  const { searchHistory, popularQueries, addToHistory, removeFromHistory, clearHistory } = useSearchStore();
  const { searchProducts, getProducts } = useMockCatalogApi();

  const [searchQuery, setSearchQuery] = useState(query);
  const [loading, setLoading] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounce search query for autocomplete (300ms delay)
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Load all products for autocomplete
  useEffect(() => {
    getProducts({ regionId: region?.id || 'r1' }).then(res => {
      if (res.success && res.data) setAllProducts(res.data);
    });
  }, [getProducts, region?.id]);

  // Live autocomplete suggestions (uses debounced query)
  const suggestions = useMemo(() => {
    if (!debouncedSearchQuery.trim() || debouncedSearchQuery.length < 2) return [];
    const q = debouncedSearchQuery.toLowerCase();
    return allProducts
      .filter(p => p.name.toLowerCase().includes(q))
      .slice(0, 5);
  }, [debouncedSearchQuery, allProducts]);

  useEffect(() => {
    if (query) {
      setLoading(true);
      addToHistory(query);
      searchProducts(query).then(response => {
        if (response.success && response.data) {
          setProducts(response.data);
        }
        setLoading(false);
      });
    }
  }, [query, searchProducts, setProducts, addToHistory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
      setShowSuggestions(false);
    }
  };

  const handleQuickSearch = (q: string) => {
    setSearchQuery(q);
    setSearchParams({ q });
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchParams({});
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Поиск товаров</h1>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="relative mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Что ищете?"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            className="pl-12 pr-24 py-6 text-lg rounded-xl border-2 focus:border-brand"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchQuery && (
              <Button type="button" variant="ghost" size="icon" onClick={clearSearch}>
                <X className="w-5 h-5 text-gray-400" />
              </Button>
            )}
            <Button type="submit" className="bg-brand hover:bg-brand-600 rounded-lg">
              Найти
            </Button>
          </div>
        </div>

        {/* Autocomplete Suggestions Dropdown */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border overflow-hidden"
            >
              {suggestions.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                    {product.images?.[0] && (
                      <OptimizedImage src={product.images[0].thumbnailUrl} alt={product.name} aspectRatio="1/1" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-brand font-bold">{product.basePrice} ₽</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* No Query State - Show History & Popular */}
      {!query && (
        <div className="space-y-8">
          {/* Search History */}
          {searchHistory.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  История поиска
                </h2>
                <Button variant="ghost" size="sm" onClick={clearHistory} className="text-gray-500">
                  <Trash2 className="w-4 h-4 mr-1" /> Очистить
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((q) => (
                  <motion.button
                    key={q}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="group flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    onClick={() => handleQuickSearch(q)}
                  >
                    <span className="text-sm">{q}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFromHistory(q); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-gray-500" />
                    </button>
                  </motion.button>
                ))}
              </div>
            </section>
          )}

          {/* Popular Queries */}
          <section>
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-brand" />
              Популярные запросы
            </h2>
            <div className="flex flex-wrap gap-2">
              {popularQueries.map((q) => (
                <button
                  key={q}
                  onClick={() => handleQuickSearch(q)}
                  className="px-4 py-2 bg-brand-50 text-brand-700 hover:bg-brand-100 rounded-full text-sm font-medium transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </section>

          {/* Empty State Icon */}
          <div className="text-center py-12">
            <Search className="w-20 h-20 mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500">Начните вводить название товара</p>
          </div>
        </div>
      )}

      {/* Results */}
      {query && (
        <div>
          <p className="text-gray-600 mb-4">
            Результаты по запросу "{query}": <strong>{products.length}</strong> товаров
          </p>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="bg-gray-100 animate-pulse aspect-[3/4] rounded-lg" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </motion.div>
          ) : (
            <Card className="text-center py-16">
              <CardContent>
                <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Ничего не найдено</h2>
                <p className="text-gray-600 mb-4">Попробуйте изменить поисковый запрос</p>
                <Button variant="outline" onClick={() => { clearSearch(); }}>
                  Очистить поиск
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
