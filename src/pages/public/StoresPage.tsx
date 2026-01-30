import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search, Clock, Phone, Navigation, Star, ChevronRight, Locate } from 'lucide-react';
import { toast } from 'sonner';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const brandIcon = new L.Icon({
  iconUrl: 'https://placehold.co/40x50/43b02a/white?text=F',
  iconSize: [30, 40],
  iconAnchor: [15, 40],
  popupAnchor: [0, -40],
});

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

function LocateControl() {
  const map = useMap();

  const handleLocate = () => {
    map.locate({ setView: true, maxZoom: 14 });
    toast.info('Определение местоположения...');
  };

  return (
    <button
      onClick={handleLocate}
      className="absolute bottom-24 right-3 z-[1000] bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
      title="Моё местоположение"
    >
      <Locate className="w-5 h-5 text-brand" />
    </button>
  );
}

function FlyToStore({ store }: { store: Store | null }) {
  const map = useMap();

  if (store) {
    map.flyTo([store.coordinates.lat, store.coordinates.lng], 15, { duration: 1 });
  }

  return null;
}

export function StoresPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [favoriteStoreId, setFavoriteStoreId] = useState<string | null>(null);

  const filteredStores = useMemo(() =>
    mockStores.filter(store =>
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.address.toLowerCase().includes(searchQuery.toLowerCase())
    ), [searchQuery]
  );

  const handleGetDirections = (store: Store) => {
    window.open(`https://maps.google.com/?q=${store.coordinates.lat},${store.coordinates.lng}`, '_blank');
  };

  const handleSetFavorite = (storeId: string) => {
    setFavoriteStoreId(storeId === favoriteStoreId ? null : storeId);
    toast.success(storeId === favoriteStoreId ? 'Магазин удалён из избранного' : 'Магазин добавлен в избранное');
  };

  const center: [number, number] = [55.755, 37.617]; // Moscow center

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-20 px-4 py-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Магазины</h1>
          <div className="flex gap-2">
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
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2 h-[400px] lg:h-[600px] rounded-xl overflow-hidden shadow-lg relative">
            <MapContainer
              center={center}
              zoom={11}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredStores.map(store => (
                <Marker
                  key={store.id}
                  position={[store.coordinates.lat, store.coordinates.lng]}
                  icon={brandIcon}
                  eventHandlers={{
                    click: () => setSelectedStore(store),
                  }}
                >
                  <Popup>
                    <div className="min-w-[200px]">
                      <h3 className="font-bold text-base mb-1">{store.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{store.address}</p>
                      <p className="text-sm text-gray-600 mb-2">🕐 {store.hours}</p>
                      <Button
                        size="sm"
                        className="w-full bg-brand hover:bg-brand-600"
                        onClick={() => handleGetDirections(store)}
                      >
                        <Navigation className="w-3 h-3 mr-1" /> Маршрут
                      </Button>
                    </div>
                  </Popup>
                </Marker>
              ))}
              <LocateControl />
              <FlyToStore store={selectedStore} />
            </MapContainer>
          </div>

          {/* Stores List */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            <p className="text-sm text-gray-500 mb-2">Найдено магазинов: {filteredStores.length}</p>
            <AnimatePresence mode="popLayout">
              {filteredStores.map((store, index) => (
                <motion.div
                  key={store.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={`cursor-pointer transition-all hover:shadow-md ${selectedStore?.id === store.id ? 'ring-2 ring-brand' : ''}`}
                    onClick={() => setSelectedStore(store)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-base">{store.name}</h3>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSetFavorite(store.id); }}
                          className="p-1"
                        >
                          <Star className={`w-5 h-5 ${favoriteStoreId === store.id ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                        </button>
                      </div>
                      {favoriteStoreId === store.id && (
                        <Badge className="bg-brand mb-2">Мой магазин</Badge>
                      )}
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 flex-shrink-0 text-gray-400" />
                          <span className="line-clamp-1">{store.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 flex-shrink-0 text-gray-400" />
                          <span>{store.hours}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 flex-shrink-0 text-gray-400" />
                          <a href={`tel:${store.phone}`} className="hover:text-brand">{store.phone}</a>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3"
                        onClick={(e) => { e.stopPropagation(); handleGetDirections(store); }}
                      >
                        <Navigation className="w-4 h-4 mr-2" />
                        Маршрут
                        <ChevronRight className="w-4 h-4 ml-auto" />
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
