import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Package, Sparkles, Shield, Truck } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore, useCatalogStore } from '@/store';
import { useMockCatalogApi, useMockMarketingApi } from '@/api/mock';
import type { Product, Banner } from '@/types';

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
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

function BannerSkeleton() {
  return <Skeleton className="h-[300px] md:h-[400px] w-full rounded-none" />;
}

function CategorySkeleton() {
  return (
    <Card className="h-full">
      <CardContent className="p-6 flex flex-col items-center text-center">
        <Skeleton className="w-12 h-12 rounded-full mb-3" />
        <Skeleton className="h-4 w-20" />
      </CardContent>
    </Card>
  );
}

export function HomePage() {
  const { region } = useAppStore();
  const { products, setProducts } = useCatalogStore();
  const { getProducts } = useMockCatalogApi();
  const { getBanners } = useMockMarketingApi();
  const [isLoading, setIsLoading] = useState(true);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => { loadData(); }, [region]);

  const loadData = async () => {
    setIsLoading(true);
    const regionId = region?.id || 'r1';
    const [productsRes, bannersRes] = await Promise.all([getProducts({ regionId }), getBanners({ position: 'home_main', regionId })]);
    if (productsRes.success && productsRes.data) setProducts(productsRes.data);
    if (bannersRes.success && bannersRes.data) setBanners(bannersRes.data);
    setIsLoading(false);
  };

  const nextBanner = () => setCurrentBanner((prev) => (prev + 1) % banners.length);
  const prevBanner = () => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);

  return (
    <div className="space-y-8 pb-8">
      {isLoading ? (
        <BannerSkeleton />
      ) : banners.length > 0 ? (
        <section className="relative">
          <div className="relative h-[300px] md:h-[400px] overflow-hidden">
            {banners.map((banner, index) => (
              <div key={banner.id} className={`absolute inset-0 transition-opacity duration-500 ${index === currentBanner ? 'opacity-100' : 'opacity-0'}`}>
                <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
                  <div className="container mx-auto px-4">
                    <div className="max-w-lg text-white">
                      <h1 className="text-3xl md:text-5xl font-bold mb-4">{banner.title}</h1>
                      {banner.subtitle && <p className="text-lg md:text-xl mb-6">{banner.subtitle}</p>}
                      <Link to={banner.link}><Button className="bg-green-600 hover:bg-green-700">Подробнее <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {banners.length > 1 && (
            <>
              <Button variant="ghost" size="icon" className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white" onClick={prevBanner}><ChevronLeft className="w-6 h-6" /></Button>
              <Button variant="ghost" size="icon" className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white" onClick={nextBanner}><ChevronRight className="w-6 h-6" /></Button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {banners.map((_, index) => <button key={index} onClick={() => setCurrentBanner(index)} className={`w-2 h-2 rounded-full transition-all ${index === currentBanner ? 'bg-white w-6' : 'bg-white/50'}`} />)}
              </div>
            </>
          )}
        </section>
      ) : null}

      <section className="container mx-auto px-4">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <CategorySkeleton key={i} />)}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {[
              { to: '/catalog/produkty', icon: Package, color: 'green', label: 'Продукты' },
              { to: '/catalog/bytovaya-khimiya', icon: Sparkles, color: 'blue', label: 'Бытовая химия' },
              { to: '/catalog/kosmetika', icon: Shield, color: 'pink', label: 'Косметика' },
              { to: '/promotions', icon: Truck, color: 'amber', label: 'Акции' },
            ].map((cat) => (
              <motion.div key={cat.to} variants={itemVariants}>
                <Link to={cat.to}>
                  <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer h-full hover:-translate-y-1">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      <div className={`w-12 h-12 bg-${cat.color}-100 rounded-full flex items-center justify-center mb-3`}>
                        <cat.icon className={`w-6 h-6 text-${cat.color}-600`} />
                      </div>
                      <h3 className="font-semibold">{cat.label}</h3>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Популярные товары</h2>
          <Link to="/catalog" className="text-green-600 hover:underline flex items-center gap-1 font-medium">Все товары <ArrowRight className="w-4 h-4" /></Link>
        </div>
        {isLoading ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div key={i} variants={itemVariants}>
                <ProductCardSkeleton />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {products.slice(0, 6).map((product) => (
              <motion.div key={product.id} variants={itemVariants}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      <section className="bg-green-50 py-12">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid md:grid-cols-3 gap-8"
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
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
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
  );
}

function ProductCard({ product }: { product: Product }) {
  const { region } = useAppStore();
  const { getProductRegionData } = useCatalogStore();
  const regionData = region ? getProductRegionData(product.id, region.id) : null;

  return (
    <Link to={`/product/${product.id}`}>
      <Card className="hover:shadow-xl transition-all duration-300 h-full hover:-translate-y-1">
        <div className="aspect-square bg-gray-100 overflow-hidden">
          {product.images && product.images[0] ? <img src={product.images[0].thumbnailUrl} alt={product.name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">📦</div>}
        </div>
        <CardContent className="p-3">
          <p className="text-xs text-gray-500 mb-1">{product.sku}</p>
          <h3 className="text-sm font-medium line-clamp-2 mb-2">{product.name}</h3>
          {regionData && (
            <div className="flex items-center gap-2">
              <span className="font-bold text-green-600">{regionData.price.toLocaleString('ru-RU')} ₽</span>
              {regionData.oldPrice && <span className="text-xs text-gray-400 line-through">{regionData.oldPrice.toLocaleString('ru-RU')} ₽</span>}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
