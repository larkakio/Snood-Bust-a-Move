"use client";

import { useAccount, useChainId, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { useState } from "react";
import { targetChain, targetChainId } from "@/lib/chain";

export function WalletBar() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connectors, connect, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const [open, setOpen] = useState(false);

  const wrong = isConnected && chainId !== targetChainId;

  return (
    <div className="relative z-30 flex flex-col gap-2">
      {wrong && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-400/60 bg-amber-500/10 px-3 py-2 text-xs text-amber-100"
        >
          <span>Wrong network — switch to {targetChain.name}.</span>
          <button
            type="button"
            disabled={isSwitching}
            onClick={() => switchChain({ chainId: targetChainId })}
            className="rounded border border-amber-400/80 px-2 py-1 font-mono text-[11px] uppercase tracking-wide text-amber-200 hover:bg-amber-500/20 disabled:opacity-50"
          >
            {isSwitching ? "…" : "Switch"}
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        {!isConnected ? (
          <>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="cyber-btn flex-1"
            >
              Connect wallet
            </button>
          </>
        ) : (
          <>
            <span className="truncate font-mono text-xs text-cyan-200/90">
              {address?.slice(0, 6)}…{address?.slice(-4)}
            </span>
            <button
              type="button"
              onClick={() => disconnect()}
              className="cyber-btn-outline shrink-0 px-3 py-2 text-xs"
            >
              Disconnect
            </button>
          </>
        )}
      </div>

      {error && (
        <p className="text-xs text-rose-300" role="status">
          {error.message}
        </p>
      )}

      {open && !isConnected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Choose wallet"
          onClick={() => setOpen(false)}
        >
          <div
            className="cyber-panel w-full max-w-sm p-4 shadow-[0_0_40px_rgba(0,255,255,0.15)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-mono text-sm uppercase tracking-widest text-fuchsia-300">
                Wallets
              </h2>
              <button
                type="button"
                className="text-cyan-400/80 hover:text-cyan-200"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <ul className="flex flex-col gap-2">
              {connectors.map((c) => (
                <li key={c.uid}>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => {
                      connect({ connector: c });
                      setOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded border border-cyan-500/30 bg-black/40 px-3 py-3 text-left font-mono text-sm text-cyan-100 hover:border-fuchsia-400/50 hover:bg-fuchsia-950/30 disabled:opacity-40"
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
