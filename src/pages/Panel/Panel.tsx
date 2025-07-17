import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import ScriptForm from '../../components/ScriptForm';
import type { Script } from '../../types/script';
import { Tree } from 'react-complex-tree';
import {
  UncontrolledTreeEnvironment,
  StaticTreeDataProvider,
} from 'react-complex-tree';
import 'react-complex-tree/lib/style-modern.css';
import { useAppSelector } from '../../store';

interface PanelProps {
  inspectedTabId: number;
}

const Panel: React.FC<PanelProps> = ({ inspectedTabId }) => {
  const [editing, setEditing] = useState<Script | null>(null);
  const [filter, setFilter] = useState('');
  const scripts = useAppSelector((s) => s.scripts);

  const treeItems = useMemo(() => {
    const filtered = scripts.filter((s) =>
      s.name.toLowerCase().includes(filter.toLowerCase())
    );
    const items: any = {
      root: {
        index: 'root',
        isFolder: true,
        children: filtered.map((s) => s.id),
        data: { type: 'folder', folder: { id: 'root', name: 'root' } },
      },
    };
    filtered.forEach((s) => {
      items[s.id] = {
        index: s.id,
        isFolder: false,
        children: [],
        data: { type: 'script', script: s },
      };
    });
    return items;
  }, [scripts, filter]);

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
              className="rounded bg-blue-600 px-2 py-1 text-white"
              onClick={() => setEditing(null)}
            >
              Add New Snippet
            </button>
          </div>
          <UncontrolledTreeEnvironment
            canDragAndDrop
            canReorderItems
            canDropOnFolder
            dataProvider={new StaticTreeDataProvider(treeItems)}
            getItemTitle={(item) =>
              item.data.type === 'script'
                ? item.data.script.name
                : item.data.folder.name
            }
            viewState={{ 'tree-1': { expandedItems: ['root'] } }}
            onPrimaryAction={(item) => {
              if (item.data.type === 'script') {
                chrome.runtime.sendMessage({
                  action: 'RUN_SCRIPT',
                  script: item.data.script,
                  tabId: inspectedTabId,
                });
              }
            }}
            onSelectItems={(ids) => {
              const id = ids[0];
              const item = treeItems[id];
              if (item?.data.type === 'script') {
                setEditing(item.data.script);
              }
            }}
          >
            <Tree
              treeId="tree-1"
              rootItem="root"
              treeLabel="Scripts"
            />
          </UncontrolledTreeEnvironment>
        </div>
        <div className="w-2/3 overflow-y-auto pl-4">
          <ScriptForm script={editing || undefined} onSave={() => setEditing(null)} />
        </div>
      </div>
    </div>
  );
};

export default Panel;
