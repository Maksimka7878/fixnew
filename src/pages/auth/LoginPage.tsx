import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { AuthService } from '@/api/auth';

export function LoginPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 0) return '';
    if (numbers.length <= 1) return `+7`;
    if (numbers.length <= 4) return `+7 (${numbers.slice(1)}`;
    if (numbers.length <= 7) return `+7 (${numbers.slice(1, 4)}) ${numbers.slice(4)}`;
    if (numbers.length <= 9) return `+7 (${numbers.slice(1, 4)}) ${numbers.slice(4, 7)}-${numbers.slice(7)}`;
    return `+7 (${numbers.slice(1, 4)}) ${numbers.slice(4, 7)}-${numbers.slice(7, 9)}-${numbers.slice(9, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length !== 11) {
      toast.error('Введите корректный номер телефона');
      return;
    }

    setLoading(true);

    try {
      const result = await AuthService.sendCode(phoneDigits);
      if (result.success) {
        toast.success('Код подтверждения отправлен');
        // For development, show the debug code
        if (result.debugCode) {
          toast.info(`Код для теста: ${result.debugCode}`);
        }
        navigate('/auth/verify', { state: { phone } });
      }
    } catch (error) {
      toast.error('Ошибка отправки кода. Убедитесь, что сервер запущен.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          На главную
        </Link>

        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Вход по номеру телефона</CardTitle>
            <CardDescription>
              Введите номер телефона, мы отправим код подтверждения
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Номер телефона</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+7 (999) 999-99-99"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="text-lg"
                  maxLength={18}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={loading}
              >
                {loading ? 'Отправка...' : 'Получить код'}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Нажимая кнопку, вы соглашаетесь с{' '}
              <Link to="/terms" className="text-red-600 hover:underline">
                условиями использования
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
