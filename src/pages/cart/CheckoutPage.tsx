import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore, useAuthStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, MapPin, Truck, CreditCard, Package, Check } from 'lucide-react';
import { toast } from 'sonner';

const deliveryMethods = [
  { id: 'courier', name: 'Курьерская доставка', price: 0, icon: Truck },
  { id: 'pickup', name: 'Самовывоз из магазина', price: 0, icon: MapPin },
];

const paymentMethods = [
  { id: 'card', name: 'Банковская карта', icon: CreditCard },
  { id: 'cash', name: 'Наличными при получении', icon: Package },
];

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const [step] = useState(1);
  const [deliveryMethod, setDeliveryMethod] = useState('courier');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);

  // Form states
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState('');
  const [comment, setComment] = useState('');
  const [agreed, setAgreed] = useState(false);

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Корзина пуста</h1>
        <p className="text-gray-600 mb-6">Добавьте товары, чтобы оформить заказ</p>
        <Button onClick={() => navigate('/catalog')} className="bg-red-600 hover:bg-red-700">
          Перейти в каталог
        </Button>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!agreed) {
      toast.error('Необходимо согласиться с условиями');
      return;
    }

    setLoading(true);

    // Simulate order creation
    await new Promise(resolve => setTimeout(resolve, 2000));

    clearCart();
    toast.success('Заказ успешно оформлен!');
    navigate('/account/orders');
  };

  const total = totalPrice + (deliveryMethods.find(d => d.id === deliveryMethod)?.price || 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Оформление заказа</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Contact Info */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>
                  {step > 1 ? <Check className="w-4 h-4" /> : '1'}
                </div>
                <h2 className="text-lg font-semibold">Контактные данные</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Имя *</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Введите имя"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Фамилия *</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Введите фамилию"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+7 (999) 999-99-99"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Delivery */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>
                  {step > 2 ? <Check className="w-4 h-4" /> : '2'}
                </div>
                <h2 className="text-lg font-semibold">Способ доставки</h2>
              </div>

              <RadioGroup value={deliveryMethod} onValueChange={setDeliveryMethod} className="space-y-3">
                {deliveryMethods.map((method) => (
                  <div key={method.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value={method.id} id={method.id} />
                    <Label htmlFor={method.id} className="flex items-center gap-3 flex-1 cursor-pointer">
                      <method.icon className="w-5 h-5 text-gray-500" />
                      <div className="flex-1">
                        <p className="font-medium">{method.name}</p>
                      </div>
                      <span className="text-brand font-medium">
                        {method.price === 0 ? 'Бесплатно' : `${method.price} ₽`}
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {deliveryMethod === 'courier' && (
                <div className="mt-4 space-y-2">
                  <Label htmlFor="address">Адрес доставки *</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Улица, дом, квартира"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 3: Payment */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>
                  3
                </div>
                <h2 className="text-lg font-semibold">Способ оплаты</h2>
              </div>

              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value={method.id} id={method.id} />
                    <Label htmlFor={method.id} className="flex items-center gap-3 flex-1 cursor-pointer">
                      <method.icon className="w-5 h-5 text-gray-500" />
                      <span className="font-medium">{method.name}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Comment */}
          <Card>
            <CardContent className="p-6">
              <Label htmlFor="comment" className="mb-2 block">Комментарий к заказу</Label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Дополнительная информация для курьера"
                className="w-full p-3 border rounded-lg resize-none h-24"
              />
            </CardContent>
          </Card>

          {/* Agreement */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="agree"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
            />
            <Label htmlFor="agree" className="text-sm text-gray-600 cursor-pointer">
              Я согласен с условиями обработки персональных данных и публичной офертой
            </Label>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading || !firstName || !lastName || !phone || (deliveryMethod === 'courier' && !address)}
            className="w-full bg-red-600 hover:bg-red-700"
            size="lg"
          >
            {loading ? 'Оформление...' : `Оформить заказ на ${total.toFixed(2)} ₽`}
          </Button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Ваш заказ</h2>

              <div className="space-y-3 mb-4 max-h-64 overflow-auto">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex justify-between text-sm">
                    <span className="line-clamp-1 flex-1">{product.name} x{quantity}</span>
                    <span className="font-medium ml-2">{(product.basePrice * quantity).toFixed(2)} ₽</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Товары</span>
                  <span>{totalPrice.toFixed(2)} ₽</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Доставка</span>
                  <span className="text-brand">Бесплатно</span>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between text-xl font-bold">
                  <span>Итого</span>
                  <span className="text-red-600">{total.toFixed(2)} ₽</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
