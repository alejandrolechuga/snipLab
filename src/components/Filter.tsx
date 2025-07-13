import React, { useEffect, useRef, useState } from 'react';

interface FilterProps {
  value: string;
  onFilterChange: (value: string) => void;
}

const DEBOUNCE_DELAY = 200;

const Filter: React.FC<FilterProps> = ({ value, onFilterChange }) => {
  const [inputValue, setInputValue] = useState(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      onFilterChange(inputValue);
    }, DEBOUNCE_DELAY);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [inputValue, onFilterChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleClear = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    setInputValue('');
    onFilterChange('');
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        placeholder="Type out to filter list"
        value={inputValue}
        onChange={handleChange}
        className="rounded border border-gray-300 px-2 py-1 text-black"
      />
      <button
        type="button"
        onClick={handleClear}
        className="rounded bg-red-500 px-2 py-1 text-white"
      >
        Clear
      </button>
    </div>
  );
};

export default Filter;
