import { createPublicClient, http } from "viem";
import type { WalletClient } from "viem";
import { stellarTestnet } from "./chains";

const STELLAR_RPC = "https://dream-rpc.somnia.network";

export function createReactivitySDK(_walletClient: WalletClient) {
  const _publicClient = createPublicClient({
    chain: stellarTestnet,
    transport: http(STELLAR_RPC),
  });
  return null;
}

export async function scheduleWillCronJob(
  _sdk: null,
  _deadlineTimestampMs: number,
) {
  return null;
}

export async function subscribeToWillEvents(
  _sdk: null,
  _handlerContractAddress: `0x${string}`,
) {
  return null;
}
