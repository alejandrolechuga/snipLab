import React from 'react';
import { useAppSelector, useAppDispatch } from '../store';
import { deleteScript } from '../store/scriptSlice';
import type { Script } from '../types/script';

interface ScriptListProps {
  onRun: (script: Script) => void;
  onEdit: (script: Script) => void;
}

const ScriptList: React.FC<ScriptListProps> = ({ onRun, onEdit }) => {
  const scripts = useAppSelector((state) => state.scripts);
  const dispatch = useAppDispatch();

  return (
    <table className="w-full table-auto text-left">
      <thead>
        <tr>
          <th className="px-2">Name</th>
          <th className="px-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {scripts.map((s) => (
          <tr key={s.id} className="border-t">
            <td className="px-2 py-1">{s.name}</td>
            <td className="space-x-2 px-2 py-1">
              <button
                className="rounded bg-green-600 px-2 py-1 text-white"
                onClick={() => onRun(s)}
              >
                Run
              </button>
              <button
                className="rounded bg-yellow-600 px-2 py-1 text-white"
                onClick={() => onEdit(s)}
              >
                Edit
              </button>
              <button
                className="rounded bg-red-600 px-2 py-1 text-white"
                onClick={() => dispatch(deleteScript(s.id))}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ScriptList;
