import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Combobox } from './Combobox';

const OPTIONS = [
  { value: 'hu_tao', label: 'Hu Tao' },
  { value: 'raiden', label: 'Raiden Shogun' },
  { value: 'xiao', label: 'Xiao' },
];

describe('Combobox', () => {
  it('shows the selected label on the trigger button', () => {
    render(<Combobox options={OPTIONS} value="raiden" onChange={() => {}} />);
    expect(screen.getByRole('button')).toHaveTextContent('Raiden Shogun');
  });

  it('opens the dropdown when the trigger is clicked', async () => {
    render(<Combobox options={OPTIONS} value="hu_tao" onChange={() => {}} />);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('filters options case-insensitively as the user types', async () => {
    render(<Combobox options={OPTIONS} value="hu_tao" onChange={() => {}} />);
    await userEvent.click(screen.getByRole('button'));
    await userEvent.type(screen.getByRole('textbox'), 'xia');
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByRole('listitem')).toHaveTextContent('Xiao');
  });

  it('shows "No results" when the query matches nothing', async () => {
    render(<Combobox options={OPTIONS} value="hu_tao" onChange={() => {}} />);
    await userEvent.click(screen.getByRole('button'));
    await userEvent.type(screen.getByRole('textbox'), 'zzz');
    expect(screen.getByText('No results')).toBeInTheDocument();
  });

  it('calls onChange with the selected value and closes the dropdown', async () => {
    const onChange = vi.fn();
    render(<Combobox options={OPTIONS} value="hu_tao" onChange={onChange} />);
    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(screen.getByText('Xiao'));
    expect(onChange).toHaveBeenCalledWith('xiao');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('closes without selecting on Escape', async () => {
    const onChange = vi.fn();
    render(<Combobox options={OPTIONS} value="hu_tao" onChange={onChange} />);
    await userEvent.click(screen.getByRole('button'));
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('navigates the list with arrow keys and selects with Enter', async () => {
    const onChange = vi.fn();
    render(<Combobox options={OPTIONS} value="hu_tao" onChange={onChange} />);
    await userEvent.click(screen.getByRole('button'));
    // activeIndex starts at 0 (Hu Tao); two ArrowDowns reach Xiao at index 2
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenCalledWith('xiao');
  });
});
