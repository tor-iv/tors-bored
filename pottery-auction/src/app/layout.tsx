import type { Metadata } from "next";
import { Inter, Caveat, Nunito, IBM_Plex_Mono } from "next/font/google";
import { cookies, headers } from "next/headers";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ThemeProvider, type Theme } from "@/contexts/ThemeContext";
import { QueryProvider } from "@/components/providers/QueryProvider";

const VALID_THEMES: Theme[] = ['handdrawn', 'y2k', 'receipt'];

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Tor's Pottery - Handmade Ceramics",
  description: "Explore Tor's collection of handcrafted pottery pieces. Participate in monthly auctions and submit ideas for custom ceramic creations.",
  keywords: "pottery, ceramics, handmade pottery, pottery auction, custom pottery, handcrafted ceramics, pottery art",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const requestHeaders = await headers();

  // Prefer cookie (set by middleware on first visit, persisted by client on toggle)
  // Fall back to x-theme header injected by middleware for the current request
  const cookieTheme = cookieStore.get('theme')?.value as Theme | undefined;
  const headerTheme = requestHeaders.get('x-theme') as Theme | undefined;
  const theme: Theme = (VALID_THEMES.includes(cookieTheme!) ? cookieTheme! : null)
    ?? (VALID_THEMES.includes(headerTheme!) ? headerTheme! : 'receipt');

  return (
    <html lang="en" data-theme={theme}>
      <body className={`${inter.variable} ${caveat.variable} ${nunito.variable} ${ibmPlexMono.variable} antialiased`}>
        <QueryProvider>
          <ThemeProvider initialTheme={theme}>
            <Header />
            <main>{children}</main>
            <Footer />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
