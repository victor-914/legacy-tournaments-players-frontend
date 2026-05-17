import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    success: true,
    message: "Hammer Games frontend is online",
    data: { service: "player-frontend" }
  });
}
