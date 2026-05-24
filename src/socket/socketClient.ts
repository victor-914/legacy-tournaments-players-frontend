"use client";

import { io, Socket } from "socket.io-client";
import { useSocketStore } from "@/store/socketStore";

const accessTokenKey = "hammer_access_token";

function getAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(accessTokenKey);
}

class SocketClient {
  private socket: Socket | null = null;

  connect(): Socket {
    if (this.socket) {
      this.updateAuthToken();
      if (!this.socket.connected) {
        console.log("[matchmaking:client] reconnecting socket", {
          socketId: this.socket.id,
          url: process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000",
          hasToken: Boolean(getAccessToken())
        });
        this.socket.connect();
      }

      return this.socket;
    }

    console.log("[matchmaking:client] creating socket", {
      url: process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000",
      hasToken: Boolean(getAccessToken())
    });

    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000", {
      autoConnect: false,
      auth: { token: getAccessToken() },
      transports: ["websocket"]
    });

    this.socket.io.on("reconnect_attempt", () => {
      console.log("[matchmaking:client] socket reconnect attempt");
      this.updateAuthToken();
    });
    this.socket.on("connect", () => {
      console.log("[matchmaking:client] socket connected", { socketId: this.socket?.id });
      useSocketStore.getState().setConnected(true);
    });
    this.socket.on("connect_error", (error) => {
      const socketError = error as Error & { description?: unknown; context?: unknown };
      console.log("[matchmaking:client] socket connect_error", {
        message: socketError.message,
        description: socketError.description,
        context: socketError.context
      });
    });
    this.socket.on("disconnect", (reason) => {
      console.log("[matchmaking:client] socket disconnected", { reason });
      useSocketStore.getState().setConnected(false);
    });
    this.socket.connect();

    return this.socket;
  }

  private updateAuthToken() {
    if (!this.socket) {
      return;
    }

    this.socket.auth = { token: getAccessToken() };
  }

  disconnect() {
    if (!this.socket) {
      useSocketStore.getState().setConnected(false);
      return;
    }

    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.socket = null;
    useSocketStore.getState().setConnected(false);
  }
}

export const socketClient = new SocketClient();
