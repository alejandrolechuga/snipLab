import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Script } from '../types/script';
import { v4 as uuidv4 } from 'uuid';

const initialState: Script[] = [
  {
    id: uuidv4(),
    name: 'Snippet #1',
    description: 'Your first code snippet.',
    code: '// write or paste your snippet code here',
  },
];

const scriptSlice = createSlice({
  name: 'scripts',
  initialState,
  reducers: {
    addScript: {
      reducer(state, action: PayloadAction<Script>) {
        state.push(action.payload);
      },
      prepare(script: Omit<Script, 'id'>) {
        return { payload: { ...script, id: uuidv4() } };
      },
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
