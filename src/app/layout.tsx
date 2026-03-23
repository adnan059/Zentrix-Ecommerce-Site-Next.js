import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL!),
  title: {
    default: "Zentrix - Build Your Dream PC",
    template: "%s | Zentrix",
  },
  description: "Discover products from hundreds of verified vendors.",
  openGraph: {
    type: "website",
    siteName: "Zentrix",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <main>{children}</main>
      </body>
    </html>
  );
}
