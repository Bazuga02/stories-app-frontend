import type { Metadata } from "next";
import { Vina_Sans } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";
import { Navbar } from "@/components/ui/navbar";

const vinaSans = Vina_Sans({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vina",
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
      className={`${vinaSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-background text-dark"
        suppressHydrationWarning
      >
        <AppProviders>
          <Navbar />
          <div className="flex flex-1 flex-col">{children}</div>
        </AppProviders>
      </body>
    </html>
  );
}
