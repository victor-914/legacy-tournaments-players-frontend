import { apiClient } from "@/services/apiClient";
import type {
  ApiResponse,
  Player,
  RegisterPasswordPayload,
  RegisterQualificationPayload
} from "@/types/domain";

export interface UploadedStatScreenshot {
  url: string;
  key: string;
  fileName: string;
  mimeType: string;
  uploadedAt: string;
}

interface PresignedStatScreenshotUpload {
  uploadUrl: string;
  fileUrl: string;
  key: string;
  fileName: string;
  mimeType: string;
}

function unwrap<T>(response: { data: ApiResponse<T> }): T {
  return response.data.data;
}

export async function uploadStatScreenshot(
  file: File
): Promise<UploadedStatScreenshot> {
  const presignedUpload = unwrap(
    await apiClient.post<ApiResponse<PresignedStatScreenshotUpload>>(
      "/uploads/stat-screenshot/presign",
      {
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size
      }
    )
  );

  const uploadResponse = await fetch(presignedUpload.uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type
    },
    body: file
  });

  if (!uploadResponse.ok) {
    throw new Error("Unable to upload screenshot evidence to S3.");
  }

  return {
    url: presignedUpload.fileUrl,
    key: presignedUpload.key,
    fileName: presignedUpload.fileName,
    mimeType: presignedUpload.mimeType,
    uploadedAt: new Date().toISOString()
  };
}

export async function submitQualificationEvidence(
  payload: RegisterQualificationPayload
): Promise<{ evidenceId: string; statScreenshot: UploadedStatScreenshot }> {
  if (!payload.statScreenshot && !payload.statScreenshotUrl) {
    throw new Error("Screenshot evidence is required.");
  }

  const upload = await ensureUploadedStatScreenshot(payload);


  return {
    evidenceId: upload.key,
    statScreenshot: upload
  };


}

export async function createPlayerAccount(
  qualification: RegisterQualificationPayload,
  passwordPayload: RegisterPasswordPayload
): Promise<{ accountId: string; accessToken?: string; player?: Player }> {
  if (passwordPayload.password !== passwordPayload.confirmPassword) {
    throw new Error("Passwords do not match.");
  }

  const upload = await ensureUploadedStatScreenshot(qualification);

  const account = unwrap(
    await apiClient.post<
      ApiResponse<{ accountId: string; accessToken?: string; player?: Player }>
    >(
      "/auth/register",
      {
        fullname: qualification.fullName?.trim() || qualification.discordUsername?.trim() || qualification.email.split("@")[0],
        emailAddress: qualification.email,
        gameTag: qualification.gameTag?.trim() || qualification.discordUsername?.trim() || qualification.email.split("@")[0],
        phoneNumber: qualification.phoneNumber?.trim() || "N/A",
        telegramUsername: qualification.telegramUsername?.trim() || qualification.discordUsername?.trim() || "N/A",
        discordUsername: qualification.discordUsername?.trim() || "",
        currentXp: qualification.currentXp ?? 1000,

        password: passwordPayload.password,
        confirmPassword: passwordPayload.confirmPassword,

        statScreenshotUrl: upload.url,
        statScreenshotKey: upload.key,
        statScreenshotFileName: upload.fileName,
        statScreenshotMimeType: upload.mimeType
      }
    )
  );

  return account;
}

async function ensureUploadedStatScreenshot(
  payload: RegisterQualificationPayload
): Promise<UploadedStatScreenshot> {
  if (payload.statScreenshotUrl) {
    return {
      url: payload.statScreenshotUrl,
      key: payload.statScreenshotKey ?? "",
      fileName: payload.statScreenshotFileName ?? payload.statScreenshot?.name ?? "",
      mimeType: payload.statScreenshot?.type ?? "",
      uploadedAt: new Date().toISOString()
    };
  }

  if (!payload.statScreenshot) {
    throw new Error("Screenshot evidence is required.");
  }

  return uploadStatScreenshot(payload.statScreenshot);
}

