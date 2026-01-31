import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Package, Sparkles, Shield, Truck, Tag, Gift, Star, Flame, Percent, Heart } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore, useCatalogStore, useAuthStore, useUIStore, useFavoritesStore } from '@/store';
import { useMockCatalogApi, useMockMarketingApi } from '@/api/mock';
import type { Product, Banner } from '@/types';
import { Stories } from '@/components/home/Stories';
import { SEOHead } from '@/components/seo/SEOHead';
import { OrganizationSchema, ECommerceSchema } from '@/components/seo/JsonLdSchema';

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

function BannerSkeleton() {
  return <Skeleton className="h-[200px] md:h-[400px] w-full rounded-2xl mx-4 md:mx-0" />;
}

const quickTags = [
  { label: 'Подарки', icon: Gift, color: 'bg-pink-50 text-pink-600' },
  { label: 'Распродажа', icon: Percent, color: 'bg-red-50 text-red-600' },
  { label: 'Новинки', icon: Star, color: 'bg-amber-50 text-amber-600' },
  { label: 'Хиты', icon: Flame, color: 'bg-orange-50 text-orange-600' },
  { label: 'Акции', icon: Tag, color: 'bg-brand-50 text-brand' },
];

export function HomePage() {
  const { region } = useAppStore();
  const { products, setProducts } = useCatalogStore();
  const { isAuthenticated } = useAuthStore();
  const { setAuthModalOpen } = useUIStore();
  const { getProducts } = useMockCatalogApi();
  const { getBanners } = useMockMarketingApi();
  const [isLoading, setIsLoading] = useState(true);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const bannerInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { loadData(); }, [region]);

  useEffect(() => {
    if (banners.length <= 1) return;
    bannerInterval.current = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => { if (bannerInterval.current) clearInterval(bannerInterval.current); };
  }, [banners.length]);

  const loadData = async () => {
    setIsLoading(true);
    const regionId = region?.id || 'r1';
    const [productsRes, bannersRes] = await Promise.all([getProducts({ regionId }), getBanners({ position: 'home_main', regionId })]);
    if (productsRes.success && productsRes.data) setProducts(productsRes.data);
    if (bannersRes.success && bannersRes.data) setBanners(bannersRes.data);
    setIsLoading(false);
  };

  const goToBanner = (index: number) => {
    setCurrentBanner(index);
    if (bannerInterval.current) clearInterval(bannerInterval.current);
    bannerInterval.current = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
  };

  const nextBanner = () => goToBanner((currentBanner + 1) % banners.length);
  const prevBanner = () => goToBanner((currentBanner - 1 + banners.length) % banners.length);

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
        {/* Instagram-style Stories */}
        <section className="pt-4 px-4 md:container md:mx-auto">
          <Stories />
        </section>

        {/* Horizontal Quick Tags */}
        <section className="pt-0 md:pt-0">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 md:container md:mx-auto">
            {quickTags.map((tag) => (
              <Link
                key={tag.label}
                to="/promotions"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all active:scale-95 ${tag.color}`}
              >
                <tag.icon className="w-4 h-4" />
                {tag.label}
              </Link>
            ))}
          </div>
        </section>

        {/* Hero Banner Carousel */}
        {isLoading ? (
          <BannerSkeleton />
        ) : banners.length > 0 ? (
          <section className="px-4 md:px-0">
            <div className="md:container md:mx-auto">
              <div className="relative rounded-2xl overflow-hidden">
                <div className="relative h-[200px] md:h-[400px]">
                  {banners.map((banner, index) => (
                    <div key={banner.id} className={`absolute inset-0 transition-opacity duration-500 ${index === currentBanner ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                      <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-end md:items-center p-6 md:p-10">
                        <div className="max-w-lg text-white">
                          <h1 className="text-xl md:text-4xl font-bold mb-2 md:mb-4">{banner.title}</h1>
                          {banner.subtitle && <p className="text-sm md:text-lg mb-3 md:mb-6 text-white/90">{banner.subtitle}</p>}
                          <Link to={banner.link}>
                            <Button className="bg-brand hover:bg-brand-600 text-sm md:text-base active:scale-95 transition-transform">
                              Подробнее <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {banners.length > 1 && (
                  <>
                    <Button variant="ghost" size="icon" className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full" onClick={prevBanner}><ChevronLeft className="w-6 h-6" /></Button>
                    <Button variant="ghost" size="icon" className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full" onClick={nextBanner}><ChevronRight className="w-6 h-6" /></Button>
                  </>
                )}
                {banners.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {banners.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToBanner(index)}
                        className={`h-2 rounded-full transition-all duration-300 ${index === currentBanner ? 'bg-white w-6' : 'bg-white/50 w-2'}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        ) : null}

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

        {/* Categories Row */}
        <section className="px-4 md:container md:mx-auto">
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            <motion.div
              className="flex md:grid md:grid-cols-4 gap-3 w-max md:w-full"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {[
                { to: '/catalog/produkty', icon: Package, color: 'brand', label: 'Продукты' },
                { to: '/catalog/bytovaya-khimiya', icon: Sparkles, color: 'blue', label: 'Бытовая химия' },
                { to: '/catalog/kosmetika', icon: Shield, color: 'pink', label: 'Косметика' },
                { to: '/promotions', icon: Tag, color: 'amber', label: 'Акции' },
              ].map((cat) => (
                <motion.div key={cat.to} variants={itemVariants} className="flex-shrink-0 w-[120px] md:w-auto">
                  <Link to={cat.to}>
                    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer h-full hover:-translate-y-1 active:scale-95">
                      <CardContent className="p-4 md:p-6 flex flex-col items-center text-center">
                        <div className={`w-12 h-12 bg-${cat.color}-100 rounded-2xl flex items-center justify-center mb-3`}>
                          <cat.icon className={`w-6 h-6 text-${cat.color}-600`} />
                        </div>
                        <h3 className="font-semibold text-sm">{cat.label}</h3>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
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
              {products.slice(0, 6).map((product) => (
                <motion.div key={product.id} variants={itemVariants} className="flex-shrink-0 w-[160px] md:w-auto">
                  <ProductCard product={product} />
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
              {products.slice(6, 12).map((product) => (
                <motion.div key={product.id} variants={itemVariants} className="flex-shrink-0 w-[160px] md:w-auto">
                  <ProductCard product={product} />
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

function ProductCard({ product }: { product: Product }) {
  const { region } = useAppStore();
  const { getProductRegionData } = useCatalogStore();
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const regionData = region ? getProductRegionData(product.id, region.id) : null;
  const isLiked = isFavorite(product.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  return (
    <Link to={`/product/${product.id}`}>
      <Card className={`hover:shadow-xl transition-all duration-300 h-full hover:-translate-y-1 active:scale-[0.98] overflow-hidden ${product.outOfStock ? 'opacity-60' : ''}`}>
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {product.images && product.images[0] ? (
            <img src={product.images[0].thumbnailUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">📦</div>
          )}
          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors z-10"
          >
            <Heart className={`w-4 h-4 transition-colors ${isLiked ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
          </button>
          {/* Badges */}
          {product.isNew && (
            <span className="absolute top-2 left-2 px-2 py-0.5 bg-brand text-white text-[10px] font-medium rounded-full">Новинка</span>
          )}
          {product.isBestseller && !product.isNew && (
            <span className="absolute top-2 left-2 px-2 py-0.5 bg-orange-500 text-white text-[10px] font-medium rounded-full">Хит</span>
          )}
          {product.outOfStock && (
            <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-gray-800 text-white text-[10px] font-medium rounded-full">Нет в наличии</span>
          )}
        </div>
        <CardContent className="p-3">
          <p className="text-xs text-gray-500 mb-1">{product.sku}</p>
          <h3 className="text-sm font-medium line-clamp-2 mb-2">{product.name}</h3>
          {regionData && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-brand">{regionData.price.toLocaleString('ru-RU')} ₽</span>
                {regionData.oldPrice && <span className="text-xs text-gray-400 line-through">{regionData.oldPrice.toLocaleString('ru-RU')} ₽</span>}
              </div>
              {product.cardPrice && (
                <div className="text-xs text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded inline-block">
                  {product.cardPrice} ₽ по карте
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
