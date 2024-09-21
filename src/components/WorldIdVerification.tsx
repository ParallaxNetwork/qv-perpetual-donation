"use client";

import React from "react";
import { IDKitWidget, VerificationLevel } from "@worldcoin/idkit";
import { Button } from "./ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { handleVerify } from "@/lib/dynamic";

const WorldIDVerification: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search");
  console.log("search", search);

  console.log("init", window.location);

  // Success callback
  const onSuccess = () => {
    console.log(window.location);
    router.push("/connect" + "?" + search);
    console.log(window.location);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-gray-700">
      <h1 className="text-2xl font-bold mb-6">World ID Verification</h1>

      <div className="flex flex-col md:flex-row gap-4 max-w-md">
        <IDKitWidget
          app_id={process.env.NEXT_PUBLIC_WORLD_ID_APP_ID as `app_`} // Replace with your app ID
          action={process.env.NEXT_PUBLIC_WORLD_ID_ACTION_ID as string}
          onSuccess={onSuccess}
          handleVerify={handleVerify}
          verification_level={VerificationLevel.Device}
        >
          {({ open }) => <Button onClick={open}>Verify with World ID</Button>}
        </IDKitWidget>
      </div>
    </div>
  );
};

export default WorldIDVerification;
