import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ThumbsUp, ChevronDown, ChevronUp, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Review {
    id: string;
    author: string;
    rating: number;
    date: string;
    text: string;
    helpful: number;
    verified: boolean;
}

const mockReviews: Review[] = [
    { id: '1', author: 'Ольга М.', rating: 5, date: '15 янв 2026', text: 'Отличный товар! Качество на высоте, доставка быстрая. Рекомендую всем!', helpful: 12, verified: true },
    { id: '2', author: 'Алексей К.', rating: 4, date: '10 янв 2026', text: 'Хороший товар за свои деньги. Есть небольшие недочеты, но в целом доволен покупкой.', helpful: 5, verified: true },
    { id: '3', author: 'Мария П.', rating: 5, date: '5 янв 2026', text: 'Покупаю уже не в первый раз. Всегда отличное качество!', helpful: 8, verified: false },
];

interface ProductReviewsProps {
    productId: string;
}

function StarRating({ rating, size = 'sm', interactive = false, onChange }: {
    rating: number;
    size?: 'sm' | 'lg';
    interactive?: boolean;
    onChange?: (rating: number) => void;
}) {
    const [hovered, setHovered] = useState(0);
    const sizeClass = size === 'lg' ? 'w-8 h-8' : 'w-4 h-4';

    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={!interactive}
                    onClick={() => onChange?.(star)}
                    onMouseEnter={() => interactive && setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    className={interactive ? 'cursor-pointer' : 'cursor-default'}
                >
                    <Star
                        className={`${sizeClass} ${star <= (hovered || rating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                            } transition-colors`}
                    />
                </button>
            ))}
        </div>
    );
}

export function ProductReviews({ productId: _productId }: ProductReviewsProps) {
    const [showAll, setShowAll] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [newRating, setNewRating] = useState(0);
    const [newReview, setNewReview] = useState('');
    const [likedReviews, setLikedReviews] = useState<string[]>([]);

    const avgRating = mockReviews.reduce((sum, r) => sum + r.rating, 0) / mockReviews.length;
    const displayedReviews = showAll ? mockReviews : mockReviews.slice(0, 2);

    const handleSubmitReview = () => {
        if (newRating === 0) {
            toast.error('Пожалуйста, поставьте оценку');
            return;
        }
        toast.success('Спасибо за ваш отзыв!');
        setShowForm(false);
        setNewRating(0);
        setNewReview('');
    };

    const handleLike = (reviewId: string) => {
        if (likedReviews.includes(reviewId)) {
            setLikedReviews(likedReviews.filter(id => id !== reviewId));
        } else {
            setLikedReviews([...likedReviews, reviewId]);
        }
    };

    return (
        <section className="pt-8 border-t">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold mb-1">Отзывы</h2>
                    <div className="flex items-center gap-2">
                        <StarRating rating={Math.round(avgRating)} />
                        <span className="text-sm text-gray-600">
                            {avgRating.toFixed(1)} ({mockReviews.length} отзывов)
                        </span>
                    </div>
                </div>
                <Button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-brand hover:bg-brand-600"
                >
                    Написать отзыв
                </Button>
            </div>

            {/* Review Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <Card className="mb-6 border-brand">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold">Ваш отзыв</h3>
                                    <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="mb-4">
                                    <p className="text-sm text-gray-600 mb-2">Ваша оценка:</p>
                                    <StarRating rating={newRating} size="lg" interactive onChange={setNewRating} />
                                </div>
                                <Textarea
                                    placeholder="Расскажите о вашем опыте использования товара..."
                                    value={newReview}
                                    onChange={(e) => setNewReview(e.target.value)}
                                    className="mb-4"
                                    rows={4}
                                />
                                <Button onClick={handleSubmitReview} className="bg-brand hover:bg-brand-600">
                                    <Send className="w-4 h-4 mr-2" /> Отправить отзыв
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reviews List */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {displayedReviews.map((review, index) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarFallback className="bg-brand-100 text-brand">
                                                    {review.author.slice(0, 2)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{review.author}</span>
                                                    {review.verified && (
                                                        <Badge variant="secondary" className="text-xs">Проверено</Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500">{review.date}</p>
                                            </div>
                                        </div>
                                        <StarRating rating={review.rating} />
                                    </div>
                                    <p className="text-gray-700 mb-3">{review.text}</p>
                                    <button
                                        onClick={() => handleLike(review.id)}
                                        className={`flex items-center gap-1 text-sm transition-colors ${likedReviews.includes(review.id) ? 'text-brand' : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        <ThumbsUp className={`w-4 h-4 ${likedReviews.includes(review.id) ? 'fill-brand' : ''}`} />
                                        Полезно ({review.helpful + (likedReviews.includes(review.id) ? 1 : 0)})
                                    </button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Show More/Less */}
            {mockReviews.length > 2 && (
                <Button
                    variant="ghost"
                    className="w-full mt-4"
                    onClick={() => setShowAll(!showAll)}
                >
                    {showAll ? (
                        <>Скрыть <ChevronUp className="w-4 h-4 ml-1" /></>
                    ) : (
                        <>Показать все отзывы ({mockReviews.length}) <ChevronDown className="w-4 h-4 ml-1" /></>
                    )}
                </Button>
            )}
        </section>
    );
}
