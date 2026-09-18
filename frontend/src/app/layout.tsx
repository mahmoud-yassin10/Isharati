import type { Metadata, Viewport } from "next";
import { A11yProvider } from "@/lib/a11y";
import { LangProvider } from "@/lib/lang";
import { BRAND } from "@/lib/brand";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${BRAND.ar} · الفيزياء بلغة الإشارة المصرية`,
    template: `%s · ${BRAND.ar}`,
  },
  description:
    "إشارتي: منصة تعليمية مصرية تشرح الفيزياء بلغة الإشارة المصرية، بإشارة لكل مصطلح ومختبر تفاعلي يعمل بدون صوت.",
  applicationName: BRAND.en,
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#1b3f9e",
  colorScheme: "light",
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
