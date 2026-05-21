import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flenix Jewels Ltd",
  description: "Flenix Jewels Ltd - Exquisite Jewelry Collection",
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
