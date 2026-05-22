import { Link } from 'react-router-dom';
import { Search, User, PlusCircle } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center">
            <span className="text-2xl font-bold text-indigo-600">Tsundere</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8 hidden md:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Я шукаю..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Link
              to="/catalog"
              className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium hidden sm:block"
            >
              Всі оголошення
            </Link>
            
            <Link
              to="/auth"
              className="text-gray-500 hover:text-indigo-600 px-3 py-2 text-sm font-medium"
            >
              Увійти
            </Link>
            
            <Link
              to="/profile"
              className="text-gray-500 hover:text-indigo-600 flex items-center gap-2 px-3 py-2 text-sm font-medium"
            >
              <User className="h-5 w-5" />
              <span className="hidden sm:block">Профіль</span>
            </Link>

            <button className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
              <PlusCircle className="h-5 w-5" />
              <span className="hidden sm:block">Додати оголошення</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
