import { screen, fireEvent, waitFor } from '../../test-utils';
import { renderWithProviders } from '../../test-utils';
import { vi } from 'vitest';
import ListingForm from '../ListingForm';

describe('ListingForm component', () => {
  it('shows client validation error before submitting invalid listing', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<ListingForm onSubmit={onSubmit} />);

    await waitFor(() => expect(screen.getByText('Додати фото')).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText(/Назва товару/), {
      target: { value: 'ab' },
    });
    fireEvent.change(screen.getByLabelText(/Опис/), {
      target: { value: 'Достатньо довгий опис товару' },
    });
    fireEvent.change(screen.getByLabelText('Ціна'), {
      target: { value: '100' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Опублікувати' }));

    expect(screen.getByText('Назва має містити щонайменше 3 символи')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
