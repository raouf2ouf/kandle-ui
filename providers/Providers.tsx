"use client";

import { store } from "@/stores/store";
import { WalletProvider } from "./WalletProvider";
import { Provider } from "react-redux";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <WalletProvider>{children}</WalletProvider>;
    </Provider>
  );
}
