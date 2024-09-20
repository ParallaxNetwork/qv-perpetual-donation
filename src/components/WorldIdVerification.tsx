"use client";

import React, { useState } from "react";
import {
  IDKitWidget,
  ISuccessResult,
  VerificationLevel,
} from "@worldcoin/idkit";

const WorldIDVerification: React.FC = () => {
  // State to control iframe visibility
  // State to control iframe loading and loaded status
  const [iframeLoading, setIframeLoading] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const handleCreateWorldID = () => {
    setIframeLoading(true);
  };

  const handleIframeLoad = () => {
    setIframeLoaded(true);
  };

  const handleVerify = async (result: ISuccessResult) => {
    const { merkle_root, nullifier_hash, proof, verification_level } = result;

    console.log("result", result);

    // The signal used during the proof generation (empty string in your case)
    const signal = ""; // If you used a different signal, replace accordingly

    // The action name you used in IDKitWidget
    const action = process.env.NEXT_PUBLIC_WORLD_ID_ACTION_ID; // Replace with your actual action name if different

    // Prepare the payload
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
        // Handle the success response
        console.log("Verification successful:", data);
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

  // Success callback
  const onSuccess = () => {
    window.location.href = "/successHumanityVerification";

    // response simpen ke local storage
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-6">World ID Verification</h1>

      {!iframeLoading && (
        <>
          {/* IDKitWidget button */}
          <IDKitWidget
            app_id={process.env.NEXT_PUBLIC_WORLD_ID_APP_ID as `app_`} // Replace with your app ID
            action={process.env.NEXT_PUBLIC_WORLD_ID_ACTION_ID as string}
            onSuccess={onSuccess}
            handleVerify={handleVerify}
            verification_level={VerificationLevel.Device}
          >
            {({ open }) => (
              <button
                onClick={open}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Verify with World ID
              </button>
            )}
          </IDKitWidget>

          {/* "Create World ID" button */}
          <button
            onClick={handleCreateWorldID}
            className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Create World ID
          </button>
        </>
      )}

      {/* Iframe Placeholder or Loader */}
      {iframeLoading && !iframeLoaded && (
        <div className="mt-6">
          <p className="text-center">Loading...</p>
        </div>
      )}

      {/* Show iframe when loaded */}
      {iframeLoaded && (
        <iframe
          title="World ID Widget"
          src="https://worldcoin.org/join/OQY91SN"
          width="100%"
          height="800"
          className="mt-6"
          onLoad={handleIframeLoad}
        ></iframe>
      )}

      {/* Hidden iframe to start loading content */}
      {iframeLoading && (
        <iframe
          title="Hidden World ID Widget"
          src="https://worldcoin.org/join/OQY91SN"
          style={{ display: "none" }}
          onLoad={handleIframeLoad}
        ></iframe>
      )}
    </div>
  );
};

export default WorldIDVerification;
