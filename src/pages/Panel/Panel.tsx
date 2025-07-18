import React, { useState, useEffect, useRef } from 'react';
import { X, FilePlus } from 'lucide-react';
import ScriptForm from '../../components/ScriptForm';
import ScriptList from '../../components/ScriptList';
import type { Script } from '../../types/script';
import { useAppDispatch, useAppSelector } from '../../store';
import { addScript } from '../../store/scriptSlice';

interface PanelProps {
  inspectedTabId: number;
}

const Panel: React.FC<PanelProps> = ({ inspectedTabId }) => {
  const dispatch = useAppDispatch();
  const scripts = useAppSelector((state) => state.scripts);
  const [editingScript, setEditingScript] = useState<Script | null>(
    scripts.length > 0 ? scripts[0] : null
  );
  const didInit = useRef(false);

  useEffect(() => {
    if (!didInit.current) {
      didInit.current = true;
      if (scripts.length === 0) {
        const action = addScript({
          name: 'Snippet #1',
          description: 'Your first code snippet.',
          code: '// write or paste your snippet code here',
        });
        dispatch(action);
        setEditingScript(action.payload);
        return;
      }
    }

    if (scripts.length === 0) {
      setEditingScript(null);
    } else if (!editingScript || !scripts.some((s) => s.id === editingScript.id)) {
      setEditingScript(scripts[0]);
    }
  }, [scripts, dispatch]);
  const [filter, setFilter] = useState('');

  const handleAddNewScript = () => {
    const action = addScript({
      name: `Snippet #${scripts.length + 1}`,
      description: '',
      code: '// Your JavaScript code here',
    });
    dispatch(action);
    setEditingScript(action.payload);
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-800 p-4 text-white">
      <h1 className="mb-4 text-xl font-bold">Welcome to SnipLab</h1>
      <div className="flex flex-1">
        <div className="w-1/3 overflow-y-auto pr-4 border-r border-zinc-700">
          <div className="mb-2 flex items-center space-x-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Filter snippets..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full rounded border px-2 py-1 pr-6 text-black"
              />
              {filter && (
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setFilter('')}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          <button
            className="rounded bg-blue-600 p-2 text-white"
            onClick={handleAddNewScript}
            aria-label="Create New Snippet"
          >
            <FilePlus size={16} />
          </button>
          </div>
          <ScriptList
            onRun={(s) => {
              chrome.runtime.sendMessage({
                action: 'RUN_SCRIPT',
                script: s,
                tabId: inspectedTabId,
              });
            }}
            onEdit={setEditingScript}
            filterText={filter}
            selectedId={editingScript?.id}
          />
        </div>
        <div className="w-2/3 overflow-y-auto pl-4">
          {editingScript && (
            <ScriptForm
              script={editingScript}
              onSave={() => setEditingScript(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Panel;
