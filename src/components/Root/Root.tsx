"use client";

import { type PropsWithChildren, useEffect, useMemo } from "react";
import {
  SDKProvider,
  useLaunchParams,
  useMiniApp,
  useThemeParams,
  useViewport,
  bindMiniAppCSSVars,
  bindThemeParamsCSSVars,
  bindViewportCSSVars,
} from "@telegram-apps/sdk-react";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { AppRoot } from "@telegram-apps/telegram-ui";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ErrorPage } from "@/components/ErrorPage";
import { useTelegramMock } from "@/hooks/useTelegramMock";
import { useDidMount } from "@/hooks/useDidMount";
import { LoaderIcon } from "lucide-react";

import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider } from "@tanstack/react-query";

import {
  DynamicContextProvider,
  EthereumWalletConnectors,
} from "@/lib/dynamic";
import { ZeroDevSmartWalletConnectors } from "@dynamic-labs/ethereum-aa";

import "./styles.css";
import { config, queryClient } from "@/lib/wagmi";

const dynEnv = process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID;

function App(props: PropsWithChildren) {
  const lp = useLaunchParams();
  const miniApp = useMiniApp();
  const themeParams = useThemeParams();
  const viewport = useViewport();

  useEffect(() => {
    return bindMiniAppCSSVars(miniApp, themeParams);
  }, [miniApp, themeParams]);

  useEffect(() => {
    return bindThemeParamsCSSVars(themeParams);
  }, [themeParams]);

  useEffect(() => {
    return viewport && bindViewportCSSVars(viewport);
  }, [viewport]);

  return (
    <AppRoot
      appearance={miniApp.isDark ? "dark" : "light"}
      platform={["macos", "ios"].includes(lp.platform) ? "ios" : "base"}
    >
      <DynamicContextProvider
        settings={{
          environmentId: dynEnv as string,
          walletConnectors: [
            EthereumWalletConnectors,
            ZeroDevSmartWalletConnectors,
          ],
        }}
      >
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <DynamicWagmiConnector>{props.children}</DynamicWagmiConnector>
          </QueryClientProvider>
        </WagmiProvider>
      </DynamicContextProvider>
    </AppRoot>
  );
}

function RootInner({ children }: PropsWithChildren) {
  // Mock Telegram environment in development mode if needed.
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useTelegramMock();
  }

  const debug = useLaunchParams().startParam === "debug";
  const manifestUrl = useMemo(() => {
    return new URL("tonconnect-manifest.json", window.location.href).toString();
  }, []);

  // Enable debug mode to see all the methods sent and events received.
  useEffect(() => {
    if (debug) {
      import("eruda").then((lib) => lib.default.init());
    }
  }, [debug]);

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <SDKProvider acceptCustomStyles debug={debug}>
        <App>{children}</App>
      </SDKProvider>
    </TonConnectUIProvider>
  );
}

export function Root(props: PropsWithChildren) {
  // Unfortunately, Telegram Mini Apps does not allow us to use all features of the Server Side
  // Rendering. That's why we are showing loader on the server side.
  const didMount = useDidMount();

  return didMount ? (
    <ErrorBoundary fallback={ErrorPage}>
      <RootInner {...props} />
    </ErrorBoundary>
  ) : (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 text-neutral-900">
      <h1 className="text-4xl font-bold text-primary">QIVE</h1>
      <div className="flex items-center gap-2">
        <LoaderIcon className="size-4 animate-spin" />
        <span>Loading</span>
      </div>
    </div>
  );
}
