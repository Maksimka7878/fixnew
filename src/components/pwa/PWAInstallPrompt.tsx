import { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';


export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);

    useEffect(() => {
        // Check if iOS
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(isIOSDevice);

        // Check if already in standalone mode
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

        if (isStandalone) {
            setIsVisible(false);
            return;
        }

        // Handle Android install prompt
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Only show prompt if not dismissed recently (could use localStorage)
            const dismissed = localStorage.getItem('pwa_prompt_dismissed');
            if (!dismissed) setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // For iOS, show prompt spread out or after some time if not installed
        if (isIOSDevice && !isStandalone) {
            const dismissed = localStorage.getItem('pwa_prompt_dismissed');
            if (!dismissed) {
                // Delay slightly to not annoy immediately on load
                setTimeout(() => setIsVisible(true), 3000);
            }
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt && !isIOS) return;

        if (isIOS) {
            setShowIOSInstructions(true);
            return;
        }

        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setIsVisible(false);
            }
            setDeferredPrompt(null);
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
        setShowIOSInstructions(false);
        // Remember dismissal for a session or longer
        localStorage.setItem('pwa_prompt_dismissed', 'true');
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <>
                    {/* Main Prompt */}
                    {!showIOSInstructions ? (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-xl shadow-2xl p-4 z-50 border border-brand-100 flex items-center gap-4"
                        >
                            <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <span className="text-xl font-bold text-brand-600">FP</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900 leading-tight">Установить приложение</h3>
                                <p className="text-xs text-gray-500 mt-1">Быстрый доступ, без открытого браузера</p>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600" onClick={handleDismiss}>
                                    <X className="w-4 h-4" />
                                </Button>
                                <Button size="sm" className="bg-brand hover:bg-brand-600 h-8 text-xs px-3" onClick={handleInstall}>
                                    <Download className="w-3 h-3 mr-1.5" />
                                    {isIOS ? 'Инструкция' : 'Установить'}
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        /* iOS Instructions Modal/Card */
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                            onClick={handleDismiss} // Close on backdrop click
                        >
                            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-bold">Как установить на iPhone</h3>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-2" onClick={handleDismiss}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="space-y-4 text-sm text-gray-700">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-gray-100 rounded-lg text-blue-600">
                                            <Share className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium">1. Нажмите «Поделиться»</p>
                                            <p className="text-gray-500 text-xs">В нижней части экрана браузера</p>
                                        </div>
                                    </div>
                                    <div className="w-px h-4 bg-gray-200 ml-6"></div>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-gray-100 rounded-lg text-gray-900">
                                            <PlusSquare className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium">2. Выберите «На экран «Домой»</p>
                                            <p className="text-gray-500 text-xs">Прокрутите список вниз, если нужно</p>
                                        </div>
                                    </div>
                                    <div className="w-px h-4 bg-gray-200 ml-6"></div>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-gray-100 rounded-lg text-brand">
                                            <span className="font-bold text-sm">Add</span>
                                        </div>
                                        <div>
                                            <p className="font-medium">3. Нажмите «Добавить»</p>
                                            <p className="text-gray-500 text-xs">В правом верхнем углу</p>
                                        </div>
                                    </div>
                                </div>

                                <Button className="w-full mt-6 bg-brand hover:bg-brand-600" onClick={handleDismiss}>
                                    Понятно
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </>
            )}
        </AnimatePresence>
    );
}
