import { useState } from 'react';
import { Phone, ArrowLeft, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useUIStore, useAuthStore } from '@/store';
import { useMockAuthApi } from '@/api/mock';
import { toast } from 'sonner';

export function AuthModal() {
  const { isAuthModalOpen, setAuthModalOpen } = useUIStore();
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
    if (!phone || phone.length < 10) { toast.error('Введите корректный номер телефона'); return; }
    setIsLoading(true);
    const response = await sendSms(phone);
    if (response.success && response.data) { setStep('otp'); toast.success('Код отправлен'); }
    else { toast.error(response.error?.message || 'Ошибка отправки SMS'); }
    setIsLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 4) { toast.error('Введите 4-значный код'); return; }
    setIsLoading(true);
    const response = await verifyOtp(phone, otp);
    if (response.success && response.data) {
      const { user, tokens } = response.data;
      login(user, tokens);
      setAuthModalOpen(false);
      toast.success('Добро пожаловать!');
    } else {
      toast.error(response.error?.message || 'Неверный код');
      setOtp('');
    }
    setIsLoading(false);
  };

  const handleClose = () => { setAuthModalOpen(false); setStep('phone'); setPhone(''); setOtp(''); };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 'otp' && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setStep('phone')}><ArrowLeft className="w-4 h-4" /></Button>}
            <Phone className="w-5 h-5 text-brand" />
            {step === 'phone' ? 'Вход по номеру телефона' : 'Подтверждение'}
          </DialogTitle>
        </DialogHeader>
        {step === 'phone' ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="phone">Номер телефона</Label>
              <Input id="phone" type="tel" placeholder="+7 (999) 999-99-99" value={formatPhone(phone)} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} maxLength={18} />
              <p className="text-xs text-gray-500 mt-1">Мы отправим код подтверждения</p>
            </div>
            <Button className="w-full bg-brand hover:bg-brand-600" onClick={handleSendSms} disabled={isLoading || phone.length < 10}>
              {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Отправка...</> : 'Получить код'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="otp">Код из SMS</Label>
              <Input id="otp" type="text" placeholder="0000" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))} maxLength={4} className="text-center text-2xl tracking-widest" />
              <p className="text-xs text-gray-500 mt-1">Код отправлен на {formatPhone(phone)}</p>
            </div>
            <Button className="w-full bg-brand hover:bg-brand-600" onClick={handleVerifyOtp} disabled={isLoading || otp.length !== 4}>
              {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Проверка...</> : 'Подтвердить'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
