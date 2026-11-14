import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BuyMe — Multi-Store Grocery Delivery Platform | Batticaloa District",
  description: "Executive Multi-Store Grocery Delivery Operations & Analytics (Batticaloa, Sri Lanka)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#FFFDFD] text-[#1F2430] min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
