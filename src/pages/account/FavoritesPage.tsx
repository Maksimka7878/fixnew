import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useUserProfileStore, useAppStore, useCatalogStore } from '@/store';
import { useMockCatalogApi } from '@/api/mock';
import type { Product } from '@/types';

export function FavoritesPage() {
    const { favorites, removeFromFavorites: removeFavorite, clearFavorites } = useUserProfileStore();
    const { region } = useAppStore();
    const { products, setProducts, getProductRegionData } = useCatalogStore();
    const { getProducts } = useMockCatalogApi();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadProducts = async () => {
            setIsLoading(true);
            const res = await getProducts({ regionId: region?.id || 'r1' });
            if (res.success && res.data) {
                setProducts(res.data);
            }
            setIsLoading(false);
        };
        loadProducts();
    }, [region]);

    const favoriteProducts = products.filter((p) => favorites.includes(p.id));

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 w-48 bg-gray-200 rounded" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-64 bg-gray-200 rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link to="/" className="text-gray-600 hover:text-gray-900">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Избранное</h1>
                    <span className="text-gray-500">({favoriteProducts.length})</span>
                </div>
                {favoriteProducts.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFavorites} className="text-red-500 hover:text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Очистить
                    </Button>
                )}
            </div>

            {favoriteProducts.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-16"
                >
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Heart className="w-12 h-12 text-gray-300" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Список пуст</h2>
                    <p className="text-gray-500 mb-6">
                        Добавляйте понравившиеся товары, чтобы не потерять их
                    </p>
                    <Link to="/catalog">
                        <Button className="bg-brand hover:bg-brand-600">
                            Перейти в каталог
                        </Button>
                    </Link>
                </motion.div>
            ) : (
                <motion.div
                    className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <AnimatePresence mode="popLayout">
                        {favoriteProducts.map((product) => (
                            <FavoriteProductCard
                                key={product.id}
                                product={product}
                                regionData={region ? getProductRegionData(product.id, region.id) : null}
                                onRemove={() => removeFavorite(product.id)}
                            />
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}
        </div>
    );
}

function FavoriteProductCard({
    product,
    regionData,
    onRemove,
}: {
    product: Product;
    regionData: { price: number; oldPrice?: number } | null | undefined;
    onRemove: () => void;
}) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
        >
            <Card className="h-full overflow-hidden group">
                <div className="relative aspect-square bg-gray-100">
                    {product.images?.[0] ? (
                        <img
                            src={product.images[0].thumbnailUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                    )}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onRemove();
                        }}
                        className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-colors"
                    >
                        <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                    </button>
                    {product.isNew && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-brand text-white text-xs font-medium rounded-full">
                            Новинка
                        </span>
                    )}
                    {product.isBestseller && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-orange-500 text-white text-xs font-medium rounded-full">
                            Хит
                        </span>
                    )}
                </div>
                <CardContent className="p-3">
                    <Link to={`/product/${product.id}`}>
                        <p className="text-xs text-gray-500 mb-1">{product.sku}</p>
                        <h3 className="text-sm font-medium line-clamp-2 mb-2 hover:text-brand transition-colors">
                            {product.name}
                        </h3>
                    </Link>
                    {regionData && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-brand">{regionData.price} ₽</span>
                            {regionData.oldPrice && (
                                <span className="text-xs text-gray-400 line-through">{regionData.oldPrice} ₽</span>
                            )}
                            {product.cardPrice && (
                                <span className="text-xs text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">
                                    {product.cardPrice} ₽ по карте
                                </span>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
