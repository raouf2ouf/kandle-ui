import { combineReducers, configureStore } from "@reduxjs/toolkit";
import offersSlice from "./offers.slice";
import kandelsSlice from "./kandel.slice";

const rootReducer = combineReducers({
  offers: offersSlice,
  kandels: kandelsSlice,
});

export const setupStore = (preloadedState?: RootState) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    devTools: false,
  });
};
export const store = setupStore();

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = typeof store.dispatch;
