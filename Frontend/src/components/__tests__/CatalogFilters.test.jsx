import { screen, fireEvent } from '../../test-utils';
import { renderWithProviders } from '../../test-utils';
import CatalogFilters from '../CatalogFilters';

describe('CatalogFilters component', () => {
  it('renders category options', async () => {
    renderWithProviders(<CatalogFilters />);
    fireEvent.click(await screen.findByText('Всі категорії'));
    expect(await screen.findByText('Смартфони')).toBeInTheDocument();
    expect(await screen.findByText('Ноутбуки')).toBeInTheDocument();
  });

  it('renders price range inputs', async () => {
    renderWithProviders(<CatalogFilters />);
    fireEvent.click(await screen.findByText('Від - До'));
    expect(await screen.findByPlaceholderText('Від')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('До')).toBeInTheDocument();
  });

  it('renders filters panel', async () => {
    renderWithProviders(<CatalogFilters />);
    expect(await screen.findByText('Фільтри')).toBeInTheDocument();
  });
});
