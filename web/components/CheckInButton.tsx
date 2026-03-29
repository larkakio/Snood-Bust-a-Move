"use client";

import {
  useAccount,
  useChainId,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { BaseError, UserRejectedRequestError } from "viem";
import { useEffect, useState } from "react";
import { getCheckInDataSuffix } from "@/lib/builderSuffix";
import { checkInAbi } from "@/lib/checkInAbi";
import { targetChainId } from "@/lib/chain";

const addr = (process.env.NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS ??
  "0x") as `0x${string}`;

export function CheckInButton() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { writeContract, data: hash, isPending, error, reset } =
    useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      if (error instanceof UserRejectedRequestError) {
        setLocalError("Transaction cancelled in wallet.");
      } else if (error instanceof BaseError) {
        setLocalError(error.shortMessage ?? error.message);
      } else {
        setLocalError(
          error instanceof Error ? error.message : "Transaction failed.",
        );
      }
    } else setLocalError(null);
  }, [error]);

  const ready =
    isConnected &&
    chainId === targetChainId &&
    addr.length === 42 &&
    addr !== "0x0000000000000000000000000000000000000000";

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        disabled={!ready || isPending || isConfirming}
        onClick={() => {
          reset();
          setLocalError(null);
          writeContract({
            address: addr,
            abi: checkInAbi,
            functionName: "checkIn",
            args: [],
            dataSuffix: getCheckInDataSuffix(),
          });
        }}
        className="cyber-btn w-full border-fuchsia-500/50 text-fuchsia-100 shadow-[0_0_20px_rgba(255,0,255,0.2)] disabled:opacity-40"
      >
        {isPending || isConfirming
          ? "Confirm in wallet…"
          : "Daily check-in (on-chain)"}
      </button>
      {!ready && isConnected && chainId === targetChainId && (
        <p className="text-[10px] text-white/50">
          Set <span className="font-mono">NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS</span>{" "}
          after deploy.
        </p>
      )}
      {localError && (
        <p className="text-xs text-rose-300" role="status">
          {localError}
        </p>
      )}
      {isSuccess && (
        <p className="text-xs text-lime-300" role="status">
          Checked in. Streak lives on-chain.
        </p>
      )}
    </div>
  );
}
