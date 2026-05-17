"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import { parseEther, formatEther } from "viem";
import { toast } from "sonner";
import { useVaultXLM, useWillInfo, useStelMemoWrite, useScheduleCron } from "@/lib/hooks";
import { STELMEMO_ABI } from "@/lib/abi";
import { CONTRACT_ADDRESS } from "@/lib/contract";
import type { InactivePeriod } from "@/types";

interface TokenOption {
  name: string;
  symbol: string;
  logo: string;
  type: "native" | "erc20";
  disabled?: boolean;
}

const TOKEN_OPTIONS: TokenOption[] = [
  {
    name: "Stellar Token",
    symbol: "XLM",
    logo: "/Assets/Images/Logo/stellar-logo.svg",
    type: "native",
    disabled: false,
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    logo: "/Assets/Images/Logo/eth-logo.svg",
    type: "erc20",
    disabled: true,
  },
  {
    name: "USD Coin",
    symbol: "USDC",
    logo: "/Assets/Images/Logo/usdc-logo.webp",
    type: "erc20",
    disabled: true,
  },
];

export function Vault() {
  const { address } = useAccount();
  const { data: vaultData, refetch: refetchVault } = useVaultXLM(address);
  const { data: willData } = useWillInfo(address);
  const { writeContract, isPending, isConfirming } = useStelMemoWrite();
  const { scheduleCron, isScheduling } = useScheduleCron();

  const [showDepositForm, setShowDepositForm] = useState(false);
  const [selectedToken, setSelectedToken] = useState<TokenOption | null>(null);
  const [showTokenSelector, setShowTokenSelector] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");

  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [regBeneficiary, setRegBeneficiary] = useState("");
  const [regPeriod, setRegPeriod] = useState<InactivePeriod | "custom">(30);
  const [regCustomDays, setRegCustomDays] = useState("");

  const vaultBalance = vaultData ? formatEther(vaultData) : "0";
  const beneficiary = willData ? (willData[0] as string) : "";
  const lastCheckIn = willData ? willData[1] : BigInt(0);
  const inactivePeriod = willData ? willData[2] : BigInt(0);
  const deadlineTimestamp = willData ? willData[3] : BigInt(0);
  const executed = willData ? willData[4] : false;
  const hasWill = willData && willData[5];
  const isProcessing = isPending || isConfirming || isScheduling;

  const handleDeposit = () => {
    if (!selectedToken || !depositAmount || Number(depositAmount) <= 0) {
      toast.error("Please select a token and enter a valid amount");
      return;
    }

    if (selectedToken.type === "native") {
      writeContract(
        {
          address: CONTRACT_ADDRESS,
          abi: STELMEMO_ABI,
          functionName: "depositXLM",
          value: parseEther(depositAmount),
        },
        {
          onSuccess: () => {
            toast.success("Deposit successful");
            setShowDepositForm(false);
            setSelectedToken(null);
            setDepositAmount("");
            refetchVault();
          },
          onError: (err) => {
            toast.error(err.message.split("\n")[0]);
          },
        },
      );
    }
  };

  const handleWithdraw = () => {
    writeContract(
      {
        address: CONTRACT_ADDRESS,
        abi: STELMEMO_ABI,
        functionName: "withdraw",
      },
      {
        onSuccess: () => {
          toast.success("Withdrawal successful");
          refetchVault();
        },
        onError: (err) => {
          toast.error(err.message.split("\n")[0]);
        },
      },
    );
  };

  const handleRegisterWill = () => {
    if (!regBeneficiary) {
      toast.error("Please enter a beneficiary address");
      return;
    }

    let days: number;
    if (regPeriod === "custom") {
      const customValue = Number(regCustomDays);
      if (!regCustomDays || isNaN(customValue) || customValue <= 0) {
        toast.error("Please enter a valid number of days");
        return;
      }
      days = customValue;
    } else {
      days = regPeriod;
    }

    const periodInSeconds = Math.round(days * 86400);
    writeContract(
      {
        address: CONTRACT_ADDRESS,
        abi: STELMEMO_ABI,
        functionName: "registerWill",
        args: [regBeneficiary as `0x${string}`, BigInt(periodInSeconds)],
      },
      {
        onSuccess: async () => {
          const deadlineMs = Date.now() + periodInSeconds * 1000;
          try {
            await scheduleCron(deadlineMs);
            toast.success("Will registered & inheritance scheduled successfully");
          } catch {
            toast.success("Will registered successfully (cron auto-scheduled by contract)");
          }
          setShowRegisterForm(false);
        },
        onError: (err) => {
          toast.error(err.message.split("\n")[0]);
        },
      },
    );
  };

  if (!address) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Vault</h1>
          <p className="mt-2 text-sm text-text-muted">
            Connect your wallet to manage your vault
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Vault</h1>
        <p className="mt-1 text-sm text-text-muted">
          Manage assets for inheritance
        </p>
      </div>

      <div className="rounded-lg border border-border-main bg-surface p-6">
        <h2 className="text-sm font-medium text-text-muted">
          Total Vault Value
        </h2>
        <p className="mt-2 text-3xl font-bold text-foreground">
          {vaultBalance} XLM
        </p>
      </div>

      <div className="rounded-lg border border-border-main bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Assets in Vault
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-border-main bg-main p-4">
            <div className="flex items-center gap-3">
              <Image
                src="/Assets/Images/Logo/stellar-logo.svg"
                alt="XLM"
                width={32}
                height={32}
                className="rounded-full"
              />
              <div>
                <p className="font-medium text-foreground">Stellar Token</p>
                <p className="text-sm text-text-muted">XLM</p>
              </div>
            </div>
            <p className="text-lg font-semibold text-foreground">
              {vaultBalance}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border-main bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Manage Assets
        </h2>
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setShowDepositForm(true)}
            disabled={isProcessing}
            className="w-full cursor-pointer rounded-lg bg-brand px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            Deposit Token
          </button>
          <button
            type="button"
            onClick={handleWithdraw}
            disabled={isProcessing}
            className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing ? "Processing..." : "Withdraw"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showDepositForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur-lg p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-2xl rounded-lg border border-border-main bg-surface p-8"
            >
              <h2 className="mb-6 text-xl font-semibold text-foreground">
                Deposit Token
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted">
                    Select Token
                  </label>
                  <div className="relative mt-2">
                    <button
                      type="button"
                      onClick={() => setShowTokenSelector(!showTokenSelector)}
                      className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-border-main bg-main px-4 py-3 text-sm text-foreground transition-colors hover:border-brand"
                    >
                      {selectedToken ? (
                        <div className="flex items-center gap-3">
                          <Image
                            src={selectedToken.logo}
                            alt={selectedToken.name}
                            width={24}
                            height={24}
                            className="rounded-full"
                          />
                          <span>
                            {selectedToken.name} ({selectedToken.symbol})
                          </span>
                        </div>
                      ) : (
                        <span className="text-text-muted">Choose a token</span>
                      )}
                      <svg
                        className={`h-5 w-5 text-text-muted transition-transform ${
                          showTokenSelector ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {showTokenSelector && (
                      <div className="absolute z-10 mt-2 w-full rounded-lg border border-border-main bg-surface">
                        {TOKEN_OPTIONS.map((token) => (
                          <button
                            key={token.symbol}
                            type="button"
                            onClick={() => {
                              if (!token.disabled) {
                                setSelectedToken(token);
                                setShowTokenSelector(false);
                              }
                            }}
                            disabled={token.disabled}
                            className={`flex w-full items-center justify-between gap-3 border-b border-border-main px-4 py-3 text-sm transition-colors last:border-b-0 ${
                              token.disabled
                                ? "cursor-not-allowed opacity-50"
                                : "cursor-pointer hover:bg-brand-pink-light"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Image
                                src={token.logo}
                                alt={token.name}
                                width={24}
                                height={24}
                                className="rounded-full"
                              />
                              <span className="text-foreground">
                                {token.name} ({token.symbol})
                              </span>
                            </div>
                            {token.disabled && (
                              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                                Coming Soon
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="amount"
                    className="block text-sm font-medium text-text-muted"
                  >
                    Amount
                  </label>
                  <input
                    type="text"
                    id="amount"
                    placeholder="0.0"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-border-main bg-main px-4 py-3 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand focus:ring-opacity-20"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleDeposit}
                    disabled={isProcessing}
                    className="flex-1 cursor-pointer rounded-lg bg-brand px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isProcessing ? "Processing..." : "Confirm Deposit"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDepositForm(false);
                      setSelectedToken(null);
                      setShowTokenSelector(false);
                      setDepositAmount("");
                    }}
                    className="flex-1 cursor-pointer rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!hasWill && (
        <div className="rounded-lg border border-brand bg-brand-pink-light p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Register Will
            </h2>
            <button
              type="button"
              onClick={() => setShowRegisterForm(!showRegisterForm)}
              className="cursor-pointer rounded-lg border border-border-main px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-white"
            >
              {showRegisterForm ? "Hide" : "Show Form"}
            </button>
          </div>

          {showRegisterForm && (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="reg-beneficiary"
                  className="block text-sm font-medium text-text-muted"
                >
                  Beneficiary Wallet Address
                </label>
                <input
                  type="text"
                  id="reg-beneficiary"
                  placeholder="0x..."
                  value={regBeneficiary}
                  onChange={(e) => setRegBeneficiary(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-border-main bg-surface px-4 py-3 font-mono text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand focus:ring-opacity-20"
                />
              </div>
              <div>
                <label
                  htmlFor="reg-period"
                  className="block text-sm font-medium text-text-muted"
                >
                  Inactivity Period
                </label>
                <select
                  id="reg-period"
                  value={regPeriod}
                  onChange={(e) => {
                    const value = e.target.value;
                    setRegPeriod(value === "custom" ? "custom" : Number(value) as InactivePeriod);
                  }}
                  className="mt-2 w-full cursor-pointer rounded-lg border border-border-main bg-surface px-4 py-3 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand focus:ring-opacity-20"
                >
                  <option value="0.000347222">30 seconds (Testing)</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="180">180 days</option>
                  <option value="365">365 days</option>
                  <option value="custom">Custom</option>
                </select>
                {regPeriod === "custom" && (
                  <input
                    type="number"
                    placeholder="Enter number of days"
                    value={regCustomDays}
                    onChange={(e) => setRegCustomDays(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-border-main bg-surface px-4 py-3 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand focus:ring-opacity-20"
                    min="1"
                  />
                )}
              </div>
              <button
                type="button"
                onClick={handleRegisterWill}
                disabled={isProcessing}
                className="w-full cursor-pointer rounded-lg bg-brand px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isProcessing ? "Processing..." : "Register Will"}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="rounded-lg border border-border-main bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Inheritance Details
        </h2>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-text-muted">Beneficiary</p>
            <p className="mt-1 font-mono text-sm text-foreground">
              {beneficiary ? `${beneficiary.slice(0, 6)}...${beneficiary.slice(-4)}` : "Not registered"}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-text-muted">Last Check-In</p>
              <p className="mt-1 text-sm text-foreground">
                {lastCheckIn && lastCheckIn > BigInt(0)
                  ? new Date(Number(lastCheckIn) * 1000).toLocaleString()
                  : "No check-in yet"}
              </p>
            </div>
            <div>
              <p className="text-sm text-text-muted">Inactive Period</p>
              <p className="mt-1 text-sm text-foreground">
                {inactivePeriod && inactivePeriod > BigInt(0)
                  ? `${Math.round(Number(inactivePeriod) / 86400)} days`
                  : "Not set"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-text-muted">Deadline</p>
              <p className="mt-1 text-sm text-foreground">
                {deadlineTimestamp && deadlineTimestamp > BigInt(0)
                  ? new Date(Number(deadlineTimestamp)).toLocaleString()
                  : "Not set"}
              </p>
            </div>
            <div>
              <p className="text-sm text-text-muted">Status</p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {executed ? "Executed" : hasWill ? "Active" : "Not registered"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
