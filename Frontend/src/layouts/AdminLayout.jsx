import { Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingBag, Settings, LogOut } from 'lucide-react';

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-indigo-600">Tsundere</span>
            <span className="ml-2 text-xs font-bold bg-red-100 text-red-600 px-2 py-1 rounded-full uppercase tracking-wider">Admin</span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <Link to="/admin" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-indigo-600 bg-indigo-50">
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Дашборд
          </Link>
          <Link to="/admin/users" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-gray-50 transition-colors">
            <Users className="w-5 h-5 mr-3" />
            Користувачі
          </Link>
          <Link to="/admin/listings" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-gray-50 transition-colors">
            <ShoppingBag className="w-5 h-5 mr-3" />
            Оголошення
          </Link>
          <Link to="/admin/settings" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-gray-50 transition-colors">
            <Settings className="w-5 h-5 mr-3" />
            Налаштування
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 transition-colors">
            <LogOut className="w-5 h-5 mr-3" />
            Вийти
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
