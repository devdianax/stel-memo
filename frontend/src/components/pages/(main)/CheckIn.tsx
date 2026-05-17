"use client";

import { useAccount } from "wagmi";
import { toast } from "sonner";
import { useWillInfo, useStelMemoWrite, useScheduleCron } from "@/lib/hooks";
import { STELMEMO_ABI } from "@/lib/abi";
import { CONTRACT_ADDRESS } from "@/lib/contract";
import { CountdownTimer } from "./CountdownTimer";

export function CheckIn() {
  const { address } = useAccount();
  const { data: willData } = useWillInfo(address);
  const { writeContract, isPending, isConfirming } = useStelMemoWrite();
  const { scheduleCron, isScheduling } = useScheduleCron();

  const isProcessing = isPending || isConfirming || isScheduling;
  const lastCheckIn = willData ? willData[1] : BigInt(0);
  const inactivePeriod = willData ? willData[2] : BigInt(0);
  const deadline = willData ? willData[3] : BigInt(0);

  const lastCheckInText = lastCheckIn && lastCheckIn > BigInt(0)
    ? new Date(Number(lastCheckIn) * 1000).toLocaleString()
    : "--";

  const deadlineDate = deadline ? new Date(Number(deadline)) : new Date();

  const handleCheckIn = () => {
    writeContract(
      {
        address: CONTRACT_ADDRESS,
        abi: STELMEMO_ABI,
        functionName: "checkIn",
      },
      {
        onSuccess: async () => {
          if (inactivePeriod && inactivePeriod > BigInt(0)) {
            const newDeadlineMs = Date.now() + Number(inactivePeriod) * 1000;
            try {
              await scheduleCron(newDeadlineMs);
              toast.success("Check-in successful & inheritance timer reset");
            } catch {
              toast.success("Check-in successful (cron auto-rescheduled by contract)");
            }
          } else {
            toast.success("Check-in successful. Your deadline has been reset.");
          }
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
          <h1 className="text-2xl font-bold text-foreground">Check-In</h1>
          <p className="mt-2 text-sm text-text-muted">
            Connect your wallet to check in
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Check-In</h1>
        <p className="mt-1 text-sm text-text-muted">
          Confirm you are still active
        </p>
      </div>

      <div className="rounded-lg border border-border-main bg-surface p-6">
        <h2 className="text-sm font-medium text-text-muted">Last Check-In</h2>
        <p className="mt-2 text-2xl font-bold text-foreground">
          {lastCheckInText}
        </p>
      </div>

      <div className="rounded-lg border border-border-main bg-surface p-6">
        <h2 className="mb-4 text-sm font-medium text-text-muted">
          Next Required Check-In
        </h2>
        <CountdownTimer targetDate={deadlineDate} />
        <p className="mt-4 text-sm text-text-muted">
          You must check in before the countdown ends to prevent inheritance
          execution
        </p>
      </div>

      <div className="rounded-lg border border-border-main bg-surface p-8 text-center">
        <h2 className="mb-2 text-lg font-semibold text-foreground">
          Confirm Activity
        </h2>
        <p className="mb-6 text-sm text-text-muted">
          Click the button below to reset your activity timer
        </p>
        <button
          type="button"
          onClick={handleCheckIn}
          disabled={isProcessing}
          className="cursor-pointer rounded-lg bg-brand px-8 py-4 text-base font-medium text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isProcessing ? "Processing..." : "I'm Still Active"}
        </button>
      </div>
    </div>
  );
}
