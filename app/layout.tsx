import type { Metadata } from "next";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";
import "./globals.css";

export const metadata: Metadata = {
  title: "Steam Style Search",
  description: "Browse and filter a large library of games.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AppErrorBoundary>{children}</AppErrorBoundary>
      </body>
    </html>
  );
}
