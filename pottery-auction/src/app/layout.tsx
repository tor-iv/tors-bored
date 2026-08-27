import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono, Special_Elite, Permanent_Marker, VT323, Space_Mono } from "next/font/google";
import { cookies, headers } from "next/headers";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ThemeProvider, type Theme } from "@/contexts/ThemeContext";
import { QueryProvider } from "@/components/providers/QueryProvider";
import CursorTrail from "@/components/theme/y2k/CursorTrail";

const VALID_THEMES: Theme[] = ['y2k', 'receipt'];

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const specialElite = Special_Elite({ variable: '--font-typewriter', subsets: ['latin'], weight: '400' });
const permanentMarker = Permanent_Marker({ variable: '--font-handwriting', subsets: ['latin'], weight: '400' });
const vt323 = VT323({ variable: '--font-vt323', subsets: ['latin'], weight: '400' });
const spaceMono = Space_Mono({ variable: '--font-space-mono', subsets: ['latin'], weight: ['400', '700'] });

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
      <body className={`${inter.variable} ${ibmPlexMono.variable} ${specialElite.variable} ${permanentMarker.variable} ${vt323.variable} ${spaceMono.variable} antialiased`}>
        <QueryProvider>
          <ThemeProvider initialTheme={theme}>
            <Header />
            <main>{children}</main>
            <Footer />
            {theme === 'y2k' && <CursorTrail />}
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
