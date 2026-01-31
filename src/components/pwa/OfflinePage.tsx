import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function OfflinePage() {
    const handleRetry = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <WifiOff className="w-10 h-10 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold mb-3">Нет соединения</h1>
            <p className="text-gray-500 mb-8 max-w-sm">
                Похоже, у вас проблемы с интернетом. Проверьте подключение и попробуйте снова.
            </p>
            <Button
                onClick={handleRetry}
                size="lg"
                className="bg-brand hover:bg-brand-600 rounded-xl"
            >
                <RefreshCw className="w-5 h-5 mr-2" />
                Обновить
            </Button>
        </div>
    );
}
