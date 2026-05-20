import type { RegisterPasswordPayload, RegisterQualificationPayload } from "@/types/domain";

const latency = 600;

function resolveMock<T>(data: T): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(data), latency);
  });
}

export function uploadStatScreenshot(file: File): Promise<{ fileName: string; uploadedAt: string }> {
  // TODO: Replace with real evidence upload endpoint when registration backend is ready.
  return resolveMock({ fileName: file.name, uploadedAt: new Date().toISOString() });
}

export async function submitQualificationEvidence(payload: RegisterQualificationPayload): Promise<{ evidenceId: string }> {
  // TODO: Persist qualification evidence and moderation status through the backend.
  if (!payload.statScreenshot) {
    throw new Error("Screenshot evidence is required.");
  }

  await uploadStatScreenshot(payload.statScreenshot);
  return resolveMock({ evidenceId: `evidence-${Date.now()}` });
}

export function createPlayerAccount(
  qualification: RegisterQualificationPayload,
  passwordPayload: RegisterPasswordPayload
): Promise<{ accountId: string }> {
  // TODO: Replace with real account creation/auth session endpoint.
  if (passwordPayload.password !== passwordPayload.confirmPassword) {
    throw new Error("Passwords do not match.");
  }

  return resolveMock({ accountId: `player-${qualification.gameTag.toLowerCase().replace(/[^a-z0-9]/g, "-")}` });
}
