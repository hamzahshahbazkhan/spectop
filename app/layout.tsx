import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Space_Mono } from "@next/font/google";
import { ProductProvider } from "@/context/ProductContext";
import "./globals.css";

const mono = Space_Mono({
  subsets: ['latin'],
  weight: ['400'],
});

export const metadata: Metadata = {
  title: "SPECTOP",
  description: "Created by Hamzah Shahbaz Khan",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={mono.className}>
        <ProductProvider>
          <div className="flex flex-col min-h-screen ">
            <Navbar />
            <main className="flex-grow md:px-8">{children}</main>
            <Footer />
          </div>
        </ProductProvider>
      </body>
    </html>
  );
}
