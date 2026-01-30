import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search, Clock, Phone, Navigation } from 'lucide-react';
import { toast } from 'sonner';

const mockStores = [
  {
    id: '1',
    name: 'Fix Price на Тверской',
    address: 'ул. Тверская, д. 15, Москва',
    phone: '+7 (495) 123-45-67',
    hours: '08:00 - 22:00',
    coordinates: { lat: 55.758, lng: 37.617 },
  },
  {
    id: '2',
    name: 'Fix Price на Арбате',
    address: 'ул. Арбат, д. 25, Москва',
    phone: '+7 (495) 234-56-78',
    hours: '09:00 - 21:00',
    coordinates: { lat: 55.752, lng: 37.596 },
  },
  {
    id: '3',
    name: 'Fix Price в Мега Химки',
    address: 'Мега Химки, Московская обл.',
    phone: '+7 (495) 345-67-89',
    hours: '10:00 - 22:00',
    coordinates: { lat: 55.889, lng: 37.44 },
  },
  {
    id: '4',
    name: 'Fix Price на Невском',
    address: 'Невский пр., д. 100, Санкт-Петербург',
    phone: '+7 (812) 123-45-67',
    hours: '08:00 - 23:00',
    coordinates: { lat: 59.934, lng: 30.335 },
  },
  {
    id: '5',
    name: 'Fix Price в Галерее',
    address: 'ТРК Галерея, Лиговский пр., д. 30, Санкт-Петербург',
    phone: '+7 (812) 234-56-78',
    hours: '10:00 - 22:00',
    coordinates: { lat: 59.927, lng: 30.358 },
  },
];

export function StoresPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [stores] = useState(mockStores);

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGetDirections = (store: typeof mockStores[0]) => {
    const url = `https://maps.google.com/?q=${store.coordinates.lat},${store.coordinates.lng}`;
    window.open(url, '_blank');
  };

  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          toast.success('Местоположение определено');
          console.log('Location:', position.coords);
        },
        () => {
          toast.error('Не удалось определить местоположение');
        }
      );
    } else {
      toast.error('Геолокация не поддерживается');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Магазины</h1>

      {/* Search */}
      <div className="flex gap-2 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Поиск по названию или адресу..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={handleDetectLocation}
          className="flex items-center gap-2"
        >
          <MapPin className="w-4 h-4" />
          Рядом со мной
        </Button>
      </div>

      {/* Map Placeholder */}
      <div className="bg-gray-100 rounded-lg h-64 md:h-96 mb-8 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-600">Карта магазинов</p>
          <p className="text-sm text-gray-500">Интеграция с картами будет здесь</p>
        </div>
      </div>

      {/* Stores List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStores.map(store => (
          <Card key={store.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-2">{store.name}</h3>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{store.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span>{store.hours}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <a href={`tel:${store.phone}`} className="hover:text-red-600">
                    {store.phone}
                  </a>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleGetDirections(store)}
              >
                <Navigation className="w-4 h-4 mr-2" />
                Проложить маршрут
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStores.length === 0 && (
        <div className="text-center py-16">
          <MapPin className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Магазины не найдены</h2>
          <p className="text-gray-600">Попробуйте изменить поисковый запрос</p>
        </div>
      )}
    </div>
  );
}
