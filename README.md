<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/57a34a31-4e02-4160-a3fe-27190e12f1f7

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

---

## Permanent data storage (hosted MySQL) - recommended

By default the workflow runs MySQL inside the GitHub runner and restores/saves it through the GitHub cache.
That can lose the last session's data if the runner stops abruptly. For permanent data, use a hosted MySQL
(Aiven, TiDB Cloud Serverless, Railway, your own VPS) and add these GitHub Secrets:

`MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`
and `MYSQL_SSL=true` if the provider requires TLS.

When `MYSQL_HOST` is set, the workflow skips the cache restore / dump steps automatically.
The app creates its own tables on first start (`initAllTables()` in `src/server/db.ts`).

If the cached backup is ever corrupt, the workflow now stops instead of wiping data.
To deliberately start from an empty database, run the workflow manually with `force_fresh_database = true`.
