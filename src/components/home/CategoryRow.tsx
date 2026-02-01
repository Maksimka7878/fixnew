import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { memo } from 'react';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

// Icons are dynamically served from the public folder
const categories = [
    {
        id: 'products',
        label: 'Продукты',
        image: '/images/icons/icon_products.png', // Assuming we will move them here
        link: '/catalog/products',
        color: 'bg-green-50'
    },
    {
        id: 'cleaning',
        label: 'Бытовая химия',
        image: '/images/icons/icon_cleaning.png',
        link: '/catalog/bytovaya-khimiya',
        color: 'bg-blue-50'
    },
    {
        id: 'cosmetics',
        label: 'Косметика',
        image: '/images/icons/icon_cosmetics.png',
        link: '/catalog/cosmetics',
        color: 'bg-pink-50'
    },
    {
        id: 'sales',
        label: 'Акции',
        image: '/images/icons/icon_sales.png',
        link: '/promotions',
        color: 'bg-orange-50'
    }
];

function CategoryRowComponent() {
    return (
        <div className="flex gap-4 overflow-x-auto scrollbar-hide px-4 md:container md:mx-auto py-2">
            {categories.map((category) => (
                <Link key={category.id} to={category.link} className="flex-shrink-0">
                    <motion.div
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex flex-col items-center gap-2 w-[100px]"
                    >
                        <div className={`w-[80px] h-[80px] rounded-2xl flex items-center justify-center shadow-sm p-4 ${category.color}`}>
                            <OptimizedImage
                                src={category.image}
                                alt={category.label}
                                className="drop-shadow-md"
                                aspectRatio="1/1"
                                priority
                            />
                        </div>
                        <span className="text-xs font-medium text-center text-gray-700 leading-tight">
                            {category.label}
                        </span>
                    </motion.div>
                </Link>
            ))}
        </div>
    );
}

export const CategoryRow = memo(CategoryRowComponent);
