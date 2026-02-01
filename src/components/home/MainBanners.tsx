import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Banner } from '@/types';

interface MainBannersProps {
    banners: Banner[];
    isLoading: boolean;
}

export function MainBanners({ banners, isLoading }: MainBannersProps) {
    const [current, setCurrent] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Auto-play logic
    useEffect(() => {
        if (banners.length <= 1 || isPaused) return;

        intervalRef.current = setInterval(() => {
            setCurrent(prev => (prev + 1) % banners.length);
        }, 5000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [banners.length, isPaused]);

    const nextSlide = () => {
        setCurrent(prev => (prev + 1) % banners.length);
    };

    const prevSlide = () => {
        setCurrent(prev => (prev - 1 + banners.length) % banners.length);
    };

    const goToSlide = (index: number) => {
        setCurrent(index);
    };

    const handleDragEnd = (_: any, info: PanInfo) => {
        if (info.offset.x < -50) {
            nextSlide();
        } else if (info.offset.x > 50) {
            prevSlide();
        }
    };

    if (isLoading) {
        return (
            <div className="w-full h-[200px] md:h-[400px] bg-gray-200 animate-pulse rounded-2xl" />
        );
    }

    if (banners.length === 0) return null;

    return (
        <section className="px-4 md:px-0 select-none">
            <div className="md:container md:mx-auto">
                <div
                    className="relative w-full overflow-hidden rounded-2xl shadow-sm"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    onTouchStart={() => setIsPaused(true)}
                    onTouchEnd={() => setIsPaused(false)}
                >
                    <div className="relative h-[200px] md:h-[400px]">
                        <AnimatePresence initial={false} mode="popLayout">
                            <motion.div
                                key={current}
                                className="absolute inset-0 w-full h-full"
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.2}
                                onDragEnd={handleDragEnd}
                            >
                                <img
                                    src={banners[current].image}
                                    alt={banners[current].title}
                                    className="w-full h-full object-cover"
                                    draggable={false}
                                />
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent flex items-end md:items-center p-6 md:p-12">
                                    <div className="max-w-xl text-white">
                                        <motion.h2
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.2 }}
                                            className="text-2xl md:text-5xl font-bold mb-2 md:mb-4 leading-tight drop-shadow-lg"
                                        >
                                            {banners[current].title}
                                        </motion.h2>

                                        {banners[current].subtitle && (
                                            <motion.p
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.3 }}
                                                className="text-base md:text-xl mb-4 md:mb-8 text-white/90 drop-shadow-md"
                                            >
                                                {banners[current].subtitle}
                                            </motion.p>
                                        )}

                                        <motion.div
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.4 }}
                                        >
                                            <Link to={banners[current].link}>
                                                <Button className="bg-brand hover:bg-brand-600 text-white font-semibold px-6 py-2 md:py-6 md:text-lg rounded-full shadow-lg active:scale-95 transition-transform">
                                                    Подробнее <ArrowRight className="w-5 h-5 ml-2" />
                                                </Button>
                                            </Link>
                                        </motion.div>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Desktop Navigation Arrows */}
                    {banners.length > 1 && (
                        <>
                            <button
                                onClick={prevSlide}
                                className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm transition-colors z-10"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={nextSlide}
                                className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm transition-colors z-10"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </>
                    )}

                    {/* Pagination Dots */}
                    {banners.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                            {banners.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    className={`h-2 rounded-full transition-all duration-300 ${index === current ? 'bg-white w-8' : 'bg-white/50 w-2 hover:bg-white/70'}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
