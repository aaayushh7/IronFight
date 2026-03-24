import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/nav-bar";
import { Toaster } from "sonner";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "Meal Recovery Tracker",
  description: "Your personal recovery meal companion — stay consistent, feel great.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FAF8FF",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="mesh-bg min-h-screen antialiased">
        <div className="max-w-md mx-auto min-h-screen relative">
          <main className="pb-28 pt-2">
            {children}
          </main>
          <NavBar />
        </div>
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
              fontWeight: "500",
            },
          }}
        />
      </body>
    </html>
  );
}
