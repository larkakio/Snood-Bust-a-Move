"use client";

import { useEffect, useState } from "react";
import { WalletBar } from "@/components/WalletBar";
import { CheckInButton } from "@/components/CheckInButton";
import { SignWithWallet } from "@/components/SignWithWallet";
import { GameCanvas } from "@/components/game/GameCanvas";

export default function Home() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const fn = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-lg flex-col gap-4 px-4 pb-10 pt-6">
      <header className="space-y-1 text-center">
        <h1 className="bg-gradient-to-r from-fuchsia-400 via-cyan-300 to-lime-300 bg-clip-text font-mono text-2xl font-bold uppercase tracking-[0.2em] text-transparent drop-shadow-[0_0_12px_rgba(5,217,232,0.4)]">
          Snood
        </h1>
        <p className="text-xs text-cyan-200/60">
          Bust-a-Move energy · Base L2 · swipe to aim
        </p>
      </header>

      <GameCanvas reducedMotion={reducedMotion} />

      <section className="cyber-panel space-y-3 p-4">
        <WalletBar />
        <CheckInButton />
        <SignWithWallet />
      </section>
    </main>
  );
}
