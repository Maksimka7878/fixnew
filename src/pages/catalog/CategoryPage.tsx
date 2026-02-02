import { useParams } from 'react-router-dom';
import { useCatalogStore, useAppStore } from '@/store';
import { ProductCard } from '@/components/product/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState, useMemo } from 'react';
import { useMockCatalogApi } from '@/api/mock';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

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

function PageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-sm mb-6">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-9 w-48 mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { region } = useAppStore();
  const { categories, products, setCategories, setProducts } = useCatalogStore();
  const { getCategories, getProducts } = useMockCatalogApi();
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const category = categories.find(c => c.slug === slug);
  const categoryId = category?.id;
  const categoryProducts = useMemo(
    () => products.filter(p => p.categoryId === categoryId),
    [products, categoryId]
  );

  // Load categories if not already loaded
  useEffect(() => {
    if (categories.length === 0 && !isLoadingCategories) {
      setIsLoadingCategories(true);
      getCategories(region?.id).then(response => {
        if (response.success && response.data) {
          setCategories(response.data);
        }
        setIsLoadingCategories(false);
      });
    }
  }, [categories.length, isLoadingCategories, getCategories, region?.id, setCategories]);

  // Load products when category is found
  useEffect(() => {
    if (categoryId) {
      setIsLoadingProducts(true);
      getProducts({ categoryId }).then(response => {
        if (response.success && response.data) {
          setProducts(response.data);
        }
        setIsLoadingProducts(false);
      });
    }
  }, [categoryId, getProducts, setProducts]);

  // Show full page skeleton while categories are loading
  if (categories.length === 0 || isLoadingCategories) {
    return <PageSkeleton />;
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Категория не найдена</h1>
          <p className="text-gray-600">Запрашиваемая категория не существует</p>
        </div>
      </div>
    );
  }

  const isLoading = isLoadingProducts || categoryProducts.length === 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-brand transition-colors">Главная</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/catalog" className="hover:text-brand transition-colors">Каталог</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">{category.name}</span>
      </nav>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">{category.name}</h1>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {categoryProducts.map((product, index) => (
            <motion.div key={product.id} variants={itemVariants}>
              <ProductCard product={product} index={index} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
