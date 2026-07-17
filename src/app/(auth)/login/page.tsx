import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLoader } from "@/components/ui/loader";
import { LoginPageClient } from "./LoginPageClient";

export const metadata: Metadata = {
  title: "Stories — Log in",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <LoginPageClient />
    </Suspense>
  );
}
