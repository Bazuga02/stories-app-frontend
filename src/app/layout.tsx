import type { Metadata } from "next";
import { B612, Vina_Sans } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";

const vinaSans = Vina_Sans({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vina",
  display: "swap",
});

const b612 = B612({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-b612",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Stories — read and write",
  description: "A minimal blog platform for thoughtful stories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${vinaSans.variable} ${b612.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-background text-dark"
        suppressHydrationWarning
      >
        <AppProviders>
          <Navbar />
          <div className="flex flex-1 flex-col">{children}</div>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
