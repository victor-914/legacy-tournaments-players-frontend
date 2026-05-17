"use client";

import { io, Socket } from "socket.io-client";
import { useSocketStore } from "@/store/socketStore";

class SocketClient {
  private socket: Socket | null = null;

  connect(): Socket {
    if (this.socket) {
      return this.socket;
    }

    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000", {
      autoConnect: false,
      transports: ["websocket"]
    });

    this.socket.on("connect", () => useSocketStore.getState().setConnected(true));
    this.socket.on("disconnect", () => useSocketStore.getState().setConnected(false));
    this.socket.connect();

    return this.socket;
  }
}

export const socketClient = new SocketClient();
