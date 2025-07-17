import React, { useState } from 'react';
import { X, FileText, FolderPlus, ArrowLeftSquare } from 'lucide-react';
import ScriptForm from '../../components/ScriptForm';
import ScriptList from '../../components/ScriptList';
import { useAppDispatch, useAppSelector } from '../../store';
import { addFolder, setSelectedFolderId } from '../../store/itemsSlice';
import type { Script } from '../../types/script';

interface PanelProps {
  inspectedTabId: number;
}

const Panel: React.FC<PanelProps> = ({ inspectedTabId }) => {
  const dispatch = useAppDispatch();
  const { selectedFolderId, items } = useAppSelector((s) => s.items);
  const [editing, setEditing] = useState<Script | null>(null);
  const [filter, setFilter] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  const breadcrumbs = React.useMemo(() => {
    const chain: string[] = [];
    let current = selectedFolderId;
    while (current) {
      const item = items.find((i) => i.id === current);
      if (!item) break;
      chain.unshift(item.name);
      current = item.parentId;
    }
    return chain;
  }, [selectedFolderId, items]);

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
              onClick={() => setEditing(null)}
            >
              <FileText size={16} />
            </button>
            <button
              className="rounded bg-green-600 p-2 text-white"
              onClick={() => {
                const action = addFolder({ parentId: selectedFolderId });
                dispatch(action);
                setEditId(action.payload.id);
              }}
            >
              <FolderPlus size={16} />
            </button>
            {selectedFolderId && (
              <button
                className="rounded bg-zinc-700 p-2"
                onClick={() => dispatch(setSelectedFolderId(null))}
              >
                <ArrowLeftSquare size={16} />
              </button>
            )}
          </div>
          <div className="mb-2 text-sm text-zinc-300">
            Root
            {breadcrumbs.map((b, idx) => (
              <span key={b}>
                {' > '}
                {b}
              </span>
            ))}
          </div>
          <ScriptList
            onRun={(s) => {
              chrome.runtime.sendMessage({
                action: 'RUN_SCRIPT',
                script: s,
                tabId: inspectedTabId,
              });
            }}
            onEdit={(s) => setEditing(s)}
            currentFolderId={selectedFolderId}
            editId={editId}
            onEditIdChange={setEditId}
          />
        </div>
        <div className="w-2/3 overflow-y-auto pl-4">
          <ScriptForm
            script={editing || undefined}
            onSave={() => setEditing(null)}
            currentParentId={selectedFolderId}
          />
        </div>
      </div>
    </div>
  );
};

export default Panel;
