import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Weather Explorer - Open-Meteo & Google Cloud Storage Dashboard",
  description: "Full-stack application to query historical weather data from Open-Meteo, store raw JSON in Google Cloud Storage, and visualize temperature trends.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
