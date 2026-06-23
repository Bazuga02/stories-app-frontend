import { Suspense } from "react";
import { PageLoader } from "@/components/ui/loader";
import { LoginPageClient } from "./LoginPageClient";

export default function LoginPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <LoginPageClient />
    </Suspense>
  );
}
