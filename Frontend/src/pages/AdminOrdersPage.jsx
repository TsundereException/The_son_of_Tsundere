import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Eye, Edit2 } from 'lucide-react';
import { useModal } from '../context/ModalContext';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showAlert, showPrompt } = useModal();

  const fetchOrders = async () => {
    try {
      const { data } = await apiClient.get('/auth/admin/orders/');
      setOrders(data.results || data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const changeStatus = async (id, currentStatus) => {
    const statuses = ['pending', 'paid', 'payment_held', 'seller_pending', 'shipped', 'delivered', 'returned', 'completed', 'cancelled'];
    const statusMap = {
      pending: 'Очікує оплати',
      paid: 'Оплачено',
      payment_held: 'Кошти зарезервовано',
      seller_pending: 'Очікує відправки',
      shipped: 'Відправлено',
      delivered: 'Доставлено',
      returned: 'Повернено',
      completed: 'Завершено',
      cancelled: 'Скасовано',
    };
    const statusOptions = statuses.map((s, i) => `${i + 1}. ${statusMap[s]}`).join('\n');
    const choice = await showPrompt(`Оберіть новий статус (введіть номер):\n${statusOptions}`);
    
    if (choice && statuses[choice - 1]) {
      const newStatus = statuses[choice - 1];
      try {
        await apiClient.patch(`/auth/admin/orders/${id}/`, { status: newStatus });
        fetchOrders();
      } catch (error) {
        console.error('Failed to update status:', error);
        await showAlert('Помилка при оновленні статусу');
      }
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Завантаження замовлень...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Замовлення</h1>
        <p className="mt-1 text-sm text-gray-500">Перегляд та управління замовленнями на платформі.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Покупець</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Сума</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Дії</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{order.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {order.buyer_name || order.buyer_email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {order.total} ₴
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => changeStatus(order.id, order.status)}
                    className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                    title="Змінити статус"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                  Замовлень поки немає
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
