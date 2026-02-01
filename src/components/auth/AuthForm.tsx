import { useState } from 'react';
import { Phone, ArrowLeft, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store';
import { useMockAuthApi } from '@/api/mock';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AuthFormProps {
    className?: string;
    onSuccess?: () => void;
}

export function AuthForm({ className, onSuccess }: AuthFormProps) {
    const { login } = useAuthStore();
    const { sendSms, verifyOtp } = useMockAuthApi();
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const formatPhone = (value: string) => {
        const digits = value.replace(/\D/g, '');
        if (digits.length === 0) return '';
        if (digits.length <= 1) return '+7';
        if (digits.length <= 4) return `+7 (${digits.slice(1)}`;
        if (digits.length <= 7) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
        if (digits.length <= 9) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
        return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
    };

    const handleSendSms = async () => {
        const digits = phone.replace(/\D/g, '');
        if (!digits || digits.length < 11) { toast.error('Введите корректный номер телефона'); return; }
        setIsLoading(true);
        const response = await sendSms(digits); // Use digits, not formatted phone
        if (response.success && response.data) { setStep('otp'); toast.success('Код отправлен'); }
        else { toast.error(response.error?.message || 'Ошибка отправки SMS'); }
        setIsLoading(false);
    };

    const handleVerifyOtp = async () => {
        if (otp.length !== 4) { toast.error('Введите 4-значный код'); return; }
        setIsLoading(true);
        const digits = phone.replace(/\D/g, '');
        const response = await verifyOtp(digits, otp);
        if (response.success && response.data) {
            const { user, tokens } = response.data;
            login(user, tokens);
            toast.success('Добро пожаловать!');
            if (onSuccess) onSuccess();
        } else {
            toast.error(response.error?.message || 'Неверный код');
            setOtp('');
        }
        setIsLoading(false);
    };

    return (
        <div className={cn("grid gap-4", className)}>
            <div className="flex flex-col space-y-2 text-center items-center mb-4">
                {step === 'otp' && (
                    <Button variant="ghost" size="icon" className="absolute left-4 top-4 h-8 w-8" onClick={() => setStep('phone')}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                )}
                <div className="h-10 w-10 bg-brand/10 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-brand" />
                </div>
                <h2 className="text-lg font-semibold tracking-tight">
                    {step === 'phone' ? 'Вход по номеру телефона' : 'Подтверждение'}
                </h2>
                <p className="text-sm text-muted-foreground">
                    {step === 'phone' ? 'Введите номер телефона для входа' : `Код отправлен на ${formatPhone(phone)}`}
                </p>
            </div>

            {step === 'phone' ? (
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="phone">Номер телефона</Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="+7 (999) 999-99-99"
                            value={formatPhone(phone)}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                            maxLength={18}
                            className="text-lg h-12"
                        />
                    </div>
                    <Button className="w-full h-12 text-base bg-brand hover:bg-brand-600" onClick={handleSendSms} disabled={isLoading || phone.length < 10}>
                        {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Отправка...</> : 'Получить код'}
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="otp">Код из SMS</Label>
                        <Input
                            id="otp"
                            type="text"
                            placeholder="0000"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            maxLength={4}
                            className="text-center text-3xl tracking-widest h-14 font-mono"
                            autoFocus
                        />
                    </div>
                    <Button className="w-full h-12 text-base bg-brand hover:bg-brand-600" onClick={handleVerifyOtp} disabled={isLoading || otp.length !== 4}>
                        {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Проверка...</> : 'Подтвердить'}
                    </Button>
                </div>
            )}

            <p className="px-8 text-center text-xs text-muted-foreground mt-4">
                Нажимая кнопку, вы соглашаетесь с <a href="#" className="underline underline-offset-4 hover:text-primary">условиями использования</a>
            </p>
        </div>
    );
}
