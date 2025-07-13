import React, { useRef } from 'react';
import type { Rule } from '../types/rule';
import { ruleSchema, toRule, type RuleInput } from '../types/ruleSchema';

interface RuleImportInputProps {
  onParsed: (rules: Rule[]) => void;
  onError: (msg: string) => void;
}

const RuleImportInput: React.FC<RuleImportInputProps> = ({
  onParsed,
  onError,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateRule = (rule: unknown): rule is RuleInput =>
    ruleSchema.safeParse(rule).success;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result as string);
        if (Array.isArray(json) && json.every(validateRule)) {
          const imported: Rule[] = json.map((r) => toRule(r));
          onParsed(imported);
        } else {
          onError('Invalid rules file');
        }
      } catch {
        onError('Failed to parse rules file');
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const triggerImport = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={triggerImport}
        className="rounded bg-blue-500 px-2 py-1"
      >
        Import Rules
      </button>
    </>
  );
};

export default RuleImportInput;
