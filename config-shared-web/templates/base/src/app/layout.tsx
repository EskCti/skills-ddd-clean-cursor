import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/shared/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Poupig Web Shell",
  description: "Base compartilhada para aplicacao administrativa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={[geistSans.variable, geistMono.variable, "__BODY_MODE_CLASS__", "bg-background text-foreground antialiased"].join(" ")}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
