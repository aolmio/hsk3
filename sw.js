const VERSION = "9e687d8b53";
const SHELL = `hsk-hub-shell-${VERSION}`;
const RUNTIME = "hsk-hub-runtime-v1";
const SHELL_FILES = ["./", "index.html", "manifest.webmanifest", "css/styles.css", "js/data.js", "js/core.js", "js/ui.js", "js/level.js", "js/confuse.js", "js/pwa.js", "js/offline.js", "js/views.js", "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "icons/apple-touch-icon.png", "icons/favicon-32.png"];
const LIBS = [
"https://cdn.jsdelivr.net/npm/hanzi-writer@3.5/dist/hanzi-writer.min.js",
"https://cdn.jsdelivr.net/npm/pinyin-pro@3.27.0/dist/index.js"
];
const RUNTIME_HOSTS = ["cdn.jsdelivr.net", "fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", event => {
event.waitUntil(
(async () => {
const shell = await caches.open(SHELL);
await shell.addAll(SHELL_FILES.map(f => new Request(f, { cache: "reload" })));
const runtime = await caches.open(RUNTIME);
await Promise.all(
LIBS.map(async url => {
try {
const res = await fetch(url, { mode: "cors" });
if (res.ok) await runtime.put(url, res);
} catch (e) {}
})
);
})()
);
});

self.addEventListener("activate", event => {
event.waitUntil(
(async () => {
const keys = await caches.keys();
await Promise.all(keys.filter(k => k.startsWith("hsk-hub-shell-") && k !== SHELL).map(k => caches.delete(k)));
await self.clients.claim();
})()
);
});

self.addEventListener("message", event => {
const data = event.data || {};
if (data.type === "SKIP_WAITING") self.skipWaiting();
else if (data.type === "GET_VERSION" && event.source) event.source.postMessage({ type: "VERSION", version: VERSION });
});

async function fromShell(request, ignoreSearch) {
const cache = await caches.open(SHELL);
return cache.match(request, { ignoreSearch });
}

async function navigate(request) {
const cached = (await fromShell("index.html", true)) || (await fromShell("./", true));
if (cached) return cached;
try {
return await fetch(request);
} catch (e) {
return new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } });
}
}

async function sameOrigin(request) {
const hit = await fromShell(request, false);
if (hit) return hit;
try {
const res = await fetch(request);
if (res.ok) {
const cache = await caches.open(SHELL);
cache.put(request, res.clone());
}
return res;
} catch (e) {
const fallback = await fromShell(request, true);
if (fallback) return fallback;
throw e;
}
}

async function staleWhileRevalidate(request) {
const cache = await caches.open(RUNTIME);
const hit = await cache.match(request);
const network = fetch(request)
.then(res => {
if (res && (res.ok || res.type === "opaque")) cache.put(request, res.clone());
return res;
})
.catch(() => null);
if (hit) {
network.catch(() => {});
return hit;
}
const res = await network;
return res || new Response("", { status: 504 });
}

self.addEventListener("fetch", event => {
const req = event.request;
if (req.method !== "GET") return;
const url = new URL(req.url);
if (url.origin === self.location.origin) {
if (req.mode === "navigate") event.respondWith(navigate(req));
else event.respondWith(sameOrigin(req));
return;
}
if (RUNTIME_HOSTS.includes(url.hostname) && !url.pathname.includes("hanzi-writer-data")) {
event.respondWith(staleWhileRevalidate(req));
}
});
