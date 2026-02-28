import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QuickHire Job Board",
  description: "Discover, filter, and apply to jobs with QuickHire.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
