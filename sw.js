// Offline support: saves the app, the Quran data and every audio clip on the device.
const VERSION = "qwr-v1-10";
const FONT_CACHE = "qwr-fonts";

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    const files = await (await fetch("precache.json", { cache: "no-store" })).json();
    for (let i = 0; i < files.length; i += 40) await cache.addAll(files.slice(i, i + 40));
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== VERSION && k !== FONT_CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

async function fromCache(req) {
  const hit = await caches.match(req, { ignoreSearch: true });
  if (!hit) return null;
  const range = req.headers.get("range");
  if (!range) return hit;
  // Safari asks for audio in byte ranges; answer those from the saved copy so audio works offline.
  const buf = await hit.arrayBuffer();
  const m = /bytes=(\d*)-(\d*)/.exec(range) || [];
  const start = m[1] ? parseInt(m[1], 10) : 0;
  const end = m[2] ? Math.min(parseInt(m[2], 10), buf.byteLength - 1) : buf.byteLength - 1;
  return new Response(buf.slice(start, end + 1), { status: 206, headers: {
    "Content-Type": hit.headers.get("Content-Type") || "audio/mp4",
    "Content-Range": `bytes ${start}-${end}/${buf.byteLength}`, "Content-Length": String(end - start + 1), "Accept-Ranges": "bytes" } });
}

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith((async () => {
      const cache = await caches.open(FONT_CACHE);
      const hit = await cache.match(e.request);
      if (hit) return hit;
      try { const res = await fetch(e.request); cache.put(e.request, res.clone()); return res; } catch (err) { return new Response("", { status: 503 }); }
    })());
    return;
  }
  if (url.origin !== location.origin) return;
  e.respondWith((async () => (await fromCache(e.request)) || fetch(e.request))());
});
