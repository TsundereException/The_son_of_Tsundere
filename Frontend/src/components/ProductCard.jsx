import { MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

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
export default function ProductCard({ product }) {
  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
        <div className="aspect-w-4 aspect-h-3 bg-gray-200 relative overflow-hidden">
          <img 
            src={product.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600'} 
            alt={product.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.condition === 'New' && (
            <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md">
              Нове
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {product.title}
          </h3>
          <p className="mt-1 text-xl font-bold text-gray-900">
            {product.price} ₴
          </p>
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span className="truncate max-w-[100px]">{product.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{product.date}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
