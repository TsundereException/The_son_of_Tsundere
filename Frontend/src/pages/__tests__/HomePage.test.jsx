import { screen } from '../../test-utils';
import { renderWithProviders } from '../../test-utils';
import HomePage from '../HomePage';

describe('HomePage component', () => {
  it('renders hero section correctly', () => {
    renderWithProviders(<HomePage />);
    
    expect(screen.getByText('Шукай, купуй, продавай швидко!')).toBeInTheDocument();
    expect(screen.getByText('Розмістити оголошення')).toBeInTheDocument();
  });

  it('renders categories', async () => {
    renderWithProviders(<HomePage />);
    
    expect(screen.getByText('Розділи на сервісі')).toBeInTheDocument();
    expect(await screen.findByText('Смартфони')).toBeInTheDocument();
    expect(await screen.findByText('Ноутбуки')).toBeInTheDocument();
  });

  it('renders recent listings section', async () => {
    renderWithProviders(<HomePage />);
    
    expect(screen.getByText('Нові оголошення')).toBeInTheDocument();
    expect(await screen.findByText(/MacBook/i)).toBeInTheDocument();
  });
});
