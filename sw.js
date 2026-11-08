// Caches every file the test needs so it works in Airplane Mode.
const CACHE = "audio-test-v1";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png",
  "audio/letter-ba.m4a", "audio/word-bismi.mp3", "audio/word-bismi.m4a", "audio/verse-1-1.mp3"];

self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });

// Safari asks for audio in byte ranges; answer those from the cache too, or audio fails offline.
self.addEventListener("fetch", e => {
  const req = e.request;
  e.respondWith((async () => {
    const cached = await caches.match(req.url, { ignoreSearch: true }) || await caches.match(req, { ignoreSearch: true });
    if (!cached) { try { return await fetch(req); } catch (err) { return new Response("Offline", { status: 503 }); } }
    const range = req.headers.get("range");
    if (!range) return cached;
    const buf = await cached.arrayBuffer();
    const m = /bytes=(\d*)-(\d*)/.exec(range) || [];
    const start = m[1] ? parseInt(m[1], 10) : 0;
    const end = m[2] ? parseInt(m[2], 10) : buf.byteLength - 1;
    return new Response(buf.slice(start, end + 1), { status: 206, headers: {
      "Content-Type": cached.headers.get("Content-Type") || "audio/mpeg",
      "Content-Range": `bytes ${start}-${end}/${buf.byteLength}`,
      "Content-Length": String(end - start + 1), "Accept-Ranges": "bytes" } });
  })());
});
