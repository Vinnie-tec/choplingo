import type { Metadata } from "next";
import "./globals.scss";
import { Poppins } from "next/font/google";

import { ToastProvider } from "@/components/toast-provider";

export const metadata: Metadata = {
  title: "ChopLingo | Good food, better days",
  description: "Find fresh inspiration and feel-good food with ChopLingo.",
};

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={poppins.variable}
      suppressHydrationWarning
      data-lt-installed="true"
      data-new-gr-c-s-check-loaded="14.1342.0"
      data-gr-ext-installed=""
    >
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
