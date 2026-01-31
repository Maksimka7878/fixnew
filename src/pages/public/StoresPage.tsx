import { useState, useMemo, useRef } from 'react';
import { YMaps, Map, Placemark, ZoomControl, GeolocationControl } from '@pbe/react-yandex-maps';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search, Clock, Phone, Navigation, Star } from 'lucide-react';
import { toast } from 'sonner';

interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  coordinates: { lat: number; lng: number };
  isFavorite?: boolean;
}

const mockStores: Store[] = [
  { id: '1', name: 'Fix Price на Тверской', address: 'ул. Тверская, д. 15, Москва', phone: '+7 (495) 123-45-67', hours: '08:00 - 22:00', coordinates: { lat: 55.758, lng: 37.617 } },
  { id: '2', name: 'Fix Price на Арбате', address: 'ул. Арбат, д. 25, Москва', phone: '+7 (495) 234-56-78', hours: '09:00 - 21:00', coordinates: { lat: 55.752, lng: 37.596 } },
  { id: '3', name: 'Fix Price в Мега Химки', address: 'Мега Химки, Московская обл.', phone: '+7 (495) 345-67-89', hours: '10:00 - 22:00', coordinates: { lat: 55.889, lng: 37.44 } },
  { id: '4', name: 'Fix Price на Невском', address: 'Невский пр., д. 100, СПб', phone: '+7 (812) 123-45-67', hours: '08:00 - 23:00', coordinates: { lat: 59.934, lng: 30.335 } },
  { id: '5', name: 'Fix Price в Галерее', address: 'ТРК Галерея, Лиговский пр., СПб', phone: '+7 (812) 234-56-78', hours: '10:00 - 22:00', coordinates: { lat: 59.927, lng: 30.358 } },
  { id: '6', name: 'Fix Price в Атриум', address: 'ТЦ Атриум, ул. Земляной Вал, Москва', phone: '+7 (495) 456-78-90', hours: '10:00 - 22:00', coordinates: { lat: 55.757, lng: 37.66 } },
  { id: '7', name: 'Fix Price в Авиапарке', address: 'ТЦ Авиапарк, Ходынский бул., Москва', phone: '+7 (495) 567-89-01', hours: '10:00 - 22:00', coordinates: { lat: 55.792, lng: 37.537 } },
];

export function StoresPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [favoriteStoreId, setFavoriteStoreId] = useState<string | null>(null);
  const mapRef = useRef<any>(null);
  const ymapsRef = useRef<any>(null);

  const filteredStores = useMemo(() =>
    mockStores.filter(store =>
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.address.toLowerCase().includes(searchQuery.toLowerCase())
    ), [searchQuery]
  );

  const handleGetDirections = (store: Store) => {
    window.open(`https://yandex.ru/maps/?rtext=~${store.coordinates.lat},${store.coordinates.lng}&rtt=mt`, '_blank');
  };

  const handleSetFavorite = (storeId: string) => {
    setFavoriteStoreId(storeId === favoriteStoreId ? null : storeId);
    toast.success(storeId === favoriteStoreId ? 'Магазин удалён из избранного' : 'Магазин добавлен в избранное');
  };

  const center = [55.755, 37.617]; // Moscow center

  const handleStoreClick = (store: Store) => {
    setSelectedStore(store);
    if (mapRef.current) {
      mapRef.current.panTo([store.coordinates.lat, store.coordinates.lng], {
        duration: 1000,
        delay: 0,
        timingFunction: 'ease-in-out'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-20 px-4 py-4 shrink-0">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold font-heading text-gray-900 mb-4">Магазины</h1>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Поиск по названию или адресу..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 text-base"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 flex flex-col lg:flex-row gap-6">

        {/* Map Container */}
        <div className="w-full lg:flex-[2] min-h-[350px] h-[50vh] lg:h-[600px] rounded-2xl overflow-hidden shadow-soft border border-gray-100 relative order-1 lg:order-2">
          <YMaps query={{ apikey: '', lang: 'ru_RU' }}>
            <Map
              defaultState={{ center: center, zoom: 11 }}
              width="100%"
              height="100%"
              instanceRef={ref => { mapRef.current = ref; }}
              onLoad={ymaps => { ymapsRef.current = ymaps; }}
            >
              <ZoomControl options={{ position: { right: 10, top: 100 } }} />
              <GeolocationControl options={{ position: { right: 10, top: 150 } }} />
              {/* <RouteButton options={{ float: "right" }} /> */}

              {filteredStores.map(store => (
                <Placemark
                  key={store.id}
                  geometry={[store.coordinates.lat, store.coordinates.lng]}
                  properties={{
                    balloonContentHeader: store.name,
                    balloonContentBody: `${store.address}<br/>${store.hours}`,
                    hintContent: store.name
                  }}
                  options={{
                    preset: selectedStore?.id === store.id ? 'islands#greenDotIcon' : 'islands#darkGreenDotIcon',
                    iconColor: selectedStore?.id === store.id ? '#43b02a' : '#26571b'
                  }}
                  onClick={() => setSelectedStore(store)}
                />
              ))}
            </Map>
          </YMaps>
        </div>

        {/* Stores List */}
        <div className="lg:flex-1 h-full flex flex-col order-2 lg:order-1 lg:max-h-[70vh]">
          <div className="shrink-0 mb-3 flex items-center justify-between text-sm text-gray-500">
            <p>Найдено магазинов: {filteredStores.length}</p>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-3 pb-safe">
            <AnimatePresence mode="popLayout">
              {filteredStores.map((store, index) => (
                <motion.div
                  key={store.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={`cursor-pointer transition-all hover:shadow-md border-0 shadow-sm ${selectedStore?.id === store.id ? 'ring-2 ring-brand bg-brand-50/30' : 'bg-white'}`}
                    onClick={() => handleStoreClick(store)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-base leading-tight font-heading">{store.name}</h3>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSetFavorite(store.id); }}
                          className="p-1 -mr-2 -mt-2"
                        >
                          <Star className={`w-5 h-5 transition-colors ${favoriteStoreId === store.id ? 'text-orange-400 fill-orange-400' : 'text-gray-300'}`} />
                        </button>
                      </div>

                      {favoriteStoreId === store.id && (
                        <Badge className="bg-brand mb-2.5">Мой магазин</Badge>
                      )}

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-start gap-2.5">
                          <MapPin className="w-4 h-4 flex-shrink-0 text-gray-400 mt-0.5" />
                          <span className="leading-snug">{store.address}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Clock className="w-4 h-4 flex-shrink-0 text-gray-400" />
                          <span>{store.hours}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Phone className="w-4 h-4 flex-shrink-0 text-gray-400" />
                          <a href={`tel:${store.phone}`} className="hover:text-brand transition-colors">{store.phone}</a>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-4 bg-transparent border-brand/20 text-brand hover:bg-brand hover:text-white transition-all active:scale-95"
                        onClick={(e) => { e.stopPropagation(); handleGetDirections(store); }}
                      >
                        <Navigation className="w-4 h-4 mr-2" />
                        Построить маршрут
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredStores.length === 0 && (
              <div className="text-center py-12">
                <MapPin className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">Магазины не найдены</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
