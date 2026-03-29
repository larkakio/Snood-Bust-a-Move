# Snood — neon bubble shooter for Base

Mobile-first **Next.js** web app (bubble-shooter mechanics + daily **check-in** on Base) with **ERC-8021** builder attribution via `ox`.

## Layout

- **`web/`** — Next.js App Router (Vercel **Root Directory** = `web`)
- **`contracts/`** — Foundry: `CheckIn.sol`

## Contracts

```bash
cd contracts
forge test
```

Deploy (set `PRIVATE_KEY` in env):

```bash
cd contracts
forge script script/Deploy.s.sol --rpc-url $BASE_RPC_URL --broadcast
```

Copy the deployed address to `NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS` in Vercel / `.env.local`.

## Web

From repo root:

```bash
cp .env.example web/.env.local
# fill NEXT_PUBLIC_* values in web/.env.local
npm run dev
```

Or from `web/`:

```bash
cd web
cp ../.env.example .env.local
npm run dev
```

Register the app on [Base.dev](https://www.base.dev), set `NEXT_PUBLIC_BASE_APP_ID` and `NEXT_PUBLIC_BUILDER_CODE`.

Branding assets in `web/public/`: `icon.jpg` (1024×1024, under 1MB) and `og-thumbnail.jpg` (1200×628 ≈ 1.91:1, under 1MB) for Base.dev / social previews.

## References

- [Migrate to a Standard Web App](https://docs.base.org/mini-apps/quickstart/migrate-to-standard-web-app)
- [Builder Codes](https://docs.base.org/base-chain/builder-codes/builder-codes)
