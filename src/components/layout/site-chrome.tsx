import { Footer } from "@/components/ui/footer";
import { Navbar } from "@/components/ui/navbar";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="flex flex-1 flex-col">{children}</div>
      <Footer />
    </>
  );
}
