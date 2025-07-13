import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type MatchCountState = Record<string, number>;

const initialState: MatchCountState = {};

const matchSlice = createSlice({
  name: 'matches',
  initialState,
  reducers: {
    incrementMatch(state, action: PayloadAction<string>) {
      const id = action.payload;
      state[id] = (state[id] || 0) + 1;
    },
    resetMatches() {
      return {} as MatchCountState;
    },
    removeMatch(state, action: PayloadAction<string>) {
      delete state[action.payload];
    },
  },
});

export const { incrementMatch, resetMatches, removeMatch } = matchSlice.actions;
export default matchSlice.reducer;
