"use client";

import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { useCheckInHistory, useVaultHistory } from "@/lib/hooks";

const ACT_TYPE_LABEL: Record<number, string> = {
  0: "Deposit XLM",
  1: "Deposit Token",
  2: "Deposit NFT",
  3: "Withdraw XLM",
  4: "Withdraw Token",
  5: "Withdraw NFT",
};

export function History() {
  const { address } = useAccount();
  const { data: checkInData } = useCheckInHistory(address);
  const { data: vaultData } = useVaultHistory(address);

  const checkInHistory =
    checkInData?.map((record: any) => ({
      date: new Date(Number(record.timestamp) * 1000).toLocaleDateString(
        "en-US",
        {
          month: "long",
          day: "numeric",
          year: "numeric",
        },
      ),
      timestamp: Number(record.timestamp),
      blockNumber: Number(record.blockNumber),
    })) ?? [];

  const vaultActivity =
    vaultData?.map((record: any) => {
      const actType = Number(record.actType);
      const isDeposit = actType <= 2;

      let displayAmount = "";
      let asset = "";

      if (actType === 0 || actType === 3) {
        // XLM
        displayAmount = `${formatEther(record.amount)} XLM`;
        asset = "XLM";
      } else if (actType === 2 || actType === 5) {
        // NFT
        displayAmount = `Token ID #${record.amount.toString()}`;
        asset = "NFT";
      } else {
        // ERC-20
        displayAmount = record.amount.toString();
        asset = "Token";
      }

      return {
        type: isDeposit ? "Deposit" : "Withdraw",
        label: ACT_TYPE_LABEL[actType],
        isDeposit,
        asset,
        displayAmount,
        date: new Date(Number(record.timestamp) * 1000).toLocaleDateString(
          "en-US",
          {
            month: "long",
            day: "numeric",
            year: "numeric",
          },
        ),
        timestamp: Number(record.timestamp),
        blockNumber: Number(record.blockNumber),
      };
    }) ?? [];

  if (!address) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">History</h1>
          <p className="mt-2 text-sm text-text-muted">
            Connect your wallet to view history
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">History</h1>
        <p className="mt-1 text-sm text-text-muted">
          View all your activity and transactions
        </p>
      </div>

      <div className="rounded-lg border border-brand bg-brand-pink-light p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="mb-2 text-lg font-semibold text-foreground">
              Powered by Stellar On-Chain Automation
            </h2>
            <p className="text-sm leading-relaxed text-text-muted">
              StelMemo uses Stellar's native on-chain scheduling to automate inheritance execution.
              When you register your will and set an inactivity period, a subscription is created
              that monitors your check-in activity. If the deadline passes without a check-in, the
              inheritance transfer is executed automatically by the blockchain validators — completely
              trustless, with no third-party intervention required. Every check-in you make resets
              this timer, ensuring your assets remain secure while you're active.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border-main bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Check-In History
        </h2>
        <div className="space-y-2">
          {checkInHistory.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-muted">
              No check-in history yet
            </p>
          ) : (
            checkInHistory.map((record, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-border-main bg-main p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-pink-light">
                    <svg
                      className="h-5 w-5 text-brand"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Check-In</p>
                    <p className="text-sm text-text-muted">{record.date}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border-main bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Vault Activity
        </h2>
        <div className="space-y-2">
          {vaultActivity.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-muted">
              No vault activity yet
            </p>
          ) : (
            vaultActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-border-main bg-main p-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      activity.isDeposit
                        ? "bg-brand-pink-light"
                        : "bg-gray-100"
                    }`}
                  >
                    <svg
                      className={`h-5 w-5 ${
                        activity.isDeposit ? "text-brand" : "text-gray-600"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {activity.isDeposit ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 12H4"
                        />
                      )}
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {activity.label}
                    </p>
                    <p className="text-sm text-text-muted">{activity.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">
                    {activity.displayAmount}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
