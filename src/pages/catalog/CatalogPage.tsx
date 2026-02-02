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

import { ProductCard } from '@/components/product/ProductCard';

// Simplified animations for better mobile performance
const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03 } }, // Faster stagger
};

const itemVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } }, // Simpler, no transform
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
    <div className="flex flex-col items-center gap-2">
      <Skeleton className="w-20 h-20 md:w-24 md:h-24 rounded-2xl" />
      <Skeleton className="h-4 w-16" />
    </div>
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
        <h2 className="text-xl font-bold mb-4">Категории</h2>
        {isLoading ? (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 7 }).map((_, i) => <CategorySkeleton key={i} />)}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-y-6 gap-x-4"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {rootCategories.map((category) => (
              <motion.div key={category.id} variants={itemVariants} className="flex justify-center">
                <Link to={`/catalog/${category.slug}`} className="flex flex-col items-center gap-2 group w-full max-w-[100px]">
                  <div className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-md group-active:scale-95 ${category.color || 'bg-gray-100'}`}>
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-4/5 h-4/5 object-contain drop-shadow-md"
                      />
                    ) : (
                      <span className="text-3xl">📦</span>
                    )}
                  </div>
                  <span className="text-xs md:text-sm font-medium text-center text-gray-700 leading-tight group-hover:text-brand transition-colors line-clamp-2">
                    {category.name}
                  </span>
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
            {products.map((product, index) => (
              <motion.div key={product.id} variants={itemVariants}>
                <ProductCard product={product} index={index} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}


