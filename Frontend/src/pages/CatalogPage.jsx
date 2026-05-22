import { useState } from 'react';
import CatalogFilters from '../components/CatalogFilters';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';

const MOCK_PRODUCTS = [
  { id: 1, title: 'MacBook Pro M2 2023', price: '45000', location: 'Київ', date: 'Сьогодні', condition: 'New', imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600' },
  { id: 2, title: 'PlayStation 5', price: '18500', location: 'Львів', date: 'Вчора', condition: 'Used', imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=600' },
  { id: 3, title: 'Офісне крісло', price: '2500', location: 'Одеса', date: 'Сьогодні', condition: 'Used', imageUrl: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=600' },
  { id: 4, title: 'iPhone 15 Pro Max', price: '52000', location: 'Дніпро', date: '2 дні тому', condition: 'New', imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=600' },
  { id: 5, title: 'Samsung Galaxy S24 Ultra', price: '48000', location: 'Харків', date: 'Сьогодні', condition: 'New', imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&q=80&w=600' },
  { id: 6, title: 'Sony WH-1000XM5', price: '12000', location: 'Київ', date: '3 дні тому', condition: 'New', imageUrl: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=600' },
];

export default function CatalogPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 5;

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
            <select className="border border-gray-200 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>Новизною</option>
              <option>Від дешевих до дорогих</option>
              <option>Від дорогих до дешевих</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {MOCK_PRODUCTS.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="flex justify-center">
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
          />
        </div>
      </div>
    </div>
  );
}
