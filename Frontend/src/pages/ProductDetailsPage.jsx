import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import ProductTabs from '../components/ProductTabs';
import RelatedProducts from '../components/RelatedProducts';

export default function ProductDetailsPage() {
  const { id } = useParams(); // actually slug based on routing /product/:id

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await apiClient.get(`/products/${id}/`);
      return response.data;
    },
  });

  // Fetch related products (same category, exclude current)
  const categoryId = product?.category?.id;
  const { data: relatedData, isLoading: isLoadingRelated } = useQuery({
    queryKey: ['relatedProducts', categoryId],
    queryFn: async () => {
      const response = await apiClient.get('/products/', {
        params: { category: categoryId }
      });
      return response.data;
    },
    enabled: !!categoryId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-20 bg-red-50 rounded-xl mt-10">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Помилка завантаження</h2>
        <p className="text-gray-600">{error?.message || 'Товар не знайдено'}</p>
      </div>
    );
  }

  // Мапінг полів
  const title = product.name;
  const price = product.price;
  const description = product.description;
  const location = 'Онлайн'; // Можна додати в модель пізніше
  const condition = product.attributes?.condition || 'Нове';
  const date = new Date(product.created_at).toLocaleString();
  const sellerName = product.seller?.first_name || product.seller?.username || 'Користувач';
  const sellerRating = product.avg_rating || 0;
  
  // Зображення
  const images = product.images?.length > 0 
    ? product.images.map(img => img.image) 
    : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1200'];
  
  const mainImage = images[0];

  // Filter out the current product from related products and limit to 4
  const relatedProducts = (relatedData?.results || [])
    .filter(p => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="text-sm text-gray-500 mb-6">
        Головна &raquo; {product.category?.name || 'Каталог'} &raquo; {title}
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 aspect-video">
            <img src={mainImage} alt={title} className="w-full h-full object-cover" />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {images.map((img, i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 aspect-square cursor-pointer hover:border-indigo-500 transition-colors">
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Key Info & Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full mb-4">
              {condition}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
            <div className="text-4xl font-extrabold text-indigo-600 mb-6">
              {price} ₴
            </div>
            <button className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-indigo-700 transition-colors mb-3 text-lg">
              Купити
            </button>
            <button className="w-full bg-indigo-50 text-indigo-600 font-bold py-3 rounded-xl hover:bg-indigo-100 transition-colors flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
              Написати продавцю
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Продавець</h3>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl mr-4 uppercase">
                {sellerName.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-gray-900">{sellerName}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="text-yellow-400 mr-1">★</span>
                  <span className="font-medium mr-2">{sellerRating}</span>
                  <span>На сайті з {new Date(product.seller?.date_joined || Date.now()).getFullYear()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Місцезнаходження</h3>
            <div className="flex items-center text-gray-600">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              {location}
            </div>
            <div className="mt-2 text-sm text-gray-400">
              Опубліковано: {date}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs / Detailed specs */}
      <ProductTabs description={description} attributes={product.attributes} />

      {/* Related Products */}
      <RelatedProducts products={relatedProducts} isLoading={isLoadingRelated} />
    </div>
  );
}
