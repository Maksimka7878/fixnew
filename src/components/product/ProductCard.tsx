import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Product } from '@/types';
import { useCartStore } from '@/store';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
    product: Product;
    index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
    const { addItem } = useCartStore();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        addItem(product);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
        >
            <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <Link to={`/product/${product.id}`} className="flex-1">
                    <div className="aspect-square relative overflow-hidden bg-gray-100">
                        <img
                            src={product.images[0]?.url || '/placeholder.png'}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        />
                        {product.isNew && (
                            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded font-semibold">
                                New
                            </div>
                        )}
                        {product.isBestseller && (
                            <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded font-semibold">
                                Hit
                            </div>
                        )}
                    </div>
                    <CardContent className="p-4">
                        <div className="text-lg font-bold text-gray-900 mb-1">
                            {product.basePrice} ₽
                        </div>
                        {product.baseOldPrice && (
                            <div className="text-sm text-gray-500 line-through mb-2">
                                {product.baseOldPrice} ₽
                            </div>
                        )}
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[40px]">
                            {product.name}
                        </h3>
                    </CardContent>
                </Link>
                <CardFooter className="p-4 pt-0 mt-auto">
                    <Button
                        className="w-full bg-green-600 hover:bg-green-700 text-white transition-all duration-200 active:scale-95"
                        onClick={handleAddToCart}
                    >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        В корзину
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
}
