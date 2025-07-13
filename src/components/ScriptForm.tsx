import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useAppDispatch } from '../store';
import { addScript, updateScript } from '../store/scriptSlice';
import type { Script } from '../types/script';

interface ScriptFormProps {
  script?: Script;
  onSave?: () => void;
}

const ScriptForm: React.FC<ScriptFormProps> = ({ script, onSave }) => {
  const dispatch = useAppDispatch();
  const [name, setName] = useState(script?.name || '');
  const [code, setCode] = useState(script?.code || '');

  useEffect(() => {
    if (script) {
      setName(script.name);
      setCode(script.code);
    }
  }, [script]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (script) {
      dispatch(updateScript({ id: script.id, changes: { name, code } }));
    } else {
      dispatch(addScript({ name, description: '', code }));
      setName('');
      setCode('');
    }
    onSave?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded border px-2 py-1 text-black"
      />
      <div className="border rounded overflow-hidden">
        <Editor
          height="300px"
          defaultLanguage="javascript"
          value={code}
          onChange={(value) => setCode(value ?? '')}
          theme="vs-dark"
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            automaticLayout: true,
          }}
        />
      </div>
      <button type="submit" className="rounded bg-blue-600 px-2 py-1 text-white">
        Save
      </button>
    </form>
  );
};

export default ScriptForm;
