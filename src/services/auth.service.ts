import axios from "axios";
import { api } from "./api";
import type { AuthResponse, User } from "@/types";

export async function login(payload: { email: string; password: string }) {
  const { data } = await api.post<AuthResponse>("/auth/login", payload);
  return data;
}

export async function register(payload: {
  email: string;
  password: string;
  name: string;
}) {
  const { data } = await api.post<AuthResponse>("/auth/register", payload);
  return data;
}

export async function fetchMe() {
  try {
    const { data } = await api.get<User>("/auth/me");
    return data;
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) {
      const { data } = await api.get<User>("/users/me");
      return data;
    }
    throw e;
  }
}
