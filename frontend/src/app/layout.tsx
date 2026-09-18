import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { A11yProvider } from "@/lib/a11y";
import { LangProvider } from "@/lib/lang";
import { LANG_BOOTSTRAP, parseLang } from "@/lib/lang-shared";
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const lang = parseLang(cookieStore.get("raqeeb_lang")?.value);
  return (
    <html lang={lang} dir={lang === "ar" ? "rtl" : "ltr"} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: LANG_BOOTSTRAP }} />
      </head>
      <body>
        <LangProvider initialLang={lang}>
          <A11yProvider>{children}</A11yProvider>
        </LangProvider>
      </body>
    </html>
  );
}
