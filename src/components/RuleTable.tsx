import React, { useMemo } from 'react';
import RuleRow from './RuleRow';
import { useAppSelector } from '../store';
import { COLUMN_ORDER, COLUMN_LABELS, RuleColumn } from './columnConfig';

interface RuleTableProps {
  filter?: string;
  onEdit: (id: string) => void;
}

const RuleTable: React.FC<RuleTableProps> = ({ filter = '', onEdit }) => {
  const rules = useAppSelector((state) => state.ruleset);
  const filteredRules = useMemo(() => {
    if (!filter) return rules;
    return rules.filter((rule) =>
      rule.urlPattern.toLowerCase().includes(filter.toLowerCase())
    );
  }, [filter, rules]);

  return (
    <table className="w-full table-auto border-collapse text-sm">
      <thead>
        <tr>
          {COLUMN_ORDER.map((column) => (
            <th
              key={column}
              className="border-b border-red-400 px-2 py-1 text-left font-semibold text-red-500"
            >
              {COLUMN_LABELS[column]}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {filteredRules.length > 0 ? (
          filteredRules.map((rule) => (
            <RuleRow
              key={rule.id}
              rule={rule}
              columns={COLUMN_ORDER}
              onEdit={onEdit}
            />
          ))
        ) : (
          <tr>
            <td colSpan={COLUMN_ORDER.length} className="py-4 text-center">
              No rules available
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default RuleTable;
