import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Product } from '@/types';
import { useCartStore, useUserProfileStore } from '@/store';
import { useAnimationStore } from '@/store/animation';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
    product: Product;
    index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
    const { addItem, items, updateQuantity, removeItem } = useCartStore();
    const { startAnimation } = useAnimationStore();
    const { isFavorite, addToFavorites, removeFromFavorites } = useUserProfileStore();
    const [isHeart, setIsHeart] = useState(isFavorite(product.id));

    const cartItem = items.find(i => i.product.id === product.id);
    const quantity = cartItem ? cartItem.quantity : 0;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        addItem(product);

        // Start fly animation
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const startPos = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        const image = product.images[0]?.url || '/placeholder.png';
        startAnimation(startPos, image);
    };

    const handleToggleFavorite = (e: React.MouseEvent) => {
        e.preventDefault();
        if (isHeart) {
            removeFromFavorites(product.id);
            setIsHeart(false);
        } else {
            addToFavorites(product.id);
            setIsHeart(true);
        }
    };

    // Prefetch product data on hover/touch
    const handlePrefetch = () => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = `/product/${product.id}`;
        document.head.appendChild(link);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
        >
            <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-brand hover:-translate-y-1 border-0 shadow-soft bg-white/50 backdrop-blur-sm group rounded-2xl">
                <Link
                    to={`/product/${product.id}`}
                    className="flex-1 flex flex-col"
                    onMouseEnter={handlePrefetch}
                    onTouchStart={handlePrefetch}
                >
                    <div className="aspect-[4/5] relative overflow-hidden bg-gray-50">
                        <img
                            src={product.images[0]?.url || '/placeholder.png'}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1">
                            {product.isNew && (
                                <span className="bg-brand text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                    New
                                </span>
                            )}
                            {product.isBestseller && (
                                <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                    Hit
                                </span>
                            )}
                        </div>

                        {/* Favorite button */}
                        <motion.button
                            onClick={handleToggleFavorite}
                            className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-colors"
                            whileTap={{ scale: 0.9 }}
                        >
                            <Heart
                                className="w-5 h-5 transition-colors"
                                style={{
                                    fill: isHeart ? '#ef4444' : 'none',
                                    color: isHeart ? '#ef4444' : '#9ca3af',
                                }}
                            />
                        </motion.button>
                    </div>
                    <CardContent className="p-4 flex-1 flex flex-col">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug mb-2 flex-grow font-sans">
                            {product.name}
                        </h3>
                        <div className="mt-auto">
                            <div className="flex items-baseline gap-2">
                                <span className="text-lg font-bold font-heading text-gray-900">
                                    {product.basePrice} ₽
                                </span>
                                {product.baseOldPrice && (
                                    <span className="text-xs text-gray-400 line-through">
                                        {product.baseOldPrice} ₽
                                    </span>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Link>
                <CardFooter className="p-4 pt-0">
                    {quantity > 0 ? (
                        <div className="flex items-center justify-between w-full bg-brand/5 border border-brand/20 rounded-xl p-1">
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-brand hover:text-brand-700 hover:bg-brand/10 rounded-lg"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (quantity > 1) {
                                        updateQuantity(product.id, quantity - 1);
                                    } else {
                                        removeItem(product.id);
                                    }
                                }}
                            >
                                <Minus className="w-4 h-4" />
                            </Button>
                            <span className="font-bold text-brand text-sm">{quantity}</span>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-brand hover:text-brand-700 hover:bg-brand/10 rounded-lg"
                                onClick={(e) => {
                                    e.preventDefault();
                                    addItem(product);
                                }}
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                    ) : (
                        <Button
                            className="w-full bg-gray-900 hover:bg-brand text-white transition-all duration-300 rounded-xl font-medium active:scale-95 shadow-none hover:shadow-lg hover:shadow-brand/20"
                            onClick={handleAddToCart}
                        >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            В корзину
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </motion.div>
    );
}
