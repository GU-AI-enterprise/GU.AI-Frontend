import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { SupportUnreadProvider } from "@/contexts/SupportUnreadContext";
import { Toaster } from "@/components/ui/sonner";
import StoreProvider from "@/store/StoreProvider";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { DomResilience } from "@/components/providers/DomResilience";

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
  title: "GU.AI",
  description: "AI-powered Virtual Fashion Model Generation Platform for the Vietnamese Market. Save 90% photoshoot cost.",
  icons: {
    icon: "/icons/main_logo.png",
    apple: "/icons/main_logo.png",
  },
  other: {
    google: "notranslate",
  },
};

// Chỉ set ở production (.env trên server deploy) — để trống ở .env local để không lẫn dữ liệu dev vào GA.
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      translate="no"
      className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
        <DomResilience />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            <StoreProvider>
              <AuthProvider>
                <SocketProvider>
                  <NotificationProvider>
                    <SupportUnreadProvider>
                      {children}
                      <Toaster position="top-center" />
                    </SupportUnreadProvider>
                  </NotificationProvider>
                </SocketProvider>
              </AuthProvider>
            </StoreProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
        {GA_MEASUREMENT_ID && <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />}
      </body>
    </html>
  );
}
