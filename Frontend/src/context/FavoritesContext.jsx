import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import apiClient from '../api/client';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const { user } = useAuth();
  const [favoritesCount, setFavoritesCount] = useState(0);

  const fetchFavoritesCount = async () => {
    if (!user) {
      setFavoritesCount(0);
      return;
    }
    try {
      const response = await apiClient.get('/products/favorites/');
      setFavoritesCount(response.data.count || response.data.length || 0);
    } catch (error) {
      console.error('Failed to fetch favorites count:', error);
    }
  };

  useEffect(() => {
    fetchFavoritesCount();
  }, [user]);

  const updateFavoritesCount = (change) => {
    setFavoritesCount(prev => Math.max(0, prev + change));
  };

  return (
    <FavoritesContext.Provider value={{ favoritesCount, updateFavoritesCount, fetchFavoritesCount }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
