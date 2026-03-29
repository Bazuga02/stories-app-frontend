import type { Metadata } from "next";
import { B612, Epilogue, Plus_Jakarta_Sans, Source_Serif_4, Vina_Sans } from "next/font/google";
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

const epilogue = Epilogue({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-epilogue",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-source-serif",
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
      className={`${vinaSans.variable} ${b612.variable} ${epilogue.variable} ${plusJakarta.variable} ${sourceSerif.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="font-login-body flex min-h-full flex-col bg-editorial-surface text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed"
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
