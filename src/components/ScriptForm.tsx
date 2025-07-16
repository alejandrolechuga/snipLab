import React, { useState, useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
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
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (script) {
      setName(script.name);
      setCode(script.code);
    }
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
      saveTimeout.current = null;
    }
  }, [script]);

  // Auto-save existing snippets with debounce
  useEffect(() => {
    if (!script?.id) return;
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }
    saveTimeout.current = setTimeout(() => {
      dispatch(
        updateScript({
          id: script.id,
          changes: { name, code },
        })
      );
      saveTimeout.current = null;
    }, 500);
    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
        saveTimeout.current = null;
      }
    };
  }, [name, code, script?.id, dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
      saveTimeout.current = null;
    }
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
      <CodeMirror
        value={code}
        height="300px"
        extensions={[javascript()]}
        onChange={(value) => setCode(value)}
        theme="dark"
        className="w-full rounded border"
      />
      {!script && (
        <button type="submit" className="rounded bg-blue-600 px-2 py-1 text-white">
          Save
        </button>
      )}
    </form>
  );
};

export default ScriptForm;
