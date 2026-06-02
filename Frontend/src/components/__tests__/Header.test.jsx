import { screen } from '../../test-utils';
import { renderWithProviders } from '../../test-utils';
import Header from '../Header';

describe('Header component', () => {
  it('renders logo', () => {
    renderWithProviders(<Header />);
    expect(screen.getByText('Tsundere')).toBeInTheDocument();
  });

  it('renders search input', () => {
    renderWithProviders(<Header />);
    expect(screen.getByPlaceholderText('Що шукаєте?')).toBeInTheDocument();
  });

  it('renders Add Listing button', () => {
    renderWithProviders(<Header />);
    expect(screen.getByText('Додати')).toBeInTheDocument();
  });
});
