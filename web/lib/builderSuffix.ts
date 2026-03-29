import { Attribution } from "ox/erc8021";
import { type Hex, size } from "viem";

/** ERC-8021 suffix for builder attribution, or undefined if not configured. */
export function getCheckInDataSuffix(): Hex | undefined {
  const raw = process.env.NEXT_PUBLIC_BUILDER_CODE_SUFFIX;
  if (raw?.startsWith("0x") && size(raw as Hex) > 0) return raw as Hex;
  const code = process.env.NEXT_PUBLIC_BUILDER_CODE?.trim();
  if (!code) return undefined;
  const suffix = Attribution.toDataSuffix({ codes: [code] });
  if (!suffix || suffix === "0x" || size(suffix) === 0) return undefined;
  return suffix;
}
