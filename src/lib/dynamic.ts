"use client";

import { ISuccessResult } from "@worldcoin/idkit";

export * from "@dynamic-labs/ethereum";
export * from "@dynamic-labs/sdk-react-core";

// Utils
export const handleVerify = async (result: ISuccessResult) => {
  const { merkle_root, nullifier_hash, proof, verification_level } = result;

  console.log("result", result);

  const signal = "";

  const action = process.env.NEXT_PUBLIC_WORLD_ID_ACTION_ID;

  const payload = {
    nullifier_hash,
    merkle_root,
    proof,
    verification_level,
    action,
    signal,
  };

  try {
    const response = await fetch("/api/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("response", response);

    if (response.ok) {
      const data = await response.json();
      console.log("Verification successful:", data);

      // save payload to local storage
      localStorage.setItem("world_id_payload", JSON.stringify(payload));
    } else {
      const errorData = await response.json();
      console.error("Verification failed:", errorData);
      throw new Error("Verification failed.", errorData);
    }
  } catch (error) {
    console.error("Error during verification:", error);
    throw new Error("Verification failed.");
  }
};
