import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, User, PlusCircle, Shield, MapPin, Heart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import apiClient from '../api/client';

const citySynonyms = {
  'ровне': 'Рівне',
  'ровно': 'Рівне',
  'киев': 'Київ',
  'одесса': 'Одеса',
  'харьков': 'Харків',
  'днепр': 'Дніпро',
  'львов': 'Львів',
  'запорожье': 'Запоріжжя',
  'николаев': 'Миколаїв',
  'винница': 'Вінниця',
  'чернигов': 'Чернігів',
  'сумы': 'Суми',
  'хмельницкий': 'Хмельницький',
  'черновцы': 'Чернівці',
  'ужгород': 'Ужгород',
  'луцк': 'Луцьк',
  'тернополь': 'Тернопіль',
  'франковск': 'Івано-Франківськ',
  'бровары': 'Бровари',
};

export default function Header() {
  const { user } = useAuth();
  const { favoritesCount } = useFavorites();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentSearch = searchParams.get('search') || '';
  const currentCity = searchParams.get('city') || '';

  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [cityInput, setCityInput] = useState(currentCity);
  const dropdownRef = useRef(null);

  const { data: cities = [] } = useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const response = await apiClient.get('/products/cities/');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const inputLower = cityInput.toLowerCase();
  
  const filteredCities = cities.filter(c => {
    // 1. Прямий збіг
    if (c.toLowerCase().includes(inputLower)) return true;
    
    // 2. Збіг по суржику (якщо користувач вводить "ро", а в словнику є "ровно" -> "Рівне")
    for (const [surzhyk, correct] of Object.entries(citySynonyms)) {
      if (correct === c && surzhyk.includes(inputLower)) {
        return true;
      }
    }
    return false;
  });

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCityDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const q = formData.get('q');
    const city = formData.get('city');
    
    let url = '/catalog?';
    if (q && q.trim() !== '') url += `search=${encodeURIComponent(q.trim())}&`;
    if (city && city.trim() !== '') url += `city=${encodeURIComponent(city.trim())}&`;
    
    // Прибираємо зайвий & або ? в кінці
    if (url.endsWith('&') || url.endsWith('?')) url = url.slice(0, -1);
    
    navigate(url);
    setIsCityDropdownOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-20 gap-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center">
            <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">Tsundere</span>
          </Link>

          {/* Search Bar (OLX style) */}
          <div className="flex-1 min-w-0 hidden lg:block">
            <form onSubmit={handleSearchSubmit} className="flex items-center w-full shadow-sm">
              
              {/* Search Query Input */}
              <div className="relative flex-1 min-w-0">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="text"
                  name="q"
                  defaultValue={currentSearch}
                  key={`search-${currentSearch}`}
                  className="block w-full pl-11 pr-4 py-3.5 border-2 border-r-0 border-gray-300 rounded-l-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-indigo-600 focus:z-10 text-gray-900 font-medium transition-colors"
                  placeholder="Що шукаєте?"
                  autoComplete="off"
                />
              </div>

              {/* Location Input with Dropdown */}
              <div className="relative w-40 xl:w-52 flex-shrink-0" ref={dropdownRef}>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <MapPin className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="text"
                  name="city"
                  value={cityInput}
                  onChange={(e) => {
                    setCityInput(e.target.value);
                    setIsCityDropdownOpen(true);
                  }}
                  onFocus={() => setIsCityDropdownOpen(true)}
                  className="block w-full pl-9 pr-3 py-3.5 border-2 border-gray-300 leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-indigo-600 focus:z-10 text-gray-900 font-medium transition-colors text-sm"
                  placeholder="Вся Україна"
                  autoComplete="off"
                />
                
                {/* Cities Dropdown */}
                {isCityDropdownOpen && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredCities.length > 0 ? (
                      filteredCities.map((city) => (
                        <button
                          type="button"
                          key={city}
                          className="w-full text-left px-4 py-2 hover:bg-indigo-50 cursor-pointer text-gray-700 font-medium flex items-center gap-2"
                          onClick={() => {
                            setCityInput(city);
                            setIsCityDropdownOpen(false);
                          }}
                        >
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {city}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-gray-500 text-sm">Місто не знайдено</div>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="bg-indigo-600 text-white px-6 py-3.5 border-2 border-indigo-600 rounded-r-lg font-bold hover:bg-indigo-700 hover:border-indigo-700 transition-colors flex-shrink-0"
              >
                Знайти
              </button>
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              to="/catalog"
              className="text-gray-500 hover:text-gray-900 px-2 py-2 text-sm font-medium hidden xl:block"
            >
              Всі оголошення
            </Link>
            
            {user ? (
              <div className="flex items-center gap-1">
                <Link
                  to="/favorites"
                  className="relative text-gray-500 hover:text-indigo-600 flex items-center justify-center p-2"
                >
                  <Heart className="h-6 w-6" />
                  {favoritesCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                      {favoritesCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/profile"
                  className="text-gray-500 hover:text-indigo-600 flex items-center gap-1.5 px-2 py-2 text-sm font-medium"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden xl:block">{user.first_name || 'Профіль'}</span>
                </Link>
              </div>
            ) : (
              <Link
                to="/auth"
                className="text-gray-500 hover:text-indigo-600 px-3 py-2 text-sm font-medium"
              >
                Увійти
              </Link>
            )}

            {user && (user.role === 'admin' || user.is_staff || user.is_superuser) && (
              <Link
                to="/admin"
                className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors hidden xl:flex"
              >
                <Shield className="h-4 w-4" />
                <span>Адмін</span>
              </Link>
            )}

            <Link 
              to={user ? "/add-listing" : "/auth"}
              className="bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors"
            >
              <PlusCircle className="h-5 w-5" />
              <span className="hidden sm:block">Додати</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
