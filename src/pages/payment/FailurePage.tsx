import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';

export const FailurePage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-10 h-10 text-red-500" />
                </div>

                <h1 className="text-2xl font-bold font-heading mb-2">Ошибка оплаты</h1>
                <p className="text-gray-500 mb-8">
                    К сожалению, платеж не прошел. Попробуйте еще раз или выберите другой способ оплаты.
                </p>

                <div className="space-y-3">
                    <Link
                        to="/cart"
                        className="block w-full py-4 bg-brand text-white rounded-xl font-bold hover:bg-brand-dark transition-colors"
                    >
                        Попробовать снова
                    </Link>
                    <Link
                        to="/"
                        className="block w-full py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                    >
                        На главную
                    </Link>
                </div>
            </div>
        </div>
    );
};
