import { useState } from 'react';
import { API_URL } from '@/config';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore, useAuthStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, MapPin, Truck, CreditCard, Package, Clock, Plus, Gift } from 'lucide-react';
import { toast } from 'sonner';

const FREE_SHIPPING_THRESHOLD = 1000;

// Saved addresses mock
const savedAddresses = [
  { id: 'a1', name: 'Дом', address: 'ул. Тверская, д. 15, кв. 42', isDefault: true },
  { id: 'a2', name: 'Работа', address: 'Пресненская наб., д. 12, офис 1502', isDefault: false },
];

// Time slots
const timeSlots = [
  { id: 't1', label: 'Как можно скорее', time: '30-60 мин' },
  { id: 't2', label: 'Сегодня', time: '18:00 - 21:00' },
  { id: 't3', label: 'Завтра', time: '10:00 - 14:00' },
  { id: 't4', label: 'Завтра', time: '14:00 - 18:00' },
  { id: 't5', label: 'Завтра', time: '18:00 - 21:00' },
];

const deliveryMethods = [
  { id: 'courier', name: 'Курьерская доставка', icon: Truck },
  { id: 'pickup', name: 'Самовывоз из магазина', icon: MapPin },
];

const paymentMethods = [
  { id: 'card', name: 'Банковская карта', icon: CreditCard },
  { id: 'cash', name: 'Наличными при получении', icon: Package },
];

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const [deliveryMethod, setDeliveryMethod] = useState('courier');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [selectedAddress, setSelectedAddress] = useState(savedAddresses.find(a => a.isDefault)?.id || 'new');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('t1');
  const [loading, setLoading] = useState(false);

  // Form states
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [newAddress, setNewAddress] = useState('');
  const [comment, setComment] = useState('');
  const [agreed, setAgreed] = useState(false);

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Корзина пуста</h1>
        <p className="text-gray-600 mb-6">Добавьте товары, чтобы оформить заказ</p>
        <Button onClick={() => navigate('/catalog')} className="bg-brand hover:bg-brand-600">
          Перейти в каталог
        </Button>
      </div>
    );
  }

  const deliveryCost = totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : 199;
  const amountToFreeShipping = FREE_SHIPPING_THRESHOLD - totalPrice;
  const total = totalPrice + (deliveryMethod === 'courier' ? deliveryCost : 0);

  const handleSubmit = async () => {
    if (!agreed) {
      toast.error('Необходимо согласиться с условиями');
      return;
    }
    if (!firstName || !lastName || !phone) {
      toast.error('Заполните обязательные поля');
      return;
    }
    if (deliveryMethod === 'courier' && selectedAddress === 'new' && !newAddress) {
      toast.error('Укажите адрес доставки');
      return;
    }

    setLoading(true);

    try {
      // Build order items
      const orderItems = items.map(({ product, quantity }) => ({
        productId: product.id,
        name: product.name,
        price: product.basePrice,
        quantity,
        imageUrl: product.images[0]?.url,
      }));

      // Determine delivery address
      const address = deliveryMethod === 'pickup'
        ? 'Самовывоз'
        : selectedAddress === 'new'
          ? newAddress
          : savedAddresses.find(a => a.id === selectedAddress)?.address || '';

      if (paymentMethod === 'card') {
        // Create order + payment via server
        const returnUrl = `${window.location.origin}/account/orders`;

        const response = await fetch(`${API_URL}/payment/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: total,
            returnUrl,
            user: user ? { id: user.id, phone: user.phone } : null,
            items: orderItems,
            shipping: {
              address,
              method: deliveryMethod,
              timeSlot: timeSlots.find(s => s.id === selectedTimeSlot)?.time || '',
              contact: { firstName, lastName, phone, email, comment },
            },
          }),
        });

        const data = await response.json();

        if (data.confirmationUrl) {
          // Clear cart and redirect to payment
          clearCart();
          window.location.href = data.confirmationUrl;
        } else {
          throw new Error('No confirmation URL');
        }
      } else {
        // Cash payment - create order directly
        const response = await fetch('http://localhost:3001/api/orders/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user: user ? { id: user.id, phone: user.phone } : null,
            items: orderItems,
            total,
            paymentMethod: 'cash',
            shipping: {
              address,
              method: deliveryMethod,
              timeSlot: timeSlots.find(s => s.id === selectedTimeSlot)?.time || '',
              contact: { firstName, lastName, phone, email, comment },
            },
          }),
        });

        if (response.ok) {
          clearCart();
          toast.success('Заказ успешно оформлен!');
          navigate('/account/orders');
        } else {
          throw new Error('Failed to create order');
        }
      }
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Ошибка при оформлении заказа. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Оформление заказа</h1>
      </div>

      {/* Free Shipping Progress */}
      {deliveryMethod === 'courier' && amountToFreeShipping > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-brand-50 rounded-xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <Gift className="w-5 h-5 text-brand" />
            <span className="text-sm font-medium text-gray-900">
              До бесплатной доставки осталось <span className="text-brand font-bold">{amountToFreeShipping.toFixed(0)} ₽</span>
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-brand rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((totalPrice / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-brand text-white">1</div>
                <h2 className="text-lg font-semibold">Контактные данные</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Имя *</Label>
                  <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Введите имя" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Фамилия *</Label>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Введите фамилию" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон *</Label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 (999) 999-99-99" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Method */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-brand text-white">2</div>
                <h2 className="text-lg font-semibold">Способ доставки</h2>
              </div>
              <RadioGroup value={deliveryMethod} onValueChange={setDeliveryMethod} className="space-y-3">
                {deliveryMethods.map((method) => (
                  <div key={method.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value={method.id} id={method.id} />
                    <Label htmlFor={method.id} className="flex items-center gap-3 flex-1 cursor-pointer">
                      <method.icon className="w-5 h-5 text-gray-500" />
                      <span className="font-medium">{method.name}</span>
                    </Label>
                    <span className={`font-medium ${deliveryCost === 0 || method.id !== 'courier' ? 'text-brand' : 'text-gray-600'}`}>
                      {method.id === 'pickup' ? 'Бесплатно' : deliveryCost === 0 ? 'Бесплатно' : `${deliveryCost} ₽`}
                    </span>
                  </div>
                ))}
              </RadioGroup>

              {/* Address Selection */}
              <AnimatePresence>
                {deliveryMethod === 'courier' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 space-y-3"
                  >
                    <Label>Адрес доставки</Label>
                    <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress} className="space-y-2">
                      {savedAddresses.map((addr) => (
                        <div key={addr.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value={addr.id} id={addr.id} />
                          <Label htmlFor={addr.id} className="flex-1 cursor-pointer">
                            <p className="font-medium">{addr.name}</p>
                            <p className="text-sm text-gray-500">{addr.address}</p>
                          </Label>
                        </div>
                      ))}
                      <div className="flex items-start space-x-3 p-3 border rounded-lg">
                        <RadioGroupItem value="new" id="new-address" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="new-address" className="font-medium cursor-pointer flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Новый адрес
                          </Label>
                          {selectedAddress === 'new' && (
                            <Input
                              className="mt-2"
                              value={newAddress}
                              onChange={(e) => setNewAddress(e.target.value)}
                              placeholder="Улица, дом, квартира"
                            />
                          )}
                        </div>
                      </div>
                    </RadioGroup>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Time Slot Selection */}
              <AnimatePresence>
                {deliveryMethod === 'courier' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 space-y-3"
                  >
                    <Label className="flex items-center gap-2"><Clock className="w-4 h-4" /> Время доставки</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedTimeSlot(slot.id)}
                          className={`p-3 border rounded-lg text-left transition-all ${selectedTimeSlot === slot.id
                            ? 'border-brand bg-brand-50 ring-1 ring-brand'
                            : 'hover:bg-gray-50'
                            }`}
                        >
                          <p className="text-xs text-gray-500">{slot.label}</p>
                          <p className="font-medium text-sm">{slot.time}</p>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-brand text-white">3</div>
                <h2 className="text-lg font-semibold">Способ оплаты</h2>
              </div>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value={method.id} id={`pay-${method.id}`} />
                    <Label htmlFor={`pay-${method.id}`} className="flex items-center gap-3 flex-1 cursor-pointer">
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
                className="w-full p-3 border rounded-lg resize-none h-24 focus:ring-2 focus:ring-brand focus:border-brand"
              />
            </CardContent>
          </Card>

          {/* Agreement */}
          <div className="flex items-start gap-3">
            <Checkbox id="agree" checked={agreed} onCheckedChange={(checked) => setAgreed(checked as boolean)} />
            <Label htmlFor="agree" className="text-sm text-gray-600 cursor-pointer">
              Я согласен с условиями обработки персональных данных и публичной офертой
            </Label>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading || !agreed}
            className="w-full bg-brand hover:bg-brand-600"
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
                  <span className={deliveryCost === 0 ? 'text-brand' : ''}>
                    {deliveryMethod === 'pickup' ? 'Бесплатно' : deliveryCost === 0 ? 'Бесплатно' : `${deliveryCost} ₽`}
                  </span>
                </div>
              </div>
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between text-xl font-bold">
                  <span>Итого</span>
                  <span className="text-brand">{total.toFixed(2)} ₽</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
