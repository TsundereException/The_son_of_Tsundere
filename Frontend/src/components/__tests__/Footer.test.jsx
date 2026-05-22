import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Footer from '../Footer';

describe('Footer component', () => {
  it('renders Tsundere logo text', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );
    expect(screen.getAllByText(/Tsundere/i).length).toBeGreaterThan(0);
  });

  it('renders navigation links', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );
    expect(screen.getByText('Оголошення')).toBeInTheDocument();
    expect(screen.getByText('Мій профіль')).toBeInTheDocument();
    expect(screen.getByText('Контакти')).toBeInTheDocument();
  });

  it('renders copyright info', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );
    expect(screen.getByText(/Всі права захищено/i)).toBeInTheDocument();
  });
});
