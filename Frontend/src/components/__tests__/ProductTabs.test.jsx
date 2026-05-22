import { render, screen, fireEvent } from '@testing-library/react';
import ProductTabs from '../ProductTabs';

describe('ProductTabs component', () => {
  it('renders default description tab', () => {
    render(<ProductTabs />);
    expect(screen.getByText('Детальний опис товару')).toBeInTheDocument();
  });

  it('switches to characteristics tab on click', () => {
    render(<ProductTabs />);
    const characteristicsTab = screen.getByRole('button', { name: 'Характеристики' });
    fireEvent.click(characteristicsTab);
    
    expect(screen.getByText('Пам\'ять:')).toBeInTheDocument();
  });
});
