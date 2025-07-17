import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronDown, Play, Edit, Trash2 } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../store';
import {
  deleteItem,
  updateItem,
  setSelectedFolderId,
  setExpandedFolders,
} from '../store/itemsSlice';
import type { ListItem, Folder, Script } from '../types/script';

interface ScriptListProps {
  onRun: (script: Script) => void;
  onEdit: (script: Script) => void;
  currentFolderId: string | null;
  editId?: string | null;
  onEditIdChange?: (id: string | null) => void;
}

const ScriptList: React.FC<ScriptListProps> = ({
  onRun,
  onEdit,
  currentFolderId,
  editId,
  onEditIdChange,
}) => {
  const dispatch = useAppDispatch();
  const { items, expandedFolders } = useAppSelector((state) => state.items);
  const [dragId, setDragId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement | null>(null);

  const itemsInFolder = items
    .filter((i) => i.parentId === currentFolderId)
    .sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name);
      }
      return a.type === 'folder' ? -1 : 1;
    });

  useEffect(() => {
    if (editId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editId]);

  const handleDrop = (targetFolderId: string | null) => {
    if (!dragId) return;
    if (dragId === targetFolderId) return;
    const dragged = items.find((i) => i.id === dragId);
    if (!dragged) return;
    if (targetFolderId) {
      // prevent dropping folder into its descendant
      let parent: string | null = targetFolderId;
      while (parent) {
        if (parent === dragged.id) return;
        const p = items.find((i) => i.id === parent);
        parent = p?.parentId || null;
      }
    }
    dispatch(updateItem({ id: dragId, changes: { parentId: targetFolderId } }));
    setDragId(null);
    setHoverId(null);
  };

  const toggleFolder = (id: string) => {
    const expanded = new Set(expandedFolders);
    if (expanded.has(id)) {
      expanded.delete(id);
    } else {
      expanded.add(id);
    }
    dispatch(setExpandedFolders(Array.from(expanded)));
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setHoverId('root');
        }}
        onDrop={() => handleDrop(null)}
        className={`mb-2 rounded border border-dashed p-2 text-center text-sm ${
          hoverId === 'root' ? 'bg-zinc-700' : 'bg-zinc-800'
        }`}
      >
        Drop items here to move to Root
      </div>
      <table className="w-full">
        <tbody>
          {itemsInFolder.map((item) => (
            <tr
              key={item.id}
              draggable
              onDragStart={() => setDragId(item.id)}
              onDragOver={(e) => {
                e.preventDefault();
                setHoverId(item.id);
              }}
              onDrop={() => handleDrop(item.type === 'folder' ? item.id : item.parentId)}
              className={`cursor-pointer border-b last:border-none ${
                hoverId === item.id ? 'bg-zinc-700' : 'hover:bg-zinc-700'
              }`}
            >
              <td className="py-1">
                {item.type === 'folder' ? (
                  <button
                    onClick={() => {
                      dispatch(setSelectedFolderId(item.id));
                    }}
                    className="flex items-center space-x-1"
                  >
                    {expandedFolders.includes(item.id) ? (
                      <ChevronDown size={16} onClick={(e) => { e.stopPropagation(); toggleFolder(item.id); }} />
                    ) : (
                      <ChevronRight size={16} onClick={(e) => { e.stopPropagation(); toggleFolder(item.id); }} />
                    )}
                    {editId === item.id ? (
                      <input
                        ref={editInputRef}
                        value={item.name}
                        onChange={(e) =>
                          dispatch(updateItem({ id: item.id, changes: { name: e.target.value } }))
                        }
                        onBlur={() => onEditIdChange?.(null)}
                        className="ml-1 rounded border px-1 text-black"
                      />
                    ) : (
                      <span onDoubleClick={() => onEditIdChange?.(item.id)}>{item.name}</span>
                    )}
                  </button>
                ) : (
                  <div className="flex items-center">
                    {editId === item.id ? (
                      <input
                        ref={editInputRef}
                        value={item.name}
                        onChange={(e) =>
                          dispatch(updateItem({ id: item.id, changes: { name: e.target.value } }))
                        }
                        onBlur={() => onEditIdChange?.(null)}
                        className="mr-1 rounded border px-1 text-black"
                      />
                    ) : (
                      <span onDoubleClick={() => onEditIdChange?.(item.id)} className="mr-1">
                        {item.name}
                      </span>
                    )}
                  </div>
                )}
              </td>
              <td className="py-1 text-right" onClick={(e) => e.stopPropagation()}>
                {item.type === 'script' && (
                  <>
                    <button
                      className="mr-2 text-blue-500 hover:text-blue-700"
                      onClick={() => onRun(item as Script)}
                    >
                      <Play size={16} />
                    </button>
                    <button
                      className="mr-2 text-yellow-500 hover:text-yellow-700"
                      onClick={() => onEdit(item as Script)}
                    >
                      <Edit size={16} />
                    </button>
                  </>
                )}
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => dispatch(deleteItem(item.id))}
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
          {itemsInFolder.length === 0 && (
            <tr>
              <td className="py-2 text-center text-sm text-zinc-400" colSpan={2}>
                This folder is empty. Drag items here or add a new snippet/folder.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ScriptList;
