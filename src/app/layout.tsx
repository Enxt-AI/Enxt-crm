import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export const metadata: Metadata = {
  title: "Enxt Brain",
  description: "Founder CRM and document-native AI company brain for Enxt AI."
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
