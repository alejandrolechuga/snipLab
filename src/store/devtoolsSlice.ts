import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DevtoolsState {
  isReady: boolean;
  contentScriptReady: boolean;
}

const initialState: DevtoolsState = {
  isReady: false,
  contentScriptReady: false,
};

const devtoolsSlice = createSlice({
  name: 'devtoolsPanel',
  initialState,
  reducers: {
    setDevtoolsPanelReady(state, action: PayloadAction<boolean>) {
      state.isReady = action.payload;
    },
    setContentScriptReady(state, action: PayloadAction<boolean>) {
      state.contentScriptReady = action.payload;
    },
  },
});

export const { setDevtoolsPanelReady, setContentScriptReady } =
  devtoolsSlice.actions;

export default devtoolsSlice.reducer;
