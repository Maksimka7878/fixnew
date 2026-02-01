import { z } from 'zod';

/**
 * Checkout Form Validation Schemas
 *
 * Using Zod for runtime validation with TypeScript inference
 */

// Address validation
export const AddressSchema = z.object({
  fullName: z.string()
    .min(2, 'Имя должно быть минимум 2 символа')
    .max(100, 'Имя слишком длинное'),
  phone: z.string()
    .regex(/^\+?[\d\s\-()]{10,}$/, 'Введите корректный номер телефона'),
  street: z.string()
    .min(3, 'Укажите улицу')
    .max(200, 'Название улицы слишком длинное'),
  house: z.string()
    .min(1, 'Укажите номер дома')
    .max(20, 'Неверный номер дома'),
  apartment: z.string()
    .max(10, 'Неверный номер квартиры')
    .optional(),
  city: z.string()
    .min(2, 'Укажите город')
    .max(100, 'Название города слишком длинное'),
  zipCode: z.string()
    .regex(/^\d{5,6}$/, 'Почтовый индекс должен содержать 5-6 цифр')
    .optional(),
  isDefault: z.boolean().default(false)
});

// Shipping method validation
export const ShippingSchema = z.object({
  method: z.enum(['delivery', 'pickup'])
    .refine(val => !!val, 'Выберите способ доставки'),
  deliveryDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Выберите дату доставки'),
  pickupLocation: z.string()
    .optional()
});

// Payment method validation
export const PaymentSchema = z.object({
  method: z.enum(['card', 'cash', 'bank_transfer'])
    .refine(val => !!val, 'Выберите способ оплаты'),
  cardNumber: z.string()
    .regex(/^\d{16}$/, 'Номер карты должен содержать 16 цифр')
    .optional(),
  cardCvv: z.string()
    .regex(/^\d{3,4}$/, 'CVV должен содержать 3-4 цифры')
    .optional(),
  cardExpiry: z.string()
    .regex(/^\d{2}\/\d{2}$/, 'Формат: MM/YY')
    .optional()
});

// Complete checkout form validation
export const CheckoutFormSchema = z.object({
  address: AddressSchema,
  shipping: ShippingSchema,
  payment: PaymentSchema,
  promoCode: z.string()
    .max(50, 'Промокод слишком длинный')
    .optional(),
  agreedToTerms: z.boolean()
    .refine(val => val === true, {
      message: 'Вы должны согласиться с условиями'
    }),
  newsletter: z.boolean().default(false)
});

export type CheckoutFormData = z.infer<typeof CheckoutFormSchema>;
export type AddressData = z.infer<typeof AddressSchema>;
