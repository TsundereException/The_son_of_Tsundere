import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, X, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { CITIES_LIST } from '../utils/distance';
import CategoryPicker from '../components/CategoryPicker';

export default function EditListingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { slug } = useParams();
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    description: '',
    price: '',
    city: user?.city || '',
    stock: 1,
    attributes: {},
    is_safe_deal_enabled: true,
  });

  const [priceType, setPriceType] = useState('price'); // 'price', 'free', 'exchange'
  const [isNegotiable, setIsNegotiable] = useState(false);

  // Images State
  const [images, setImages] = useState([]); // array of File objects
  const [imagePreviews, setImagePreviews] = useState([]); // array of URL strings

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await apiClient.get(`/products/${slug}/`);
        const product = response.data;
        setFormData({
          name: product.name || '',
          category_id: product.category?.id || '',
          description: product.description || '',
          price: product.price || '',
          city: product.city || '',
          stock: product.stock || 1,
          attributes: product.attributes || {},
          is_safe_deal_enabled: product.is_safe_deal_enabled !== undefined ? product.is_safe_deal_enabled : true,
        });
        setPriceType(product.is_free ? 'free' : product.is_exchange ? 'exchange' : 'price');
        setIsNegotiable(product.is_negotiable);
        if (product.images) {
           setExistingImages(product.images);
        }
      } catch (err) {
        console.error('Failed to load product', err);
        setError('Не вдалося завантажити дані оголошення');
      }
    };
    if (slug) fetchProduct();
  }, [slug]);


  // Fetch filter config based on selected category
  const { data: config } = useQuery({
    queryKey: ['filters-config', formData.category_id],
    queryFn: async () => {
      const response = await apiClient.get('/products/filters-config/', {
        params: formData.category_id ? { category: formData.category_id } : {}
      });
      return response.data;
    },
  });

  useEffect(() => {
    // Fetch categories on load
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get('/products/categories/');
        setCategories(response.data.results || response.data);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Filter out non-images just in case
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    setImages(prev => [...prev, ...validFiles]);

    // Create previews
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeExistingImage = (id) => {
    setExistingImages(prev => prev.filter(img => img.id !== id));
    setImagesToDelete(prev => [...prev, id]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index]);
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category_id || !formData.description) {
      setError('Будь ласка, заповніть всі обов\'язкові поля');
      return;
    }
    
    if (priceType === 'price' && (!formData.price || formData.price < 0)) {
       setError('Вкажіть коректну ціну');
       return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      let finalPrice = priceType === 'price' ? parseFloat(formData.price) : 0;
      
      // 1. Create Product
      const productResponse = await apiClient.patch(`/products/${slug}/`, {
        name: formData.name,
        category_id: parseInt(formData.category_id),
        description: formData.description,
        price: finalPrice,
        is_negotiable: isNegotiable,
        is_free: priceType === 'free',
        is_exchange: priceType === 'exchange',
        is_safe_deal_enabled: formData.is_safe_deal_enabled,
        city: formData.city,
        stock: 1, // Defaulting to 1 for private listings
        attributes: formData.attributes,
        is_active: true
      });

      const productId = productResponse.data.id;
      // Remove images marked for deletion
      for (const id of imagesToDelete) {
        try { await apiClient.delete(`/products/images/${id}/`); } catch (e) { console.error(e); }
      }
      const productSlug = productResponse.data.slug;

      // 2. Upload Images
      if (images.length > 0) {
        // Upload images sequentially or parallel. 
        // We will do sequentially to mark the first as main (if backend requires, or just let backend handle it)
        for (let i = 0; i < images.length; i++) {
          const file = images[i];
          const imageFormData = new FormData();
          imageFormData.append('image', file);
          if (i === 0) {
            imageFormData.append('is_main', 'true');
          }

          try {
            await apiClient.post(`/products/${productId}/images/`, imageFormData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
          } catch (imgErr) {
            console.error('Failed to upload image', imgErr);
            // Optionally, handle partial failure here
          }
        }
      }

      // 3. Success -> Navigate to product or profile
      navigate('/profile'); // or navigate(`/product/${productSlug}`)
      
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.response?.data?.detail || 'Помилка при створенні оголошення. Спробуйте ще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 bg-white border border-gray-200 text-gray-600 rounded-full hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Редагувати оголошення</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r">
              <p>{error}</p>
            </div>
          )}

          {/* Photos Section */}
          <div className="mb-8 pb-8 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-indigo-500" />
              Фотографії
            </h2>
            <p className="text-sm text-gray-500 mb-4">Перше фото буде основним (на обкладинці оголошення).</p>
            
            <div className="flex flex-wrap gap-4">
              {existingImages.map((img) => (
                <div key={img.id} className="relative w-32 h-32 rounded-lg border-2 border-gray-200 overflow-hidden group">
                  <img src={img.image} alt="existing" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => removeExistingImage(img.id)}
                    className="absolute top-2 right-2 p-1 bg-white/90 text-red-600 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {img.is_main && (
                     <div className="absolute bottom-0 left-0 right-0 bg-indigo-600/80 text-white text-xs text-center py-1">
                       Головне
                     </div>
                  )}
                </div>
              ))}
              {imagePreviews.map((preview, idx) => (
                <div key={idx} className="relative w-32 h-32 rounded-lg border-2 border-gray-200 overflow-hidden group">
                  <img src={preview} alt={`preview ${idx}`} className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 p-1 bg-white/90 text-red-600 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {idx === 0 && (
                     <div className="absolute bottom-0 left-0 right-0 bg-indigo-600/80 text-white text-xs text-center py-1">
                       Головне
                     </div>
                  )}
                </div>
              ))}

              {/* Upload Button */}
              {imagePreviews.length < 10 && (
                <label className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-indigo-400 hover:text-indigo-500 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 mb-2" />
                  <span className="text-xs font-medium">Додати фото</span>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden" 
                  />
                </label>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Назва товару <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Наприклад, Навушники Apple AirPods Pro"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                required
                maxLength={200}
              />
            </div>

            <div className="relative z-50">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Категорія <span className="text-red-500">*</span>
              </label>
              <CategoryPicker 
                categories={categories}
                value={formData.category_id}
                onChange={(val) => setFormData(prev => ({ ...prev, category_id: val }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ціна <span className="text-red-500">*</span>
              </label>
              
              <div className="flex bg-gray-100 p-1 rounded-lg mb-4 w-full max-w-sm">
                <button
                  type="button"
                  onClick={() => setPriceType('price')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${priceType === 'price' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Ціна
                </button>
                <button
                  type="button"
                  onClick={() => setPriceType('free')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${priceType === 'free' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Безкоштовно
                </button>
                <button
                  type="button"
                  onClick={() => setPriceType('exchange')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${priceType === 'exchange' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Обмін
                </button>
              </div>

              {priceType === 'price' && (
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                      step="1"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all pr-12"
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">грн</span>
                  </div>
                  
                  <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={isNegotiable}
                      onChange={(e) => setIsNegotiable(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Договірна</span>
                  </label>
                </div>
              )}
            </div>

            <div className="md:col-span-2 mt-2 p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Безпечна угода (Доставка)
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Дозвольте покупцям безпечно оплачувати товар на сайті. Гроші переказуються вам після огляду товару на пошті.
                </p>
              </div>
              <div className="relative inline-block w-12 ml-4 align-middle select-none shrink-0">
                <input 
                  type="checkbox" 
                  name="is_safe_deal_enabled" 
                  id="is_safe_deal_enabled"
                  checked={formData.is_safe_deal_enabled}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_safe_deal_enabled: e.target.checked }))}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 checked:right-0 checked:border-indigo-600 focus:outline-none transition-all duration-300"
                  style={{ top: '0', left: formData.is_safe_deal_enabled ? '1.5rem' : '0', right: '0' }}
                />
                <label htmlFor="is_safe_deal_enabled" className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${formData.is_safe_deal_enabled ? 'bg-indigo-600' : 'bg-gray-300'}`}></label>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Опис <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Опишіть товар детальніше: стан, особливості, причину продажу..."
                rows={6}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-y"
                required
              />
            </div>

            {/* Dynamic Attributes */}
            {config?.attributes && config.attributes.map(attr => (
              <div key={attr.id}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {attr.name}
                </label>
                {attr.type === 'range' ? (
                  <input
                    type="number"
                    value={formData.attributes[attr.slug] ? formData.attributes[attr.slug][0] : ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      attributes: { ...formData.attributes, [attr.slug]: [e.target.value] }
                    })}
                    placeholder={`Введіть ${attr.name.toLowerCase()}`}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
                  />
                ) : attr.options && attr.options.length > 0 && attr.options.length <= 5 ? (
                  <div className="flex flex-wrap gap-2">
                    {attr.options.map(opt => {
                      const isSelected = formData.attributes[attr.slug] && formData.attributes[attr.slug][0] === opt.value;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            const newValue = isSelected ? '' : opt.value;
                            setFormData({
                              ...formData,
                              attributes: { ...formData.attributes, [attr.slug]: [newValue] }
                            });
                          }}
                          className={`px-4 py-2 text-sm font-medium rounded-full border transition-colors ${
                            isSelected 
                              ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm' 
                              : 'bg-white border-gray-300 text-gray-700 hover:border-indigo-400 hover:bg-indigo-50/30'
                          }`}
                        >
                          {opt.value}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <select
                    value={formData.attributes[attr.slug] ? formData.attributes[attr.slug][0] : ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      attributes: { ...formData.attributes, [attr.slug]: [e.target.value] }
                    })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
                  >
                    <option value="">Не вказано</option>
                    {attr.options.map(opt => (
                      <option key={opt.id} value={opt.value}>{opt.value}</option>
                    ))}
                  </select>
                )}
              </div>
            ))}

            <div className="md:col-span-2 mt-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Ваші контактні дані</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Місто
                  </label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
                  >
                    <option value="">Не вказано</option>
                    {CITIES_LIST.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Контактна особа
                  </label>
                  <input
                    type="text"
                    value={user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.email?.split('@')[0] || ''}
                    disabled
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 outline-none cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400 mt-1">Береться з вашого профілю</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email-адреса
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 outline-none cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Номер телефону
                  </label>
                  <input
                    type="tel"
                    value={user?.phone || ''}
                    disabled
                    placeholder="+380"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 outline-none cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400 mt-1">Для зміни телефону перейдіть в налаштування профілю</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex gap-4 justify-end border-t pt-6">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="px-6 py-3 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Скасувати
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 rounded-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
            >
              {isSubmitting ? 'Публікація...' : 'Зберегти зміни'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
