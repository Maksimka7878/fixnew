import { Link, useNavigate } from 'react-router-dom';
import { Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCartStore, useUIStore, useAppStore } from '@/store';
import { toast } from 'sonner';

export function CartDrawer() {
  const navigate = useNavigate();
  const { isCartDrawerOpen, setCartDrawerOpen } = useUIStore();
  const { items, totalItems, totalPrice, removeItem, updateQuantity, clearCart } = useCartStore();
  const { region } = useAppStore();

  const handleCheckout = () => {
    if (items.length === 0) { toast.error('Корзина пуста'); return; }
    if (!region) { toast.error('Выберите регион'); return; }
    setCartDrawerOpen(false);
    navigate('/checkout');
  };

  return (
    <Sheet open={isCartDrawerOpen} onOpenChange={setCartDrawerOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Корзина
            <AnimatePresence mode="wait">
              {totalItems > 0 && (
                <motion.span
                  key={totalItems}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  className="text-sm font-normal text-gray-500"
                >
                  ({totalItems})
                </motion.span>
              )}
            </AnimatePresence>
          </SheetTitle>
        </SheetHeader>

        <AnimatePresence mode="wait">
          {items.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col items-center justify-center text-center p-4"
            >
              <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Корзина пуста</h3>
              <p className="text-gray-500 mb-4">Добавьте товары в корзину</p>
              <Button onClick={() => { setCartDrawerOpen(false); navigate('/catalog'); }} className="bg-green-600 hover:bg-green-700">Перейти в каталог</Button>
            </motion.div>
          ) : (
            <motion.div
              key="filled"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col min-h-0"
            >
              <ScrollArea className="flex-1 -mx-6 px-6">
                <div className="space-y-4">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.div
                        key={item.product.id}
                        layout
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                        className="flex gap-4 py-2"
                      >
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {item.product.images && item.product.images[0] ? <img src={item.product.images[0].thumbnailUrl} alt={item.product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><ShoppingBag className="w-8 h-8" /></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link to={`/product/${item.product.id}`} className="text-sm font-medium text-gray-900 hover:text-green-600 line-clamp-2 transition-colors" onClick={() => setCartDrawerOpen(false)}>{item.product.name}</Link>
                          <p className="text-xs text-gray-500 mt-1">{item.product.sku}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-bold text-green-600">{(item.product.basePrice || 0).toLocaleString('ru-RU')} ₽</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-red-600 transition-colors" onClick={() => removeItem(item.product.id)}><Trash2 className="w-4 h-4" /></Button>
                          <div className="flex items-center border rounded-lg">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}><Minus className="w-4 h-4" /></Button>
                            <motion.span
                              key={item.quantity}
                              initial={{ scale: 1.3 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                              className="w-8 text-center text-sm font-medium"
                            >
                              {item.quantity}
                            </motion.span>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}><Plus className="w-4 h-4" /></Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>

              <motion.div
                layout
                className="border-t pt-4 space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Товары ({totalItems})</span>
                    <span>{totalPrice.toLocaleString('ru-RU')} ₽</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Доставка</span>
                    <span className="text-green-600 font-medium">Бесплатно</span>
                  </div>
                </div>
                <div className="border-t pt-2 flex justify-between items-center">
                  <span className="text-lg font-bold">Итого</span>
                  <motion.span
                    key={totalPrice}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className="text-xl font-bold text-green-600"
                  >
                    {totalPrice.toLocaleString('ru-RU')} ₽
                  </motion.span>
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700 h-12 transition-all active:scale-[0.98]" onClick={handleCheckout}>Оформить заказ</Button>
                <Button variant="ghost" className="w-full text-gray-500" onClick={clearCart}><Trash2 className="w-4 h-4 mr-2" />Очистить корзину</Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
}
