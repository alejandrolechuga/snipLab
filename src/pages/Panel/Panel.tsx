import React, { useState } from 'react';
import ScriptForm from '../../components/ScriptForm';
import ScriptList from '../../components/ScriptList';
import type { Script } from '../../types/script';
import { safeDevtoolsInspectedWindow } from '../../chrome';

const Panel: React.FC = () => {
  const [editing, setEditing] = useState<Script | null>(null);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-800 p-4 text-white">
      <h1 className="mb-4 text-xl font-bold">Welcome to SnipLab</h1>
      <div className="flex flex-1">
        <div className="w-1/3 overflow-y-auto pr-4 border-r border-zinc-700">
          <ScriptList
            onRun={(s) => {
              const inspectedWindow = safeDevtoolsInspectedWindow();
              const tabId = inspectedWindow?.tabId;
              if (tabId !== undefined) {
                chrome.runtime.sendMessage({ action: 'RUN_SCRIPT', script: s, tabId });
              } else {
                console.warn('No inspected window tabId; sending message without tabId');
                chrome.runtime.sendMessage({ action: 'RUN_SCRIPT', script: s });
              }
            }}
            onEdit={(s) => setEditing(s)}
          />
        </div>
        <div className="w-2/3 overflow-y-auto pl-4">
          <ScriptForm script={editing || undefined} onSave={() => setEditing(null)} />
        </div>
      </div>
    </div>
  );
};

export default Panel;
