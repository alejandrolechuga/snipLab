import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { FeatureFlags } from '../types/features';
import { defaultFeatureFlags } from '../types/features';

const featureSlice = createSlice({
  name: 'features',
  initialState: defaultFeatureFlags,
  reducers: {
    setFeatures(state, action: PayloadAction<Partial<FeatureFlags>>) {
      return { ...state, ...action.payload };
    },
  },
});

export const { setFeatures } = featureSlice.actions;
export default featureSlice.reducer;
