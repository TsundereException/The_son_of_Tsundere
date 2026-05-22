import { render, screen } from '@testing-library/react';
import CatalogFilters from '../CatalogFilters';

describe('CatalogFilters component', () => {
  it('renders category options', () => {
    render(<CatalogFilters />);
    expect(screen.getByText('Смартфони')).toBeInTheDocument();
    expect(screen.getByText('Ноутбуки')).toBeInTheDocument();
  });

  it('renders price range inputs', () => {
    render(<CatalogFilters />);
    expect(screen.getByPlaceholderText('Від')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('До')).toBeInTheDocument();
  });

  it('renders apply button', () => {
    render(<CatalogFilters />);
    expect(screen.getByRole('button', { name: 'Застосувати' })).toBeInTheDocument();
  });
});
