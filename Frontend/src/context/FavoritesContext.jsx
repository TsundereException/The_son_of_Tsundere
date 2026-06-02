import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from './AuthContext';
import apiClient from '../api/client';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const { user } = useAuth();
  const [favoritesCount, setFavoritesCount] = useState(0);

  const fetchFavoritesCount = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    fetchFavoritesCount();
  }, [fetchFavoritesCount]);

  const updateFavoritesCount = (change) => {
    setFavoritesCount(prev => Math.max(0, prev + change));
  };

  const contextValue = useMemo(() => ({
    favoritesCount,
    updateFavoritesCount,
    fetchFavoritesCount
  }), [favoritesCount, fetchFavoritesCount]);

  return (
    <FavoritesContext.Provider value={contextValue}>
      {children}
    </FavoritesContext.Provider>
  );
};

FavoritesProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useFavorites = () => useContext(FavoritesContext);
