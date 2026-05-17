"use client";

import Link from "next/link";
import { useConnection } from "wagmi";
import { formatEther } from "viem";
import { useWillInfo, useWillStatus, useVaultXLM, formatStatus } from "@/lib/hooks";
import { StatusBadge } from "./StatusBadge";
import { CountdownTimer } from "./CountdownTimer";
import { DashboardStats } from "./DashboardStats";

export function Dashboard() {
  const { address } = useConnection();
  const { data: willData, isLoading: willLoading } = useWillInfo(address);
  const { data: statusData } = useWillStatus(address);
  const { data: vaultData } = useVaultXLM(address);

  const status = formatStatus(statusData as string | undefined);
  const vaultBalance = vaultData ? formatEther(vaultData) : "0";

  const hasWill = willData && willData[5];
  const beneficiary = willData ? (willData[0] as string) : "";
  const lastCheckIn = willData ? willData[1] : BigInt(0);
  const inactivePeriod = willData ? willData[2] : BigInt(0);
  const deadline = willData ? willData[3] : BigInt(0);

  const deadlineDate = deadline ? new Date(Number(deadline)) : new Date();

  const lastActivityText = lastCheckIn && lastCheckIn > BigInt(0)
    ? new Date(Number(lastCheckIn) * 1000).toLocaleString()
    : "--";

  const inactiveDays = inactivePeriod && inactivePeriod > BigInt(0)
    ? `${Number(inactivePeriod) / 86400} days`
    : "--";

  if (!address) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-2 text-sm text-text-muted">
            Connect your wallet to view your inheritance status
          </p>
        </div>
      </div>
    );
  }

  if (willLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-text-muted">
            Monitor your inheritance status and activity
          </p>
        </div>
        <StatusBadge status={status.toLowerCase() as "active" | "warning" | "inactive"} />
      </div>

      {hasWill && (
        <div className="rounded-lg border border-border-main bg-surface p-6">
          <h2 className="text-sm font-medium text-text-muted">
            Time Remaining Until Inactivity
          </h2>
          <div className="mt-4">
            <CountdownTimer targetDate={deadlineDate} />
          </div>
        </div>
      )}

      <DashboardStats
        walletAddress={address}
        beneficiaryAddress={beneficiary || "Not set"}
        lastActivity={lastActivityText}
        inactivityPeriod={inactiveDays}
        vaultBalance={`${vaultBalance} XLM`}
      />

      {hasWill ? (
        <div className="rounded-lg border border-border-main bg-surface p-6">
          <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
          <div className="mt-4 flex gap-3">
            <Link
              href="/main/checkin"
              className="cursor-pointer rounded-lg bg-brand px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
            >
              Check In Now
            </Link>
            <Link
              href="/main/vault"
              className="cursor-pointer rounded-lg border border-brand bg-white px-6 py-3 text-sm font-medium text-brand transition-colors hover:bg-brand-pink-light"
            >
              Manage Vault
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-border-main bg-surface p-8 text-center">
          <h2 className="text-lg font-semibold text-foreground">
            No Active Will
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            Register your digital will to start protecting your assets
          </p>
          <Link
            href="/main/settings"
            className="mt-4 inline-block cursor-pointer rounded-lg bg-brand px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
          >
            Register Will
          </Link>
        </div>
      )}
    </div>
  );
}
