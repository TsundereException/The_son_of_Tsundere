import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Shield, ShieldOff, CheckCircle, XCircle } from 'lucide-react';
import { useModal } from '../context/ModalContext';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useModal();

  const fetchUsers = async () => {
    try {
      const { data } = await apiClient.get('/auth/admin/users/');
      setUsers(data.results || data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleStatus = async (userId, currentStatus) => {
    try {
      // In a real app we might patch { is_active: !currentStatus }
      // This requires the backend serializer to accept is_active update
      await apiClient.patch(`/auth/admin/users/${userId}/`, { is_active: !currentStatus });
      fetchUsers(); // reload
    } catch (error) {
      console.error('Failed to toggle status:', error);
      await showAlert('Не вдалося змінити статус користувача');
    }
  };

  const toggleAdmin = async (userId, isStaff) => {
    try {
      await apiClient.patch(`/auth/admin/users/${userId}/`, { 
        is_staff: !isStaff, 
        role: !isStaff ? 'admin' : 'buyer' 
      });
      fetchUsers();
    } catch (error) {
      console.error('Failed to change role:', error);
      await showAlert('Не вдалося змінити роль користувача');
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-500">Завантаження користувачів...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Управління користувачами</h1>
        <p className="mt-1 text-sm text-gray-500">Перегляд та редагування всіх користувачів платформи.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Користувач</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Роль</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Реєстрація</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Дії</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{u.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                        {u.first_name ? u.first_name[0] : u.email[0].toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{u.first_name || u.username} {u.last_name}</div>
                        <div className="text-sm text-gray-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      u.is_staff || u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                      u.role === 'seller' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {u.is_staff || u.role === 'admin' ? 'Адмін' : u.role === 'seller' ? 'Продавець' : 'Покупець'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {u.is_active ? (
                      <span className="flex items-center text-sm text-green-600"><CheckCircle className="w-4 h-4 mr-1" /> Активний</span>
                    ) : (
                      <span className="flex items-center text-sm text-red-600"><XCircle className="w-4 h-4 mr-1" /> Заблокований</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(u.date_joined).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => toggleAdmin(u.id, u.is_staff)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3 flex items-center inline-flex"
                      title={u.is_staff ? "Забрати права адміна" : "Зробити адміном"}
                    >
                      {u.is_staff ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => toggleStatus(u.id, u.is_active)}
                      className={`${u.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                    >
                      {u.is_active ? 'Заблокувати' : 'Розблокувати'}
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
