import { useEffect, useState } from 'react';
import { MapPin, Search, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore, useUIStore } from '@/store';
import { useMockCatalogApi } from '@/api/mock';
import type { Region } from '@/types';
import { toast } from 'sonner';

export function RegionModal() {
  const { isRegionModalOpen, setRegionModalOpen } = useUIStore();
  const { region, setRegion } = useAppStore();
  const { getRegions } = useMockCatalogApi();
  const [regions, setRegions] = useState<Region[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isRegionModalOpen) loadRegions();
  }, [isRegionModalOpen]);

  const loadRegions = async () => {
    setIsLoading(true);
    const response = await getRegions();
    if (response.success && response.data) setRegions(response.data);
    setIsLoading(false);
  };

  const handleSelectRegion = async (selectedRegion: Region) => {
    setRegion(selectedRegion);
    toast.success(`Регион изменен на ${selectedRegion.name}`);
    setRegionModalOpen(false);
  };

  const filteredRegions = regions.filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <Dialog open={isRegionModalOpen} onOpenChange={setRegionModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-600" />
            Выберите ваш город
          </DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Поиск города..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Загрузка...</div>
            ) : filteredRegions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Города не найдены</div>
            ) : (
              filteredRegions.map((r) => (
                <Button key={r.id} variant="ghost" className={`w-full justify-start gap-2 ${region?.id === r.id ? 'bg-green-50 text-green-700' : ''}`} onClick={() => handleSelectRegion(r)}>
                  {region?.id === r.id && <Check className="w-4 h-4" />}
                  <span>{r.name}</span>
                </Button>
              ))
            )}
          </div>
        </ScrollArea>
        <p className="text-xs text-gray-500 text-center">Цены и наличие товаров зависят от выбранного региона</p>
      </DialogContent>
    </Dialog>
  );
}
