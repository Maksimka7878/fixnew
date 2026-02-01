import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

interface Props {
    children?: ReactNode;
    fallback?: (error: Error, retry: () => void) => ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorCount: 0,
    };

    public static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("🔴 Error Boundary caught:", error, errorInfo);

        // Increment error count to prevent infinite loops
        this.setState(prev => ({
            errorCount: prev.errorCount + 1
        }));

        // Log to analytics in production
        if (import.meta.env.PROD) {
            window.__ANALYTICS__?.('error', {
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString(),
                url: window.location.href
            });
        }
    }

    private handleReset = () => {
        this.setState({
            hasError: false,
            error: null
        });
    };

    private handleReload = () => {
        window.location.reload();
    };

    private handleGoHome = () => {
        window.location.href = '/';
    };

    public render() {
        if (this.state.hasError && this.state.error) {
            const isDev = import.meta.env.DEV;
            const errorCategory = this.categorizeError(this.state.error);

            // If custom fallback provided, use it
            if (this.props.fallback) {
                return this.props.fallback(this.state.error, this.handleReset);
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white p-4">
                    <div className="max-w-md w-full space-y-6">
                        {/* Icon */}
                        <div className="flex justify-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>
                        </div>

                        {/* Error Message */}
                        <div className="text-center space-y-2">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {this.getErrorTitle(errorCategory)}
                            </h1>
                            <p className="text-sm text-gray-600">
                                {this.getErrorDescription(errorCategory)}
                            </p>
                        </div>

                        {/* Dev-only error details */}
                        {isDev && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-xs font-mono text-red-700 break-all">
                                    {this.state.error.message}
                                </p>
                                {this.state.error.stack && (
                                    <pre className="text-xs text-red-600 mt-2 overflow-auto max-h-32">
                                        {this.state.error.stack}
                                    </pre>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-2">
                            {this.state.errorCount < 3 && (
                                <button
                                    onClick={this.handleReset}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-600 transition-colors font-medium"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Попробовать снова
                                </button>
                            )}
                            <button
                                onClick={this.handleReload}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Перезагрузить страницу
                            </button>
                            <button
                                onClick={this.handleGoHome}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                                <Home className="w-4 h-4" />
                                На главную
                            </button>
                        </div>

                        {/* Support message */}
                        <p className="text-xs text-center text-gray-500">
                            Если ошибка повторяется, пожалуйста{' '}
                            <button
                                onClick={() => {
                                    const subject = encodeURIComponent('Ошибка в приложении');
                                    const body = encodeURIComponent(
                                        `Ошибка: ${this.state.error?.message}\n\nСтраница: ${window.location.href}`
                                    );
                                    window.location.href = `mailto:support@example.com?subject=${subject}&body=${body}`;
                                }}
                                className="text-brand hover:underline"
                            >
                                напишите нам
                            </button>
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }

    private categorizeError(error: Error): string {
        const message = error.message.toLowerCase();
        if (message.includes('network') || message.includes('fetch')) return 'network';
        if (message.includes('chunk') || message.includes('script')) return 'chunk';
        if (message.includes('permission')) return 'permission';
        return 'unknown';
    }

    private getErrorTitle(category: string): string {
        const titles: Record<string, string> = {
            network: 'Ошибка подключения',
            chunk: 'Требуется обновление',
            permission: 'Доступ запрещен',
            unknown: 'Что-то пошло не так'
        };
        return titles[category] || titles.unknown;
    }

    private getErrorDescription(category: string): string {
        const descriptions: Record<string, string> = {
            network: 'Проверьте подключение к интернету и попробуйте снова',
            chunk: 'Пожалуйста, перезагрузите страницу чтобы получить обновление',
            permission: 'У вас нет доступа к этому ресурсу',
            unknown: 'Приложение столкнулось с неожиданной ошибкой'
        };
        return descriptions[category] || descriptions.unknown;
    }
}
