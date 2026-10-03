// Cloudflare bindings declared in wrangler.jsonc. `getCloudflareContext().env`
// is typed as CloudflareEnv by @opennextjs/cloudflare.
interface CloudflareEnv {
  DB: D1Database;
  MEDIA: R2Bucket;
  ASSETS: Fetcher;
}
