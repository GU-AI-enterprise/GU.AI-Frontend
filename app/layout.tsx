import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { Toaster } from "@/components/ui/sonner";
import StoreProvider from "@/store/StoreProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GU.AI - AI Virtual Fashion Model Generation",
  description: "AI-powered Virtual Fashion Model Generation Platform for the Vietnamese Market. Save 90% photoshoot cost.",
  icons: {
    icon: "/lotus.svg",
    apple: "/lotus.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} h-full antialiased`}
      style={{ colorScheme: "light" }}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
        <StoreProvider>
          <AuthProvider>
            <NotificationProvider>
              {children}
              <Toaster position="top-center" />
            </NotificationProvider>
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
