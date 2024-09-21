"use client";
import {
  DynamicWidget,
  useDynamicContext,
  useSocialAccounts,
  useTelegramLogin,
} from "@dynamic-labs/sdk-react-core";
import { Spinner } from "@telegram-apps/telegram-ui";
import { useEffect, useState } from "react";
import { ProviderEnum } from "@dynamic-labs/types";

type Props = {};

const DynamicWallet = (props: Props) => {
  const { sdkHasLoaded, user } = useDynamicContext();
  const { telegramSignIn } = useTelegramLogin();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!sdkHasLoaded) return;

    const signIn = async () => {
      if (!user) {
        await telegramSignIn({ forceCreateUser: true });
      }

      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    };

    signIn();
  }, [sdkHasLoaded]);

  return isLoading ? (
    <Spinner size="m" />
  ) : (
    <>
      <DynamicWidget />
    </>
  );
};

export default DynamicWallet;
