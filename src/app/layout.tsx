import "@/styles/globals.css";
import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { TRPCReactProvider } from "@/trpc/react";
import BackgroundComponent from "./_components/BackgroundComponent";
import Navbar from "./_components/Navbar";
import { Footer } from "./_components/Footer";

export const metadata: Metadata = {
  title: "Shaga Sresthaa - Portfolio",
  description:
    "Graduate Student @ Western Michigan University | Full Stack Developer | Astronomy Enthusiast",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body
        className="relative min-h-screen"
        style={{ backgroundColor: "var(--color-portfolio-bg)" }}
      >
        {/* Background with SVGs - sits behind everything */}
        <BackgroundComponent />

        {/* Navbar - floats above content */}
        <Navbar />

        {/* Main content with session handling */}
        <div className="relative z-10">
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </div>
        <Footer />
      </body>
    </html>
  );
}
