import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThreeHotfix } from "@/components/ThreeHotfix";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CMA | Elite Pickleball Coaching System",
  description: "Master the court with CMA. Book world-class pickleball instructors with real-time availability and AI-powered performance insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThreeHotfix />
        {children}
      </body>
    </html>
  );
}
