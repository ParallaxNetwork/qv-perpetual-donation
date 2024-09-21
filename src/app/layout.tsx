import type { PropsWithChildren } from "react";
import type { Metadata } from "next";

import { Root } from "@/components/Root/Root";

import "@telegram-apps/telegram-ui/dist/styles.css";
import "normalize.css/normalize.css";
import "./_assets/globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "QIVE",
  description: "Perpetual Quadratic Donation Protocol",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <Root>
          <div className="mx-auto max-w-lg">
            {children}
            <Toaster />
          </div>
        </Root>
      </body>
    </html>
  );
}
