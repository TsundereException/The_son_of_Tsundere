import { Outlet, Link, NavLink, Navigate } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingBag, Settings, LogOut, MessageSquare, AlertTriangle, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-500">Завантаження...</div>;
  }

  // Якщо не залогований або не має прав адміна - редірект на головну
  if (!user || (user.role !== 'admin' && !user.is_staff && !user.is_superuser)) {
    return <Navigate to="/" replace />;
  }

  const navLinkClass = ({ isActive }) => 
    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
      isActive 
        ? 'text-indigo-600 bg-indigo-50' 
        : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
    }`;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            <span className="text-2xl font-bold text-indigo-600">Tsundere</span>
            <span className="ml-2 text-xs font-bold bg-red-100 text-red-600 px-2 py-1 rounded-full uppercase tracking-wider">Admin</span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <NavLink to="/admin" end className={navLinkClass}>
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Дашборд
          </NavLink>
          <NavLink to="/admin/users" className={navLinkClass}>
            <Users className="w-5 h-5 mr-3" />
            Користувачі
          </NavLink>
          <NavLink to="/admin/orders" className={navLinkClass}>
            <ShoppingBag className="w-5 h-5 mr-3" />
            Замовлення
          </NavLink>
          <NavLink to="/admin/listings" className={navLinkClass}>
            <ShoppingBag className="w-5 h-5 mr-3" />
            Оголошення
          </NavLink>
          <NavLink to="/admin/categories" className={navLinkClass}>
            <Layers className="w-5 h-5 mr-3" />
            Категорії
          </NavLink>
          <NavLink to="/admin/reports" className={navLinkClass}>
            <AlertTriangle className="w-5 h-5 mr-3" />
            Скарги
          </NavLink>
          <NavLink to="/admin/reviews" className={navLinkClass}>
            <MessageSquare className="w-5 h-5 mr-3" />
            Відгуки
          </NavLink>
          <NavLink to="/admin/settings" className={navLinkClass}>
            <Settings className="w-5 h-5 mr-3" />
            Налаштування
          </NavLink>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={logout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
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
