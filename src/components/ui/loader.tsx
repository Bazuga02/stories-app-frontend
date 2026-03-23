import { cn } from "@/lib/cn";

export function Loader({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "inline-block size-10 animate-spin rounded-full border-[3px] border-dark/20 border-t-dark",
        className,
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-[40vh] flex-1 items-center justify-center bg-background">
      <Loader className="size-12" />
    </div>
  );
}
