import { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Product } from '@/types';
import { useCartStore, useUserProfileStore } from '@/store';
import { useAnimationStore } from '@/store/animation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

interface ProductCardProps {
    product: Product;
    index?: number;
}

function ProductCardComponent({ product, index = 0 }: ProductCardProps) {
    const navigate = useNavigate();
    const { addItem, items, updateQuantity, removeItem } = useCartStore();
    const { startAnimation } = useAnimationStore();
    const { isFavorite, addToFavorites, removeFromFavorites } = useUserProfileStore();
    const [isHeart, setIsHeart] = useState(isFavorite(product.id));

    const cartItem = items.find(i => i.product.id === product.id);
    const quantity = cartItem ? cartItem.quantity : 0;

    const handleCardClick = () => {
        navigate(`/product/${product.id}`);
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        addItem(product);

        // Start fly animation
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const startPos = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        const image = product.images[0]?.url || '/placeholder.png';
        startAnimation(startPos, image);
    };

    const handleToggleFavorite = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isHeart) {
            removeFromFavorites(product.id);
            setIsHeart(false);
        } else {
            addToFavorites(product.id);
            setIsHeart(true);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
        >
            <Card
                className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-100 shadow-sm bg-white group rounded-lg cursor-pointer"
                onClick={handleCardClick}
            >
                <div className="relative">
                    {/* Image Area */}
                    <div className="aspect-square relative overflow-hidden bg-white">
                        <OptimizedImage
                            src={product.images[0]?.url || product.images[0]?.thumbnailUrl || '/placeholder.png'}
                            alt={product.name}
                            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                            aspectRatio="4/5"
                            priority={index === 0}
                        />

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                            {product.isNew && (
                                <span className="bg-brand text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                                    New
                                </span>
                            )}
                            {product.isBestseller && (
                                <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                                    Hit
                                </span>
                            )}
                        </div>

                        {/* Favorite button (Top Right, Circular, Semi-transparent) */}
                        <motion.button
                            onClick={handleToggleFavorite}
                            className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-all z-20"
                            whileTap={{ scale: 0.9 }}
                        >
                            <Heart
                                className={`w-4 h-4 transition-colors ${isHeart ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                            />
                        </motion.button>
                    </div>
                </div>

                <CardContent className="p-3 flex-1 flex flex-col">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight mb-2 flex-grow font-sans">
                        {product.name}
                    </h3>

                    <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-lg font-bold font-heading text-gray-900">
                            {product.basePrice} ₽
                        </span>
                        {product.baseOldPrice && (
                            <span className="text-xs text-gray-400 line-through">
                                {product.baseOldPrice} ₽
                            </span>
                        )}
                    </div>

                    {/* Cart Actions - Button only, no extra controls */}
                    <div onClick={(e) => e.stopPropagation()}>
                        {quantity > 0 ? (
                            <div className="flex items-center justify-between w-full bg-brand/5 border border-brand/20 rounded-lg p-1 h-9">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-brand hover:text-brand-700 hover:bg-brand/10 rounded"
                                    onClick={() => {
                                        if (quantity > 1) {
                                            updateQuantity(product.id, quantity - 1);
                                        } else {
                                            removeItem(product.id);
                                        }
                                    }}
                                >
                                    <Minus className="w-3.5 h-3.5" />
                                </Button>
                                <span className="font-bold text-brand text-xs">{quantity}</span>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-brand hover:text-brand-700 hover:bg-brand/10 rounded"
                                    onClick={() => addItem(product)}
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        ) : (
                            <Button
                                className="w-full bg-blue-50 border border-blue-200 text-gray-900 hover:bg-brand hover:text-white hover:border-brand transition-all duration-300 rounded-lg font-medium text-sm h-9"
                                onClick={handleAddToCart}
                            >
                                Купить
                            </Button>
                        )}
                    </div>
                </CardContent>
                {/* Removed separate CardFooter as controls are now inside Content for better layout control */}
            </Card>
        </motion.div>
    );
}

// Memoize with custom comparison to prevent unnecessary re-renders
export const ProductCard = memo(ProductCardComponent, (prevProps, nextProps) => {
    return (
        prevProps.product.id === nextProps.product.id &&
        prevProps.index === nextProps.index
    );
});

ProductCard.displayName = 'ProductCard';
