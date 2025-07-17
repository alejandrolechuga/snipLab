import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import type { ListItem, Script, Folder } from '../types/script';

interface ItemsState {
  items: ListItem[];
  selectedFolderId: string | null;
  expandedFolders: string[];
}

const initialState: ItemsState = {
  items: [],
  selectedFolderId: null,
  expandedFolders: [],
};

const itemsSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    addScript: {
      reducer(state, action: PayloadAction<Script>) {
        state.items.push(action.payload);
      },
      prepare(payload: Omit<Script, 'id' | 'type'> & { parentId: string | null }) {
        return {
          payload: { ...payload, id: uuidv4(), type: 'script' } as Script,
        };
      },
    },
    addFolder: {
      reducer(state, action: PayloadAction<Folder>) {
        state.items.push(action.payload);
      },
      prepare(payload: { parentId: string | null }) {
        return {
          payload: { id: uuidv4(), name: 'New Folder', parentId: payload.parentId, type: 'folder' } as Folder,
        };
      },
    },
    updateItem(state, action: PayloadAction<{ id: string; changes: Partial<ListItem> }>) {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) {
        if (action.payload.changes.parentId === undefined && 'parentId' in action.payload.changes === false) {
          delete (action.payload.changes as any).parentId;
        }
        Object.assign(item, action.payload.changes);
      }
    },
    deleteItem(state, action: PayloadAction<string>) {
      const deleteRecursive = (id: string) => {
        const children = state.items.filter((i) => i.parentId === id);
        children.forEach((child) => deleteRecursive(child.id));
        state.items = state.items.filter((i) => i.id !== id);
      };
      deleteRecursive(action.payload);
      if (state.selectedFolderId === action.payload) {
        state.selectedFolderId = null;
      }
    },
    setItems(state, action: PayloadAction<ListItem[]>) {
      // Ensure items is always an array to avoid runtime errors
      state.items = Array.isArray(action.payload) ? action.payload : [];
    },
    setSelectedFolderId(state, action: PayloadAction<string | null>) {
      state.selectedFolderId = action.payload;
    },
    setExpandedFolders(state, action: PayloadAction<string[]>) {
      state.expandedFolders = action.payload;
    }
  },
});

export const { addScript, addFolder, updateItem, deleteItem, setItems, setSelectedFolderId, setExpandedFolders } = itemsSlice.actions;

export default itemsSlice.reducer;
