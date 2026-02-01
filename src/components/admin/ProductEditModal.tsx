import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive';
  image?: string;
  description?: string;
}

interface ProductEditModalProps {
  isOpen: boolean;
  product: Product | null;
  isNew?: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
}

export function ProductEditModal({
  isOpen,
  product,
  isNew = false,
  onClose,
  onSave,
}: ProductEditModalProps) {
  const [formData, setFormData] = useState<Product>(
    product || {
      id: '',
      name: '',
      sku: '',
      category: '',
      price: 0,
      stock: 0,
      status: 'active',
    }
  );

  const [saving, setSaving] = useState(false);

  const handleChange = (field: keyof Product, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error('Введите название товара');
      return;
    }
    if (!formData.sku.trim()) {
      toast.error('Введите SKU товара');
      return;
    }
    if (formData.price < 0) {
      toast.error('Цена не может быть отрицательной');
      return;
    }

    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    onSave(formData);
    toast.success(isNew ? 'Товар добавлен' : 'Товар обновлён');
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? 'Добавить товар' : 'Редактировать товар'}</DialogTitle>
          <DialogDescription>
            {isNew
              ? 'Заполните информацию о новом товаре'
              : 'Обновите информацию о товаре'}
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Grid layout for form fields */}
          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div className="col-span-2 sm:col-span-1">
              <Label className="text-sm font-medium">Название *</Label>
              <Input
                placeholder="Шоколад молочный"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="mt-1"
              />
            </div>

            {/* SKU */}
            <div className="col-span-2 sm:col-span-1">
              <Label className="text-sm font-medium">SKU *</Label>
              <Input
                placeholder="CH-001"
                value={formData.sku}
                onChange={(e) => handleChange('sku', e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Category */}
            <div className="col-span-2 sm:col-span-1">
              <Label className="text-sm font-medium">Категория</Label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="">Выберите категорию</option>
                <option value="Кондитерия">Кондитерия</option>
                <option value="Напитки">Напитки</option>
                <option value="Закуски">Закуски</option>
                <option value="Хлеб">Хлеб</option>
                <option value="Молочные">Молочные продукты</option>
              </select>
            </div>

            {/* Price */}
            <div className="col-span-2 sm:col-span-1">
              <Label className="text-sm font-medium">Цена (₽) *</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.price}
                onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                className="mt-1"
                min="0"
              />
            </div>

            {/* Stock */}
            <div className="col-span-2 sm:col-span-1">
              <Label className="text-sm font-medium">Остаток (шт) *</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.stock}
                onChange={(e) => handleChange('stock', parseInt(e.target.value) || 0)}
                className="mt-1"
                min="0"
              />
            </div>

            {/* Description */}
            <div className="col-span-2">
              <Label className="text-sm font-medium">Описание</Label>
              <Textarea
                placeholder="Описание товара..."
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                className="mt-1 resize-none"
                rows={3}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-brand hover:bg-brand-dark"
            >
              {saving ? '⏳ Сохранение...' : 'Сохранить'}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
