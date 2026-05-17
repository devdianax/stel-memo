import type { Metadata } from "next";
import { Web3Provider } from "@/components/providers/Web3Provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "StelMemo",
  description: "Decentralized crypto inheritance protocol on Stellar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
