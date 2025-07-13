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
    <ul>
      {scripts.map((s) => (
        <li
          key={s.id}
          className="flex items-center justify-between border-b py-1 last:border-none"
        >
          <span>{s.name}</span>
          <span className="space-x-2">
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
          </span>
        </li>
      ))}
    </ul>
  );
};

export default ScriptList;
