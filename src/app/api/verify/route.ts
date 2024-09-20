import { type IVerifyResponse, VerificationLevel } from "@worldcoin/idkit";
import { verifyCloudProof } from "@worldcoin/idkit-core/backend";

export type VerifyReply = {
  success: boolean;
  code?: string;
  attribute?: string | null;
  detail?: string;
};

interface IVerifyRequest {
  proof: {
    nullifier_hash: string;
    merkle_root: string;
    proof: string;
    verification_level: VerificationLevel;
  };
  signal?: string;
}

const app_id = process.env.NEXT_PUBLIC_WORLD_ID_APP_ID as `app_${string}`;

export async function POST(req: Request) {
  const {
    nullifier_hash,
    merkle_root,
    proof,
    verification_level,
    action,
    signal,
  } = await req.json();

  console.log("Received verification request:", {
    nullifier_hash,
    merkle_root,
    proof,
    verification_level,
    action,
    signal,
  });

  const vReq: IVerifyRequest = {
    proof: {
      nullifier_hash,
      merkle_root,
      proof,
      verification_level,
    },
    signal,
  };

  const verifyRes: any = (await verifyCloudProof(
    vReq.proof,
    app_id,
    action,
    vReq.signal
  )) as IVerifyResponse;

  console.log("Verification response:", verifyRes);

  if (verifyRes.success) {
    // This is where you should perform backend actions if the verification succeeds
    // Such as, setting a user as "verified" in a database
    return new Response(JSON.stringify(verifyRes), { status: 201 });
  } else {
    if (verifyRes.code === "max_verifications_reached") {
      // Usually these errors are due to a user having already verified.
      // Assume the user is verified and proceed.
      return new Response(JSON.stringify(verifyRes), { status: 200 });
    }

    // This is where you should handle errors from the World ID /verify endpoint.
    // Usually these errors are due to a user having already verified.
    return new Response(JSON.stringify(verifyRes), { status: 400 });
  }

  // return new Response(JSON.stringify({ res: }), { status: 200 });
}
