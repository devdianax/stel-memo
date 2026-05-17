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

export async function scheduleWillCronJob(
  sdk: SDK,
  deadlineTimestampMs: number,
) {
  const result = await sdk.scheduleOnchainCronJob({
    timestampMs: deadlineTimestampMs,
    handlerContractAddress: CONTRACT_ADDRESS,
    priorityFeePerGas: BigInt(1_000_000_000),
    maxFeePerGas: BigInt(20_000_000_000),
    gasLimit: BigInt(200_000),
    isGuaranteed: true,
    isCoalesced: false,
  });

  if (result instanceof Error) {
    throw result;
  }

  return result;
}

export async function subscribeToWillEvents(
  sdk: SDK,
  handlerContractAddress: `0x${string}`,
) {
  const result = await sdk.createSoliditySubscription({
    emitter: CONTRACT_ADDRESS,
    handlerContractAddress,
    priorityFeePerGas: BigInt(1_000_000_000),
    maxFeePerGas: BigInt(20_000_000_000),
    gasLimit: BigInt(200_000),
    isGuaranteed: true,
    isCoalesced: false,
  });

  if (result instanceof Error) {
    throw result;
  }

  return result;
}
