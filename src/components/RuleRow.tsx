import React from 'react';
import type { Rule } from '../types/rule';
import { RuleColumn } from './columnConfig';
import { useAppDispatch, useAppSelector } from '../store';
import { removeRule, updateRule } from '../Panel/ruleset/rulesetSlice';
import { removeMatch } from '../store/matchSlice';
import { trackEvent } from '../utils/telemetry';
import ToggleButton from './ToggleButton';

const TITLE_MAP: Record<string, string> = {
  REQ: 'Request Body Override',
  RES: 'Response Body Override',
  'REQ-H': 'Request Headers Override',
  'RES-H': 'Response Headers Override',
};

interface RuleRowProps {
  rule: Rule;
  columns: RuleColumn[];
  onEdit: (id: string) => void;
}

const RuleRow: React.FC<RuleRowProps> = ({ rule, columns, onEdit }) => {
  const dispatch = useAppDispatch();
  const matchCount = useAppSelector((state) => state.matches[rule.id] || 0);
  const handleDelete = () => {
    dispatch(removeRule(rule.id));
    dispatch(removeMatch(rule.id));
    trackEvent('rule_deleted', {
      request_override: !!(rule.requestBody && rule.requestBody.trim() !== ''),
      response_override: !!(rule.response && rule.response.trim() !== ''),
      method: rule.method || 'ALL',
      use_regexp: rule.isRegExp ?? false,
      had_delay: rule.delayMs != null && rule.delayMs > 0,
      delay_ms: rule.delayMs ?? 0,
      status_code: rule.statusCode,
      enabled: rule.enabled,
    });
  };
  const handleEdit = () => {
    trackEvent('rule_edit_clicked');
    onEdit(rule.id);
  };

  const renderCell = (column: RuleColumn): React.ReactNode => {
    switch (column) {
      case RuleColumn.UrlPattern:
        return (
          <p title={rule.urlPattern} className="max-w-[300px] truncate">
            {rule.urlPattern}
          </p>
        );
      case RuleColumn.Method:
        return rule.method || 'Match All';
      case RuleColumn.Overrides: {
        const tags: string[] = [];
        if (rule.requestBody) tags.push('REQ');
        if (rule.response) tags.push('RES');
        if (rule.requestHeaders && Object.keys(rule.requestHeaders).length > 0)
          tags.push('REQ-H');
        if (
          rule.responseHeaders &&
          Object.keys(rule.responseHeaders).length > 0
        )
          tags.push('RES-H');
        if (tags.length === 0) {
          return <span className="text-gray-400">&ndash;</span>;
        }
        return (
          <div className="flex gap-1">
            {tags.map((t) => (
              <span
                key={t}
                title={TITLE_MAP[t]}
                className="text-xs bg-neutral-700 text-white px-2 py-0.5 rounded-md font-mono"
              >
                {t}
              </span>
            ))}
          </div>
        );
      }
      case RuleColumn.Enabled:
        return (
          <ToggleButton
            isEnabled={rule.enabled}
            onToggle={() =>
              dispatch(
                updateRule({ id: rule.id, changes: { enabled: !rule.enabled } })
              )
            }
          />
        );
      case RuleColumn.Matches:
        return matchCount;
      case RuleColumn.Actions:
      default:
        return (
          <>
            <button
              type="button"
              onClick={handleEdit}
              className="mr-2 rounded bg-blue-500 px-2 py-1"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded bg-red-500 px-2 py-1"
            >
              Delete
            </button>
          </>
        );
    }
  };

  return (
    <tr className="even:bg-gray-800/50">
      {columns.map((column) => (
        <td key={column} className="border-b px-2 py-1">
          {renderCell(column)}
        </td>
      ))}
    </tr>
  );
};

export default RuleRow;
