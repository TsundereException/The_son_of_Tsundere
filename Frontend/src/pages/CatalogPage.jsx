import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import CatalogFilters from '../components/CatalogFilters';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';

export default function CatalogPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [ordering, setOrdering] = useState('-created_at'); // За замовчуванням новизна

  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['products', currentPage, ordering],
    queryFn: async () => {
      const response = await apiClient.get('/products/', {
        params: {
          page: currentPage,
          ordering: ordering,
        },
      });
      return response.data;
    },
  });

  const products = productsData?.results || [];
  const totalPages = productsData?.total_pages || 1;

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <CatalogFilters />

      {/* Main Content */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Каталог товарів</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Сортувати за:</span>
            <select 
              value={ordering}
              onChange={(e) => setOrdering(e.target.value)}
              className="border border-gray-200 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="-created_at">Новизною</option>
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
          <div className="text-gray-500 py-10 text-center bg-gray-50 rounded-xl">
            Товарів не знайдено
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
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
