import type { Metadata } from "next";
import { Inter, Caveat } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ColorToggleProvider } from "@/contexts/ColorToggleContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Marketplace - Discover Unique Items",
  description: "Explore our collection of unique items and special offerings. Custom requests available.",
  keywords: "marketplace, collectibles, unique items, custom requests, special collections",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${caveat.variable} antialiased bg-medium-cream`}>
        <ColorToggleProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </ColorToggleProvider>
      </body>
    </html>
  );
}
