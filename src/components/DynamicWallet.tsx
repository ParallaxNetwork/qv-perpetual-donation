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
  const { sdkHasLoaded, user } = useDynamicContext();
  const { telegramSignIn }: any = useTelegramLogin();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!sdkHasLoaded) return;

    const signIn = async () => {
      if (!user) {
        const ts = await telegramSignIn({ forceCreateUser: true });
        console.log("telegramSignIn", ts);
      }
      setIsLoading(false);
    };

    signIn();
  }, [sdkHasLoaded]);

  return isLoading ? (
    <Spinner size="m" />
  ) : (
    <>
      <DynamicWidget />
      <br />
      user: {JSON.stringify(user)}
    </>
  );
};

export default DynamicWallet;
