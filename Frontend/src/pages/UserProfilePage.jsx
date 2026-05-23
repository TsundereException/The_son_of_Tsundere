import { useState, useEffect } from 'react';
import { Settings, Package, Heart, ShoppingBag, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import apiClient from '../api/client';

import { CITIES_LIST } from '../utils/distance';

export default function UserProfilePage() {
  const [activeTab, setActiveTab] = useState('listings');
  const [city, setCity] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [myListings, setMyListings] = useState([]);
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [listingsError, setListingsError] = useState(null);

  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  // Update local state when user loads
  useEffect(() => {
    if (user && user.city) {
      setCity(user.city);
    }
  }, [user]);

  const [myOrders, setMyOrders] = useState([]);
  const [mySales, setMySales] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isLoadingSales, setIsLoadingSales] = useState(false);

  // Fetch listings when tab is 'listings'
  useEffect(() => {
    if (activeTab === 'listings') {
      const fetchListings = async () => {
        setIsLoadingListings(true);
        setListingsError(null);
        try {
          const response = await apiClient.get('/products/my/');
          setMyListings(response.data.results || response.data);
        } catch (error) {
          console.error("Error fetching listings", error);
          if (error.response?.status === 403) {
            setListingsError("Щоб розміщувати оголошення, ви маєте бути продавцем.");
          } else {
            setListingsError("Не вдалося завантажити ваші оголошення.");
          }
        } finally {
          setIsLoadingListings(false);
        }
      };
      fetchListings();
    } else if (activeTab === 'orders') {
      const fetchOrders = async () => {
        setIsLoadingOrders(true);
        try {
          const response = await apiClient.get('/orders/?role=buyer');
          setMyOrders(response.data.results || response.data);
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoadingOrders(false);
        }
      };
      fetchOrders();
    } else if (activeTab === 'sales') {
      const fetchSales = async () => {
        setIsLoadingSales(true);
        try {
          const response = await apiClient.get('/orders/?role=seller');
          setMySales(response.data.results || response.data);
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoadingSales(false);
        }
      };
      fetchSales();
    }
  }, [activeTab]);

  if (!user) return <div className="p-8 text-center text-gray-500">Завантаження профілю...</div>;

  const initials = user.first_name ? user.first_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase();
  const fullName = user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user.username;
  
  let formattedDate = 'невідомо';
  if (user.created_at) {
    const d = new Date(user.created_at);
    formattedDate = d.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' });
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleOrderAction = async (orderId, action) => {
    try {
      await apiClient.post(`/orders/${orderId}/${action}/`);
      // re-fetch sales
      setActiveTab('listings');
      setTimeout(() => setActiveTab('sales'), 0);
    } catch (e) {
      window.alert(e.response?.data?.detail || 'Помилка');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Profile Info */}
      <aside className="w-full lg:w-80 flex-shrink-0">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-3xl font-bold mb-4 uppercase">
              {initials}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{fullName}</h2>
            <p className="text-gray-500 mb-2">{user.email}</p>
            {user.city && <p className="text-sm font-medium text-indigo-600 mb-2">Місто: {user.city}</p>}
            <p className="text-sm text-gray-400 mb-6">На сайті з {formattedDate}</p>
            
            <button 
              onClick={() => setActiveTab('settings')}
              className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-2 rounded-md transition-colors border border-gray-200">
              <Settings className="w-4 h-4" />
              Редагувати профіль
            </button>
          </div>
          
          <div className="mt-8 border-t border-gray-100 pt-6">
            <nav className="space-y-2">
              <button 
                onClick={() => setActiveTab('listings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'listings' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Package className="w-5 h-5" />
                Мої оголошення
              </button>
              <button 
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'orders' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <ShoppingBag className="w-5 h-5" />
                Мої закупівлі
              </button>
              <button 
                onClick={() => setActiveTab('sales')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'sales' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <ShoppingBag className="w-5 h-5" />
                Мої продажі
              </button>
              <button 
                onClick={() => setActiveTab('favorites')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'favorites' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Heart className="w-5 h-5" />
                Улюблене
              </button>
              
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 transition-colors mt-8"
              >
                <LogOut className="w-5 h-5" />
                Вийти
              </button>
            </nav>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100">
        {activeTab === 'listings' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Мої оголошення</h1>
              <button 
                onClick={() => navigate('/add-listing')}
                className="bg-indigo-600 text-white font-medium px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                Додати нове
              </button>
            </div>
            {isLoadingListings ? (
              <p className="text-gray-500 py-10 text-center">Завантаження...</p>
            ) : listingsError ? (
              <p className="text-red-500 py-10 text-center">{listingsError}</p>
            ) : myListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {myListings.map(product => (
                  <div key={product.id} className="relative">
                    <ProductCard product={product} />
                    <div className="absolute top-2 left-2 flex gap-2">
                       <button 
                         onClick={() => navigate(`/edit-listing/${product.slug}`)}
                         className="bg-white/90 text-sm font-medium px-3 py-1 rounded-md shadow hover:bg-white text-gray-700"
                       >
                         Редагувати
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900">У вас поки немає оголошень</h3>
                <p className="text-gray-500 mt-1">Додайте свій перший товар на продаж.</p>
                <button 
                  onClick={() => navigate('/add-listing')}
                  className="inline-block mt-4 bg-indigo-600 text-white font-medium px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                  Додати нове
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Мої закупівлі</h1>
            {isLoadingOrders ? (
              <p className="text-gray-500 text-center">Завантаження...</p>
            ) : myOrders.length > 0 ? (
              <div className="space-y-4">
                {myOrders.map(order => (
                  <div key={order.id} className="border rounded-xl p-4 flex justify-between items-center bg-gray-50">
                    <div>
                      <p className="font-bold text-gray-800">Замовлення #{order.id}</p>
                      <p className="text-sm text-gray-500">Сума: {order.total} ₴</p>
                      <p className="text-sm text-gray-500">Статус: <span className="font-medium text-indigo-600">{order.status}</span></p>
                      {order.tracking_number && (
                         <p className="text-sm font-medium text-gray-700 mt-1">ТТН: {order.tracking_number}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900">Ви ще нічого не купували</h3>
                <p className="text-gray-500 mt-1">Знайдіть цікаві товари в каталозі.</p>
                <a href="/catalog" className="inline-block mt-4 bg-indigo-600 text-white font-medium px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                  Перейти в каталог
                </a>
              </div>
            )}
          </div>
        )}

        {activeTab === 'sales' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Мої продажі</h1>
            {isLoadingSales ? (
              <p className="text-gray-500 text-center">Завантаження...</p>
            ) : mySales.length > 0 ? (
              <div className="space-y-4">
                {mySales.map(order => (
                  <div key={order.id} className="border rounded-xl p-4 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-gray-800">Замовлення #{order.id}</p>
                      <p className="text-sm text-gray-500">Покупець: {order.buyer?.email || order.buyer?.username}</p>
                      <p className="text-sm text-gray-500">Сума: {order.total} ₴</p>
                      <p className="text-sm text-gray-500">Статус: <span className="font-medium text-indigo-600">{order.status}</span></p>
                      {order.tracking_number && (
                         <p className="text-sm font-medium text-green-600 mt-1">ТТН: {order.tracking_number}</p>
                      )}
                    </div>
                    {order.status === 'payment_held' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleOrderAction(order.id, 'approve')} className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors">
                          Підтвердити
                        </button>
                        <button onClick={() => handleOrderAction(order.id, 'reject')} className="px-4 py-2 bg-red-100 text-red-600 font-bold rounded-lg hover:bg-red-200 transition-colors">
                          Відхилити
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900">У вас немає нових замовлень</h3>
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Улюблене</h1>
            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
              <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">Список порожній</h3>
              <p className="text-gray-500 mt-1">Додавайте товари в улюблене, щоб не загубити.</p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Налаштування профілю</h1>
            <div className="max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ваше місто (для розрахунку відстані)
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
              >
                <option value="">Не вказано</option>
                {CITIES_LIST.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <button
                onClick={async () => {
                  setIsUpdating(true);
                  try {
                    await updateProfile({ city });
                    window.alert('Профіль оновлено!');
                  } catch (e) {
                    window.alert('Помилка оновлення');
                  } finally {
                    setIsUpdating(false);
                  }
                }}
                disabled={isUpdating}
                className="mt-4 bg-indigo-600 text-white font-medium px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {isUpdating ? 'Збереження...' : 'Зберегти зміни'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
