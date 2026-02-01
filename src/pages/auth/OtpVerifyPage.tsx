import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store';
import { AuthService } from '@/api/auth';

export function OtpVerifyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  // Get phone or email from state
  const phone = location.state?.phone || '';
  const email = location.state?.email || '';
  const method = location.state?.method || (phone ? 'phone' : 'email');

  const destination = method === 'phone' ? phone : email;

  const [code, setCode] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!destination) {
      navigate('/auth/login');
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [destination, navigate]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every(digit => digit)) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (codeStr?: string) => {
    const fullCode = codeStr || code.join('');
    if (fullCode.length !== 4) return;

    setLoading(true);

    try {
      // Prepare payload based on method
      const payload: any = { code: fullCode };
      if (method === 'phone') {
        payload.phone = phone.replace(/\D/g, '');
      } else {
        payload.email = email;
      }

      const result = await AuthService.verifyCode(payload);

      if (result.success && result.user && result.token) {
        // Create user object for store
        const user = {
          id: result.user.id,
          phone: result.user.phone,
          email: result.user.email,
          firstName: result.user.firstName || 'Пользователь',
          lastName: result.user.lastName || '',
          regionId: '1',
          region: {
            id: '1',
            code: 'MOW',
            name: 'Москва',
            timezone: 'Europe/Moscow',
            currency: 'RUB',
            isActive: true,
          },
          role: result.user.role as 'user' | 'admin',
          isVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const tokens = {
          accessToken: result.token,
          refreshToken: result.token,
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
        };

        login(user, tokens);
        toast.success('Вы успешно вошли');
        navigate('/');
      } else {
        toast.error(result.error || 'Неверный код');
        setCode(['', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      toast.error('Ошибка проверки кода. Проверьте сервер.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setCountdown(60);
    toast.success('Код отправлен повторно');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          to="/auth/login"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Link>

        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Подтверждение</CardTitle>
            <CardDescription>
              Введите код, отправленный на {destination}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center gap-3 mb-6">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-14 h-16 text-center text-2xl font-bold border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                  disabled={loading}
                />
              ))}
            </div>

            <Button
              onClick={() => handleVerify()}
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={loading || code.some(d => !d)}
            >
              {loading ? 'Проверка...' : 'Подтвердить'}
            </Button>

            <div className="text-center mt-6">
              {countdown > 0 ? (
                <p className="text-gray-500">
                  Отправить код повторно через {countdown} сек
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  className="text-red-600 hover:underline"
                >
                  Отправить код повторно
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
