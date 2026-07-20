"use client";

import { io, Socket } from "socket.io-client";

class PublicSocketClient {
  private socket: Socket | null = null;
  private refCount = 0;

  acquire(): Socket {
    this.refCount += 1;

    if (!this.socket) {
      this.socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000"}/public`, {
        transports: ["websocket"]
      });
    }

    return this.socket;
  }

  release() {
    this.refCount = Math.max(0, this.refCount - 1);

    if (this.refCount === 0 && this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const publicSocketClient = new PublicSocketClient();
