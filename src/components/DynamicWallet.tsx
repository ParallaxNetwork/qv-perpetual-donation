"use client";
import {
  DynamicWidget,
  useDynamicContext,
  useTelegramLogin,
} from "@dynamic-labs/sdk-react-core";
import { Spinner } from "@telegram-apps/telegram-ui";
import { useEffect, useState } from "react";

type Props = {};

const DynamicWallet = (props: Props) => {
  // const { dc.sdkHasLoaded, user, } = useDynamicContext();
  const dc = useDynamicContext();
  const { telegramSignIn } = useTelegramLogin();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!dc.sdkHasLoaded) return;

    const signIn = async () => {
      if (!dc.user) {
        await telegramSignIn({ forceCreateUser: true });
      }
      setIsLoading(false);
    };

    signIn();
  }, [dc.sdkHasLoaded]);

  return isLoading ? (
    <Spinner size="m" />
  ) : (
    <>
      <DynamicWidget />
      <br />
      dc.sdkHasLoaded: {dc.sdkHasLoaded}
      <br />
      user: {JSON.stringify(dc)}
    </>
  );
};

export default DynamicWallet;
