import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Home, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';

export const SuccessPage: React.FC = () => {
    const { clearCart } = useCartStore();

    useEffect(() => {
        // Clear cart on successful payment
        clearCart();
    }, [clearCart]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-brand" />
                </div>

                <h1 className="text-2xl font-bold font-heading mb-2">Оплата прошла успешно!</h1>
                <p className="text-gray-500 mb-8">
                    Спасибо за ваш заказ. Мы начали его собирать. Вы получите уведомление о готовности.
                </p>

                <div className="space-y-3">
                    <Link
                        to="/"
                        className="block w-full py-4 bg-brand text-white rounded-xl font-bold hover:bg-brand-dark transition-colors"
                    >
                        На главную
                    </Link>
                    <Link
                        to="/catalog"
                        className="block w-full py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                    >
                        Продолжить покупки
                    </Link>
                </div>
            </div>
        </div>
    );
};
