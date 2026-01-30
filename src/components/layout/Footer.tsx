import { Link } from 'react-router-dom';
import { Phone, Mail, Instagram, Facebook, Youtube, MessageCircle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="bg-brand py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">Скачайте приложение Fix Price</h3>
              <p className="text-brand-100">Бонусы, акции и удобные покупки</p>
            </div>
            <div className="flex gap-3">
              <a href="#" className="bg-black text-white px-4 py-2 rounded-lg text-xs">App Store</a>
              <a href="#" className="bg-black text-white px-4 py-2 rounded-lg text-xs">Google Play</a>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-lg font-bold mb-4">О компании</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/about" className="hover:text-white">О Fix Price</Link></li>
              <li><Link to="/careers" className="hover:text-white">Карьера</Link></li>
              <li><Link to="/partners" className="hover:text-white">Партнерам</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4">Покупателям</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/account/loyalty" className="hover:text-white">Бонусная программа</Link></li>
              <li><Link to="/delivery" className="hover:text-white">Доставка и оплата</Link></li>
              <li><Link to="/returns" className="hover:text-white">Возврат товара</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4">Контакты</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="flex items-center gap-2"><Phone className="w-4 h-4" /><a href="tel:88001234567" className="hover:text-white">8 (800) 123-45-67</a></li>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4" /><a href="mailto:support@fixprice.ru" className="hover:text-white">support@fixprice.ru</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4">Мы в соцсетях</h4>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-brand"><MessageCircle className="w-5 h-5" /></a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-brand"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-brand"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-brand"><Youtube className="w-5 h-5" /></a>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Fix Price. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}
