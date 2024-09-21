"use client";

import DynamicWallet from "@/components/DynamicWallet";
import { handleVerify } from "@/lib/dynamic";
import { Spinner } from "@telegram-apps/telegram-ui";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

type Props = {};

const Connect = (props: Props) => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);

  // A utility function to safely retrieve and parse localStorage data
  const getWorldIdPayload = () => {
    try {
      const payload = localStorage.getItem("world_id_payload");
      if (!payload) return null;
      return JSON.parse(payload);
    } catch (error) {
      console.error("Failed to parse world_id_payload:", error);
      return null;
    }
  };

  useEffect(() => {
    const worldIdPayload = getWorldIdPayload();

    if (!worldIdPayload) {
      // Redirect if no valid payload is found
      router.push("/");
      return;
    }

    // Verify the payload
    handleVerify(worldIdPayload)
      .then((res) => {
        console.log("Verification successful:", res);
      })
      .catch((err) => {
        console.error("Verification failed:", err);
        localStorage.removeItem("world_id_payload");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  return (
    <div className="flex min-h-screen w-full justify-center items-center text-gray-700">
      {loading ? (
        <div className="flex flex-col items-center gap-2">
          <Spinner size="s" />
          <p>Verifying World ID...</p>
        </div>
      ) : (
        <DynamicWallet />
      )}
    </div>
  );
};

export default Connect;
