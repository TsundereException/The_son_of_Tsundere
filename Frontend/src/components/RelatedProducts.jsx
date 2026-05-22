import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';

export default function RelatedProducts({ products, isLoading }) {
  if (isLoading) {
    return (
      <div className="mt-16">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Супутні товари</h3>
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return null; // Не показуємо блок, якщо немає товарів
  }

  return (
    <div className="mt-16">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900">
          Супутні товари
        </h3>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          З цієї ж категорії
        </span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
