import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCatalogStore, useCartStore, useFavoritesStore, useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { useMockCatalogApi } from '@/api/mock';
import { ChevronRight, Minus, Plus, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@/types';

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, categories, getProductRegionData } = useCatalogStore();
  const { region } = useAppStore();
  const { addItem } = useCartStore();
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const { getProducts } = useMockCatalogApi();

  const [product, setProduct] = useState<Product | undefined>(products.find(p => p.id === id));
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(!product);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);

  const category = categories.find(c => c.id === product?.categoryId);
  const isLiked = product ? isFavorite(product.id) : false;
  const regionData = product && region ? getProductRegionData(product.id, region.id) : null;

  // Load product if not in store
  useEffect(() => {
    if (!product && id) {
      setLoading(true);
      getProducts({ regionId: region?.id || 'r1' }).then((response) => {
        if (response.success && response.data) {
          const found = response.data.find(p => p.id === id);
          if (found) {
            setProduct(found);
          } else {
            navigate('/catalog');
          }
        }
        setLoading(false);
      });
    }
  }, [id, product, getProducts, navigate, region?.id]);

  // Load similar products
  useEffect(() => {
    if (product) {
      getProducts({ regionId: region?.id || 'r1', categoryId: product.categoryId }).then((response) => {
        if (response.success && response.data) {
          setSimilarProducts(response.data.filter(p => p.id !== product.id).slice(0, 6));
        }
      });
    }
  }, [product, region, getProducts]);

  const handleAddToCart = () => {
    if (product && !product.outOfStock) {
      addItem(product, quantity);
      toast.success(`${product.name} добавлен в корзину`);
    }
  };

  const handleFavoriteToggle = () => {
    if (product) {
      toggleFavorite(product.id);
      toast(isLiked ? 'Удалено из избранного' : 'Добавлено в избранное');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-12 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Товар не найден</h1>
          <p className="text-gray-600">Запрашиваемый товар не существует</p>
        </div>
      </div>
    );
  }

  // Mock specifications
  const specifications = [
    { name: 'Бренд', value: product.brand || 'Fix Price' },
    { name: 'Страна', value: product.country || 'Россия' },
    { name: 'Вес', value: product.weight ? `${product.weight} г` : '—' },
    { name: 'Артикул', value: product.sku },
    { name: 'Штрихкод', value: product.barcode },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/" className="hover:text-brand">Главная</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/catalog" className="hover:text-brand">Каталог</Link>
        {category && (
          <>
            <ChevronRight className="w-4 h-4" />
            <Link to={`/catalog/${category.slug}`} className="hover:text-brand">{category.name}</Link>
          </>
        )}
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden">
          {product.images[0] ? (
            <img src={product.images[0].url} alt={product.name} className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-6xl">📦</div>
          )}
          {product.isNew && <Badge className="absolute top-4 left-4 bg-brand">Новинка</Badge>}
          {product.isBestseller && <Badge className="absolute top-4 left-4 bg-orange-500">Хит</Badge>}
          {product.outOfStock && <Badge className="absolute top-4 left-4 bg-gray-800">Нет в наличии</Badge>}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-gray-500">Артикул: {product.sku}</p>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-brand">{regionData?.price || product.basePrice} ₽</span>
              {(regionData?.oldPrice || product.baseOldPrice) && (
                <span className="text-xl text-gray-400 line-through">{regionData?.oldPrice || product.baseOldPrice} ₽</span>
              )}
            </div>
            {product.cardPrice && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 text-brand-600 rounded-lg text-sm font-medium">
                💳 {product.cardPrice} ₽ по карте
              </div>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Количество:</span>
            <div className="flex items-center border rounded-lg">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-gray-100 transition-colors">
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 font-medium w-12 text-center">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:bg-gray-100 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleAddToCart}
              disabled={product.outOfStock}
              className="flex-1 bg-brand hover:bg-brand-600"
              size="lg"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {product.outOfStock ? 'Нет в наличии' : 'В корзину'}
            </Button>
            <Button variant="outline" size="lg" onClick={handleFavoriteToggle}>
              <Heart className={`w-5 h-5 transition-colors ${isLiked ? 'text-red-500 fill-red-500' : ''}`} />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigator.share?.({ title: product.name, url: window.location.href })}>
              <Share2 className="w-5 h-5" />
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t">
            <div className="text-center">
              <Truck className="w-6 h-6 mx-auto mb-2 text-brand" />
              <p className="text-xs text-gray-600">Быстрая доставка</p>
            </div>
            <div className="text-center">
              <Shield className="w-6 h-6 mx-auto mb-2 text-brand" />
              <p className="text-xs text-gray-600">Гарантия качества</p>
            </div>
            <div className="text-center">
              <RotateCcw className="w-6 h-6 mx-auto mb-2 text-brand" />
              <p className="text-xs text-gray-600">Легкий возврат</p>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="pt-6 border-t">
              <h3 className="font-semibold mb-2">Описание</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Specifications */}
      <section className="pt-8 border-t">
        <h2 className="text-xl font-bold mb-4">Характеристики</h2>
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-2">
          {specifications.map((spec) => (
            <div key={spec.name} className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">{spec.name}</span>
              <span className="font-medium text-gray-900">{spec.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <section className="pt-8 border-t">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Похожие товары</h2>
            <Link to={`/catalog/${category?.slug || ''}`} className="text-brand hover:underline flex items-center gap-1 text-sm">
              Все <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <motion.div
            className="flex md:grid md:grid-cols-6 gap-4 overflow-x-auto scrollbar-hide pb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {similarProducts.map((p) => (
              <SimilarProductCard key={p.id} product={p} />
            ))}
          </motion.div>
        </section>
      )}
    </div>
  );
}

function SimilarProductCard({ product }: { product: Product }) {
  const { region } = useAppStore();
  const { getProductRegionData } = useCatalogStore();
  const regionData = region ? getProductRegionData(product.id, region.id) : null;

  return (
    <Link to={`/product/${product.id}`} className="flex-shrink-0 w-[140px] md:w-auto">
      <Card className="h-full hover:shadow-lg transition-all duration-300 overflow-hidden">
        <div className="aspect-square bg-gray-100 overflow-hidden">
          {product.images?.[0] ? (
            <img src={product.images[0].thumbnailUrl} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
          )}
        </div>
        <CardContent className="p-2">
          <h3 className="text-xs font-medium line-clamp-2 mb-1">{product.name}</h3>
          <span className="font-bold text-brand text-sm">{regionData?.price || product.basePrice} ₽</span>
        </CardContent>
      </Card>
    </Link>
  );
}
