import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, ArrowLeft, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { AuthService } from '@/api/auth';

export function LoginPage() {
  const navigate = useNavigate();
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
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

    let payload = {};
    if (method === 'phone') {
      const phoneDigits = phone.replace(/\D/g, '');
      if (phoneDigits.length !== 11) {
        toast.error('Введите корректный номер телефона');
        return;
      }
      payload = { phone: phoneDigits };
    } else {
      if (!email || !email.includes('@')) {
        toast.error('Введите корректный Email');
        return;
      }
      payload = { email };
    }

    setLoading(true);

    try {
      const result = await AuthService.sendCode(payload);
      if (result.success) {
        toast.success(result.message || 'Код подтверждения отправлен');
        navigate('/auth/verify', { state: { ...payload, method } });
      } else {
        toast.error('Ошибка: ' + result.message);
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
              {method === 'phone' ? <Phone className="w-8 h-8 text-red-600" /> : <Mail className="w-8 h-8 text-red-600" />}
            </div>
            <CardTitle className="text-2xl">Вход в систему</CardTitle>
            <CardDescription>
              Выберите спосов входа
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
              <button
                type="button"
                onClick={() => setMethod('phone')}
                className={`py-2 text-sm font-medium rounded-md transition-all ${method === 'phone' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Телефон
              </button>
              <button
                type="button"
                onClick={() => setMethod('email')}
                className={`py-2 text-sm font-medium rounded-md transition-all ${method === 'email' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Email
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {method === 'phone' ? (
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
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="email">Электронная почта</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@mail.ru"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-lg"
                  />
                </div>
              )}

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
