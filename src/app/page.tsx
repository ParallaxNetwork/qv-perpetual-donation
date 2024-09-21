import DynamicWallet from "@/components/DynamicWallet";
import WorldIDVerification from "@/components/WorldIdVerification";
import { Section, List } from "@telegram-apps/telegram-ui";

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <WorldIDVerification />
      {/* <DynamicWallet /> */}
    </div>
  );
}
