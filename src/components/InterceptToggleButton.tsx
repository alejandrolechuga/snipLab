import React from 'react';

export type InterceptToggleButtonProps = {
  isEnabled: boolean;
  onToggle: () => void;
};

const InterceptToggleButton: React.FC<InterceptToggleButtonProps> = ({
  isEnabled,
  onToggle,
}) => (
  <button
    type="button"
    onClick={onToggle}
    className={`px-3 py-1 rounded text-sm font-medium transition ${
      isEnabled
        ? 'bg-green-600 text-white hover:bg-green-700'
        : 'bg-gray-500 text-white hover:bg-gray-600'
    }`}
  >
    {isEnabled ? 'Interception Enabled' : 'Enable Interception'}
  </button>
);

export default InterceptToggleButton;
