import { useState } from 'react';
import { MapPin, Clock, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { getDistanceText } from '../utils/distance';
import apiClient from '../api/client';
import PropTypes from 'prop-types';

const HeartButton = ({ isFavorite, toggleFavorite }) => (
  <button
    onClick={toggleFavorite}
    className={`absolute top-2 right-2 p-2 rounded-full shadow-sm transition-colors z-10 ${
      isFavorite ? 'bg-white text-red-500' : 'bg-white/80 text-gray-500 hover:text-red-500 hover:bg-white'
    }`}
  >
    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
  </button>
);

HeartButton.propTypes = {
  isFavorite: PropTypes.bool.isRequired,
  toggleFavorite: PropTypes.func.isRequired,
};

export default function ProductCard({ product, layout = 'grid' }) {
  const { user } = useAuth();
  const { updateFavoritesCount } = useFavorites();
  const navigate = useNavigate();
  
  const title = product.name || product.title;
  const price = product.price;
  const imageUrl = product.main_image || product.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600';
  const location = product.city || product.location || 'Онлайн';
  const date = product.created_at ? new Date(product.created_at).toLocaleDateString() : product.date;
  const condition = product.condition || 'New';
  const idOrSlug = product.slug || product.id;

  const locationDisplay = getDistanceText(user?.city, location);

  const [isFavorite, setIsFavorite] = useState(product.is_favorite || false);

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      navigate('/auth');
      return;
    }
    
    const newStatus = !isFavorite;
    setIsFavorite(newStatus);
    updateFavoritesCount(newStatus ? 1 : -1);

    try {
      await apiClient.post(`/products/${product.id}/favorite/`);
    } catch (error) {
      setIsFavorite(!newStatus);
      updateFavoritesCount(!newStatus ? 1 : -1);
      console.error('Failed to toggle favorite', error);
    }
  };

  if (layout === 'list') {
    return (
      <Link to={`/product/${idOrSlug}`} className="group block mb-4 relative">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col sm:flex-row relative">
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
            <HeartButton isFavorite={isFavorite} toggleFavorite={toggleFavorite} />
          </div>
          <div className="p-4 sm:p-6 flex flex-col flex-1 justify-between">
            <div>
              <div className="flex justify-between items-start gap-4">
                <h3 className="text-xl sm:text-2xl font-medium text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors pr-10">
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

  return (
    <Link to={`/product/${idOrSlug}`} className="group block relative">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
        <div className="aspect-w-4 aspect-h-3 bg-gray-200 relative overflow-hidden">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {condition === 'New' && (
            <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md">
              Нове
            </span>
          )}
          <HeartButton isFavorite={isFavorite} toggleFavorite={toggleFavorite} />
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

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    slug: PropTypes.string,
    name: PropTypes.string,
    title: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    location: PropTypes.string,
    city: PropTypes.string,
    date: PropTypes.string,
    created_at: PropTypes.string,
    condition: PropTypes.string,
    main_image: PropTypes.string,
    imageUrl: PropTypes.string,
    is_favorite: PropTypes.bool,
  }).isRequired,
  layout: PropTypes.oneOf(['grid', 'list']),
};
