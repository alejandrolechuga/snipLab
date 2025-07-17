import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import type { ListItems, ListItem, ItemData } from '../types/script';

export type ItemsState = ListItems;

const initialState: ItemsState = {};

const itemsSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    addScript: {
      reducer(state, action: PayloadAction<ListItem>) {
        state[action.payload.index] = action.payload;
      },
      prepare(data: { name: string; code: string; parentId?: string }) {
        const id = uuidv4();
        const item: ListItem = {
          index: id,
          children: [],
          isFolder: false,
          data: { type: 'script', script: { id, name: data.name, description: '', code: data.code, parentId: data.parentId } },
        };
        return { payload: item };
      },
    },
    addFolder: {
      reducer(state, action: PayloadAction<ListItem>) {
        state[action.payload.index] = action.payload;
      },
      prepare(data: { name: string; parentId?: string }) {
        const id = uuidv4();
        const item: ListItem = {
          index: id,
          children: [],
          isFolder: true,
          data: { type: 'folder', folder: { id, name: data.name, parentId: data.parentId } },
        };
        return { payload: item };
      },
    },
    updateItem(state, action: PayloadAction<{ id: string; changes: Partial<ItemData> }>) {
      const item = state[action.payload.id];
      if (item) {
        item.data = { ...item.data, ...action.payload.changes } as ItemData;
      }
    },
    deleteItem(state, action: PayloadAction<string>) {
      const remove = (id: string | number) => {
        const item = state[id];
        if (!item) return;
        if (item.children) item.children.forEach(remove);
        delete state[id];
      };
      remove(action.payload);
    },
    moveItem(state, action: PayloadAction<{ id: string; newParentId: string | undefined }>) {
      const { id, newParentId } = action.payload;
      const item = state[id];
      if (!item) return;
      // remove from old parent's children
      const oldParentId = (item.data.type === 'script' ? item.data.script.parentId : item.data.folder.parentId) || undefined;
      if (oldParentId && state[oldParentId]) {
        state[oldParentId].children = state[oldParentId].children?.filter((cid) => cid !== id) || [];
      }
      // add to new parent
      if (newParentId && state[newParentId]) {
        state[newParentId].children = [...(state[newParentId].children || []), id];
      }
      if (item.data.type === 'script') {
        item.data.script.parentId = newParentId;
      } else {
        item.data.folder.parentId = newParentId;
      }
    },
    setItems(_state, action: PayloadAction<ItemsState>) {
      return action.payload;
    },
  },
});

export const { addScript, addFolder, updateItem, deleteItem, moveItem, setItems } = itemsSlice.actions;

export default itemsSlice.reducer;
