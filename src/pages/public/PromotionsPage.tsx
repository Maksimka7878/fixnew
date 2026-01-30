import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowRight, Percent, Gift, Clock } from 'lucide-react';
import { useMockMarketingApi } from '@/api/mock';
import type { Promotion } from '@/types';

export function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const { getPromotions } = useMockMarketingApi();

  useEffect(() => {
    getPromotions().then(response => {
      if (response.success && response.data) {
        setPromotions(response.data);
      }
      setLoading(false);
    });
  }, [getPromotions]);

  const activePromotions = promotions.filter(p => p.isActive);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Акции и предложения</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-100 animate-pulse h-80 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Акции и предложения</h1>
      <p className="text-gray-600 mb-8">Специальные предложения и скидки для наших клиентов</p>

      {/* Featured Promotion */}
      {activePromotions[0] && (
        <div className="mb-12">
          <Card className="overflow-hidden bg-gradient-to-r from-red-600 to-red-700 text-white">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                    <Percent className="w-12 h-12" />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <Badge className="bg-white/20 text-white mb-2">Главная акция</Badge>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">{activePromotions[0].name}</h2>
                  <p className="text-white/80 mb-4">{activePromotions[0].description}</p>
                  <div className="flex items-center justify-center md:justify-start gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      До {new Date(activePromotions[0].endDate).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  className="flex-shrink-0"
                >
                  Подробнее
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Promotions Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activePromotions.slice(1).map(promotion => (
          <Card key={promotion.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48 bg-gray-100">
              {promotion.bannerImage ? (
                <img
                  src={promotion.bannerImage}
                  alt={promotion.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Gift className="w-16 h-16 text-gray-300" />
                </div>
              )}
              <div className="absolute top-4 left-4">
                <Badge className="bg-red-600 text-white hover:bg-red-700 border-none text-sm px-3 py-1">
                  {promotion.discountType === 'percent' ? `-${promotion.discountValue}%` : `-${promotion.discountValue} ₽`}
                </Badge>
              </div>
            </div>

            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Акция до {new Date(promotion.endDate).toLocaleDateString()}
              </div>

              <h3 className="font-semibold text-lg mb-2">{promotion.name}</h3>
              <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                {promotion.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>До {new Date(promotion.endDate).toLocaleDateString('ru-RU')}</span>
                </div>
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                  Подробнее
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {activePromotions.length === 0 && (
        <div className="text-center py-16">
          <Gift className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Нет активных акций</h2>
          <p className="text-gray-600">В настоящее время нет активных акций</p>
        </div>
      )}

      {/* Loyalty Banner */}
      <div className="mt-12">
        <Card className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <Gift className="w-10 h-10" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold mb-2">Программа лояльности</h2>
                <p className="text-white/80">
                  Получайте баллы за покупки и обменивайте их на скидки.
                  Чем больше покупок — тем больше выгода!
                </p>
              </div>
              <Button
                variant="secondary"
                className="flex-shrink-0"
              >
                Узнать больше
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
