declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    NEXTDNS_ENCRYPTION_KEY?: string;
  }
}
