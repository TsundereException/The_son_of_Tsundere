import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import Pagination from '../Pagination';

describe('Pagination component', () => {
  it('renders page numbers correctly', () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={2} totalPages={5} onPageChange={onPageChange} />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('calls onPageChange when a page number is clicked', () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />);
    
    fireEvent.click(screen.getByText('3'));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('does not render if totalPages is 1 or less', () => {
    const onPageChange = vi.fn();
    const { container } = render(<Pagination currentPage={1} totalPages={1} onPageChange={onPageChange} />);
    expect(container).toBeEmptyDOMElement();
  });
});
