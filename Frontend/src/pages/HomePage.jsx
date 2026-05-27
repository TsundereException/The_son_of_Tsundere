import { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';


// Helper to get icon by name
const getIconComponent = (iconName) => {
  if (!iconName) return LucideIcons.Folder;
  const Icon = LucideIcons[iconName];
  return Icon ? Icon : LucideIcons.Folder;
};

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState(null);

  // Fetch categories from API
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiClient.get('/products/categories/');
      return response.data.results || response.data;
    },
  });

  const handleCategoryClick = (category) => {
    if (activeCategory?.id === category.id) {
      setActiveCategory(null); // toggle off
    } else {
      setActiveCategory(category);
    }
  };

  // Fetch latest products from API
  const { data: latestProductsData, isLoading: isLoadingLatest } = useQuery({
    queryKey: ['latest_products'],
    queryFn: async () => {
      const response = await apiClient.get('/products/', {
        params: { ordering: '-created_at', limit: 4 }
      });
      return response.data.results || response.data;
    },
  });

  const latestProducts = latestProductsData?.slice(0, 4) || [];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-indigo-600 rounded-2xl p-8 sm:p-12 text-center text-white relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Шукай, купуй, продавай швидко!
          </h1>
          <p className="text-lg sm:text-xl text-indigo-100 max-w-2xl mx-auto mb-8">
            The Son of Tsundere - найкраще місце для вигідних покупок та швидких продажів.
          </p>
          <button 
            onClick={() => {
              if (user) {
                navigate('/add-listing');
              } else {
                navigate('/auth', { state: { isLogin: false } });
              }
            }}
            className="bg-white text-indigo-600 font-bold px-8 py-3 rounded-full text-lg shadow-lg hover:bg-gray-50 transition-colors"
          >
            Розмістити оголошення
          </button>
        </div>
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Categories Section (OLX Style) */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Розділи на сервісі</h2>
        
        {/* Horizontal row of categories */}
        <div className="flex flex-wrap justify-center gap-6 sm:gap-8 mb-6">
          {categoriesData?.map((category) => {
            const Icon = getIconComponent(category.icon_name);
            const colorClass = category.color || 'bg-gray-100 text-gray-600';
            const isActive = activeCategory?.id === category.id;
            
            return (
              <div 
                key={category.id} 
                className="flex flex-col items-center cursor-pointer group"
                onClick={() => handleCategoryClick(category)}
              >
                <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center ${colorClass} group-hover:scale-105 transition-transform ${isActive ? 'ring-4 ring-indigo-500 ring-offset-2' : ''}`}>
                  <Icon className="w-10 h-10 sm:w-12 sm:h-12" />
                </div>
                <span className="mt-3 font-medium text-gray-800 text-center text-sm sm:text-base max-w-[100px] leading-tight">
                  {category.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Expanded Subcategories Panel */}
        {activeCategory && (
          <div className="relative mt-4 bg-white border border-gray-200 rounded-xl shadow-lg p-6 sm:p-8 animate-in fade-in slide-in-from-top-4 duration-300">
            {/* Tiny arrow pointing up (CSS triangle trick) - simplified implementation just visually linking to the row */}
            
            <div className="mb-6 border-b border-gray-100 pb-4">
              <Link 
                to={`/catalog?category=${activeCategory.id}`}
                className="text-indigo-600 font-medium hover:text-indigo-800 flex items-center gap-2"
              >
                <span className="text-lg">&gt;</span> Переглянути всі оголошення в {activeCategory.name}
              </Link>
            </div>
            
            {activeCategory.children && activeCategory.children.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6">
                {activeCategory.children.map(child => (
                  <Link 
                    key={child.id}
                    to={`/catalog?category=${child.id}`}
                    className="text-gray-700 hover:text-indigo-600 hover:underline flex items-start gap-2"
                  >
                    <span className="text-gray-400">&gt;</span> {child.name}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 italic">Немає підкатегорій</div>
            )}
          </div>
        )}
      </section>

      {/* Recent Listings Section */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Нові оголошення</h2>
          <Link to="/catalog" className="text-indigo-600 hover:text-indigo-700 font-medium hidden sm:block">
            Дивитись усі &rarr;
          </Link>
        </div>
        
        {isLoadingLatest ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            {latestProducts.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-8">
                Оголошень ще немає. Будьте першим!
              </div>
            )}
          </div>
        )}
        
        <div className="mt-6 text-center sm:hidden">
          <Link to="/catalog" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Дивитись усі &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
