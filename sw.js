// Offline support.
// App files (page, code, styles, Quran text): fetched fresh from the network first, so every update
// shows up on the next open; the saved copy is used only when offline.
// Audio: saved once and played from the device; never re-downloaded on an update.
const SHELL = "qwr-shell";
const AUDIO = "qwr-audio-1";
const FONT_CACHE = "qwr-fonts";

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const files = await (await fetch("precache.json", { cache: "no-store" })).json();
    const shell = await caches.open(SHELL);
    await shell.addAll(files.filter(f => !f.startsWith("audio/")).map(f => new Request(f, { cache: "reload" })));
    const audio = await caches.open(AUDIO);
    const missing = [];
    for (const f of files.filter(f => f.startsWith("audio/"))) if (!(await audio.match(f))) missing.push(f);
    for (let i = 0; i < missing.length; i += 40) await audio.addAll(missing.slice(i, i + 40));
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (![SHELL, AUDIO, FONT_CACHE].includes(k)) await caches.delete(k);
    await self.clients.claim();
  })());
});

async function fromAudioCache(req) {
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

async function networkFirst(req) {
  const cache = await caches.open(SHELL);
  try {
    const res = await Promise.race([
      fetch(req, { cache: "no-cache" }),
      new Promise((_, no) => setTimeout(() => no(new Error("slow")), 4000)),
    ]);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    return (await cache.match(req, { ignoreSearch: true })) || (await cache.match("index.html")) || new Response("Offline", { status: 503 });
  }
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
  if (url.pathname.includes("/audio/")) { e.respondWith((async () => (await fromAudioCache(e.request)) || fetch(e.request))()); return; }
  e.respondWith(networkFirst(e.request));
});
