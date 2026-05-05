import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flenix Jewels",
  description: "Flenix Jewels - Exquisite Jewelry Collection",
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
