"use strict";
(function () {
const CV = { s2t: null, t2s: null, tried: false, warned: false };
const cacheT = new Map();
const cacheS = new Map();
const ATTRS = ["placeholder", "title", "aria-label"];
const SKIP = "script,style,textarea,input,select,[data-no-conv],[data-zw]";
const SKIP_NO_ZW = "script,style,textarea,input,select,[data-no-conv]";
const SIMP_INPUTS = ["lvl-search", "rad-search", "mw-search", "sv-search", "sen-q", "cf-q", "cf-look-q", "pal-input", "an-input", "wd-q"];
const SCRIPT_INPUTS = ["stroke-input", "ws-chars"];
const TEXT_ORIG = new WeakMap();
const ATTR_ORIG = new WeakMap();
let lastMode = null;
let curWord = "";
let observer = null;
let libLoading = null;
const LIB_URLS = ["https://cdn.jsdelivr.net/npm/opencc-js@1.0.5/dist/umd/full.js", "https://unpkg.com/opencc-js@1.0.5/dist/umd/full.js", "https://cdnjs.cloudflare.com/ajax/libs/opencc-js/1.0.5/full.js"];
const FONT_MIRRORS = { sans: "noto-sans-sc", serif: "noto-serif-sc", kai: "lxgw-wen-kai-tc", brush: "ma-shan-zheng", running: "zhi-mang-xing", cursive: "liu-jian-mao-cao", hand: "long-cang", playful: "zcool-kuaile", elegant: "zcool-xiaowei", bold: "zcool-qingke-huangyou" };
const fontWarned = new Set();
const PLACE_KEY = "hsk_hub_place";
let placeSaving = false;
let placeTimer = 0;

function converters() {
if (!CV.tried && window.OpenCC && typeof window.OpenCC.Converter === "function") {
CV.tried = true;
try {
CV.s2t = window.OpenCC.Converter({ from: "cn", to: "tw" });
CV.t2s = window.OpenCC.Converter({ from: "tw", to: "cn" });
} catch (e) {
CV.s2t = null;
CV.t2s = null;
}
}
return CV;
}
function loadOne(url) {
return new Promise(resolve => {
const el = document.createElement("script");
el.src = url;
el.async = true;
el.onload = () => resolve(!!window.OpenCC);
el.onerror = () => {
el.remove();
resolve(false);
};
document.head.append(el);
});
}
function loadLib() {
if (window.OpenCC) return Promise.resolve(true);
if (libLoading) return libLoading;
libLoading = (async () => {
for (const url of LIB_URLS) {
if (window.OpenCC) return true;
if (await loadOne(url)) return true;
}
return !!window.OpenCC;
})().then(ok => {
libLoading = null;
return ok;
});
return libLoading;
}
function afterLibReady() {
cacheT.clear();
cacheS.clear();
updateButton();
lastMode = null;
applyScript(true);
}
function ready() {
const c = converters();
return !!(c.s2t && c.t2s);
}
function run(map, fn, s) {
const hit = map.get(s);
if (hit !== undefined) return hit;
let out = s;
try {
out = fn(s);
} catch (e) {
out = s;
}
if (map.size > 20000) map.clear();
map.set(s, out);
return out;
}
function toTrad(s) {
s = String(s == null ? "" : s);
if (!ZH_RE.test(s)) return s;
const c = converters();
return c.s2t ? run(cacheT, c.s2t, s) : s;
}
function toSimp(s) {
s = String(s == null ? "" : s);
if (!ZH_RE.test(s)) return s;
const c = converters();
return c.t2s ? run(cacheS, c.t2s, s) : s;
}
function mode() {
return S.settings.script === "trad" ? "trad" : "simp";
}
function toScript(s) {
return mode() === "trad" ? toTrad(s) : toSimp(s);
}

function proc(node) {
const v = node.nodeValue;
const k = TEXT_ORIG.get(node);
const m = mode();
let base = v;
if (k && k.out === v) {
if (k.mode === m) return;
base = k.src;
}
if (!ZH_RE.test(base)) {
if (k) TEXT_ORIG.delete(node);
return;
}
const out = toScript(base);
if (out !== v) node.nodeValue = out;
if (out !== base) TEXT_ORIG.set(node, { src: base, out, mode: m });
else TEXT_ORIG.delete(node);
}
function fixZw(el) {
const src = el.getAttribute("data-zw") || "";
const srcChars = Array.from(src);
const out = Array.from(toScript(src));
const usable = out.length === srcChars.length;
const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
const nodes = [];
let n;
while ((n = walker.nextNode())) nodes.push(n);
let i = 0;
nodes.forEach(node => {
const v = node.nodeValue;
let s = "";
Array.from(v).forEach(c => {
s += isZh(c) && usable && out[i] ? out[i] : c;
i++;
});
if (s !== v) node.nodeValue = s;
});
}
function convAttrs(root) {
if (root.nodeType !== 1) return;
const els = [root].concat(Array.from(root.querySelectorAll("[placeholder],[title],[aria-label]")));
els.forEach(el => {
if (el.closest(SKIP_NO_ZW)) return;
let rec = ATTR_ORIG.get(el) || {};
ATTRS.forEach(a => {
const v = el.getAttribute(a);
if (v == null) return;
let base = v;
if (rec[a] && rec[a].out === v) base = rec[a].src;
if (!ZH_RE.test(base)) {
delete rec[a];
return;
}
const out = toScript(base);
if (out !== v) el.setAttribute(a, out);
if (out !== base) rec[a] = { src: base, out };
else delete rec[a];
});
ATTR_ORIG.set(el, rec);
});
}
function processTree(root) {
if (!root) return;
if (root.nodeType === 3) {
const p = root.parentElement;
if (!p) return;
const z = p.closest("[data-zw]");
if (z) fixZw(z);
else if (!p.closest(SKIP)) proc(root);
return;
}
if (root.nodeType !== 1) return;
const zr = root.closest("[data-zw]");
if (zr) {
fixZw(zr);
return;
}
if (root.closest(SKIP_NO_ZW)) return;
const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
acceptNode: n => (n.parentElement && n.parentElement.closest(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT)
});
const nodes = [];
let n;
while ((n = walker.nextNode())) nodes.push(n);
nodes.forEach(proc);
root.querySelectorAll("[data-zw]").forEach(fixZw);
convAttrs(root);
}

function inputProto(el) {
return el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
}
function rawValue(el) {
return Object.getOwnPropertyDescriptor(inputProto(el), "value").get.call(el);
}
function setRawValue(el, v) {
Object.getOwnPropertyDescriptor(inputProto(el), "value").set.call(el, v);
}
function hookInput(el, fn) {
if (!el || el.__zhHooked) return;
el.__zhHooked = true;
const desc = Object.getOwnPropertyDescriptor(inputProto(el), "value");
Object.defineProperty(el, "value", {
configurable: true,
get() {
return fn(desc.get.call(this));
},
set(v) {
desc.set.call(this, v);
}
});
}
function hookInputs(root) {
const scope = root && root.nodeType === 1 ? root : document;
const find = id => (scope.id === id ? scope : scope.querySelector ? scope.querySelector("#" + id) : null);
SIMP_INPUTS.forEach(id => hookInput(find(id), toSimp));
SCRIPT_INPUTS.forEach(id => hookInput(find(id), toScript));
}

function updateButton() {
const btn = document.getElementById("script-btn");
if (!btn) return;
const trad = mode() === "trad";
btn.innerHTML = `<span style="font-weight:${trad ? 400 : 800};opacity:${trad ? 0.5 : 1}">简</span><span style="opacity:.4;margin:0 .12em">/</span><span style="font-weight:${trad ? 800 : 400};opacity:${trad ? 1 : 0.5}">繁</span>`;
btn.setAttribute("aria-pressed", trad ? "true" : "false");
btn.setAttribute("data-no-conv", "");
btn.title = trad ? "Showing traditional hanzi. Click for simplified." : "Showing simplified hanzi. Click for traditional.";
btn.setAttribute("aria-label", btn.title);
document.querySelectorAll('select[data-setting="script"]').forEach(sel => (sel.value = mode()));
document.documentElement.setAttribute("data-script", mode());
}

function refreshWidgets() {
SCRIPT_INPUTS.forEach(id => {
const el = document.getElementById(id);
if (el) setRawValue(el, toScript(rawValue(el)));
});
try {
const stage = document.getElementById("stroke-stage");
if (stage && stage.childElementCount && stage.offsetParent !== null && typeof buildStrokes === "function") buildStrokes();
} catch (e) {}
try {
if (S.route && S.route.name === "worksheet" && typeof wsRender === "function") wsRender();
} catch (e) {}
try {
const dlg = document.getElementById("dlg-word");
if (dlg && dlg.open && curWord) window.openWord(curWord);
} catch (e) {}
}

function applyScript(force) {
if (!S.settings.script) S.settings.script = "simp";
const m = mode();
updateButton();
if (!force && m === lastMode) return;
const first = lastMode === null;
lastMode = m;
processTree(document.body);
if (!first) refreshWidgets();
}

function formsHTML(key) {
if (!ready()) return "";
const trad = toTrad(key);
const same = trad === key;
const g = "font-size:1.15rem;font-weight:700;color:inherit";
const inner = same
? `<span>简体 = 繁體 <b class="han" style="${g}">${esc(key)}</b></span>`
: `<span>简体 <b class="han" style="${g}">${esc(key)}</b></span><span>繁體 <b class="han" style="${g}">${esc(trad)}</b></span>`;
return `<div class="script-forms small" data-no-conv style="display:flex;gap:1rem;flex-wrap:wrap;margin:.35rem 0;opacity:.85">${inner}</div>`;
}

function loadFontCss(f) {
const family = f.stack.split(",")[0].replace(/["']/g, "").trim();
const urls = [`https://fonts.googleapis.com/css2?family=${f.gf}&display=swap`];
if (FONT_MIRRORS[f.id]) urls.push(`https://cdn.jsdelivr.net/npm/@fontsource/${FONT_MIRRORS[f.id]}/index.css`);
let i = 0;
const fail = () => {
fontLoaded.delete(f.id);
if (!fontWarned.has(f.id)) {
fontWarned.add(f.id);
toast("This font could not be downloaded. Check your connection or content blocker, then pick it again.");
}
};
const next = () => {
if (i >= urls.length) {
fail();
return;
}
const link = document.createElement("link");
link.rel = "stylesheet";
link.crossOrigin = "anonymous";
link.href = urls[i++];
const bad = () => {
link.remove();
next();
};
link.onerror = bad;
link.onload = () => {
if (!document.fonts || !document.fonts.load) return;
document.fonts.load(`16px "${family}"`, "你好汉语學習").then(list => {
if (!list || !list.length) bad();
}, bad);
};
document.head.append(link);
};
next();
}

function wrapAll() {
window.ensureFont = function (id) {
const f = fontById(id);
if (!f.gf || fontLoaded.has(f.id)) return;
fontLoaded.add(f.id);
loadFontCss(f);
};

const oHanzi = window.hanziHTML;
window.hanziHTML = function (display, key, raw) {
return `<span class="hzw" data-zw="${esc(display || "")}" style="display:contents">${oHanzi(display, key, raw)}</span>`;
};

const oOpen = window.openWord;
window.openWord = function (key) {
key = String(key == null ? "" : key);
if (!S.dict.has(key)) {
const s = toSimp(key);
if (s !== key && (S.dict.has(s) || S.levelOf.has(s))) key = s;
}
curWord = key;
oOpen(key);
if (!silentWord) wordLayer(key);
const top = document.querySelector("#word-body .d-hanzi");
if (top) {
const html = formsHTML(key);
if (html) top.insertAdjacentHTML("afterend", html);
}
};

const oPal = window.paletteItems;
window.paletteItems = function (q) {
const items = oPal(toSimp(q));
const trad = mode() === "trad";
items.forEach(it => {
if (!it.hz) return;
const alt = trad ? it.hz : toTrad(it.hz);
if (alt && alt !== (trad ? toTrad(it.hz) : it.hz)) it.alt = { tag: trad ? "简" : "繁", text: alt };
});
return items;
};
const oRender = window.renderPalette;
window.renderPalette = function () {
oRender();
document.querySelectorAll("#pal-list .pal-item").forEach(el => {
const it = PAL.items[Number(el.dataset.i)];
const slot = el.querySelector(".grow");
if (it && it.alt && slot) slot.insertAdjacentHTML("afterend", `<span class="faint small han" data-no-conv>${it.alt.tag} ${esc(it.alt.text)}</span>`);
});
};

const oCopy = window.copyText;
window.copyText = function (text, label) {
return oCopy(toScript(text), label);
};

const oCorpus = window.searchCorpus;
window.searchCorpus = function (q, source) {
return oCorpus(toSimp(q), source);
};

const oHl = window.highlightHTML;
window.highlightHTML = function (text, q) {
return oHl(text, toSimp(q));
};

const oWriters = window.makeWriters;
window.makeWriters = function (container, chars, size, opts) {
const out = Array.from(toScript(chars.join("")));
return oWriters(container, out.length === chars.length ? out : chars, size, opts);
};

const oApply = window.applySettings;
window.applySettings = function () {
if (!S.settings.script) S.settings.script = "simp";
oApply();
applyScript(false);
};
}

A["toggle-script"] = () => {
S.settings.script = mode() === "trad" ? "simp" : "trad";
persist.settings();
applyScript(false);
if (ready()) {
toast(mode() === "trad" ? "Showing traditional hanzi 繁體" : "Showing simplified hanzi 简体");
return;
}
toast("Loading conversion data…");
loadLib().then(ok => {
if (ok) {
afterLibReady();
toast(mode() === "trad" ? "Showing traditional hanzi 繁體" : "Showing simplified hanzi 简体");
} else toast("Could not load conversion data. Check your connection and try again.");
});
};

let skipPop = 0;
let pending = false;
let queued = [];
let settleTimer = 0;
let trail = [];
let idx = 0;
let silentWord = false;
const TRAIL_KEY = "hsk_hub_trail";
function settle() {
clearTimeout(settleTimer);
pending = false;
const q = queued;
queued = [];
q.forEach(f => f());
}
function runOrQueue(f) {
if (pending) queued.push(f);
else f();
}
function goBackBy(n) {
if (n <= 0) return;
pending = true;
skipPop++;
history.go(-n);
clearTimeout(settleTimer);
settleTimer = setTimeout(() => {
skipPop = 0;
settle();
}, 900);
}
function pushLayer(extra) {
history.pushState(Object.assign({ hh: 1, i: idx }, extra), "", location.href);
}
function saveTrail() {
try {
const off = Math.max(0, trail.length - 40);
localStorage.setItem(TRAIL_KEY, JSON.stringify({ trail: trail.slice(off), idx: Math.max(0, idx - off) }));
} catch (e) {}
}
function loadTrail() {
try {
const t = JSON.parse(localStorage.getItem(TRAIL_KEY) || "null");
if (t && Array.isArray(t.trail) && t.trail.length && typeof t.idx === "number" && t.trail[t.idx]) return t;
} catch (e) {}
return null;
}
function wordLayer(key) {
const d = document.getElementById("dlg-word");
if (!d || !d.open) return;
if (!d.__pushed) {
d.__pushed = true;
d.__depth = 1;
d.__last = key;
runOrQueue(() => pushLayer({ dlg: "dlg-word", n: 1, w: key }));
return;
}
if (d.__last === key) return;
d.__last = key;
d.__depth = (d.__depth || 1) + 1;
const n = d.__depth;
runOrQueue(() => pushLayer({ dlg: "dlg-word", n, w: key }));
}
function watchDialog(d) {
if (d.__hhWatch) return;
d.__hhWatch = true;
new MutationObserver(() => {
if (d.open && !d.__pushed) {
if (d.id === "dlg-word") return;
d.__pushed = true;
d.__depth = 1;
runOrQueue(() => pushLayer({ dlg: d.id || "dialog", n: 1 }));
} else if (!d.open && d.__pushed) {
const n = d.__depth || 1;
const id = d.id || "dialog";
d.__pushed = false;
d.__depth = 0;
d.__last = "";
if (d.__byBack) d.__byBack = false;
else
runOrQueue(() => {
if (history.state && history.state.dlg === id) goBackBy(n);
});
}
}).observe(d, { attributes: true, attributeFilter: ["open"] });
}
function initHistory() {
const st = history.state;
const h = location.hash || "#/home";
const saved = loadTrail();
if (st && st.hh && typeof st.i === "number") {
idx = st.i;
if (saved && saved.trail[idx] === h) trail = saved.trail.slice();
else trail = [];
trail[idx] = h;
if (st.dlg || st.menu) history.replaceState({ hh: 1, i: idx }, "", location.href);
} else if (saved && (h === "#/home" || !location.hash)) {
trail = saved.trail.slice(0, saved.idx + 1);
history.replaceState({ hh: 1, i: 0 }, "", trail[0]);
for (let k = 1; k < trail.length; k++) history.pushState({ hh: 1, i: k }, "", trail[k]);
idx = trail.length - 1;
if (location.hash !== h) {
try {
route();
} catch (e) {}
}
} else {
trail = [h];
idx = 0;
history.replaceState({ hh: 1, i: 0 }, "", h);
}
saveTrail();
window.addEventListener("hashchange", () => {
const cs = history.state;
if (cs && cs.hh && typeof cs.i === "number") {
idx = cs.i;
trail[idx] = location.hash || "#/home";
} else {
idx += 1;
trail.length = idx;
trail[idx] = location.hash || "#/home";
history.replaceState({ hh: 1, i: idx }, "", location.href);
}
saveTrail();
});
document.querySelectorAll("dialog").forEach(watchDialog);
const app = document.getElementById("app");
let menuPushed = false;
if (app) {
new MutationObserver(() => {
const on = app.classList.contains("menu-open");
if (on && !menuPushed) {
menuPushed = true;
runOrQueue(() => pushLayer({ menu: 1 }));
} else if (!on && menuPushed) {
menuPushed = false;
runOrQueue(() => {
if (history.state && history.state.menu) goBackBy(1);
});
}
}).observe(app, { attributes: true, attributeFilter: ["class"] });
}
window.addEventListener("popstate", () => {
const cs = history.state || {};
if (typeof cs.i === "number") idx = cs.i;
if (skipPop > 0) {
skipPop--;
if (skipPop === 0) settle();
return;
}
const open = Array.from(document.querySelectorAll("dialog")).filter(d => d.open && d.__pushed);
if (open.length) {
const d = open[open.length - 1];
if (cs.dlg === d.id && d.id === "dlg-word" && cs.w) {
silentWord = true;
try {
window.openWord(cs.w);
} finally {
silentWord = false;
}
d.__last = cs.w;
d.__depth = cs.n || 1;
return;
}
if (cs.dlg === d.id) return;
d.__byBack = true;
d.close();
return;
}
if (app && app.classList.contains("menu-open")) {
menuPushed = false;
app.classList.remove("menu-open");
return;
}
if (cs.dlg || cs.menu) history.back();
});
}

function savePlace() {
if (!placeSaving) return;
try {
localStorage.setItem(PLACE_KEY, JSON.stringify({ hash: location.hash, y: Math.round(window.scrollY || 0), t: Date.now() }));
} catch (e) {}
}
function savePlaceSoon() {
if (placeTimer) return;
placeTimer = setTimeout(() => {
placeTimer = 0;
savePlace();
}, 250);
}
function restorePlace() {
let p = null;
try {
p = JSON.parse(localStorage.getItem(PLACE_KEY) || "null");
} catch (e) {}
const start = () => {
placeSaving = true;
};
if (!p || !p.hash || Date.now() - (p.t || 0) > 30 * 86400000) {
start();
return;
}
const cur = location.hash;
if (cur !== p.hash) {
if (cur === "" || cur === "#" || cur === "#/home") location.hash = p.hash;
else {
start();
return;
}
}
const target = Number(p.y) || 0;
let tries = 0;
let done = false;
const finish = () => {
if (done) return;
done = true;
clearInterval(timer);
["touchstart", "wheel", "keydown", "mousedown"].forEach(ev => window.removeEventListener(ev, finish, true));
start();
};
["touchstart", "wheel", "keydown", "mousedown"].forEach(ev => window.addEventListener(ev, finish, { capture: true, passive: true }));
const timer = setInterval(() => {
tries++;
const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
if (max >= target || tries > 30) {
window.scrollTo(0, Math.min(target, max));
if (max >= target || tries > 30) setTimeout(finish, 200);
}
}, 150);
}

function boot() {
if (!S.settings.script) S.settings.script = "simp";
wrapAll();
try {
const cf = fontById(S.settings.hanFont);
if (cf.gf) {
fontLoaded.delete(cf.id);
window.ensureFont(cf.id);
}
} catch (e) {}
hookInputs(document);
applyScript(true);
observer = new MutationObserver(records => {
records.forEach(r => {
if (r.type === "childList") {
r.addedNodes.forEach(n => {
if (n.nodeType === 1) hookInputs(n);
processTree(n);
});
} else if (r.type === "characterData") processTree(r.target);
});
});
observer.observe(document.body, { childList: true, subtree: true, characterData: true });
window.addEventListener("load", () => {
if (ready()) {
cacheT.clear();
cacheS.clear();
processTree(document.body);
}
});
if (!ready()) loadLib().then(ok => ok && afterLibReady());
window.addEventListener("scroll", savePlaceSoon, { passive: true });
window.addEventListener("hashchange", () => setTimeout(savePlace, 400));
window.addEventListener("pagehide", savePlace);
document.addEventListener("visibilitychange", () => {
if (document.visibilityState === "hidden") savePlace();
});
initHistory();
restorePlace();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
})();