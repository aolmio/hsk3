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
if (!ready() && m === "trad" && !CV.warned && !first) {
CV.warned = true;
toast("Conversion data is not loaded yet. Connect to the internet once so it can be saved for offline use.");
}
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

function wrapAll() {
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
toast(mode() === "trad" ? "Showing traditional hanzi 繁體" : "Showing simplified hanzi 简体");
};

function boot() {
if (!S.settings.script) S.settings.script = "simp";
wrapAll();
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
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
})();
