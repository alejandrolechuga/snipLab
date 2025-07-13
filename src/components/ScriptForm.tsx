import React, { useState, useEffect } from 'react';
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
  const [description, setDescription] = useState(script?.description || '');
  const [code, setCode] = useState(script?.code || '');

  useEffect(() => {
    if (script) {
      setName(script.name);
      setDescription(script.description);
      setCode(script.code);
    }
  }, [script]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (script) {
      dispatch(updateScript({ id: script.id, changes: { name, description, code } }));
    } else {
      dispatch(addScript({ name, description, code }));
      setName('');
      setDescription('');
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
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full rounded border px-2 py-1 text-black"
      />
      <textarea
        placeholder="Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="w-full rounded border px-2 py-1 font-mono text-black"
        rows={6}
      />
      <button type="submit" className="rounded bg-blue-600 px-2 py-1 text-white">
        Save
      </button>
    </form>
  );
};

export default ScriptForm;
