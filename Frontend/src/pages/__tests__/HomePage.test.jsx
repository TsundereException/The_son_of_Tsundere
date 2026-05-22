import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../HomePage';

describe('HomePage component', () => {
  it('renders hero section correctly', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Шукай, купуй, продавай швидко!')).toBeInTheDocument();
    expect(screen.getByText('Розмістити оголошення')).toBeInTheDocument();
  });

  it('renders categories', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Популярні категорії')).toBeInTheDocument();
    expect(screen.getByText('Смартфони')).toBeInTheDocument();
    expect(screen.getByText('Ноутбуки')).toBeInTheDocument();
  });

  it('renders recent listings section', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Нові оголошення')).toBeInTheDocument();
    // Assuming MOCK_PRODUCTS has MacBook
    expect(screen.getByText(/MacBook/i)).toBeInTheDocument();
  });
});
