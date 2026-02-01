import { z } from 'zod';

/**
 * Authentication Form Validation Schemas
 */

// Login validation
export const LoginSchema = z.object({
  phoneOrEmail: z.string()
    .min(1, 'Введите номер телефона или email')
    .refine(
      (val) => {
        const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return phoneRegex.test(val) || emailRegex.test(val);
      },
      'Введите корректный номер телефона или email'
    )
});

// OTP verification
export const OTPSchema = z.object({
  otp: z.string()
    .length(6, 'Код должен содержать 6 цифр')
    .regex(/^\d{6}$/, 'Код должен содержать только цифры')
});

// Registration validation
export const RegistrationSchema = z.object({
  firstName: z.string()
    .min(2, 'Имя должно быть минимум 2 символа')
    .max(50, 'Имя слишком длинное'),
  lastName: z.string()
    .min(2, 'Фамилия должна быть минимум 2 символа')
    .max(50, 'Фамилия слишком длинная'),
  email: z.string()
    .email('Введите корректный email')
    .max(100, 'Email слишком длинный'),
  phone: z.string()
    .regex(/^\+?[\d\s\-()]{10,}$/, 'Введите корректный номер телефона'),
  password: z.string()
    .min(8, 'Пароль должен быть минимум 8 символов')
    .regex(/[A-Z]/, 'Пароль должен содержать минимум 1 заглавную букву')
    .regex(/[0-9]/, 'Пароль должен содержать минимум 1 цифру'),
  confirmPassword: z.string()
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Пароли не совпадают',
    path: ['confirmPassword']
  }
);

// Password reset
export const PasswordResetSchema = z.object({
  newPassword: z.string()
    .min(8, 'Пароль должен быть минимум 8 символов')
    .regex(/[A-Z]/, 'Пароль должен содержать минимум 1 заглавную букву')
    .regex(/[0-9]/, 'Пароль должен содержать минимум 1 цифру'),
  confirmPassword: z.string()
}).refine(
  (data) => data.newPassword === data.confirmPassword,
  {
    message: 'Пароли не совпадают',
    path: ['confirmPassword']
  }
);

export type LoginData = z.infer<typeof LoginSchema>;
export type OTPData = z.infer<typeof OTPSchema>;
export type RegistrationData = z.infer<typeof RegistrationSchema>;
export type PasswordResetData = z.infer<typeof PasswordResetSchema>;
