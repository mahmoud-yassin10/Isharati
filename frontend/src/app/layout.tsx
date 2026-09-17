import type { Metadata } from "next";
import { A11yProvider } from "@/lib/a11y";
import { LangProvider } from "@/lib/lang";
import "./globals.css";

export const metadata: Metadata = {
  title: "رقيب",
  description: "درس الفيزياء بالحركة، مع لغة الإشارة المصرية.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body>
        <LangProvider>
          <A11yProvider>{children}</A11yProvider>
        </LangProvider>
      </body>
    </html>
  );
}
