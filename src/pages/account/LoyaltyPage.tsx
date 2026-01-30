import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Gift, Star, TrendingUp, Award, ChevronRight, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { useMockLoyaltyApi } from '@/api/mock';
import type { LoyaltyInfo, LoyaltyTransaction } from '@/types';

const loyaltyLevels = [
  { name: 'Бронза', minPoints: 0, color: 'bg-amber-700', discount: 1 },
  { name: 'Серебро', minPoints: 1000, color: 'bg-gray-400', discount: 3 },
  { name: 'Золото', minPoints: 5000, color: 'bg-yellow-500', discount: 5 },
  { name: 'Платина', minPoints: 15000, color: 'bg-cyan-500', discount: 10 },
];

export function LoyaltyPage() {
  const { user } = useAuthStore();
  const { getLoyaltyInfo, getLoyaltyHistory } = useMockLoyaltyApi();
  const [loyalty, setLoyalty] = useState<LoyaltyInfo | null>(null);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      Promise.all([
        getLoyaltyInfo(user.id),
        getLoyaltyHistory(user.id),
      ]).then(([infoRes, historyRes]) => {
        if (infoRes.success && infoRes.data) {
          setLoyalty(infoRes.data);
        }
        if (historyRes.success && historyRes.data) {
          setTransactions(historyRes.data);
        }
        setLoading(false);
      });
    }
  }, [user, getLoyaltyInfo, getLoyaltyHistory]);

  const copyCardNumber = () => {
    if (loyalty?.cardNumber) {
      navigator.clipboard.writeText(loyalty.cardNumber);
      toast.success('Номер карты скопирован');
    }
  };

  const currentLevel = loyaltyLevels.findIndex(l =>
    (loyalty?.points || 0) >= l.minPoints
  );
  const nextLevel = loyaltyLevels[currentLevel + 1];
  const progressToNext = nextLevel
    ? Math.min(100, ((loyalty?.points || 0) / nextLevel.minPoints) * 100)
    : 100;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-gray-200 rounded-lg" />
          <div className="h-64 bg-gray-200 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Программа лояльности</h1>

      {/* Loyalty Card */}
      <Card className="mb-8 overflow-hidden">
        <div className={`bg-gradient-to-r ${loyaltyLevels[currentLevel]?.color || 'bg-amber-700'} p-8 text-white`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-6 h-6" />
                <span className="text-white/80">Уровень {loyaltyLevels[currentLevel]?.name}</span>
              </div>
              <h2 className="text-3xl font-bold mb-1">
                {loyalty?.points.toLocaleString('ru-RU')} баллов
              </h2>
              <p className="text-white/80">
                = {(loyalty?.points || 0 / 10).toFixed(0)} ₽ для оплаты покупок
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/80 mb-1">Номер карты</p>
              <button
                onClick={copyCardNumber}
                className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
              >
                <span className="font-mono text-lg">{loyalty?.cardNumber}</span>
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {nextLevel && (
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span>{loyalty?.points.toLocaleString('ru-RU')} баллов</span>
                <span>{nextLevel.minPoints.toLocaleString('ru-RU')} баллов</span>
              </div>
              <Progress value={progressToNext} className="h-2 bg-white/30" />
              <p className="text-sm text-white/80 mt-2">
                Наберите еще {(nextLevel.minPoints - (loyalty?.points || 0)).toLocaleString('ru-RU')} баллов
                для уровня {nextLevel.name} ({nextLevel.discount}% скидка)
              </p>
            </div>
          )}
        </div>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Levels */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Уровни лояльности</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loyaltyLevels.map((level, index) => (
                  <div
                    key={level.name}
                    className={`flex items-center gap-4 p-4 rounded-lg ${index === currentLevel ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
                      }`}
                  >
                    <div className={`w-10 h-10 ${level.color} rounded-full flex items-center justify-center text-white font-bold`}>
                      {level.name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{level.name}</span>
                        {index === currentLevel && (
                          <Badge className="bg-red-600">Текущий</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        От {level.minPoints.toLocaleString('ru-RU')} баллов
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-lg">{level.discount}%</span>
                      <p className="text-xs text-gray-500">скидка</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>История начислений</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.slice(0, 10).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.createdAt).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                      <span className={`font-bold ${transaction.type === 'earn' ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {transaction.type === 'earn' ? '+' : '-'}{transaction.points}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Star className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>История начислений пуста</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* How it works */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Как это работает</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="font-medium">Покупайте</p>
                  <p className="text-sm text-gray-500">Получайте 1 балл за каждые 10 ₽ в чеке</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Star className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="font-medium">Накапливайте</p>
                  <p className="text-sm text-gray-500">Повышайте уровень для больших скидок</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Gift className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="font-medium">Тратьте</p>
                  <p className="text-sm text-gray-500">1 балл = 0.1 ₽ для оплаты покупок</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Promo */}
          <Card className="bg-gradient-to-br from-red-600 to-red-700 text-white">
            <CardContent className="p-6">
              <Gift className="w-10 h-10 mb-4" />
              <h3 className="font-bold text-lg mb-2">Приведи друга</h3>
              <p className="text-white/80 text-sm mb-4">
                Получите 500 баллов за каждого друга, который зарегистрируется по вашей ссылке
              </p>
              <Button variant="secondary" className="w-full">
                Поделиться
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
