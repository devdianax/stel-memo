export interface WillInfo {
  beneficiary: string;
  lastCheckIn: bigint;
  inactivePeriod: bigint;
  deadlineTimestamp: bigint;
  executed: boolean;
  active: boolean;
}

export type WillStatus = "Active" | "Warning" | "Inactive";

export type InactivePeriod = 30 | 90 | 180 | 365 | 0.000347222;
