import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import apiClient, { formatApiError } from '../api/client';
import ListingForm from '../components/ListingForm';
import { useAuth } from '../context/AuthContext';

export default function AddListingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname, isLogin: true }} />;
  }

  const handleSubmit = async ({ formData, priceType, isNegotiable, images }) => {
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
      const productResponse = await apiClient.post('/products/create/', {
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

      // 2. Upload Images
      if (images.length > 0) {
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
          }
        }
      }

      // 3. Success -> Navigate to profile
      navigate('/profile');
      
    } catch (err) {
      console.error('Submit error:', err);
      setError(formatApiError(err, 'Помилка при створенні оголошення. Спробуйте ще раз.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ListingForm
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      error={error}
      isEdit={false}
    />
  );
}
