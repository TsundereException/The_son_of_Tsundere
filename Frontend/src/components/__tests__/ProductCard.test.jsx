import { screen } from '../../test-utils';
import { renderWithProviders } from '../../test-utils';
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
    renderWithProviders(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Test Product Title')).toBeInTheDocument();
    expect(screen.getByText('999 ₴')).toBeInTheDocument();
    expect(screen.getByText('Kyiv')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('renders New badge if condition is New', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Нове')).toBeInTheDocument();
  });

  it('does not render New badge if condition is Used', () => {
    renderWithProviders(<ProductCard product={{ ...mockProduct, condition: 'Used' }} />);
    
    expect(screen.queryByText('Нове')).not.toBeInTheDocument();
  });
});
