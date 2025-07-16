import React from 'react';
import { Play, Edit, Trash2 } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../store';
import { deleteScript } from '../store/scriptSlice';
import type { Script } from '../types/script';

interface ScriptListProps {
  onRun: (script: Script) => void;
  onEdit: (script: Script) => void;
  /** Filter text applied to name, description or code */
  filterText?: string;
}

const ScriptList: React.FC<ScriptListProps> = ({ onRun, onEdit, filterText }) => {
  const scripts = useAppSelector((state) => state.scripts);
  const dispatch = useAppDispatch();

  const filtered = scripts.filter((s) => {
    if (!filterText) return true;
    const t = filterText.toLowerCase();
    return (
      s.name.toLowerCase().includes(t) ||
      s.description.toLowerCase().includes(t) ||
      s.code.toLowerCase().includes(t)
    );
  });

  return (
    <table className="w-full">
      <tbody>
        {filtered.map((s) => (
          <tr
            key={s.id}
            className="cursor-pointer border-b last:border-none hover:bg-zinc-700"
            onClick={() => onEdit(s)}
          >
            <td className="py-1">{s.name}</td>
            <td
              className="py-1 text-right"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="mr-2 text-blue-500 hover:text-blue-700"
                onClick={() => onRun(s)}
              >
                <Play size={16} />
              </button>
              <button
                className="mr-2 text-yellow-500 hover:text-yellow-700"
                onClick={() => onEdit(s)}
              >
                <Edit size={16} />
              </button>
              <button
                className="text-red-500 hover:text-red-700"
                onClick={() => dispatch(deleteScript(s.id))}
              >
                <Trash2 size={16} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ScriptList;
