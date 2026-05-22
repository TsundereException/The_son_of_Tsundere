import { BrowserRouter } from 'react-router-dom';
import ProductCard from './ProductCard';

export default {
  title: 'Components/ProductCard',
  component: ProductCard,
  decorators: [
    (Story) => (
      <BrowserRouter>
        <div className="max-w-xs">
          <Story />
        </div>
      </BrowserRouter>
    ),
  ],
  tags: ['autodocs'],
};

export const Default = {
  args: {
    product: {
      id: 1,
      title: 'iPhone 15 Pro Max',
      price: '52000',
      location: 'Київ',
      date: 'Сьогодні',
      condition: 'New',
      imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=600',
    },
  },
};

export const Used = {
  args: {
    product: {
      id: 2,
      title: 'PlayStation 5',
      price: '18500',
      location: 'Львів',
      date: 'Вчора',
      condition: 'Used',
      imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=600',
    },
  },
};

export const WithoutImage = {
  args: {
    product: {
      id: 3,
      title: 'Офісне крісло',
      price: '2500',
      location: 'Одеса',
      date: '2 дні тому',
      condition: 'Used',
    },
  },
};
