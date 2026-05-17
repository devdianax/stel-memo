import { create } from "zustand";
import type { WillInfo, WillStatus } from "@/types";

interface WillState {
  willInfo: WillInfo | null;
  status: WillStatus;
  vaultXLM: string;
  loading: boolean;
  error: string | null;
  setWillInfo: (info: WillInfo | null) => void;
  setStatus: (status: WillStatus) => void;
  setVaultXLM: (amount: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useWillStore = create<WillState>((set) => ({
  willInfo: null,
  status: "Inactive",
  vaultXLM: "0",
  loading: false,
  error: null,
  setWillInfo: (info) => set({ willInfo: info }),
  setStatus: (status) => set({ status }),
  setVaultXLM: (amount) => set({ vaultXLM: amount }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      willInfo: null,
      status: "Inactive",
      vaultXLM: "0",
      loading: false,
      error: null,
    }),
}));
