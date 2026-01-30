import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

interface Story {
    id: string;
    title: string;
    image: string;
    color: string;
    slides: { image: string; text?: string }[];
}

const mockStories: Story[] = [
    {
        id: '1',
        title: 'Новинки',
        image: 'https://placehold.co/100x100/22c55e/white?text=NEW',
        color: 'from-green-500 to-green-600',
        slides: [
            { image: 'https://placehold.co/400x600/22c55e/white?text=Новинки+января', text: 'Новые товары каждую неделю!' },
            { image: 'https://placehold.co/400x600/16a34a/white?text=Только+в+Fix+Price' },
        ]
    },
    {
        id: '2',
        title: 'Скидки',
        image: 'https://placehold.co/100x100/ef4444/white?text=SALE',
        color: 'from-red-500 to-red-600',
        slides: [
            { image: 'https://placehold.co/400x600/ef4444/white?text=Скидки+до+50%25', text: 'Успейте купить!' },
            { image: 'https://placehold.co/400x600/dc2626/white?text=Только+сегодня' },
        ]
    },
    {
        id: '3',
        title: 'Идеи',
        image: 'https://placehold.co/100x100/8b5cf6/white?text=IDEA',
        color: 'from-violet-500 to-violet-600',
        slides: [
            { image: 'https://placehold.co/400x600/8b5cf6/white?text=Подарки+любимым', text: 'Идеи для подарков' },
        ]
    },
    {
        id: '4',
        title: 'Рецепты',
        image: 'https://placehold.co/100x100/f59e0b/white?text=FOOD',
        color: 'from-amber-500 to-amber-600',
        slides: [
            { image: 'https://placehold.co/400x600/f59e0b/white?text=Вкусные+рецепты', text: 'Готовим вместе' },
            { image: 'https://placehold.co/400x600/d97706/white?text=Быстро+и+просто' },
        ]
    },
    {
        id: '5',
        title: 'DIY',
        image: 'https://placehold.co/100x100/06b6d4/white?text=DIY',
        color: 'from-cyan-500 to-cyan-600',
        slides: [
            { image: 'https://placehold.co/400x600/06b6d4/white?text=Творим+своими+руками' },
        ]
    },
];

export function Stories() {
    const [activeStory, setActiveStory] = useState<Story | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const openStory = (story: Story) => {
        setActiveStory(story);
        setCurrentSlide(0);
        setIsPaused(false);
    };

    const closeStory = () => {
        setActiveStory(null);
        setCurrentSlide(0);
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
                setActiveStory(prevStory);
                setCurrentSlide(prevStory.slides.length - 1);
            }
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
                                <img
                                    src={story.image}
                                    alt={story.title}
                                    className="w-16 h-16 rounded-full object-cover"
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
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
                        onClick={(e) => {
                            const rect = (e.target as HTMLElement).getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            if (x < rect.width / 3) {
                                prevSlide();
                            } else if (x > rect.width * 2 / 3) {
                                nextSlide();
                            }
                        }}
                    >
                        {/* Progress Bars */}
                        <div className="absolute top-safe-area left-0 right-0 flex gap-1 p-2 z-10">
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
                        <div className="absolute top-safe-area left-0 right-0 flex items-center justify-between p-4 pt-6 z-10">
                            <div className="flex items-center gap-3">
                                <img src={activeStory.image} alt="" className="w-10 h-10 rounded-full border-2 border-white" />
                                <span className="text-white font-medium">{activeStory.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setIsPaused(!isPaused)} className="p-2 text-white">
                                    {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
                                </button>
                                <button onClick={closeStory} className="p-2 text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Slide Content */}
                        <motion.div
                            key={`${activeStory.id}-${currentSlide}`}
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full h-full flex items-center justify-center"
                        >
                            <img
                                src={activeStory.slides[currentSlide].image}
                                alt=""
                                className="max-w-full max-h-full object-contain"
                            />
                            {activeStory.slides[currentSlide].text && (
                                <div className="absolute bottom-20 left-0 right-0 text-center">
                                    <p className="text-white text-xl font-bold px-8 drop-shadow-lg">
                                        {activeStory.slides[currentSlide].text}
                                    </p>
                                </div>
                            )}
                        </motion.div>

                        {/* Navigation Hints */}
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                            <ChevronLeft className="w-8 h-8" />
                        </div>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50">
                            <ChevronRight className="w-8 h-8" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
