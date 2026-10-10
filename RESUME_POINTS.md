## Resume Bullet Points: Scalable URL Shortener

* **Caching & Performance:** Built a URL shortening service with Redis cache-aside caching, reducing redirect p99 latency from **~1,200 ms** to **~130 ms** at a near **99.9%** cache hit rate under 200 concurrent users.
* **Secure ID Generation:** Implemented cryptographically secure, 7-character Base62 short-code generation with PostgreSQL unique constraints and a collision-resolution fallback loop to handle concurrent writes safely.
* **Throughput & Indexing:** Optimized PostgreSQL redirect lookups with B-tree indexing and benchmarked the overall service, sustaining over **2,500** requests/sec at **~130 ms** p99 latency under **200** concurrent users.
* **Security & Production Readiness:** Secured REST API endpoints using strict Zod payload validation and stateless JWT authentication stored in HTTP-only cookies, eliminating injection vulnerabilities while ensuring deep observability with Pino JSON logging.
