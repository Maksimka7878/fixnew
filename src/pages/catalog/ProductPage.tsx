import { useParams, useNavigate } from 'react-router-dom';
import { useCatalogStore, useCartStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { useMockCatalogApi } from '@/api/mock';
import { ChevronRight, Minus, Plus, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { products, categories } = useCatalogStore();
  const { addItem } = useCartStore();
  const { getProductBySlug } = useMockCatalogApi();

  const [product, setProduct] = useState(products.find(p => p.slug === slug));
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(!product);

  const category = categories.find(c => c.id === product?.categoryId);

  useEffect(() => {
    if (!product && slug) {
      setLoading(true);
      getProductBySlug(slug).then(response => {
        if (response.success && response.data) {
          setProduct(response.data);
        } else {
          navigate('/catalog');
        }
        setLoading(false);
      });
    }
  }, [slug, product, getProductBySlug, navigate]);

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      toast.success(`${product.name} добавлен в корзину`);
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-red-600">Главная</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/catalog" className="hover:text-red-600">Каталог</Link>
        {category && (
          <>
            <ChevronRight className="w-4 h-4" />
            <Link to={`/catalog/${category.slug}`} className="hover:text-red-600">{category.name}</Link>
          </>
        )}
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
          {product.images[0] ? (
            <img
              src={product.images[0].url}
              alt={product.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Нет изображения
            </div>
          )}
          {product.isNew && (
            <Badge className="absolute top-4 left-4 bg-green-500">Новинка</Badge>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-gray-500">Артикул: {product.sku}</p>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-red-600">{product.basePrice} ₽</span>
            {product.baseOldPrice && (
              <span className="text-xl text-gray-400 line-through">{product.baseOldPrice} ₽</span>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Количество:</span>
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 hover:bg-gray-100"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 hover:bg-gray-100"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleAddToCart}
              className="flex-1 bg-red-600 hover:bg-red-700"
              size="lg"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              В корзину
            </Button>
            <Button variant="outline" size="lg">
              <Heart className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t">
            <div className="text-center">
              <Truck className="w-6 h-6 mx-auto mb-2 text-gray-600" />
              <p className="text-xs text-gray-600">Быстрая доставка</p>
            </div>
            <div className="text-center">
              <Shield className="w-6 h-6 mx-auto mb-2 text-gray-600" />
              <p className="text-xs text-gray-600">Гарантия качества</p>
            </div>
            <div className="text-center">
              <RotateCcw className="w-6 h-6 mx-auto mb-2 text-gray-600" />
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
    </div>
  );
}
