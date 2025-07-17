import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Script } from '../types/script';

const initialState: Script[] = [];

const scriptSlice = createSlice({
  name: 'scripts',
  initialState,
  reducers: {
    addScript(state, action: PayloadAction<Script>) {
      state.push(action.payload);
    },
    updateScript(
      state,
      action: PayloadAction<{ id: string; changes: Partial<Script> }>
    ) {
      const script = state.find((s) => s.id === action.payload.id);
      if (script) {
        Object.assign(script, action.payload.changes);
      }
    },
    deleteScript(state, action: PayloadAction<string>) {
      return state.filter((s) => s.id !== action.payload);
    },
    setScripts(_state, action: PayloadAction<Script[]>) {
      return action.payload;
    },
  },
});

export const { addScript, updateScript, deleteScript, setScripts } =
  scriptSlice.actions;

export default scriptSlice.reducer;
