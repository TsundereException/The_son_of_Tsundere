import { useQuery } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function FavoritesPage() {
  const { user } = useAuth();

  const { data: favorites, isLoading, error } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const response = await apiClient.get('/products/favorites/');
      return response.data.results || response.data;
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Авторизуйтесь</h2>
        <p className="text-gray-600 mb-6">Щоб переглядати збережені оголошення, потрібно увійти в акаунт.</p>
        <Link to="/auth" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
          Увійти
        </Link>
      </div>
    );
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="text-center py-20 bg-red-50 rounded-xl">
          <p className="text-red-600 font-medium">Помилка завантаження. Спробуйте пізніше.</p>
        </div>
      );
    }

    if (!favorites || favorites.length === 0) {
      return (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
          <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Тут поки що порожньо</h2>
          <p className="text-gray-500 mb-6">Додавайте товари у вибране, щоб не загубити їх.</p>
          <Link to="/catalog" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
            Перейти в каталог
          </Link>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {favorites.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-8 h-8 text-red-500 fill-current" />
        <h1 className="text-3xl font-bold text-gray-900">Моє вибране</h1>
      </div>

      {renderContent()}
    </div>
  );
}
