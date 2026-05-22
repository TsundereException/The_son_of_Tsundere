import { useState } from 'react';
import { Settings, Package, Heart, ShoppingBag, LogOut } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const MOCK_MY_LISTINGS = [
  { id: 101, title: 'Моє оголошення 1', price: '500', location: 'Київ', date: 'Сьогодні', condition: 'Used' },
  { id: 102, title: 'Моє оголошення 2', price: '1200', location: 'Київ', date: 'Вчора', condition: 'New' },
];

export default function UserProfilePage() {
  const [activeTab, setActiveTab] = useState('listings');

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Profile Info */}
      <aside className="w-full lg:w-80 flex-shrink-0">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-3xl font-bold mb-4">
              ІК
            </div>
            <h2 className="text-xl font-bold text-gray-900">Іван Користувач</h2>
            <p className="text-gray-500 mb-2">ivan.kor@example.com</p>
            <p className="text-sm text-gray-400 mb-6">На сайті з травня 2026</p>
            
            <button className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-2 rounded-md transition-colors border border-gray-200">
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
                Мої замовлення
              </button>
              <button 
                onClick={() => setActiveTab('favorites')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'favorites' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Heart className="w-5 h-5" />
                Улюблене
              </button>
              
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 transition-colors mt-8">
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
              <button className="bg-indigo-600 text-white font-medium px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                Додати нове
              </button>
            </div>
            {MOCK_MY_LISTINGS.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {MOCK_MY_LISTINGS.map(product => (
                  <div key={product.id} className="relative">
                    <ProductCard product={product} />
                    <div className="absolute top-2 left-2 flex gap-2">
                       <button className="bg-white/90 text-sm font-medium px-3 py-1 rounded-md shadow hover:bg-white text-gray-700">
                         Редагувати
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 py-10 text-center">У вас поки немає активних оголошень.</p>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Мої замовлення</h1>
            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">Ви ще нічого не купували</h3>
              <p className="text-gray-500 mt-1">Знайдіть цікаві товари в каталозі.</p>
              <a href="/catalog" className="inline-block mt-4 bg-indigo-600 text-white font-medium px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                Перейти в каталог
              </a>
            </div>
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
      </div>
    </div>
  );
}
