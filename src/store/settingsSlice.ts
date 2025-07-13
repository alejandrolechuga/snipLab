import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  patched: boolean;
}

const initialState: SettingsState = {
  patched: false,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setPatched(state, action: PayloadAction<boolean>) {
      state.patched = action.payload;
    },
  },
});

export const { setPatched } = settingsSlice.actions;
export default settingsSlice.reducer;
