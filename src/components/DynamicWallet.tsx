"use client";
import {
  DynamicWidget,
  useDynamicContext,
  useTelegramLogin,
} from "@dynamic-labs/sdk-react-core";
import { Spinner } from "@telegram-apps/telegram-ui";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type Props = {};

const DynamicWallet = (props: Props) => {
  const searchParams = useSearchParams();
  console.log("dynamic");
  searchParams.forEach((value, key) => {
    console.log(key, value);
  });

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
  }, [sdkHasLoaded, telegramSignIn, user]);

  return isLoading ? (
    <Spinner size="m" />
  ) : (
    <>
      <DynamicWidget />
    </>
  );
};

export default DynamicWallet;
