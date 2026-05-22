import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const { data } = await apiClient.get('/auth/admin/reports/');
      setReports(data.results || data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const changeStatus = async (id, newStatus) => {
    if (window.confirm('Ви впевнені, що хочете змінити статус скарги?')) {
      try {
        await apiClient.patch(`/auth/admin/reports/${id}/`, { status: newStatus });
        fetchReports();
      } catch (error) {
        console.error('Failed to update report status:', error);
        alert('Помилка при оновленні статусу');
      }
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Завантаження скарг...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Скарги (Reports)</h1>
        <p className="mt-1 text-sm text-gray-500">Модерація скарг на користувачів та оголошення.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Відправник</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Об'єкт скарги</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Причина</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Дії</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {report.sender_name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {report.target_user_name ? (
                    <span className="text-blue-600 font-medium">Користувач: {report.target_user_name}</span>
                  ) : report.target_product_name ? (
                    <span className="text-indigo-600 font-medium">Товар: {report.target_product_name}</span>
                  ) : (
                    <span className="text-gray-500">Невідомо</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {report.reason}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${report.status === 'resolved' ? 'bg-green-100 text-green-800' : 
                      report.status === 'rejected' ? 'bg-gray-100 text-gray-800' : 
                      'bg-red-100 text-red-800'}`}>
                    {report.status === 'new' ? 'Нова' : report.status === 'resolved' ? 'Вирішена' : 'Відхилена'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {report.status === 'new' && (
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => changeStatus(report.id, 'resolved')}
                        className="text-green-600 hover:bg-green-50 p-1 rounded transition-colors"
                        title="Позначити як вирішену"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => changeStatus(report.id, 'rejected')}
                        className="text-gray-600 hover:bg-gray-100 p-1 rounded transition-colors"
                        title="Відхилити скаргу"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                  Немає жодної скарги
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
