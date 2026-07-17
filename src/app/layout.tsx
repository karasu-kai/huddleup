import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Huddle Up",
  description: "Shared lists for anything you're planning together.",
  manifest: "/manifest.json?v=4",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Huddle Up",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#E8E8E4",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full`}>
      <body className={`${geistSans.className} min-h-full bg-canvas text-text-primary antialiased`}>
        {children}
      </body>
    </html>
  );
}
