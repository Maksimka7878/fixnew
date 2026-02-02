import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { memo } from 'react';

// Large category cards with full background thematic images
const categories = [
    {
        id: 'gifts',
        label: 'Подарки любимым',
        image: '/images/categories/gifts.webp',
        link: '/catalog/podarki',
    },
    {
        id: 'products',
        label: 'Продукты',
        image: '/images/categories/food.webp',
        link: '/catalog/produkty',
    },
    {
        id: 'cleaning',
        label: 'Бытовая химия',
        image: '/images/categories/cleaning.webp',
        link: '/catalog/bytovaya-khimiya',
    },
    {
        id: 'home',
        label: 'Для дома',
        image: '/images/categories/home.webp',
        link: '/catalog/dom-i-sad',
    },
    {
        id: 'cosmetics',
        label: 'Косметика',
        image: '/images/categories/cosmetics.webp',
        link: '/catalog/kosmetika',
    },
    {
        id: 'sales',
        label: 'Акции',
        image: '/images/categories/sales.webp',
        link: '/catalog/aktsii',
    }
];

const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

function CategoryRowComponent() {
    return (
        <div className="px-4 md:container md:mx-auto">
            {/* Mobile: horizontal scroll */}
            <div className="md:hidden overflow-x-auto scrollbar-hide -mx-4 px-4">
                <div className="flex gap-3 w-max py-2">
                    {categories.slice(0, 4).map((category) => (
                        <Link key={category.id} to={category.link} className="flex-shrink-0">
                            <motion.div
                                whileTap={{ scale: 0.95 }}
                                className="relative w-[140px] h-[120px] rounded-2xl overflow-hidden shadow-sm"
                            >
                                <img
                                    src={category.image}
                                    alt={category.label}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                <span className="absolute bottom-3 left-3 text-sm font-semibold text-white drop-shadow-lg">
                                    {category.label}
                                </span>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Desktop: grid of large cards with full background images */}
            <motion.div
                className="hidden md:grid md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-5"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                {categories.map((category) => (
                    <motion.div key={category.id} variants={itemVariants}>
                        <Link to={category.link}>
                            <div className="relative h-[160px] lg:h-[180px] xl:h-[200px] rounded-2xl overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                                {/* Full background image */}
                                <img
                                    src={category.image}
                                    alt={category.label}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />

                                {/* Label with semi-transparent background at top */}
                                <div className="absolute top-3 left-3 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm">
                                    <span className="text-sm lg:text-base font-semibold text-gray-800">
                                        {category.label}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}

export const CategoryRow = memo(CategoryRowComponent);
