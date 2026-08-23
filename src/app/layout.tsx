import type { Metadata, Viewport } from "next";
import { Alexandria, Marhey } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const alexandria = Alexandria({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
});

const marhey = Marhey({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "مطبعة الروعة | هدايا بطابعك — Al Rawaa Printing",
  description: "مطبوعات وهدايا حسب الطلب تُنفذ بعناية في عجمان وتصل إلى كل الإمارات. متجر إلكتروني متكامل مع لوحة تحكم.",
  icons: { icon: "/uploads/processed-logo-al-rawhaa-png-93d69af7-40c8-4396-8959-4d4b1cc612d7_4c62e8cc.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${alexandria.variable} ${marhey.variable} font-body antialiased bg-white text-[#33393e]`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
