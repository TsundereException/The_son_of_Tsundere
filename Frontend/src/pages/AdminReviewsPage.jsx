import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Trash2, Star } from 'lucide-react';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const { data } = await apiClient.get('/auth/admin/reviews/');
      setReviews(data.results || data);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const deleteReview = async (id) => {
    if (window.confirm('Ви впевнені, що хочете видалити цей відгук? Дія незворотня.')) {
      try {
        await apiClient.delete(`/auth/admin/reviews/${id}/`);
        fetchReviews();
      } catch (error) {
        console.error('Failed to delete review:', error);
        window.alert('Помилка при видаленні відгуку');
      }
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Завантаження відгуків...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Модерація відгуків</h1>
        <p className="mt-1 text-sm text-gray-500">Видалення спаму або коментарів, що порушують правила.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Товар</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Покупець</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Оцінка</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Коментар</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Дії</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reviews.map((review) => (
              <tr key={review.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600 truncate max-w-[150px]">
                  {review.product_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {review.buyer_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center text-yellow-400">
                    <Star className="w-4 h-4 fill-current mr-1" />
                    <span className="text-gray-700 font-medium">{review.rating}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-sm truncate">
                  {review.comment || <span className="italic text-gray-400">Без тексту</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(review.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => deleteReview(review.id)}
                    className="text-red-600 hover:text-red-900 p-1"
                    title="Видалити відгук"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                  Жодного відгуку не знайдено
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
