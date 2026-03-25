import type { Metadata, Viewport } from "next";
import { Playfair_Display, Nunito } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/nav-bar";
import { Toaster } from "sonner";
import { NotificationReminder } from "@/components/notification-reminder";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Meal Recovery Tracker",
  description: "Your personal recovery meal companion — stay consistent, feel great.",
  appleWebApp: {
    capable: true,
    title: "Recovery",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#FAF8FF",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${nunito.variable}`}>
      <body className="mesh-bg min-h-screen antialiased">
        <div className="max-w-md mx-auto min-h-screen relative">
          <main className="pb-28 pt-2 pt-safe">
            {children}
          </main>
          <NavBar />
        </div>
        <NotificationReminder />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "rgba(255, 255, 255, 0.92)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(201, 167, 235, 0.3)",
              borderRadius: "1rem",
              color: "#2D2A35",
              fontSize: "14px",
              fontWeight: "600",
              fontFamily: "var(--font-nunito)",
            },
          }}
        />
      </body>
    </html>
  );
}
