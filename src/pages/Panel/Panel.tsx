import React, { useState } from 'react';
import ScriptForm from '../../components/ScriptForm';
import ScriptList from '../../components/ScriptList';
import type { Script } from '../../types/script';

const Panel: React.FC = () => {
  const [editing, setEditing] = useState<Script | null>(null);

  return (
    <div className="space-y-4 p-2 text-white">
      <h1 className="text-xl font-bold">Welcome to SnipLab</h1>
      <ScriptList
        onRun={(s) => {
          chrome.runtime.sendMessage({ action: 'RUN_SCRIPT', script: s });
        }}
        onEdit={(s) => setEditing(s)}
      />
      <ScriptForm script={editing || undefined} onSave={() => setEditing(null)} />
    </div>
  );
};

export default Panel;
