import type { Metadata } from "next";
import localFont from "next/font/local";
import { ViewTransitions } from "next-view-transitions";
import "./globals.css";
import Nav from "@/components/ui/Nav";
import { SmoothScrollProvider } from "@/components/motion/SmoothScrollProvider";
import { DecorLayer } from "@/components/depth/DecorLayer";

const clashDisplay = localFont({
  src: "../../public/fonts/ClashDisplay-Variable.woff2",
  variable: "--font-clash-display",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

const switzer = localFont({
  src: "../../public/fonts/Switzer-Variable.woff2",
  variable: "--font-switzer",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

const jetbrainsMono = localFont({
  src: "../../public/fonts/JetBrainsMono-Regular.ttf",
  variable: "--font-jetbrains-mono",
  display: "swap",
  fallback: ["ui-monospace", "monospace"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "CompEngSoc — UNSW Computer Engineering Society",
    template: "%s · CompEngSoc",
  },
  description: "UNSW's Computer Engineering Society — where silicon meets software.",
  icons: { icon: "/icon.png", apple: "/icon.png" },
  openGraph: {
    title: "CompEngSoc — UNSW Computer Engineering Society",
    description: "Where silicon meets software.",
    images: ["/og/default-og.png"],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html
        lang="en"
        className={`${clashDisplay.variable} ${switzer.variable} ${jetbrainsMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-substrate text-silk font-body">
          <DecorLayer />
          <SmoothScrollProvider>
            <Nav />
            {children}
          </SmoothScrollProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
