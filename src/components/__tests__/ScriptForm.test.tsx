import React from 'react';
import { render, fireEvent, act, screen } from '@testing-library/react';
import ScriptForm from '../ScriptForm';
import { updateScript, addScript } from '../../store/scriptSlice';

jest.mock('@uiw/react-codemirror', () => {
  const MockCodeMirror = (props: any) => {
    const { value, onChange } = props;
    return <textarea value={value} onChange={(e) => onChange(e.target.value)} />;
  };
  MockCodeMirror.displayName = 'MockCodeMirror';
  return MockCodeMirror;
});

const mockDispatch = jest.fn();

jest.mock('../../store', () => ({
  useAppDispatch: () => mockDispatch,
}));

const existingScript = {
  id: '1',
  name: 'demo',
  description: 'desc',
  code: 'console.log(1);',
};

describe('ScriptForm auto-save', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockDispatch.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('auto-saves updates for existing scripts', () => {
    render(<ScriptForm script={existingScript} onSave={jest.fn()} />);
    fireEvent.change(screen.getByPlaceholderText('Name'), {
      target: { value: 'updated' },
    });
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(mockDispatch).toHaveBeenCalledWith(
      updateScript({
        id: existingScript.id,
        changes: { name: 'updated', code: 'console.log(1);' },
      })
    );
  });

  it('does not auto-save when creating a new script', () => {
    render(<ScriptForm onSave={jest.fn()} />);
    fireEvent.change(screen.getByPlaceholderText('Name'), {
      target: { value: 'new' },
    });
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(mockDispatch).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText('Save'));
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'scripts/addScript',
        payload: expect.objectContaining({
          id: expect.any(String),
          name: 'new',
          description: '',
          code: '',
        }),
      })
    );
  });

});
