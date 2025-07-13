import React from 'react';

interface RuleImportConfirmProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const RuleImportConfirm: React.FC<RuleImportConfirmProps> = ({
  onConfirm,
  onCancel,
}) => (
  <div className="my-2 flex items-center gap-2">
    <span>Overwrite existing rules with imported ones?</span>
    <button
      type="button"
      onClick={onConfirm}
      className="rounded bg-blue-500 px-2 py-1"
    >
      Confirm
    </button>
    <button
      type="button"
      onClick={onCancel}
      className="rounded bg-gray-300 px-2 py-1"
    >
      Cancel
    </button>
  </div>
);

export default RuleImportConfirm;
