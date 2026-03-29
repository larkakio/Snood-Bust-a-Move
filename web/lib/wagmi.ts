import { http, createConfig, createStorage, cookieStorage } from "wagmi";
import { injected, baseAccount, walletConnect } from "wagmi/connectors";
import { targetChain } from "./chain";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

const connectors = [
  injected(),
  baseAccount({ appName: "Snood" }),
  ...(projectId
    ? [
        walletConnect({
          projectId,
          metadata: {
            name: "Snood",
            description: "Neon bubble shooter on Base",
            url:
              process.env.NEXT_PUBLIC_SITE_URL ?? "https://localhost:3000",
            icons: ["/icon.jpg"],
          },
          showQrModal: true,
        }),
      ]
    : []),
];

export const wagmiConfig = createConfig({
  chains: [targetChain],
  connectors,
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  transports: {
    [targetChain.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
