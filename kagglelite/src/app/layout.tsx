import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KaggleLite",
  description: "A clone of Kaggle",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-kaggle-bg text-kaggle-text antialiased`}>
        <Toaster richColors position="top-right" />
        <Navbar />
        <Sidebar />
        <main className="md:ml-64 pt-16 min-h-screen p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
