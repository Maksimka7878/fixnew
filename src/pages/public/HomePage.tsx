import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Package, Shield, Truck, Sparkles, Star } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore, useCatalogStore, useAuthStore, useUIStore } from '@/store';
import { useMockCatalogApi, useMockMarketingApi } from '@/api/mock';
import type { Banner } from '@/types';
import { Stories } from '@/components/home/Stories';
import { MainBanners } from '@/components/home/MainBanners';
import { CategoryRow } from '@/components/home/CategoryRow';
import { SEOHead } from '@/components/seo/SEOHead';
import { OrganizationSchema, ECommerceSchema } from '@/components/seo/JsonLdSchema';
import { ProductCard } from '@/components/product/ProductCard';

// Simplified animations for better mobile performance (no transforms)
const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
};

function ProductCardSkeleton() {
  return (
    <div className="w-[160px] md:w-auto flex-shrink-0 md:flex-shrink">
      <Card className="h-full flex flex-col overflow-hidden">
        <Skeleton className="aspect-square w-full" />
        <CardContent className="p-3 space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-5 w-20" />
        </CardContent>
      </Card>
    </div>
  );
}





export function HomePage() {
  const { region } = useAppStore();
  const { products, setProducts } = useCatalogStore();
  const { isAuthenticated } = useAuthStore();
  const { setAuthModalOpen } = useUIStore();
  const { getProducts } = useMockCatalogApi();
  const { getBanners } = useMockMarketingApi();
  const [isLoading, setIsLoading] = useState(true);
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => { loadData(); }, [region]);



  const loadData = async () => {
    setIsLoading(true);
    const regionId = region?.id || 'r1';
    const [productsRes, bannersRes] = await Promise.all([getProducts({ regionId }), getBanners({ position: 'home_main', regionId })]);
    if (productsRes.success && productsRes.data) setProducts(productsRes.data);
    if (bannersRes.success && bannersRes.data) setBanners(bannersRes.data);
    setIsLoading(false);
  };



  return (
    <>
      <SEOHead
        title="Магазин товаров для дома"
        description="Fix Price Pro - магазин товаров для дома и быта. Более 2000 товаров по фиксированным ценам, бесплатная доставка от 1000₽ и программа лояльности."
        keywords="магазин товаров, товары для дома, бытовая химия, косметика, доставка, фиксированные цены"
        ogType="website"
        ogImage={`${window.location.origin}/og-image.jpg`}
      />
      <OrganizationSchema />
      <ECommerceSchema />
      <div className="space-y-6 md:space-y-8 pb-8">
        {/* Hero Banner Carousel - FIRST like fix-price.com */}
        <MainBanners banners={banners} isLoading={isLoading} />

        {/* Large Category Cards - like fix-price.com */}
        <section className="pt-2 md:pt-4">
          <CategoryRow />
        </section>

        {/* Instagram-style Stories - mobile only */}
        <section className="pt-4 px-4 md:hidden">
          <Stories />
        </section>

        {/* Navigation Blocks */}
        <section className="px-4 md:container md:mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/catalog">
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 transition-shadow hover:shadow-md"
              >
                <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Package className="w-7 h-7 text-brand" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">Каталог товаров</h3>
                  <p className="text-sm text-gray-500">Более 2000 товаров по фиксированным ценам</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </motion.div>
            </Link>

            {!isAuthenticated ? (
              <button onClick={() => setAuthModalOpen(true)} className="text-left">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="bg-brand rounded-2xl p-6 shadow-sm flex items-center gap-4 transition-shadow hover:shadow-md"
                >
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">Выгоднее с авторизацией</h3>
                    <p className="text-sm text-white/80">Бонусы, скидки и персональные предложения</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-white/60 flex-shrink-0" />
                </motion.div>
              </button>
            ) : (
              <Link to="/account/loyalty">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="bg-brand rounded-2xl p-6 shadow-sm flex items-center gap-4 transition-shadow hover:shadow-md"
                >
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Star className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">Бонусная программа</h3>
                    <p className="text-sm text-white/80">Копите и тратьте баллы с каждой покупки</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-white/60 flex-shrink-0" />
                </motion.div>
              </Link>
            )}
          </div>
        </section>

        {/* Popular Products Rail */}
        <section className="md:container md:mx-auto">
          <div className="flex items-center justify-between mb-4 px-4 md:px-0">
            <h2 className="text-xl md:text-2xl font-bold">Популярные товары</h2>
            <Link to="/catalog" className="text-brand hover:underline flex items-center gap-1 font-medium text-sm">
              Все <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {isLoading ? (
            <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 md:px-0">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <motion.div
              className="flex md:grid md:grid-cols-6 gap-3 overflow-x-auto scrollbar-hide px-4 md:px-0"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {products.slice(0, 6).map((product, index) => (
                <motion.div key={product.id} variants={itemVariants} className="flex-shrink-0 w-[160px] md:w-auto">
                  <ProductCard product={product} index={index} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>

        {/* Recommendations Rail */}
        {!isLoading && products.length > 6 && (
          <section className="md:container md:mx-auto">
            <div className="flex items-center justify-between mb-4 px-4 md:px-0">
              <h2 className="text-xl md:text-2xl font-bold">Рекомендации</h2>
              <Link to="/catalog" className="text-brand hover:underline flex items-center gap-1 font-medium text-sm">
                Все <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <motion.div
              className="flex md:grid md:grid-cols-6 gap-3 overflow-x-auto scrollbar-hide px-4 md:px-0"
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              {products.slice(6, 12).map((product, index) => (
                <motion.div key={product.id} variants={itemVariants} className="flex-shrink-0 w-[160px] md:w-auto">
                  <ProductCard product={product} index={index + 6} />
                </motion.div>
              ))}
            </motion.div>
          </section>
        )}

        {/* Features */}
        <section className="bg-brand-50 py-10 md:py-12">
          <div className="container mx-auto px-4">
            <motion.div
              className="grid md:grid-cols-3 gap-6 md:gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-50px' }}
            >
              {[
                { icon: Truck, title: 'Быстрая доставка', desc: 'Доставляем заказы в течение 1-3 дней' },
                { icon: Shield, title: 'Гарантия качества', desc: 'Возврат товара в течение 14 дней' },
                { icon: Sparkles, title: 'Бонусная программа', desc: 'Копите баллы с каждой покупки' },
              ].map((feature) => (
                <motion.div key={feature.title} variants={itemVariants} className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}


