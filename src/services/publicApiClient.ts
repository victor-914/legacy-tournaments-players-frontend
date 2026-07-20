import axios from "axios";

export const publicApiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/api`,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json"
  }
});
