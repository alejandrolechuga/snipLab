import React from 'react';
import { render, screen } from '@testing-library/react';
import ScriptList from '../ScriptList';

const scripts = [
  { id: '1', name: 'first', description: '', code: '' },
  { id: '2', name: 'second', description: '', code: '' },
];

const mockDispatch = jest.fn();

jest.mock('../../store', () => ({
  useAppSelector: (selector: any) => selector({ scripts }),
  useAppDispatch: () => mockDispatch,
}));

describe('ScriptList row selection', () => {
  it('adds highlight class to selected row', () => {
    render(
      <ScriptList onRun={jest.fn()} onEdit={jest.fn()} selectedId="2" />
    );
    const selectedRow = screen.getByText('second').closest('tr');
    const otherRow = screen.getByText('first').closest('tr');
    expect(selectedRow).toHaveClass('bg-zinc-700');
    expect(otherRow).not.toHaveClass('bg-zinc-700');
  });
});
