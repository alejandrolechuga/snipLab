import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DevtoolsState {
  isReady: boolean;
}

const initialState: DevtoolsState = {
  isReady: false,
};

const devtoolsSlice = createSlice({
  name: 'devtools',
  initialState,
  reducers: {
    setDevtoolsPanelReady(state, action: PayloadAction<boolean>) {
      state.isReady = action.payload;
    },
  },
});

export const { setDevtoolsPanelReady } = devtoolsSlice.actions;
export default devtoolsSlice.reducer;
