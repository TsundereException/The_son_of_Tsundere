import { Users, ShoppingBag, DollarSign, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const STATS = [
    { label: 'Всього користувачів', value: '1,248', change: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Активні оголошення', value: '3,842', change: '+5%', icon: ShoppingBag, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { label: 'Успішні продажі (Місяць)', value: '854', change: '+18%', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Нові відвідувачі', value: '12.5k', change: '+2.4%', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-100' },
  ];

  const RECENT_LISTINGS = [
    { id: 101, title: 'MacBook Pro M2', user: 'Іван Д.', price: '45000 ₴', status: 'Активне', date: 'Сьогодні' },
    { id: 102, title: 'Sony PlayStation 5', user: 'Марія К.', price: '18500 ₴', status: 'На перевірці', date: 'Вчора' },
    { id: 103, title: 'Офісне крісло', user: 'Петро В.', price: '2500 ₴', status: 'Продано', date: '2 дні тому' },
    { id: 104, title: 'iPhone 15 Pro Max', user: 'Олена С.', price: '52000 ₴', status: 'Активне', date: '3 дні тому' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Огляд платформи</h1>
        <p className="mt-1 text-sm text-gray-500">Остання статистика та активність на сайті.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center">
              <div className={`p-4 rounded-xl ${stat.bg} ${stat.color} mr-4`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <div className="flex items-baseline space-x-2">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <span className="text-sm font-medium text-green-600">{stat.change}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Listings Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Останні оголошення</h3>
          <button className="text-sm font-medium text-indigo-600 hover:text-indigo-900">Всі оголошення</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Назва товару</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Продавець</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ціна</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Дії</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {RECENT_LISTINGS.map((listing) => (
                <tr key={listing.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{listing.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{listing.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{listing.user}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{listing.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${listing.status === 'Активне' ? 'bg-green-100 text-green-800' : 
                        listing.status === 'На перевірці' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'}`}>
                      {listing.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{listing.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">Редаг.</button>
                    <button className="text-red-600 hover:text-red-900">Видалити</button>
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
