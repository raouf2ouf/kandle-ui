import { KandelPosition } from "@/types/kandel";
import { createSlice } from "@reduxjs/toolkit";
import { createEntityAdapter } from "@reduxjs/toolkit";
import type { RootState } from "./store";

// Adapter
const offersAdapter = createEntityAdapter<KandelPosition, string>({
  selectId: (p: KandelPosition) => p.transactionHash,
});

// Selectors
export const { selectAll: selectAllOffers } = offersAdapter.getSelectors(
  (state: RootState) => state.offers,
);

type InitialState = {
  status: "loading" | "success" | "error" | "idle";
};
const initialState = offersAdapter.getInitialState<InitialState>({
  status: "idle",
});

export const offerSlice = createSlice({
  name: "offers",
  initialState: initialState,
  reducers: {
    setOffers: (state, action) => {
      if (action.payload) {
        offersAdapter.setAll(state, action.payload);
      }
    },
    addOffer: (state, action) => {
      if (action.payload) {
        offersAdapter.addOne(state, action.payload);
      }
    },
    removeOffer: (state, action) => {
      if (action.payload) {
        offersAdapter.removeOne(state, action.payload);
      }
    },
  },
  extraReducers: () => {},
});

export const { setOffers, addOffer, removeOffer } = offerSlice.actions;

export default offerSlice.reducer;
