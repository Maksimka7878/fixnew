import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { X, Play, Pause } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

interface Story {
    id: string;
    title: string;
    image: string;
    color: string;
    slides: { image: string; text?: string; description?: string }[];
}

const mockStories: Story[] = [
    {
        id: '1',
        title: 'Новинки',
        image: '/images/products/bfbaef91a975ade106b8496fb72f5f01.webp',
        color: 'from-green-500 to-green-600',
        slides: [
            {
                image: '/images/products/bfbaef91a975ade106b8496fb72f5f01.webp',
                text: 'Салфетки Plushe',
                description: 'Мягкие двухслойные салфетки для вашего комфорта'
            },
            {
                image: '/images/products/541f029e5ad38f437901f9474bfe2233.webp',
                text: 'Пакеты BonHome',
                description: 'Удобное хранение вещей'
            },
        ]
    },
    {
        id: '2',
        title: 'Кухня',
        image: '/images/products/0f1068a2d887f41a7cef7030a817376b.webp',
        color: 'from-red-500 to-red-600',
        slides: [
            {
                image: '/images/products/0f1068a2d887f41a7cef7030a817376b.webp',
                text: 'Бумага для выпечки',
                description: 'Готовьте с удовольствием без пригорания'
            },
            {
                image: '/images/products/c349b441dcc149c4e23e248bd9572eb1.webp',
                text: 'Салфетки Duet',
                description: 'Экономичная упаковка 250 шт.'
            },
        ]
    },
    {
        id: '3',
        title: 'Порядок',
        image: '/images/products/63e5d88ae9985b8430228194c6615a8b.webp',
        color: 'from-violet-500 to-violet-600',
        slides: [
            {
                image: '/images/products/63e5d88ae9985b8430228194c6615a8b.webp',
                text: 'Умное хранение',
                description: 'Крышки на резинке для любой посуды'
            },
            {
                image: '/images/products/570092f2b8fa8860afadc8ec43ceea81.webp',
                text: 'Фасовочные пакеты',
                description: 'Прочные и вместительные'
            }
        ]
    },
    {
        id: '4',
        title: 'Завтраки',
        image: '/images/products/c0d7e83d4895d392fe09e2a799f96afc.webp',
        color: 'from-amber-500 to-amber-600',
        slides: [
            {
                image: '/images/products/c0d7e83d4895d392fe09e2a799f96afc.webp',
                text: 'Завтрак с собой',
                description: 'Удобные пакеты для сэндвичей'
            },
            {
                image: '/images/products/6ad6d5e3be6c376e231ec1dd3f29f1c6.webp',
                text: 'Заморозка',
                description: 'Сохраните свежесть продуктов надолго'
            },
        ]
    },
    {
        id: '5',
        title: 'Уборка',
        image: '/images/products/524b016745568e11c95e18248c887118.webp',
        color: 'from-cyan-500 to-cyan-600',
        slides: [
            {
                image: '/images/products/524b016745568e11c95e18248c887118.webp',
                text: 'Чистота дома',
                description: 'Губки для сильных загрязнений'
            },
        ]
    },
];

