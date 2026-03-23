import { Suspense } from "react";
import { PageLoader } from "@/components/ui/loader";
import { EditorPageClient } from "./EditorPageClient";

export default function EditorPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <EditorPageClient />
    </Suspense>
  );
}
