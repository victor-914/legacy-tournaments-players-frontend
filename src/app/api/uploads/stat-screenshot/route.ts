import { createHash, createHmac, randomUUID } from "crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const allowedMimeTypes = new Set(["image/png", "image/jpeg"]);
const maxFileSize = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("statScreenshot");

  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, message: "Screenshot evidence is required.", data: null }, { status: 400 });
  }

  if (!allowedMimeTypes.has(file.type)) {
    return NextResponse.json({ success: false, message: "Only PNG and JPEG screenshots are accepted.", data: null }, { status: 400 });
  }

  if (file.size > maxFileSize) {
    return NextResponse.json({ success: false, message: "Screenshot must be 5MB or smaller.", data: null }, { status: 400 });
  }

  const config = getS3Config();
  if (!config) {
    return NextResponse.json({ success: false, message: "S3 upload is not configured.", data: null }, { status: 500 });
  }

  const extension = file.type === "image/png" ? "png" : "jpg";
  const key = `registration-screenshots/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${extension}`;
  const body = Buffer.from(await file.arrayBuffer());

  try {
    await putObjectToS3({
      ...config,
      body,
      contentType: file.type,
      key
    });
  } catch {
    return NextResponse.json({ success: false, message: "Unable to upload screenshot evidence.", data: null }, { status: 502 });
  }

  const url = config.publicBaseUrl
    ? `${config.publicBaseUrl.replace(/\/$/, "")}/${key}`
    : `https://${config.bucket}.s3.${config.region}.amazonaws.com/${key}`;

  return NextResponse.json({
    success: true,
    message: "Screenshot uploaded.",
    data: {
      url,
      key,
      fileName: file.name,
      mimeType: file.type,
      uploadedAt: new Date().toISOString()
    }
  });
}

function getS3Config() {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION;
  const bucket = process.env.AWS_S3_BUCKET;

  if (!accessKeyId || !secretAccessKey || !region || !bucket) {
    return null;
  }

  return {
    accessKeyId,
    secretAccessKey,
    sessionToken: process.env.AWS_SESSION_TOKEN,
    region,
    bucket,
    publicBaseUrl: process.env.AWS_S3_PUBLIC_BASE_URL
  };
}

async function putObjectToS3({
  accessKeyId,
  secretAccessKey,
  sessionToken,
  region,
  bucket,
  key,
  body,
  contentType
}: {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
  region: string;
  bucket: string;
  key: string;
  body: Buffer;
  contentType: string;
}) {
  const service = "s3";
  const host = `${bucket}.s3.${region}.amazonaws.com`;
  const encodedKey = key.split("/").map(encodeURIComponent).join("/");
  const url = `https://${host}/${encodedKey}`;
  const now = new Date();
  const amzDate = toAmzDate(now);
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = sha256Hex(body);
  const signedHeaders = sessionToken
    ? "content-type;host;x-amz-content-sha256;x-amz-date;x-amz-security-token"
    : "content-type;host;x-amz-content-sha256;x-amz-date";
  const canonicalHeaders = [
    `content-type:${contentType}`,
    `host:${host}`,
    `x-amz-content-sha256:${payloadHash}`,
    `x-amz-date:${amzDate}`,
    sessionToken ? `x-amz-security-token:${sessionToken}` : null
  ]
    .filter((line): line is string => Boolean(line))
    .join("\n");

  const canonicalRequest = [
    "PUT",
    `/${encodedKey}`,
    "",
    canonicalHeaders,
    "",
    signedHeaders,
    payloadHash
  ]
    .join("\n");

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, sha256Hex(canonicalRequest)].join("\n");
  const signingKey = getSignatureKey(secretAccessKey, dateStamp, region, service);
  const signature = hmacHex(signingKey, stringToSign);
  const authorization = [
    `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}`,
    `SignedHeaders=${signedHeaders}`,
    `Signature=${signature}`
  ].join(", ");

  const headers: Record<string, string> = {
    Authorization: authorization,
    "Content-Type": contentType,
    Host: host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate
  };

  if (sessionToken) {
    headers["x-amz-security-token"] = sessionToken;
  }

  const response = await fetch(url, {
    method: "PUT",
    headers,
    body: body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength) as BodyInit
  });

  if (!response.ok) {
    throw new Error(`S3 upload failed with status ${response.status}.`);
  }
}

function toAmzDate(date: Date) {
  return date.toISOString().replace(/[:-]|\.\d{3}/g, "");
}

function sha256Hex(value: Buffer | string) {
  return createHash("sha256").update(value).digest("hex");
}

function hmacHex(key: Buffer | string, value: string) {
  return createHmac("sha256", key).update(value).digest("hex");
}

function hmacBuffer(key: Buffer | string, value: string) {
  return createHmac("sha256", key).update(value).digest();
}

function getSignatureKey(secretAccessKey: string, dateStamp: string, region: string, service: string) {
  const dateKey = hmacBuffer(`AWS4${secretAccessKey}`, dateStamp);
  const regionKey = hmacBuffer(dateKey, region);
  const serviceKey = hmacBuffer(regionKey, service);
  return hmacBuffer(serviceKey, "aws4_request");
}
