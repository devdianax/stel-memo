interface StatCardProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border-main bg-surface p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-text-muted">{label}</p>
          <p className="mt-2 text-lg font-semibold text-foreground">{value}</p>
        </div>
        {icon && <div className="text-brand">{icon}</div>}
      </div>
    </div>
  );
}

interface DashboardStatsProps {
  walletAddress: string;
  beneficiaryAddress: string;
  lastActivity: string;
  inactivityPeriod: string;
  vaultBalance: string;
}

export function DashboardStats({
  walletAddress,
  beneficiaryAddress,
  lastActivity,
  inactivityPeriod,
  vaultBalance,
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StatCard
        label="Wallet Address"
        value={`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
        icon={
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        }
      />
      <StatCard
        label="Beneficiary Address"
        value={`${beneficiaryAddress.slice(0, 6)}...${beneficiaryAddress.slice(-4)}`}
        icon={
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        }
      />
      <StatCard
        label="Last Activity"
        value={lastActivity}
        icon={
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
      />
      <StatCard
        label="Inactivity Period"
        value={inactivityPeriod}
        icon={
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        }
      />
      <StatCard
        label="Vault Balance"
        value={vaultBalance}
        icon={
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
      />
    </div>
  );
}
