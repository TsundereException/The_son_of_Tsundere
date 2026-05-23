import { MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDistanceText } from '../utils/distance';

/**
 * Компонент картки товару, який відображається в списку товарів або на головній сторінці.
 * Включає зображення, назву, ціну, місцезнаходження та час публікації.
 *
 * @param {Object} props - Властивості компонента.
 * @param {Object} props.product - Об'єкт із даними товару.
 * @param {string|number} props.product.id - Унікальний ідентифікатор товару.
 * @param {string} props.product.title - Назва товару.
 * @param {string|number} props.product.price - Ціна товару в гривнях.
 * @param {string} props.product.location - Місцезнаходження (місто, район).
 * @param {string} props.product.date - Відносний час або дата публікації.
 * @param {string} [props.product.condition] - Стан товару (наприклад, 'New' або 'Used').
 * @param {string} [props.product.imageUrl] - URL зображення товару. Якщо не передано, використовується заглушка.
 * @returns {JSX.Element} React компонент картки товару.
 */
export default function ProductCard({ product, layout = 'grid' }) {
  const { user } = useAuth();
  
  // Мапінг полів з бекенду або використання мок-даних як fallback
  const title = product.name || product.title;
  const price = product.price;
  const imageUrl = product.main_image || product.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600';
  const location = product.city || product.location || 'Онлайн';
  const date = product.created_at ? new Date(product.created_at).toLocaleDateString() : product.date;
  const condition = product.condition || 'New'; // Можна витягнути з category або додати на бекенді пізніше
  const idOrSlug = product.slug || product.id;

  const locationDisplay = getDistanceText(user?.city, location);

  if (layout === 'list') {
    return (
      <Link to={`/product/${idOrSlug}`} className="group block mb-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col sm:flex-row">
          <div className="w-full sm:w-64 h-48 sm:h-auto bg-gray-200 relative overflow-hidden flex-shrink-0">
            <img 
              src={imageUrl} 
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {condition === 'New' && (
              <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                Нове
              </span>
            )}
          </div>
          <div className="p-4 sm:p-6 flex flex-col flex-1 justify-between">
            <div>
              <div className="flex justify-between items-start gap-4">
                <h3 className="text-xl sm:text-2xl font-medium text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                  {title}
                </h3>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 whitespace-nowrap">
                  {price} ₴
                </p>
              </div>
              <p className="text-gray-500 mt-2 line-clamp-1">{condition}</p>
            </div>
            
            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span className="truncate max-w-[250px]" title={locationDisplay}>{locationDisplay}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{date}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // За замовчуванням - сітка (grid)
  return (
    <Link to={`/product/${idOrSlug}`} className="group block">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
        <div className="aspect-w-4 aspect-h-3 bg-gray-200 relative overflow-hidden">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {condition === 'New' && (
            <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md">
              Нове
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {title}
          </h3>
          <p className="mt-1 text-xl font-bold text-gray-900">
            {price} ₴
          </p>
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span className="truncate max-w-[150px]" title={locationDisplay}>{locationDisplay}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{date}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
