import { Kandel } from "@/types/kandel";
import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import { createEntityAdapter } from "@reduxjs/toolkit";
import type { RootState } from "./store";
import { Address } from "viem";

// Adapter
const kandelsAdapter = createEntityAdapter<Kandel, string>({
  selectId: (p: Kandel) => p.kandelAddress,
});

// Selectors
export const { selectAll: selectAllKandels } = kandelsAdapter.getSelectors(
  (state: RootState) => state.kandels,
);
export const selectCurrentKandel = (state: RootState): Kandel | null => {
  if (!state.kandels.currentKandelAddress) return null;
  return state.kandels.entities[state.kandels.currentKandelAddress];
};

export const selectKandelsOfOwner = createSelector(
  [
    selectAllKandels,
    (state, owner: Address | undefined) => owner?.toLowerCase(),
  ],
  (kandels, ownerAddress) => {
    const userKandels = kandels.filter(
      (kandel) => kandel.owner == ownerAddress,
    );
    return userKandels;
  },
);

type InitialState = {
  status: "loading" | "success" | "error" | "idle";
  currentKandelAddress?: Address | null | undefined;
};
const initialState = kandelsAdapter.getInitialState<InitialState>({
  status: "idle",
});

export const kandelSlice = createSlice({
  name: "kandels",
  initialState: initialState,
  reducers: {
    setKandels: (state, action) => {
      if (action.payload) {
        kandelsAdapter.setAll(state, action.payload);
      }
    },
    addKandel: (state, action) => {
      if (action.payload) {
        kandelsAdapter.upsertOne(state, action.payload);
      }
    },
    removeKandel: (state, action) => {
      if (action.payload) {
        kandelsAdapter.removeOne(state, action.payload);
      }
    },
    setCurrentKandelAddress: (state, action) => {
      state.currentKandelAddress = action.payload;
    },
    updateKandel: (
      state,
      action: PayloadAction<{ id: string; changes: Partial<Kandel> }>,
    ) => {
      if (action.payload) {
        kandelsAdapter.updateOne(state, action.payload);
      }
    },
  },
  extraReducers: () => {},
});

export const {
  setKandels,
  addKandel,
  removeKandel,
  setCurrentKandelAddress,
  updateKandel,
} = kandelSlice.actions;

export default kandelSlice.reducer;
