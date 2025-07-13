import React, { useState, useEffect, useRef } from 'react';
import Filter from './Filter';
import RuleTable from './RuleTable';
import { useAppSelector } from '../store';
import RuleImportExport from './RuleImportExport';
import { trackEvent } from '../utils/telemetry';

interface RuleListProps {
  onEdit: (id: string) => void;
  onAdd: () => void;
}

const RuleList: React.FC<RuleListProps> = ({ onEdit, onAdd }) => {
  const [filter, setFilter] = useState('');
  const rules = useAppSelector((state) => state.ruleset);
  const rulesCount = rules.length;
  const filterShown = useRef(false);
  const { enableImportExport } = useAppSelector((state) => state.features);

  useEffect(() => {
    if (rulesCount > 10 && !filterShown.current) {
      trackEvent('rule_filter_visible');
      filterShown.current = true;
    }
    if (rulesCount <= 10) {
      filterShown.current = false;
    }
  }, [rulesCount]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        {rulesCount > 10 && (
          <Filter value={filter} onFilterChange={setFilter} />
        )}
        <button
          type="button"
          onClick={onAdd}
          className="rounded bg-green-600 px-2 py-1"
        >
          Add Rule
        </button>
        {enableImportExport && <RuleImportExport rules={rules} />}
      </div>
      <RuleTable filter={filter} onEdit={onEdit} />
    </div>
  );
};

export default RuleList;
