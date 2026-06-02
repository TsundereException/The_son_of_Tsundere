import { screen, fireEvent } from '../../test-utils';
import { renderWithProviders } from '../../test-utils';
import AuthPage from '../AuthPage';

describe('AuthPage component', () => {
  it('renders login form by default', () => {
    renderWithProviders(<AuthPage />);
    expect(screen.getByText('З поверненням!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Увійти' })).toBeInTheDocument();
  });

  it('switches to registration form when clicking Register tab', () => {
    renderWithProviders(<AuthPage />);
    const registerTab = screen.getByRole('button', { name: 'Реєстрація' });
    fireEvent.click(registerTab);
    
    expect(screen.getByText('Створити акаунт')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Зареєструватися' })).toBeInTheDocument();
  });
});
