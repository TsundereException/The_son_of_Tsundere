import { screen, fireEvent } from '../../test-utils';
import { renderWithProviders } from '../../test-utils';
import { vi } from 'vitest';
import CheckoutModal from '../CheckoutModal';

const product = {
  id: 1,
  name: 'Тестовий товар',
  price: '100',
  images: [],
};

describe('CheckoutModal component', () => {
  it('disables regular checkout submit without address', () => {
    renderWithProviders(
      <CheckoutModal isOpen onClose={vi.fn()} product={product} isSafeDeal={false} />
    );

    expect(screen.getByRole('button', { name: 'Замовити' })).toBeDisabled();
  });

  it('shows validation error for invalid safe deal card', async () => {
    renderWithProviders(
      <CheckoutModal isOpen onClose={vi.fn()} product={product} isSafeDeal />
    );

    fireEvent.change(screen.getByLabelText('Відділення / Адреса'), {
      target: { value: 'м. Київ, Відділення №1' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Далі (Оплата)' }));
    fireEvent.change(screen.getByLabelText('Номер картки (Тестовий)'), {
      target: { value: '123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Оплатити/ }));

    expect(await screen.findByText('Номер картки має містити від 12 до 19 цифр')).toBeInTheDocument();
  });
});
