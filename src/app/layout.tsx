import type { PropsWithChildren } from "react";
import type { Metadata } from "next";

import { Root } from "@/components/Root/Root";

import "@telegram-apps/telegram-ui/dist/styles.css";
import "normalize.css/normalize.css";
import "./_assets/globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Quive",
  description: "Perpetual Quadratic Donation Protocol",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body>
        <Root>
          <div className="mx-auto max-w-lg bg-white">
            {children}
            <Toaster />
          </div>
        </Root>
      </body>
    </html>
  );
}
