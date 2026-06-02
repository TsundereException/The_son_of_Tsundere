import { screen } from '../../test-utils';
import { renderWithProviders } from '../../test-utils';
import Footer from '../Footer';

describe('Footer component', () => {
  it('renders Tsundere logo text', () => {
    renderWithProviders(<Footer />);
    expect(screen.getAllByText(/Tsundere/i).length).toBeGreaterThan(0);
  });

  it('renders navigation links', () => {
    renderWithProviders(<Footer />);
    expect(screen.getByText('Оголошення')).toBeInTheDocument();
    expect(screen.getByText('Мій профіль')).toBeInTheDocument();
    expect(screen.getByText('Контакти')).toBeInTheDocument();
  });

  it('renders copyright info', () => {
    renderWithProviders(<Footer />);
    expect(screen.getByText(/Всі права захищено/i)).toBeInTheDocument();
  });
});
