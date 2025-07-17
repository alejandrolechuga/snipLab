import React, { useState, useEffect, useRef } from 'react';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { useAppDispatch } from '../store';
import { addScript, updateItem } from '../store/itemsSlice';
import type { Script } from '../types/script';

interface ScriptFormProps {
  script?: Script;
  onSave?: () => void;
  currentParentId?: string | null;
}

const ScriptForm: React.FC<ScriptFormProps> = ({ script, onSave, currentParentId }) => {
  const dispatch = useAppDispatch();
  const [name, setName] = useState(script?.name || '');
  const [code, setCode] = useState(script?.code || '');
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const codeMirrorRef = useRef<ReactCodeMirrorRef>(null);

  useEffect(() => {
    if (script) {
      setName(script.name);
      setCode(script.code);
    } else {
      // Clear fields when switching to creating a new snippet
      setName('');
      setCode('');
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
        updateItem({
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

  // Resize CodeMirror editor when the window size changes
  useEffect(() => {
    const handleResize = () => {
      const container = codeMirrorRef.current?.editor;
      if (container) {
        const parent = container.parentElement;
        if (parent) {
          const newWidth = parent.clientWidth;
          const offsetTop = parent.getBoundingClientRect().top;
          const availableHeight = window.innerHeight - offsetTop - 200;
          container.style.width = `${newWidth}px`;
          container.style.height = `${Math.max(200, availableHeight)}px`;
          codeMirrorRef.current?.view?.requestMeasure();
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
      saveTimeout.current = null;
    }
    if (script) {
      dispatch(updateItem({ id: script.id, changes: { name, code } }));
    } else {
      dispatch(addScript({ name, description: '', code, parentId: currentParentId ?? null }));
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
        ref={codeMirrorRef}
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
