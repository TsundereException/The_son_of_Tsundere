import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import apiClient from '../api/client';
import CatalogFilters from '../components/CatalogFilters';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';

export default function CatalogPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [ordering, setOrdering] = useState('-created_at'); // За замовчуванням новизна
  const [filters, setFilters] = useState({});

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';
  const cityQuery = searchParams.get('city') || '';

  // Скидаємо сторінку при зміні пошукового запиту
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, cityQuery]);

  // Генеруємо параметри для запиту з урахуванням динамічних фільтрів
  const queryParams = {
    page: currentPage,
    ordering: ordering,
  };
  
  if (searchQuery) {
    queryParams.search = searchQuery;
  }
  
  if (cityQuery) {
    queryParams.city = cityQuery;
  }
  
  if (filters.subcategory) {
    queryParams.category = filters.subcategory;
  } else if (filters.category) {
    queryParams.category = filters.category;
  }
  
  if (filters.min_price) queryParams.min_price = filters.min_price;
  if (filters.max_price) queryParams.max_price = filters.max_price;
  if (filters.has_photo) queryParams.has_photo = filters.has_photo;
  
  if (filters.attributes) {
    Object.keys(filters.attributes).forEach(key => {
      const vals = filters.attributes[key];
      if (Array.isArray(vals)) {
        if (vals.length > 0) {
          queryParams[`attr_${key}`] = vals.join(',');
        }
      } else if (typeof vals === 'object' && vals !== null) {
        if (vals.min) queryParams[`attr_${key}_min`] = vals.min;
        if (vals.max) queryParams[`attr_${key}_max`] = vals.max;
      }
    });
  }

  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['products', currentPage, ordering, filters, searchQuery, cityQuery],
    queryFn: async () => {
      const response = await apiClient.get('/products/', { params: queryParams });
      return response.data;
    },
  });

  const products = productsData?.results || [];
  const totalPages = productsData?.total_pages || 1;

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Скидаємо на першу сторінку при зміні фільтрів
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Top Filters (Horizontal) */}
      <CatalogFilters onFilterChange={handleFilterChange} />

      {/* Main Content */}
      <div className="w-full">
        <div className="flex justify-between items-center mb-6 px-2">
          <h1 className="text-2xl font-bold text-gray-900">Каталог товарів</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Сортувати за:</span>
            <select 
              value={ordering}
              onChange={(e) => setOrdering(e.target.value)}
              className="border border-gray-200 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="-created_at">Найновіші</option>
              <option value="price">Від дешевих до дорогих</option>
              <option value="-price">Від дорогих до дешевих</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 py-10 text-center bg-red-50 rounded-xl">
            Помилка завантаження товарів: {error.message}
          </div>
        ) : products.length === 0 ? (
          <div className="text-gray-500 py-20 text-center bg-white border border-gray-200 rounded-xl">
            <h3 className="text-xl font-bold text-gray-700 mb-2">Ми знайшли 0 оголошень</h3>
            <p>Спробуйте змінити фільтри або пошуковий запит.</p>
          </div>
        ) : (
          <div className="flex flex-col mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 px-2">Ми знайшли понад {productsData?.count || products.length} оголошень</h3>
            {products.map(product => (
              <ProductCard key={product.id} product={product} layout="list" />
            ))}
          </div>
        )}

        {!isLoading && totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
            />
          </div>
        )}
      </div>
    </div>
  );
}
