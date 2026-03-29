"use client";

import { useState } from "react";
import { createSiweMessage, generateSiweNonce } from "viem/siwe";
import {
  useAccount,
  useChainId,
  usePublicClient,
  useSignMessage,
} from "wagmi";
import { targetChainId } from "@/lib/chain";

/** Optional SIWE — proves control of the connected address. */
export function SignWithWallet() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { signMessageAsync } = useSignMessage();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSign() {
    if (
      !isConnected ||
      !address ||
      !publicClient ||
      chainId !== targetChainId
    ) {
      setMsg("Connect wallet on Base first.");
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const nonce = generateSiweNonce();
      const message = createSiweMessage({
        address,
        chainId,
        domain: window.location.host,
        nonce,
        uri: window.location.origin,
        version: "1",
      });
      const signature = await signMessageAsync({ message });
      const valid = await publicClient.verifySiweMessage({
        message,
        signature,
      });
      setMsg(valid ? "Signature verified." : "Verification failed.");
    } catch (e: unknown) {
      const err = e as { name?: string; message?: string };
      if (err.name === "UserRejectedRequestError") {
        setMsg("Signing cancelled.");
      } else {
        setMsg(err.message ?? "Could not sign.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        disabled={!isConnected || busy}
        onClick={onSign}
        className="cyber-btn-outline w-full py-2 text-xs"
      >
        {busy ? "Sign message…" : "Sign with wallet (optional)"}
      </button>
      {msg && (
        <p className="text-[11px] text-cyan-200/80" role="status">
          {msg}
        </p>
      )}
    </div>
  );
}
