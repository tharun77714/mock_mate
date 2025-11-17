import { Toaster } from "sonner";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MockMate",
  description: "An AI-powered platform for preparing for mock interviews",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${poppins.className} antialiased pattern`}>
        {/* Global vibrant background overlay (non-intrusive) */}
        {children}

        <Toaster />
      </body>
    </html>
  );
}
