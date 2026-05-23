import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Eye, EyeOff, Trash2 } from 'lucide-react';

export default function AdminListingsPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = async () => {
    try {
      const { data } = await apiClient.get('/auth/admin/products/');
      setListings(data.results || data);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const toggleStatus = async (id, currentStatus) => {
    try {
      await apiClient.patch(`/auth/admin/products/${id}/`, { is_active: !currentStatus });
      fetchListings();
    } catch (error) {
      console.error('Failed to toggle status:', error);
      window.alert('Не вдалося змінити статус оголошення');
    }
  };

  const deleteListing = async (id) => {
    if (window.confirm('Ви впевнені, що хочете назавжди видалити це оголошення?')) {
      try {
        await apiClient.delete(`/auth/admin/products/${id}/`);
        fetchListings();
      } catch (error) {
        console.error('Failed to delete listing:', error);
        window.alert('Не вдалося видалити оголошення');
      }
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-500">Завантаження оголошень...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Модерація оголошень</h1>
        <p className="mt-1 text-sm text-gray-500">Перевірка, блокування та видалення товарів.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Назва товару</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Продавець</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ціна</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата створення</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Дії</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {listings.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{l.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{l.name}</div>
                    <div className="text-xs text-gray-500">{l.category_name || 'Без категорії'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{l.seller_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{l.price} ₴</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      l.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {l.is_active ? 'Активне' : 'Приховане'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(l.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => toggleStatus(l.id, l.is_active)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4 inline-flex items-center"
                      title={l.is_active ? 'Приховати' : 'Показати'}
                    >
                      {l.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => deleteListing(l.id)}
                      className="text-red-600 hover:text-red-900 inline-flex items-center"
                      title="Видалити назавжди"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
