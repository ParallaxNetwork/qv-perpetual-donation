"use client";

import WorldIDVerification from "@/components/WorldIdVerification";
import {
  DynamicWidget,
  useDynamicContext,
  useSmartWallets,
  useTelegramLogin,
} from "@dynamic-labs/sdk-react-core";
import {
  Section,
  Cell,
  Image,
  List,
  Spinner,
} from "@telegram-apps/telegram-ui";
import { useEffect, useState } from "react";

// import { Link } from "@/components/Link/Link";

// import tonSvg from "./_assets/ton.svg";

export default function Home() {
  const { sdkHasLoaded, user } = useDynamicContext();
  const { telegramSignIn }: any = useTelegramLogin();
  const { isSmartWallet, getEOAWallet, getSmartWallet } = useSmartWallets();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!sdkHasLoaded) return;

    const signIn = async () => {
      if (!user) {
        await telegramSignIn({ forceCreateUser: true });
      }
      setIsLoading(false);

      console.log("user", user);
      console.log("user.dogeWallet", user?.dogeWallet);
      console.log("isSmartWallet", isSmartWallet(user?.dogeWallet as any));
      console.log("getEOAWallet", getEOAWallet(user?.dogeWallet as any));
    };

    signIn();

    // check
  }, [sdkHasLoaded]);

  return (
    <List>
      {/* <Section
        header='Features'
        footer='You can use these pages to learn more about features, provided by Telegram Mini Apps and other useful projects'
      >
        <Link href='/ton-connect'>
          <Cell
            before={<Image src={tonSvg.src} style={{ backgroundColor: '#007AFF' }}/>}
            subtitle='Connect your TON wallet'
          >
            TON Connect
          </Cell>
        </Link>
      </Section>
      <Section
        header='Application Launch Data'
        footer='These pages help developer to learn more about current launch information'
      >
        <Link href='/init-data'>
          <Cell subtitle='User data, chat information, technical data'>Init Data</Cell>
        </Link>
        <Link href='/launch-params'>
          <Cell subtitle='Platform identifier, Mini Apps version, etc.'>Launch Parameters</Cell>
        </Link>
        <Link href='/theme-params'>
          <Cell subtitle='Telegram application palette information'>Theme Parameters</Cell>
        </Link>
      </Section> */}

      <Section>
        <WorldIDVerification />

        {isLoading ? <Spinner size="m" /> : <DynamicWidget />}

        {JSON.stringify(user)}
      </Section>
    </List>
  );
}
