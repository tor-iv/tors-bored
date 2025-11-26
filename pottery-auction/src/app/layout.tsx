import type { Metadata } from "next";
import { Inter, Caveat } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ColorToggleProvider } from "@/contexts/ColorToggleContext";
import { QueryProvider } from "@/components/providers/QueryProvider";

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
  title: "Tor's Pottery - Handmade Ceramics",
  description: "Explore Tor's collection of handcrafted pottery pieces. Participate in monthly auctions and submit ideas for custom ceramic creations.",
  keywords: "pottery, ceramics, handmade pottery, pottery auction, custom pottery, handcrafted ceramics, pottery art",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${caveat.variable} antialiased bg-medium-cream`}>
        <QueryProvider>
          <ColorToggleProvider>
            <Header />
            <main>{children}</main>
            <Footer />
          </ColorToggleProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
