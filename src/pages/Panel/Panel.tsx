import React, { useState } from 'react';
import ScriptForm from '../../components/ScriptForm';
import ScriptList from '../../components/ScriptList';
import type { Script } from '../../types/script';
import { ExtensionMessageType, ExtensionMessageOrigin } from '../../types/runtimeMessage';
import { safeDevtoolsInspectedWindow } from '../../chrome';

const Panel: React.FC = () => {
  const [editing, setEditing] = useState<Script | null>(null);

  const handleRunScript = (s: Script) => {
    const inspected = safeDevtoolsInspectedWindow();
    const tabId = inspected?.tabId;
    if (tabId === undefined) {
      console.warn('[Panel] Unable to determine inspected tabId');
    }
    chrome.runtime.sendMessage({
      action: ExtensionMessageType.RUN_SCRIPT,
      script: s,
      tabId,
      from: ExtensionMessageOrigin.DEVTOOLS,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-800 p-4 text-white">
      <h1 className="mb-4 text-xl font-bold">Welcome to SnipLab</h1>
      <div className="flex flex-1">
        <div className="w-1/3 overflow-y-auto pr-4 border-r border-zinc-700">
          <ScriptList onRun={handleRunScript} onEdit={(s) => setEditing(s)} />
        </div>
        <div className="w-2/3 overflow-y-auto pl-4">
          <ScriptForm script={editing || undefined} onSave={() => setEditing(null)} />
        </div>
      </div>
    </div>
  );
};

export default Panel;
