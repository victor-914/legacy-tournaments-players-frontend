import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    success: true,
    message: "Legacy Esports frontend is online",
    data: { service: "player-frontend" }
  });
}
