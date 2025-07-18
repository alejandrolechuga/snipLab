import React, { useState, useEffect, useRef } from 'react';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
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

  // Resize CodeMirror editor when the window size changes
  useEffect(() => {
    const handleResize = () => {
      const editorDom = codeMirrorRef.current?.view?.dom;
      if (editorDom) {
        const parent = editorDom.parentElement;
        if (parent) {
          const newWidth = parent.clientWidth;
          const offsetTop = parent.getBoundingClientRect().top;
          const availableHeight = window.innerHeight - offsetTop - 200;
          editorDom.style.width = `${newWidth}px`;
          editorDom.style.height = `${Math.max(200, availableHeight)}px`;
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
      dispatch(updateScript({ id: script.id, changes: { name, code } }));
    } else {
      console.warn(
        'ScriptForm: Adding new script directly from form (not via "Create New Snippet" button).'
      );
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
