import type { PlayerMeDashboard } from "@/types/domain";

function normalize(value: unknown): string {
  if (typeof value === "boolean") {
    return value ? "approved" : "pending";
  }
  if (typeof value === "string") {
    return value.trim().toLowerCase();
  }
  return "";
}

export function getApprovalStatus(data?: PlayerMeDashboard | null): string {
  const candidates = [
    data?.player?.approvalStatus,
    data?.membership?.approvalStatus,
    data?.membership?.status,
    data?.user?.approvalStatus,
    data?.user?.isApproved,
    data?.user?.status
  ];

  for (const value of candidates) {
    const normalized = normalize(value);
    if (normalized) {
      return normalized;
    }
  }

  return "pending";
}

export function isApprovedPlayer(data?: PlayerMeDashboard | null): boolean {
  const status = getApprovalStatus(data);
  return status === "approved" || status === "true";
}
