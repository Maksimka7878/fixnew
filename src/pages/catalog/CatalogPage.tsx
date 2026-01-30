import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Filter, Grid3X3, List } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore, useCatalogStore } from '@/store';
import { useMockCatalogApi } from '@/api/mock';
import type { Product } from '@/types';

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
};

function ProductCardSkeleton() {
  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <CardContent className="p-3 space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-5 w-20" />
      </CardContent>
    </Card>
  );
}

function CategorySkeleton() {
  return (
    <Card className="h-full">
      <CardContent className="p-4 flex flex-col items-center text-center">
        <Skeleton className="w-16 h-16 rounded-full mb-3" />
        <Skeleton className="h-4 w-20" />
      </CardContent>
    </Card>
  );
}

function ListCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 flex gap-4">
        <Skeleton className="w-24 h-24 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-5 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

export function CatalogPage() {
  const { region } = useAppStore();
  const { products, setCategories, setProducts, getRootCategories } = useCatalogStore();
  const { getCategories, getProducts } = useMockCatalogApi();
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => { loadData(); }, [region]);

  const loadData = async () => {
    setIsLoading(true);
    const [catRes, prodRes] = await Promise.all([getCategories(region?.id), getProducts({ regionId: region?.id || 'r1' })]);
    if (catRes.success && catRes.data) setCategories(catRes.data);
    if (prodRes.success && prodRes.data) setProducts(prodRes.data);
    setIsLoading(false);
  };

  const rootCategories = getRootCategories();

  return (
    <div className="container mx-auto px-4 py-6">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-brand transition-colors">Главная</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">Каталог</span>
      </nav>
      <h1 className="text-3xl font-bold mb-8">Каталог товаров</h1>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Категории</h2>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => <CategorySkeleton key={i} />)}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {rootCategories.map((category) => (
              <motion.div key={category.id} variants={itemVariants}>
                <Link to={`/catalog/${category.slug}`}>
                  <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer h-full hover:-translate-y-1">
                    <CardContent className="p-4 flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mb-3"><span className="text-2xl">📦</span></div>
                      <h3 className="font-medium text-sm">{category.name}</h3>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Все товары</h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm"><Filter className="w-4 h-4 mr-2" />Фильтры</Button>
            <div className="flex border rounded-lg overflow-hidden">
              <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('grid')}><Grid3X3 className="w-4 h-4" /></Button>
              <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')}><List className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>
        {isLoading ? (
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6' : 'grid-cols-1'} gap-4`}>
            {Array.from({ length: viewMode === 'grid' ? 12 : 4 }).map((_, i) =>
              viewMode === 'grid' ? <ProductCardSkeleton key={i} /> : <ListCardSkeleton key={i} />
            )}
          </div>
        ) : (
          <motion.div
            className={`grid ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6' : 'grid-cols-1'} gap-4`}
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {products.map((product) => (
              <motion.div key={product.id} variants={itemVariants}>
                <ProductCard product={product} viewMode={viewMode} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}

function ProductCard({ product, viewMode }: { product: Product; viewMode: 'grid' | 'list' }) {
  const { region } = useAppStore();
  const { getProductRegionData } = useCatalogStore();
  const regionData = region ? getProductRegionData(product.id, region.id) : null;

  if (viewMode === 'list') {
    return (
      <Link to={`/product/${product.id}`}>
        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
          <CardContent className="p-4 flex gap-4">
            <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              {product.images && product.images[0] ? <img src={product.images[0].thumbnailUrl} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400">📦</div>}
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">{product.sku}</p>
              <h3 className="font-medium mb-2">{product.name}</h3>
              {regionData && <span className="font-bold text-brand">{regionData.price.toLocaleString('ru-RU')} ₽</span>}
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link to={`/product/${product.id}`}>
      <Card className="hover:shadow-xl transition-all duration-300 h-full hover:-translate-y-1">
        <div className="aspect-square bg-gray-100 overflow-hidden">
          {product.images && product.images[0] ? <img src={product.images[0].thumbnailUrl} alt={product.name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">📦</div>}
        </div>
        <CardContent className="p-3">
          <p className="text-xs text-gray-500 mb-1">{product.sku}</p>
          <h3 className="text-sm font-medium line-clamp-2 mb-2">{product.name}</h3>
          {regionData && <span className="font-bold text-brand">{regionData.price.toLocaleString('ru-RU')} ₽</span>}
        </CardContent>
      </Card>
    </Link>
  );
}
