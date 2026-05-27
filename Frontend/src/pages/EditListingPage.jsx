import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../api/client';
import ListingForm from '../components/ListingForm';

export default function EditListingPage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  
  const [initialData, setInitialData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await apiClient.get(`/products/${slug}/`);
        const product = response.data;
        let priceType = 'price';
        if (product.is_free) {
          priceType = 'free';
        } else if (product.is_exchange) {
          priceType = 'exchange';
        }

        setInitialData({
          name: product.name || '',
          category_id: product.category?.id || '',
          description: product.description || '',
          price: product.price || '',
          city: product.city || '',
          stock: product.stock || 1,
          attributes: product.attributes || {},
          is_safe_deal_enabled: product.is_safe_deal_enabled !== undefined ? product.is_safe_deal_enabled : true,
          priceType,
          isNegotiable: product.is_negotiable || false,
          existingImages: product.images || []
        });
      } catch (err) {
        console.error('Failed to load product', err);
        setError('Не вдалося завантажити дані оголошення');
      } finally {
        setIsLoading(false);
      }
    };
    if (slug) fetchProduct();
  }, [slug]);

  const handleSubmit = async ({ formData, priceType, isNegotiable, images, imagesToDelete }) => {
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
      
      // 1. Update Product
      const productResponse = await apiClient.patch(`/products/${slug}/`, {
        name: formData.name,
        category_id: Number.parseInt(formData.category_id, 10),
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

      // 2. Upload Images
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const file = images[i];
          const imageFormData = new FormData();
          imageFormData.append('image', file);
          
          // If we deleted all existing images and this is the first new one, make it main
          if (i === 0 && (!initialData.existingImages || initialData.existingImages.length === imagesToDelete.length)) {
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
          }
        }
      }

      // 3. Success -> Navigate to profile
      navigate('/profile');
      
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.response?.data?.detail || 'Помилка при збереженні оголошення. Спробуйте ще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <ListingForm
      initialData={initialData}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      error={error}
      isEdit={true}
    />
  );
}
