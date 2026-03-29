import type { Metadata } from "next";
import { Epilogue, Plus_Jakarta_Sans } from "next/font/google";
import { AuthFullscreenShell } from "@/components/auth/auth-fullscreen-shell";

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

export const metadata: Metadata = {
  title: "Stories — Join the narrative",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthFullscreenShell
      className={`${epilogue.variable} ${plusJakarta.variable} bg-editorial-surface font-login-body text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed`}
    >
      {children}
    </AuthFullscreenShell>
  );
}
