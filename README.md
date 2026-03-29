# Snood — neon bubble shooter for Base

Mobile-first **Next.js** web app (bubble-shooter mechanics + daily **check-in** on Base) with **ERC-8021** builder attribution via `ox`.

**Production:** [snood-bust-a-move.vercel.app](https://snood-bust-a-move.vercel.app)

### Vercel: fix `404` / Base.dev “Failed to fetch URL”

The Next.js app lives in **`web/`**. If Vercel’s **Root Directory** is the repo root (`.`), the deployment will **not** serve the app — you get **404** and Base.dev cannot read `<meta name="base:app_id" …>`.

1. Open [Vercel](https://vercel.com) → your project → **Settings** → **General**.
2. Under **Root Directory**, click **Edit**, set **`web`**, save.
3. **Redeploy** the latest production deployment (Deployments → ⋮ → Redeploy).
4. Check: `curl -sI https://snood-bust-a-move.vercel.app` should return **`200`**; page HTML must contain `base:app_id`.
5. Retry **Verify** on [Base.dev](https://www.base.dev).

In **Settings → Environment Variables**, set the same `NEXT_PUBLIC_*` values as in `web/.env.example` for **Production**.

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

Deployed **CheckIn** (Base mainnet): [`0xd4D6473FA818d0415b66E9B7E99D0d3c6D1d5838`](https://basescan.org/address/0xd4D6473FA818d0415b66E9B7E99D0d3c6D1d5838) — already set in `.env.example`; override in `web/.env.local` / Vercel if you redeploy.

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
