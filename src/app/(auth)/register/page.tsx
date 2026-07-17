import type { Metadata } from "next";
import { RegisterPageClient } from "./RegisterPageClient";

export const metadata: Metadata = {
  title: "Stories — Join the narrative",
};

export default function RegisterPage() {
  return <RegisterPageClient />;
}
