import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../store';
import { setRules } from '../Panel/ruleset/rulesetSlice';
import type { Rule } from '../types/rule';
import RuleExportButton from './RuleExportButton';
import RuleImportInput from './RuleImportInput';
import RuleImportConfirm from './RuleImportConfirm';

interface RuleImportExportProps {
  rules: Rule[];
}

const RuleImportExport: React.FC<RuleImportExportProps> = ({ rules }) => {
  const dispatch = useAppDispatch();
  const [message, setMessage] = useState('');
  const [pendingImport, setPendingImport] = useState<Rule[] | null>(null);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleImported = (imported: Rule[]) => {
    if (rules.length) {
      setPendingImport(imported);
    } else {
      dispatch(setRules([...rules, ...imported]));
      setMessage('Rules imported successfully');
    }
  };

  const handleError = (msg: string) => {
    setMessage(msg);
  };

  const handleConfirmImport = () => {
    if (pendingImport) {
      dispatch(setRules([...rules, ...pendingImport]));
      setMessage('Rules imported successfully');
      setPendingImport(null);
    }
  };

  const handleCancelImport = () => {
    setPendingImport(null);
  };

  return (
    <>
      {pendingImport && (
        <RuleImportConfirm
          onConfirm={handleConfirmImport}
          onCancel={handleCancelImport}
        />
      )}
      <div className="flex flex-col items-end">
        <div className="flex gap-2">
          <RuleExportButton rules={rules} onMessage={setMessage} />
          <RuleImportInput onParsed={handleImported} onError={handleError} />
        </div>
        {message && (
          <p role="status" className="mt-2 block text-sm text-blue-500">
            {message}
          </p>
        )}
      </div>
    </>
  );
};

export default RuleImportExport;
