import { useState, useCallback } from "react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { STELMEMO_ABI } from "./abi";
import { CONTRACT_ADDRESS } from "./contract";
import type { WillStatus } from "@/types";

export function useWillInfo(ownerAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: STELMEMO_ABI,
    functionName: "getWillInfo",
    args: ownerAddress ? [ownerAddress] : undefined,
    query: { enabled: !!ownerAddress },
  });
}

export function useWillStatus(ownerAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: STELMEMO_ABI,
    functionName: "getStatus",
    args: ownerAddress ? [ownerAddress] : undefined,
    query: { enabled: !!ownerAddress },
  });
}

export function useVaultXLM(ownerAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: STELMEMO_ABI,
    functionName: "vaultXLM",
    args: ownerAddress ? [ownerAddress] : undefined,
    query: { enabled: !!ownerAddress },
  });
}

export function useCheckInHistory(ownerAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: STELMEMO_ABI,
    functionName: "getCheckInHistory",
    args: ownerAddress ? [ownerAddress] : undefined,
    query: { enabled: !!ownerAddress },
  });
}

export function useVaultHistory(ownerAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: STELMEMO_ABI,
    functionName: "getVaultHistory",
    args: ownerAddress ? [ownerAddress] : undefined,
    query: { enabled: !!ownerAddress },
  });
}

export function useStelMemoWrite() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  return { writeContract, hash, isPending, isConfirming, isSuccess, error };
}

export function formatStatus(status: string | undefined): WillStatus {
  if (status === "Active") return "Active";
  if (status === "Warning") return "Warning";
  return "Inactive";
}

export function useScheduleCron() {
  const [isScheduling, setIsScheduling] = useState(false);
  const [cronTxHash, setCronTxHash] = useState<string | null>(null);

  const scheduleCron = useCallback(
    async (_deadlineTimestampMs: number) => {
      setIsScheduling(true);
      setCronTxHash("scheduled-onchain");
      setIsScheduling(false);
      return "scheduled-onchain";
    },
    [],
  );

  return { scheduleCron, isScheduling, cronTxHash };
}
