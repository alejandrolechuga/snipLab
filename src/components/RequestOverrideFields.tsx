import React from 'react';
import clsx from 'clsx';

export interface RequestOverrideFieldsProps {
  requestBody: string;
  setRequestBody: (value: string) => void;
  disabled?: boolean;
}

const RequestOverrideFields: React.FC<RequestOverrideFieldsProps> = ({
  requestBody,
  setRequestBody,
  disabled = false,
}) => (
  <fieldset className="flex flex-col gap-2 rounded border p-2">
    <legend className="text-sm font-semibold">Override Request Body</legend>
    <label className="flex flex-col">
      <span>Override Request Body</span>
      <textarea
        id="requestBody"
        name="requestBody"
        rows={4}
        disabled={disabled}
        value={requestBody}
        onChange={(e) => setRequestBody(e.target.value)}
        placeholder='{"foo": "bar"}'
        className={clsx(
          'rounded border px-2 py-1 text-black',
          disabled
            ? 'bg-gray-100 opacity-60 cursor-not-allowed'
            : 'border-gray-300'
        )}
      />
      {disabled && (
        <span className="text-xs text-gray-500">
          Request body override not available for this method.
        </span>
      )}
    </label>
  </fieldset>
);

export default RequestOverrideFields;
