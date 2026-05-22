import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProductCard from '../ProductCard';

const mockProduct = {
  id: 1,
  title: 'Test Product Title',
  price: '999',
  location: 'Kyiv',
  date: 'Today',
  condition: 'New',
  imageUrl: 'http://example.com/image.jpg'
};

describe('ProductCard component', () => {
  it('renders product details correctly', () => {
    render(
      <BrowserRouter>
        <ProductCard product={mockProduct} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Test Product Title')).toBeInTheDocument();
    expect(screen.getByText('999 ₴')).toBeInTheDocument();
    expect(screen.getByText('Kyiv')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('renders New badge if condition is New', () => {
    render(
      <BrowserRouter>
        <ProductCard product={mockProduct} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Нове')).toBeInTheDocument();
  });

  it('does not render New badge if condition is Used', () => {
    render(
      <BrowserRouter>
        <ProductCard product={{ ...mockProduct, condition: 'Used' }} />
      </BrowserRouter>
    );
    
    expect(screen.queryByText('Нове')).not.toBeInTheDocument();
  });
});
