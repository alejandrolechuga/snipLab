import React from 'react';

export interface OptionsFieldsProps {
  enabled: boolean;
  setEnabled: (value: boolean) => void;
  delayMs?: number | null;
  setDelayMs: (value: number | null) => void;
  delayMsError?: string;
}

const OptionsFields: React.FC<OptionsFieldsProps> = ({
  enabled,
  setEnabled,
  delayMs,
  setDelayMs,
  delayMsError,
}) => (
  <fieldset className="flex flex-col gap-2 rounded border p-2">
    <legend className="text-sm font-semibold">Options</legend>
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={enabled}
        onChange={(e) => setEnabled(e.target.checked)}
      />
      Enable Rule
    </label>
    <label className="flex flex-col">
      <span>Delay (ms)</span>
      <input
        type="number"
        min={0}
        max={10000}
        value={delayMs ?? ''}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === '') {
            setDelayMs(null);
          } else {
            const num = Math.min(10000, Number(raw));
            setDelayMs(num);
          }
        }}
        className="rounded border border-gray-300 px-2 py-1 text-black"
      />
      <span className="text-sm">Leave empty for no delay. Max 10000ms.</span>
      {delayMsError && (
        <span className="text-sm text-red-500">{delayMsError}</span>
      )}
    </label>
  </fieldset>
);

export default OptionsFields;
