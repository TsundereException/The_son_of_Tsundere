import '@testing-library/jest-dom';
import { vi } from 'vitest';

const mockCategories = [
  { id: 1, name: 'Смартфони', children: [], product_count: 2 },
  { id: 2, name: 'Ноутбуки', children: [], product_count: 1 },
];

const mockProducts = [
  {
    id: 1,
    slug: 'macbook-test',
    name: 'MacBook Pro',
    price: '999',
    city: 'Kyiv',
    created_at: '2026-01-01T00:00:00Z',
    main_image: 'http://example.com/image.jpg',
  },
];

vi.mock('./api/client', () => ({
  default: {
    get: vi.fn((url) => {
      if (url.includes('/products/categories/')) return Promise.resolve({ data: mockCategories });
      if (url.includes('/products/filters-config/')) {
        return Promise.resolve({
          data: {
            categories: mockCategories,
            attributes: [],
            price_range: { min: 0, max: 1000 },
          },
        });
      }
      if (url.includes('/products/cities/')) return Promise.resolve({ data: ['Київ', 'Львів'] });
      if (url.includes('/products/favorites/')) return Promise.resolve({ data: [] });
      if (url.includes('/products/')) return Promise.resolve({ data: { results: mockProducts } });
      return Promise.resolve({ data: {} });
    }),
    post: vi.fn(() => Promise.resolve({ data: {} })),
    patch: vi.fn(() => Promise.resolve({ data: {} })),
    delete: vi.fn(() => Promise.resolve({ data: {} })),
  },
  formatApiError: vi.fn((error, fallback = 'Сталася помилка') => error?.message || fallback),
}));
