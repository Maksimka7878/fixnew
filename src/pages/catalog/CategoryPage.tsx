import { useParams } from 'react-router-dom';
import { useCatalogStore, useAppStore } from '@/store';
import { ProductCard } from '@/components/product/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';
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

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { region } = useAppStore();
  const { categories, products, setCategories, setProducts } = useCatalogStore();
  const { getCategories, getProducts } = useMockCatalogApi();
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  const category = categories.find(c => c.slug === slug);
  const categoryProducts = products.filter(p => p.categoryId === category?.id);

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

  useEffect(() => {
    if (category) {
      getProducts({ categoryId: category.id }).then(response => {
        if (response.success && response.data) {
          setProducts(response.data);
        }
      });
    }
  }, [category, getProducts, setProducts]);

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

      {categoryProducts.length === 0 ? (
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
