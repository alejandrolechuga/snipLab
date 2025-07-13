import React from 'react';

export interface ResponseOverrideFieldsProps {
  response: string;
  setResponse: (value: string) => void;
  statusCode: number;
  setStatusCode: (value: number) => void;
  responseError?: string;
  statusCodeError?: string;
}

export const ResponseOverrideFields: React.FC<ResponseOverrideFieldsProps> = ({
  response,
  setResponse,
  statusCode,
  setStatusCode,
  responseError,
  statusCodeError,
}) => (
  <fieldset className="flex flex-col gap-2 rounded border p-2">
    <legend className="text-sm font-semibold">Response Override</legend>
    <label className="flex flex-col">
      <span>Response Body</span>
      <textarea
        rows={4}
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        placeholder="Leave empty to use the original response"
        className="rounded border border-gray-300 px-2 py-1 text-black"
      />
      {responseError && (
        <span className="text-sm text-red-500">{responseError}</span>
      )}
    </label>
    <label className="flex flex-col">
      <span>Status Code</span>
      <input
        type="number"
        value={statusCode}
        onChange={(e) => setStatusCode(Number(e.target.value))}
        className="rounded border border-gray-300 px-2 py-1 text-black"
      />
      {statusCodeError && (
        <span className="text-sm text-red-500">{statusCodeError}</span>
      )}
    </label>
  </fieldset>
);
