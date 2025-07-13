import React from 'react';
import type { Rule } from '../types/rule';

interface RuleExportButtonProps {
  rules: Rule[];
  onMessage: (msg: string) => void;
}

const RuleExportButton: React.FC<RuleExportButtonProps> = ({
  rules,
  onMessage,
}) => {
  const handleExport = () => {
    const withDelay = rules.map((r) => ({
      ...r,
      delayMs: r.delayMs ?? null,
      requestBody: r.requestBody ?? null,
    }));
    const blob = new Blob([JSON.stringify(withDelay, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'httpmocky-rules.json';
    a.click();
    URL.revokeObjectURL(url);
    onMessage('Rules exported successfully');
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      className="rounded bg-blue-500 px-2 py-1"
    >
      Export Rules
    </button>
  );
};

export default RuleExportButton;
