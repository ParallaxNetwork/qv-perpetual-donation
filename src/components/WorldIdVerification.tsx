"use client";

import React from "react";
import { IDKitWidget, VerificationLevel } from "@worldcoin/idkit";
import { Button } from "./ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { handleVerify } from "@/lib/dynamic";

const WorldIDVerification: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  console.log("world id");
  searchParams.forEach((value, key) => {
    console.log(key, value);
  });

  console.log("init", window.location);

  // Success callback
  const onSuccess = () => {
    console.log(window.location);
    router.push("/connect" + "?" + searchParams.toString());
    console.log(window.location);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-gray-700">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">
        Are you human?
      </h1>

      <div className="flex max-w-md flex-col gap-4 md:flex-row">
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
