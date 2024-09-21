import DynamicWallet from "@/components/DynamicWallet";
import WorldIDVerification from "@/components/WorldIdVerification";
import { Section, List } from "@telegram-apps/telegram-ui";

export default function Home() {
  return (
    <List>
      <Section>
        <div className="bg-white">
          {/* <WorldIDVerification /> */}
          <DynamicWallet />
        </div>
      </Section>
    </List>
  );
}
