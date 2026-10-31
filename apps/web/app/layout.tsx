import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KINTRAL | Retail Decision Intelligence",
  description: "See the signal. Make the move. AI-Powered Retail Decision Intelligence Platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-canvas text-ink min-h-screen flex flex-col antialiased selection:bg-primary/20 selection:text-primary-active">
        {children}
      </body>
    </html>
  );
}
