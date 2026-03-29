import { base, baseSepolia } from "wagmi/chains";
import type { Chain } from "wagmi/chains";

const id = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? "8453");

export const targetChain: Chain =
  id === baseSepolia.id ? baseSepolia : base;

export const targetChainId = targetChain.id;
