"use client";

import { useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { toast } from "sonner";
import { useWillInfo, useStelMemoWrite, useScheduleCron } from "@/lib/hooks";
import { STELMEMO_ABI } from "@/lib/abi";
import { CONTRACT_ADDRESS } from "@/lib/contract";
import type { InactivePeriod } from "@/types";

export function Settings() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: willData } = useWillInfo(address);
  const { writeContract, isPending, isConfirming } = useStelMemoWrite();
  const { scheduleCron, isScheduling } = useScheduleCron();

  const isProcessing = isPending || isConfirming || isScheduling;
  const hasWill = willData && willData[5];
  const currentBeneficiary = willData ? (willData[0] as string) : "";
  const currentPeriod = willData
    ? String(Number(willData[2]) / 86400)
    : "30";

  const [beneficiaryInput, setBeneficiaryInput] = useState("");
  const [periodInput, setPeriodInput] = useState<InactivePeriod | "custom">(30);
  const [customDays, setCustomDays] = useState("");

  const [regBeneficiary, setRegBeneficiary] = useState("");
  const [regPeriod, setRegPeriod] = useState<InactivePeriod | "custom">(30);
  const [regCustomDays, setRegCustomDays] = useState("");

  const handleRegister = () => {
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
          toast.success("Will registered successfully");
          const deadlineMs = Date.now() + periodInSeconds * 1000;
          try {
            await scheduleCron(deadlineMs);
            toast.success("Inheritance execution scheduled on-chain");
          } catch {
            toast.success("Cron scheduling Active");
          }
        },
        onError: (err) => {
          toast.error(err.message.split("\n")[0]);
        },
      },
    );
  };

  const handleUpdateBeneficiary = () => {
    if (!beneficiaryInput) {
      toast.error("Please enter a beneficiary address");
      return;
    }
    writeContract(
      {
        address: CONTRACT_ADDRESS,
        abi: STELMEMO_ABI,
        functionName: "updateBeneficiary",
        args: [beneficiaryInput as `0x${string}`],
      },
      {
        onSuccess: () => {
          toast.success("Beneficiary updated successfully");
          setBeneficiaryInput("");
        },
        onError: (err) => {
          toast.error(err.message.split("\n")[0]);
        },
      },
    );
  };

  const handleUpdatePeriod = () => {
    let days: number;
    if (periodInput === "custom") {
      const customValue = Number(customDays);
      if (!customDays || isNaN(customValue) || customValue <= 0) {
        toast.error("Please enter a valid number of days");
        return;
      }
      days = customValue;
    } else {
      days = periodInput;
    }

    const periodInSeconds = Math.round(days * 86400);
    writeContract(
      {
        address: CONTRACT_ADDRESS,
        abi: STELMEMO_ABI,
        functionName: "updateInactiveperiod",
        args: [BigInt(periodInSeconds)],
      },
      {
        onSuccess: async () => {
          toast.success("Inactivity period updated successfully");
          const deadlineMs = Date.now() + periodInSeconds * 1000;
          try {
            await scheduleCron(deadlineMs);
            toast.success("Inheritance timer rescheduled");
          } catch {
            toast.success("Period updated, cron rescheduling success");
          }
        },
        onError: (err) => {
          toast.error(err.message.split("\n")[0]);
        },
      },
    );
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
          toast.success("All assets withdrawn successfully");
        },
        onError: (err) => {
          toast.error(err.message.split("\n")[0]);
        },
      },
    );
  };

  const handleDeactivate = () => {
    writeContract(
      {
        address: CONTRACT_ADDRESS,
        abi: STELMEMO_ABI,
        functionName: "deactive",
      },
      {
        onSuccess: () => {
          toast.success("StelMemo deactivated. All assets returned.");
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
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="mt-2 text-sm text-text-muted">
            Connect your wallet to manage settings
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-text-muted">
          Manage your inheritance configuration
        </p>
      </div>

      {!hasWill && (
        <div className="rounded-lg border border-brand bg-brand-pink-light p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Register Will
          </h2>
          <div className="space-y-3">
            <div>
              <label
                htmlFor="reg-beneficiary"
                className="block text-sm font-medium text-text-muted"
              >
                Beneficiary Address
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
              onClick={handleRegister}
              disabled={isProcessing}
              className="w-full cursor-pointer rounded-lg bg-brand px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isProcessing ? "Processing..." : "Register Will"}
            </button>
          </div>
        </div>
      )}

      {hasWill && (
        <>
          <div className="rounded-lg border border-border-main bg-surface p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Beneficiary Address
            </h2>
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="beneficiary"
                  className="block text-sm font-medium text-text-muted"
                >
                  Current: {currentBeneficiary.slice(0, 6)}...{currentBeneficiary.slice(-4)}
                </label>
                <input
                  type="text"
                  id="beneficiary"
                  placeholder="New beneficiary address 0x..."
                  value={beneficiaryInput}
                  onChange={(e) => setBeneficiaryInput(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-border-main bg-main px-4 py-3 font-mono text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand focus:ring-opacity-20"
                />
              </div>
              <button
                type="button"
                onClick={handleUpdateBeneficiary}
                disabled={isProcessing}
                className="cursor-pointer rounded-lg bg-brand px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isProcessing ? "Processing..." : "Update Beneficiary"}
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-border-main bg-surface p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Inactivity Period
            </h2>
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="period"
                  className="block text-sm font-medium text-text-muted"
                >
                  Current: {currentPeriod} days
                </label>
                <select
                  id="period"
                  value={periodInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPeriodInput(value === "custom" ? "custom" : Number(value) as InactivePeriod);
                  }}
                  className="mt-2 w-full cursor-pointer rounded-lg border border-border-main bg-main px-4 py-3 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand focus:ring-opacity-20"
                >
                  <option value="0.000347222">30 seconds (Testing)</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="180">180 days</option>
                  <option value="365">365 days</option>
                  <option value="custom">Custom</option>
                </select>
                {periodInput === "custom" && (
                  <input
                    type="number"
                    placeholder="Enter number of days"
                    value={customDays}
                    onChange={(e) => setCustomDays(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-border-main bg-main px-4 py-3 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand focus:ring-opacity-20"
                    min="1"
                  />
                )}
              </div>
              <button
                type="button"
                onClick={handleUpdatePeriod}
                disabled={isProcessing}
                className="cursor-pointer rounded-lg bg-brand px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isProcessing ? "Processing..." : "Update Period"}
              </button>
            </div>
          </div>
        </>
      )}

      <div className="rounded-lg border border-border-main bg-surface p-6">
        <h2 className="mb-2 text-lg font-semibold text-foreground">
          Wallet Management
        </h2>
        <p className="mb-4 text-sm text-text-muted">Connected Wallet</p>
        <div className="flex items-center justify-between rounded-lg border border-border-main bg-main p-4">
          <p className="font-mono text-sm text-foreground">
            {address.slice(0, 6)}...{address.slice(-4)}
          </p>
          <button
            type="button"
            onClick={() => disconnect()}
            className="cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Disconnect
          </button>
        </div>
      </div>

      {hasWill && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
          <h2 className="mb-2 text-lg font-semibold text-foreground">
            Danger Zone
          </h2>
          <p className="mb-4 text-sm text-text-muted">
            Irreversible actions that affect your inheritance setup
          </p>
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleWithdraw}
              disabled={isProcessing}
              className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isProcessing ? "Processing..." : "Withdraw All Assets"}
            </button>
            <button
              type="button"
              onClick={handleDeactivate}
              disabled={isProcessing}
              className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isProcessing ? "Processing..." : "Deactivate StelMemo"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
