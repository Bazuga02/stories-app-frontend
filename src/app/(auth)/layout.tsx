import { SiteChrome } from "@/components/layout/site-chrome";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteChrome>
      <div className="flex flex-1 flex-col">{children}</div>
    </SiteChrome>
  );
}