function StoriesComponent() {
    const [activeStory, setActiveStory] = useState<Story | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // Reset slide when opening a new story
    const openStory = (story: Story) => {
        setActiveStory(story);
        setCurrentSlide(0);
        setIsPaused(false);
    };

    const closeStory = () => {
        setActiveStory(null);
        setCurrentSlide(0);
        setIsPaused(false);
    };

    const nextSlide = () => {
        if (!activeStory) return;
        if (currentSlide < activeStory.slides.length - 1) {
            setCurrentSlide(prev => prev + 1);
        } else {
            // Move to next story
            const currentIndex = mockStories.findIndex(s => s.id === activeStory.id);
            if (currentIndex < mockStories.length - 1) {
                setActiveStory(mockStories[currentIndex + 1]);
                setCurrentSlide(0);
            } else {
                closeStory();
            }
        }
    };

    const prevSlide = () => {
        if (!activeStory) return;
        if (currentSlide > 0) {
            setCurrentSlide(prev => prev - 1);
        } else {
            // Move to previous story
            const currentIndex = mockStories.findIndex(s => s.id === activeStory.id);
            if (currentIndex > 0) {
                const prevStory = mockStories[currentIndex - 1];
                setActiveStory(prevStory.slides.length > 0 ? prevStory : mockStories[0]); // Fallback safety
                setCurrentSlide(Math.max(0, (prevStory.slides.length || 1) - 1));
            }
        }
    };

    const handleDragEnd = (_: any, info: PanInfo) => {
        if (info.offset.x < -50) {
            nextSlide();
        } else if (info.offset.x > 50) {
            prevSlide();
        } else if (info.offset.y > 100) {
            closeStory();
        }
    };

    return (
        <>
            {/* Stories Circles */}
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide py-2 px-1">
                {mockStories.map((story) => (
                    <motion.button
                        key={story.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openStory(story)}
                        className="flex flex-col items-center gap-1 flex-shrink-0"
                    >
                        <div className={`p-[3px] rounded-full bg-gradient-to-br ${story.color}`}>
                            <div className="bg-white p-[2px] rounded-full">
                                <OptimizedImage
                                    src={story.image}
                                    alt={story.title}
                                    className="rounded-full border border-gray-100"
                                    aspectRatio="1/1"
                                    priority
                                />
                            </div>
                        </div>
                        <span className="text-[11px] font-medium text-gray-700 max-w-[70px] truncate">
                            {story.title}
                        </span>
                    </motion.button>
                ))}
            </div>

            {/* Story Viewer Modal */}
            <AnimatePresence>
                {activeStory && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-[100] bg-black flex items-center justify-center touch-none"
                    >
                        <motion.div
                            className="relative w-full h-full max-w-lg mx-auto bg-black md:rounded-2xl overflow-hidden"
                            drag={true}
                            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                            dragElastic={0.2}
                            onDragEnd={handleDragEnd}
                        >
                            {/* Progress Bars */}
                            <div className="absolute top-safe-area left-0 right-0 flex gap-1 p-2 z-20">
                                {activeStory.slides.map((_, index) => (
                                    <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-white"
                                            initial={{ width: index < currentSlide ? '100%' : '0%' }}
                                            animate={{
                                                width: index < currentSlide ? '100%' : index === currentSlide ? '100%' : '0%'
                                            }}
                                            transition={{
                                                duration: index === currentSlide && !isPaused ? 5 : 0,
                                                ease: 'linear'
                                            }}
                                            onAnimationComplete={() => {
                                                if (index === currentSlide && !isPaused) {
                                                    nextSlide();
                                                }
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Header */}
                            <div className="absolute top-safe-area left-0 right-0 flex items-center justify-between p-4 pt-6 z-20">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8">
                                        <OptimizedImage src={activeStory.image} alt={activeStory.title} className="rounded-full border border-white/50" aspectRatio="1/1" />
                                    </div>
                                    <span className="text-white font-medium text-sm drop-shadow-md">{activeStory.title}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={(e) => { e.stopPropagation(); setIsPaused(!isPaused); }} className="p-2 text-white/80 hover:text-white transition-colors">
                                        {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); closeStory(); }} className="p-2 text-white/80 hover:text-white transition-colors">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Click Zones (Invisible) */}
                            <div className="absolute inset-0 z-10 flex">
                                <div className="w-[30%] h-full" onClick={prevSlide} />
                                <div className="w-[40%] h-full" onClick={() => setIsPaused(!isPaused)} />
                                <div className="w-[30%] h-full" onClick={nextSlide} />
                            </div>

                            {/* Slide Content */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`${activeStory.id}-${currentSlide}`}
                                    initial={{ opacity: 0, scale: 1.05 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="w-full h-full flex flex-col items-center justify-center relative bg-gray-900"
                                >
                                    <OptimizedImage
                                        src={activeStory.slides[currentSlide].image}
                                        alt={activeStory.slides[currentSlide].text || 'Story slide'}
                                        className="w-full h-full"
                                        priority
                                    />

                                    <div className="absolute bottom-0 left-0 right-0 p-8 pb-12 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                                        <motion.div
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.1 }}
                                        >
                                            {activeStory.slides[currentSlide].text && (
                                                <h3 className="text-white text-2xl font-bold mb-2 drop-shadow-lg">
                                                    {activeStory.slides[currentSlide].text}
                                                </h3>
                                            )}
                                            {activeStory.slides[currentSlide].description && (
                                                <p className="text-white/90 text-sm md:text-base leading-relaxed drop-shadow-md pb-6">
                                                    {activeStory.slides[currentSlide].description}
                                                </p>
                                            )}
                                        </motion.div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

export const Stories = memo(StoriesComponent);
