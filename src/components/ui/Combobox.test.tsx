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
    expect(screen.getByRole('combobox')).toHaveTextContent('Raiden Shogun');
  });

  it('opens the dropdown when the trigger is clicked', async () => {
    render(<Combobox options={OPTIONS} value="hu_tao" onChange={() => {}} />);
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('filters options case-insensitively as the user types', async () => {
    render(<Combobox options={OPTIONS} value="hu_tao" onChange={() => {}} />);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.type(screen.getByRole('combobox'), 'xia');
    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(screen.getByRole('option')).toHaveTextContent('Xiao');
  });

  it('shows "No results" when the query matches nothing', async () => {
    render(<Combobox options={OPTIONS} value="hu_tao" onChange={() => {}} />);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.type(screen.getByRole('combobox'), 'zzz');
    expect(screen.getByText('No results')).toBeInTheDocument();
  });

  it('calls onChange with the selected value and closes the dropdown', async () => {
    const onChange = vi.fn();
    render(<Combobox options={OPTIONS} value="hu_tao" onChange={onChange} />);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByText('Xiao'));
    expect(onChange).toHaveBeenCalledWith('xiao');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('closes without selecting on Escape', async () => {
    const onChange = vi.fn();
    render(<Combobox options={OPTIONS} value="hu_tao" onChange={onChange} />);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('navigates the list with arrow keys and selects with Enter', async () => {
    const onChange = vi.fn();
    render(<Combobox options={OPTIONS} value="hu_tao" onChange={onChange} />);
    await userEvent.click(screen.getByRole('combobox'));
    // activeIndex starts at 0 (Hu Tao); two ArrowDowns reach Xiao at index 2
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenCalledWith('xiao');
  });
});

describe('Combobox accessibility', () => {
  it('names the trigger and the search box after the field, not its value', async () => {
    render(
      <Combobox
        options={OPTIONS}
        value="raiden"
        onChange={() => {}}
        label="Character"
      />,
    );
    const trigger = screen.getByRole('combobox', { name: 'Character' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    expect(
      screen.getByRole('combobox', { name: 'Character' }),
    ).toBeInTheDocument();
  });

  it('points aria-activedescendant at the option the arrow keys highlight', async () => {
    render(
      <Combobox
        options={OPTIONS}
        value="raiden"
        onChange={() => {}}
        label="Character"
      />,
    );
    await userEvent.click(screen.getByRole('combobox', { name: 'Character' }));
    const search = screen.getByRole('combobox', { name: 'Character' });
    const active = () =>
      document.getElementById(
        search.getAttribute('aria-activedescendant') ?? '',
      );
    expect(active()).toHaveTextContent('Hu Tao');
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    expect(active()).toHaveTextContent('Xiao');
  });

  it('does not leave the empty state as a bare listbox child', async () => {
    render(
      <Combobox
        options={OPTIONS}
        value="raiden"
        onChange={() => {}}
        label="Character"
      />,
    );
    await userEvent.click(screen.getByRole('combobox', { name: 'Character' }));
    await userEvent.type(
      screen.getByRole('combobox', { name: 'Character' }),
      'zzz',
    );
    expect(screen.getByText('No results')).toHaveAttribute(
      'role',
      'presentation',
    );
    expect(
      screen.getByRole('combobox', { name: 'Character' }),
    ).not.toHaveAttribute('aria-activedescendant');
  });

  it('does not point the collapsed trigger at a list that is not rendered', () => {
    render(
      <Combobox
        options={OPTIONS}
        value="raiden"
        onChange={() => {}}
        label="Character"
      />,
    );
    expect(
      screen.getByRole('combobox', { name: 'Character' }),
    ).not.toHaveAttribute('aria-controls');
  });

  it('exposes the dropdown as a listbox with a selected option', async () => {
    render(
      <Combobox
        options={OPTIONS}
        value="raiden"
        onChange={() => {}}
        label="Character"
      />,
    );
    await userEvent.click(screen.getByRole('combobox', { name: 'Character' }));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Raiden Shogun' }),
    ).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: 'Xiao' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });
});
