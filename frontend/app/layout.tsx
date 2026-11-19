import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import TabBar from "@/components/TabBar";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Coy · Discover",
  description: "Find out if your crush likes you back. If they don't, nobody ever knows.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FFFFFF",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={bricolage.variable}>
      <body>
        <ToastProvider>
          <main className="sheet">{children}</main>
          <TabBar />
        </ToastProvider>
      </body>
    </html>
  );
}
