"use strict";
const ESC_MAP = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ESC_MAP[c]);
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const ZH_RE = /[㐀-䶿一-鿿]/;
const isZh = ch => ZH_RE.test(ch);
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const pad2 = n => String(n).padStart(2, "0");
const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const DAY = 86400000;
const MINUTE = 60000;
const shuffle = arr => {
const a = arr.slice();
for (let i = a.length - 1; i > 0; i--) {
const j = Math.floor(Math.random() * (i + 1));
[a[i], a[j]] = [a[j], a[i]];
}
return a;
};
const debounce = (fn, ms) => {
let t;
return (...args) => {
clearTimeout(t);
t = setTimeout(() => fn(...args), ms);
};
};
const ico = (name, extra = "") => `<svg class="ico ${extra}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const pluralize = (n, one, many) => `${n.toLocaleString()} ${n === 1 ? one : many || one + "s"}`;

const store = {
get(key, fallback) {
try {
const raw = localStorage.getItem(key);
return raw == null ? fallback : JSON.parse(raw);
} catch (e) {
return fallback;
}
},
set(key, value) {
try {
localStorage.setItem(key, JSON.stringify(value));
return true;
} catch (e) {
return false;
}
},
remove(key) {
try {
localStorage.removeItem(key);
} catch (e) {}
}
};

const K = {
settings: "hsk_hub_settings",
deck: "hsk_hub_deck",
srs: "hsk_hub_srs",
stats: "hsk_hub_stats",
misc: "hsk_hub_misc",
legacyDeck: "hsk_pro_bookmarks",
legacyTheme: "hsk_pro_theme"
};

const DEFAULT_SETTINGS = {
theme: "auto",
scale: 1,
hanFont: "sans",
reduceMotion: false,
pinyinMode: "marks",
toneColors: true,
hidePinyin: false,
hideMeaning: false,
speechRate: 0.85,
voiceURI: "",
autoSpeak: false,
dailyGoal: 20,
newPerSession: 10,
fcDirection: "zh",
extBreakdown: false
};

const S = {
settings: Object.assign({}, DEFAULT_SETTINGS, store.get(K.settings, {})),
deck: new Map(),
srs: store.get(K.srs, {}) || {},
stats: store.get(K.stats, { days: {}, best: 0 }) || { days: {}, best: 0 },
misc: store.get(K.misc, {}) || {},
dict: new Map(),
levelOf: new Map(),
versions: new Map(),
dictLoaded: new Set(),
drkKeys: {},
vocab: {},
grammar: {},
phrases: null,
posMap: null,
corpus: [],
corpusSeen: new Set(),
corpusState: "idle",
corpusSources: new Map(),
gt: new Map(),
route: { name: "home", args: [] },
level: 1,
tab: "vocab",
syllabus: "all",
page: 1,
levelToken: 0,
noVoiceWarned: false
};
if (!S.stats.days) S.stats.days = {};

const persist = {
settings: () => store.set(K.settings, S.settings),
deck: () => store.set(K.deck, Array.from(S.deck.values())),
srs: () => store.set(K.srs, S.srs),
stats: () => store.set(K.stats, S.stats),
misc: () => store.set(K.misc, S.misc)
};

function loadDeck() {
const arr = store.get(K.deck, null);
if (Array.isArray(arr)) {
arr.forEach(it => it && it.hanzi && S.deck.set(it.hanzi, it));
return;
}
const legacy = store.get(K.legacyDeck, []);
if (Array.isArray(legacy)) {
legacy.forEach(it => {
if (it && it.hanzi) S.deck.set(it.hanzi, { hanzi: it.hanzi, pinyin: it.pinyin || "", meaning: it.meaning || "", level: it.level || "Saved", note: "", added: Date.now() });
});
if (S.deck.size) persist.deck();
}
}

const toasts = {
show(msg, action) {
const wrap = $("#toasts");
if (!wrap) return;
const el = document.createElement("div");
el.className = "toast";
el.setAttribute("role", "status");
el.append(document.createTextNode(msg));
if (action) {
const b = document.createElement("button");
b.type = "button";
b.textContent = action.label;
b.onclick = () => {
action.run();
el.remove();
};
el.append(b);
}
wrap.append(el);
setTimeout(() => {
el.style.opacity = "0";
el.style.transition = "opacity .25s";
setTimeout(() => el.remove(), 260);
}, action ? 5200 : 2400);
while (wrap.children.length > 3) wrap.firstChild.remove();
}
};
const toast = (msg, action) => toasts.show(msg, action);

function downloadFile(name, text, mime) {
const blob = new Blob([text], { type: mime || "text/plain;charset=utf-8" });
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = name;
document.body.append(a);
a.click();
a.remove();
setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function copyText(text, label) {
try {
await navigator.clipboard.writeText(text);
} catch (e) {
const ta = document.createElement("textarea");
ta.value = text;
ta.style.position = "fixed";
ta.style.opacity = "0";
document.body.append(ta);
ta.select();
try {
document.execCommand("copy");
} catch (err) {}
ta.remove();
}
toast(`${label || "Text"} copied`);
}

function dialogAsk({ title, message, okLabel = "OK", input = null, danger = false, cancel = true }) {
return new Promise(resolve => {
const dlg = $("#dlg-confirm");
$("#confirm-title").textContent = title;
$("#confirm-msg").textContent = message || "";
const ta = $("#confirm-input");
ta.hidden = input === null;
ta.value = input === null ? "" : input;
const ok = $("#confirm-ok");
ok.textContent = okLabel;
ok.classList.toggle("danger", danger);
$("#confirm-cancel").hidden = !cancel;
const done = () => {
dlg.removeEventListener("close", done);
resolve(dlg.returnValue === "ok" ? (input === null ? true : ta.value) : null);
};
dlg.addEventListener("close", done);
dlg.returnValue = "cancel";
dlg.showModal();
if (input !== null) ta.focus();
});
}

const TONE_TABLE = {
a: ["ā", "á", "ǎ", "à", "a"], e: ["ē", "é", "ě", "è", "e"], i: ["ī", "í", "ǐ", "ì", "i"], o: ["ō", "ó", "ǒ", "ò", "o"], u: ["ū", "ú", "ǔ", "ù", "u"],
"ü": ["ǖ", "ǘ", "ǚ", "ǜ", "ü"], v: ["ǖ", "ǘ", "ǚ", "ǜ", "ü"],
A: ["Ā", "Á", "Ǎ", "À", "A"], E: ["Ē", "É", "Ě", "È", "E"], I: ["Ī", "Í", "Ǐ", "Ì", "I"], O: ["Ō", "Ó", "Ǒ", "Ò", "O"], U: ["Ū", "Ú", "Ǔ", "Ù", "U"],
"Ü": ["Ǖ", "Ǘ", "Ǚ", "Ǜ", "Ü"]
};
const TONE_REV = {};
Object.entries(TONE_TABLE).forEach(([base, arr]) => {
if (base === "v") return;
arr.slice(0, 4).forEach(m => {
TONE_REV[m] = base;
});
});
const MARK_RES = [
[1, /[āēīōūǖĀĒĪŌŪǕ]/],
[2, /[áéíóúǘÁÉÍÓÚǗ]/],
[3, /[ǎěǐǒǔǚǍĚǏǑǓǙ]/],
[4, /[àèìòùǜÀÈÌÒÙǛ]/]
];
const VOW = "aeiouüāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ";
const SYL_RE = new RegExp(`(?:[zcs]h|[bpmfdtnlgkhjqxrzcsyw])?[${VOW}]+(?:ng(?![${VOW}])|n(?![${VOW}])|r(?![${VOW}]))?`, "gi");
const APOS_RE = /^[aeo]/i;

function toneOf(s) {
if (!s) return 5;
for (const [t, re] of MARK_RES) if (re.test(s)) return t;
const m = /([1-5])$/.exec(s);
return m ? Number(m[1]) : 5;
}
function stripTone(s) {
return String(s || "").split("").map(c => TONE_REV[c] || c).join("").replace(/[1-5]$/, "");
}
function setTone(syl, tone) {
const clean = stripTone(syl);
const idx = tone - 1;
for (const v of ["a", "A", "e", "E", "o", "O"]) {
const at = clean.indexOf(v);
if (at >= 0) return clean.slice(0, at) + TONE_TABLE[v][idx] + clean.slice(at + 1);
}
const iu = clean.indexOf("iu");
if (iu >= 0) return clean.slice(0, iu + 1) + TONE_TABLE.u[idx] + clean.slice(iu + 2);
const ui = clean.indexOf("ui");
if (ui >= 0) return clean.slice(0, ui + 1) + TONE_TABLE.i[idx] + clean.slice(ui + 2);
for (let i = clean.length - 1; i >= 0; i--) {
const ch = clean[i];
if ("iuüIUÜv".includes(ch)) return clean.slice(0, i) + TONE_TABLE[ch][idx] + clean.slice(i + 1);
}
return clean;
}
function toNumbered(s) {
const t = toneOf(s);
const base = stripTone(s);
return t === 5 ? base : base + t;
}
function fmtSyl(s) {
return S.settings.pinyinMode === "numbers" && /[a-zA-Zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]/.test(s) ? toNumbered(s) : s;
}
function plainPinyin(p) {
return stripTone(String(p || "")).toLowerCase().replace(/[\s’']/g, "");
}
function rawSyllables(str) {
const toks = String(str || "").replace(/[’']/g, " ").trim().split(/\s+/).filter(Boolean);
const out = [];
toks.forEach(t => {
SYL_RE.lastIndex = 0;
const m = t.match(SYL_RE);
if (m && m.join("").length === t.length) out.push(...m);
else out.push(t);
});
return out;
}
function sylHTML(s) {
return `<span class="sy tone-${toneOf(s)}">${esc(fmtSyl(s))}</span>`;
}
function pinyinHTML(arr) {
let out = "";
arr.forEach((s, i) => {
if (i > 0 && APOS_RE.test(stripTone(s))) out += "’";
out += sylHTML(s);
});
return out;
}
function pinyinStrHTML(str) {
return String(str || "").trim().split(/\s+/).filter(Boolean).map(tok => {
if (!/[a-zA-Zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]/.test(tok)) return esc(tok);
return pinyinHTML(rawSyllables(tok));
}).join(" ");
}
function joinText(arr) {
let out = "";
arr.forEach((s, i) => {
if (i > 0 && APOS_RE.test(stripTone(s))) out += "’";
out += fmtSyl(s);
});
return out;
}

function ppLib() {
return typeof pinyinPro !== "undefined" && pinyinPro && typeof pinyinPro.pinyin === "function" ? pinyinPro : null;
}
function runPinyin(run) {
const lib = ppLib();
if (!lib) return null;
try {
const arr = lib.pinyin(run, { toneType: "symbol", type: "array" });
return Array.isArray(arr) && arr.length === Array.from(run).length ? arr : null;
} catch (e) {
return null;
}
}
function charFallback(ch) {
const d = S.dict.get(ch);
if (d && d.pinyin) {
const r = rawSyllables(d.pinyin);
if (r.length === 1) return r[0];
}
return ch;
}
function baseSyllables(text) {
const chars = Array.from(text || "");
const out = new Array(chars.length);
let i = 0;
while (i < chars.length) {
if (!isZh(chars[i])) {
out[i] = chars[i];
i++;
continue;
}
let j = i;
while (j < chars.length && isZh(chars[j])) j++;
const arr = runPinyin(chars.slice(i, j).join(""));
for (let k = i; k < j; k++) {
const ch = chars[k];
out[k] = ch === "一" ? "yī" : ch === "不" ? "bù" : (arr && arr[k - i]) || charFallback(ch);
}
i = j;
}
return out;
}

const ORD_PREV = new Set(["第", "初", "十", "百", "千", "万", "零", "〇", "二", "三", "四", "五", "六", "七", "八", "九"]);
const NUM_NEXT = new Set(["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "零", "〇", "月", "号"]);

function analyzeSandhi(chars, baseSyls) {
const n = chars.length;
const orig = baseSyls.map((s, i) => (chars[i] === "一" ? "yī" : chars[i] === "不" ? "bù" : s));
const origTone = orig.map((s, i) => (isZh(chars[i]) ? toneOf(s) : 0));
const spoken = orig.slice();
const rule = new Array(n).fill(null);
const notes = [];
const note = (i, ruleName, detail) => {
const obj = { index: i, char: chars[i], pair: chars[i] + (chars[i + 1] || ""), rule: ruleName, orig: orig[i], spoken: spoken[i], detail };
notes.push(obj);
rule[i] = obj;
};
for (let i = 0; i < n; i++) {
const ch = chars[i];
if (ch !== "不" && ch !== "一") continue;
const prev = i > 0 ? chars[i - 1] : "";
const next = i + 1 < n ? chars[i + 1] : "";
if (!isZh(next)) continue;
if (isZh(prev) && prev === next && !ORD_PREV.has(prev)) {
spoken[i] = ch === "不" ? "bu" : "yi";
note(i, `${ch} neutral in V${ch}V`, `“${ch}” is unstressed (neutral tone) between a repeated verb or adjective: ${prev}${ch}${next}.`);
continue;
}
if (ch === "不") {
if (origTone[i + 1] === 4) {
spoken[i] = "bú";
note(i, "不 → bú", `“不” turns from bù to bú (2nd tone) before the 4th-tone syllable “${next}” (${orig[i + 1]}).`);
}
} else {
if (ORD_PREV.has(prev) || NUM_NEXT.has(next)) continue;
const nt = origTone[i + 1];
if (nt === 4) {
spoken[i] = "yí";
note(i, "一 → yí", `“一” turns from yī to yí (2nd tone) before the 4th-tone syllable “${next}” (${orig[i + 1]}).`);
} else if (nt >= 1 && nt <= 3) {
spoken[i] = "yì";
note(i, "一 → yì", `“一” turns from yī to yì (4th tone) before the tone-${nt} syllable “${next}” (${orig[i + 1]}).`);
}
}
}
let i = 0;
while (i < n) {
if (origTone[i] === 3 && !rule[i]) {
let j = i;
while (j + 1 < n && origTone[j + 1] === 3 && !rule[j + 1]) j++;
for (let k = i; k < j; k++) {
spoken[k] = setTone(orig[k], 2);
note(k, "3rd + 3rd tone", `“${chars[k]}” (${orig[k]}) becomes 2nd tone (${spoken[k]}) before the 3rd-tone syllable “${chars[k + 1]}” (${orig[k + 1]}).`);
}
i = j + 1;
} else {
i++;
}
}
const spokenTone = spoken.map((s, idx) => (isZh(chars[idx]) ? toneOf(s) : 0));
return { orig, origTone, spoken, spokenTone, notes, rule };
}

const wordCache = new Map();
function analyzeWord(hanzi, raw) {
const ck = `${hanzi}|${raw || ""}`;
if (wordCache.has(ck)) return wordCache.get(ck);
const chars = Array.from(hanzi || "").filter(isZh);
let res;
if (!chars.length) {
res = { chars: [], orig: [], spoken: [], notes: [], rule: [], spokenTone: [] };
} else {
const rs = raw ? rawSyllables(raw) : [];
const base = rs.length === chars.length ? rs : baseSyllables(chars.join(""));
const a = analyzeSandhi(chars, base);
res = { chars, orig: a.orig, spoken: a.spoken, notes: a.notes, rule: a.rule, spokenTone: a.spokenTone };
}
wordCache.set(ck, res);
if (wordCache.size > 6000) wordCache.delete(wordCache.keys().next().value);
return res;
}
function wordPinyinHTML(key, raw) {
const a = analyzeWord(key, raw);
return a.spoken.length ? pinyinHTML(a.spoken) : pinyinStrHTML(raw || "");
}
function wordPinyinText(key, raw) {
const a = analyzeWord(key, raw);
return a.spoken.length ? joinText(a.spoken) : String(raw || "");
}
function hanziHTML(display, key, raw) {
const a = analyzeWord(key || display, raw);
let zi = 0;
return Array.from(display || "").map(ch => {
if (!isZh(ch)) return esc(ch);
const s = a.spoken[zi++];
return s ? `<span class="tone-${toneOf(s)}">${esc(ch)}</span>` : esc(ch);
}).join("");
}
function sandhiPill(a, long) {
if (!a.notes.length) return "";
const n = a.notes[0];
const origTxt = pinyinHTML(a.orig);
return `<div class="pill-note" title="${esc(n.detail)}">${ico("volume")}Sandhi · written ${origTxt}${long ? " · " + esc(n.rule) : ""}</div>`;
}

const idb = {
db: null,
ready: null,
open() {
if (this.ready) return this.ready;
this.ready = new Promise(resolve => {
try {
const rq = indexedDB.open("hsk_hub_cache", 1);
rq.onupgradeneeded = () => rq.result.createObjectStore("kv");
rq.onsuccess = () => {
this.db = rq.result;
resolve(true);
};
rq.onerror = () => resolve(false);
rq.onblocked = () => resolve(false);
} catch (e) {
resolve(false);
}
});
return this.ready;
},
async get(key) {
await this.open();
if (!this.db) return null;
return new Promise(resolve => {
try {
const rq = this.db.transaction("kv").objectStore("kv").get(key);
rq.onsuccess = () => resolve(rq.result || null);
rq.onerror = () => resolve(null);
} catch (e) {
resolve(null);
}
});
},
async set(key, value) {
await this.open();
if (!this.db) return;
try {
this.db.transaction("kv", "readwrite").objectStore("kv").put(value, key);
} catch (e) {}
},
async clear() {
await this.open();
if (!this.db) return;
return new Promise(resolve => {
try {
const tx = this.db.transaction("kv", "readwrite");
tx.objectStore("kv").clear();
tx.oncomplete = () => resolve();
tx.onerror = () => resolve();
} catch (e) {
resolve();
}
});
}
};

const NET = { inflight: new Map(), ok: 0, fail: 0 };
const CACHE_TTL = 180 * DAY;
const STROKE_URL = c => `https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/${encodeURIComponent(c)}.json`;
async function netFetch(url, kind) {
if (typeof navigator !== "undefined" && navigator.onLine === false) return null;
const ctl = new AbortController();
const timer = setTimeout(() => ctl.abort(), 20000);
try {
const res = await fetch(url, { signal: ctl.signal });
if (!res.ok) return null;
return kind === "text" ? await res.text() : await res.json();
} catch (e) {
return null;
} finally {
clearTimeout(timer);
}
}
function fetchRemote(url, kind = "json", force = false) {
const id = `${kind}|${url}`;
if (NET.inflight.has(id)) return NET.inflight.get(id);
const p = (async () => {
const hit = force ? null : await idb.get(url);
if (hit && Date.now() - hit.t < CACHE_TTL) return hit.v;
const data = await netFetch(url, kind);
if (data != null) {
NET.ok++;
idb.set(url, { t: Date.now(), v: data });
return data;
}
NET.fail++;
return hit ? hit.v : null;
})();
NET.inflight.set(id, p);
p.finally(() => NET.inflight.delete(id));
return p;
}

function addDict(key, pinyin, meaning, pos, lvl, ver) {
if (!key) return;
const cur = S.dict.get(key);
if (!cur) {
S.dict.set(key, { pinyin: pinyin || "", meaning: meaning || "", pos: pos || "", pn: plainPinyin(pinyin) });
} else {
if (pinyin && !cur.pinyin) {
cur.pinyin = pinyin;
cur.pn = plainPinyin(pinyin);
}
if (meaning && (!cur.meaning || ver === "hsk30")) cur.meaning = meaning;
if (pos && !cur.pos) cur.pos = pos;
}
if (lvl) {
const old = S.levelOf.get(key);
if (!old || lvl < old) S.levelOf.set(key, lvl);
}
if (ver) {
let set = S.versions.get(key);
if (!set) {
set = new Set();
S.versions.set(key, set);
}
set.add(ver);
}
}

function seedDictionary() {
SEED_DICT.split("\n").forEach(line => {
const parts = line.trim().split("|");
if (parts.length < 4) return;
const [hz, py, mean, lv] = parts;
if (S.dict.has(hz) && S.dict.get(hz).meaning) {
const old = S.levelOf.get(hz);
if (!old || Number(lv) < old) S.levelOf.set(hz, Number(lv));
return;
}
addDict(hz, py, mean, "", Number(lv), null);
});
}

const DRK_BASE = "https://raw.githubusercontent.com/drkameleon/complete-hsk-vocabulary/main/wordlists/exclusive";
const LEON = "https://raw.githubusercontent.com/leonsilicon";

function ingestDrk(list, lvl, ver) {
const keys = [];
if (!Array.isArray(list)) return keys;
for (const item of list) {
const form = (item.forms && item.forms[0]) || {};
const trans = form.transcriptions || {};
const key = item.simplified || "";
if (!key) continue;
addDict(key, trans.pinyin || "", (form.meanings || []).join("; "), (item.pos || []).join(", "), lvl, ver);
keys.push(key);
}
return keys;
}

async function loadDictLevel(lvl) {
if (S.dictLoaded.has(lvl)) return;
const lv = lvl === 7 ? "7-9" : String(lvl);
const [oldRaw, newRaw] = await Promise.all([
lvl <= 6 ? fetchRemote(`${DRK_BASE}/old/${lvl}.json`) : null,
fetchRemote(`${DRK_BASE}/new/${lv}.json`)
]);
S.drkKeys[lvl] = { old: ingestDrk(oldRaw, lvl, "hsk20"), new: ingestDrk(newRaw, lvl, "hsk30") };
if (oldRaw || newRaw) S.dictLoaded.add(lvl);
}

const dictStatus = { running: false, done: 0 };
async function loadAllDictionaries() {
if (dictStatus.running) return;
dictStatus.running = true;
updateDictPill();
const queue = [1, 2, 3, 4, 5, 6, 7].filter(l => !S.dictLoaded.has(l));
const worker = async () => {
while (queue.length) {
const lvl = queue.shift();
await loadDictLevel(lvl);
dictStatus.done++;
updateDictPill();
}
};
await Promise.all([worker(), worker()]);
dictStatus.running = false;
wordCache.clear();
updateDictPill();
document.dispatchEvent(new CustomEvent("dict-ready"));
}
function updateDictPill() {
const pill = $("#dict-pill");
if (!pill) return;
if (dictStatus.running) {
pill.classList.add("show");
pill.textContent = `Loading dictionary ${dictStatus.done}/7`;
} else {
pill.classList.remove("show");
pill.textContent = "";
}
}

function parseLeonList(raw) {
if (!Array.isArray(raw)) return [];
const out = [];
for (const item of raw) {
if (Array.isArray(item) && item.length) out.push({ key: item[item.length - 1], display: item.join(" / ") });
else if (typeof item === "string") out.push({ key: item, display: item });
}
return out;
}
function parseKrmanik(txt) {
if (!txt) return [];
return txt.split(/\r?\n/).map(s => s.trim()).filter(Boolean).map(w => {
const clean = w.replace(/[0-9]/g, "").replace(/（.*?）/g, "").trim();
return { key: clean || w, display: w };
});
}

async function loadVocabLevel(lvl, force = false) {
if (S.vocab[lvl] && !force) return S.vocab[lvl];
if (force) S.dictLoaded.delete(lvl);
const lvStr = lvl === 7 ? "7-9" : String(lvl);
await loadDictLevel(lvl);
const needPos = !S.posMap && lvl <= 6;
const [leon20, pos, leon30, leon31, krm] = await Promise.all([
lvl <= 6 ? fetchRemote(`${LEON}/hsk2.0/main/HSK2.0_words_level${lvl}.json`, "json", force) : null,
needPos ? fetchRemote(`${LEON}/hsk2.0/main/HSK2.0_word_pos.json`) : null,
fetchRemote(`${LEON}/hsk3.0/main/HSK3.0_words_level${lvStr}.json`, "json", force),
fetchRemote(`${LEON}/hsk3.1/main/HSK3.1_words_level${lvStr}.json`, "json", force),
fetchRemote(`https://raw.githubusercontent.com/krmanik/HSK-3.0/main/New%20HSK%20(2025)/HSK%20Words/HSK_Level_${lvStr}_words.txt`, "text", force)
]);
if (pos && typeof pos === "object") S.posMap = pos;
const map = new Map();
const upsert = (key, display, ver) => {
if (!key) return;
addDict(key, "", "", S.posMap && S.posMap[key] ? S.posMap[key].join(", ") : "", lvl, ver);
const ex = map.get(key);
if (ex) {
ex.versions.add(ver);
if (display.includes("/") && !ex.hanzi.includes("/")) ex.hanzi = display;
} else {
map.set(key, { key, hanzi: display || key, level: lvl, versions: new Set([ver]) });
}
};
const keys = S.drkKeys[lvl] || { old: [], new: [] };
keys.old.forEach(k => upsert(k, k, "hsk20"));
parseLeonList(leon20).forEach(w => upsert(w.key, w.display, "hsk20"));
keys.new.forEach(k => upsert(k, k, "hsk30"));
parseLeonList(leon30).forEach(w => upsert(w.key, w.display, "hsk30"));
parseLeonList(leon31).forEach(w => upsert(w.key, w.display, "hsk31"));
parseKrmanik(krm).forEach(w => upsert(w.key, w.display, "hsk31"));
let offline = false;
let list = Array.from(map.values());
if (!list.length) {
offline = true;
list = [];
S.levelOf.forEach((l, key) => {
if (l === lvl && Array.from(key).length > 0) {
const d = S.dict.get(key);
if (d && d.meaning) list.push({ key, hanzi: key, level: lvl, versions: new Set(["hsk30"]) });
}
});
}
list = list.map(e => {
const d = S.dict.get(e.key) || {};
return { key: e.key, hanzi: e.hanzi, pinyin: d.pinyin || baseSyllables(e.key).join(" "), meaning: d.meaning || "", pos: d.pos || "", level: lvl, versions: Array.from(e.versions) };
});
const result = { list, offline };
S.vocab[lvl] = result;
return result;
}

function splitCSVLine(line) {
const out = [];
let cur = "";
let quotes = false;
for (let i = 0; i < line.length; i++) {
const c = line[i];
if (c === '"') {
if (quotes && line[i + 1] === '"') {
cur += '"';
i++;
} else {
quotes = !quotes;
}
} else if (c === "," && !quotes) {
out.push(cur.trim());
cur = "";
} else {
cur += c;
}
}
out.push(cur.trim());
return out;
}

function addCorpus(zh, en, src, py) {
if (!zh || S.corpusSeen.has(zh)) return;
S.corpusSeen.add(zh);
S.corpus.push({ zh, en: en || "", src, py: py || "" });
S.corpusSources.set(src, (S.corpusSources.get(src) || 0) + 1);
}

function parseGrammarCSV(csv, lvl) {
const lines = csv.split(/\r?\n/).filter(l => l.trim());
const map = new Map();
for (let i = 1; i < lines.length; i++) {
const cols = splitCSVLine(lines[i]);
if (cols.length < 8) continue;
const zh = cols[1] || cols[0];
const py = cols[2] || "";
const en = cols[3] || "";
const struct = cols[5] || "";
const usage = cols[6] || "";
const title = cols[7] || struct || "Grammar structure";
const link = cols[8] || "";
if (zh && en) addCorpus(zh, en, "Grammar examples", py);
if (!map.has(title)) map.set(title, { title, struct, usage, link, examples: [], sourceTag: "AllSet Grammar Wiki" });
const entry = map.get(title);
if (zh && entry.examples.length < 3) entry.examples.push({ zh, py, en });
}
return Array.from(map.values());
}

async function loadGrammar(lvl, force = false) {
if (S.grammar[lvl] && !force) return S.grammar[lvl];
const lvStr = lvl === 7 ? "7-9" : String(lvl);
const [csv, json] = await Promise.all([
lvl <= 6 ? fetchRemote(`https://raw.githubusercontent.com/krmanik/Chinese-Grammar/master/CSV%20Files%20HSK1%20-%20HSK6/hsk${lvl}.csv`, "text", force) : null,
fetchRemote(`https://raw.githubusercontent.com/krmanik/HSK-3.0/main/New%20HSK%20(2025)/HSK%20Grammar/json/HSK%20${lvStr}.json`, "json", force)
]);
const out = [];
if (csv) out.push(...parseGrammarCSV(csv, lvl));
if (Array.isArray(json)) {
json.forEach(it => {
const cat = it["类别"] || "";
const catName = it["类别名称"] || "";
const detail = it["细目"] || "";
const content = it["语法内容"] || "";
if (content || detail) {
out.push({
title: `${cat ? `[${cat}] ` : ""}${catName}${detail ? " · " + detail : ""}`.trim() || "Grammar point",
struct: content || detail,
usage: `Official HSK 3.0 / 3.1 grammar point · level ${lvStr}`,
link: "https://github.com/krmanik/HSK-3.0",
examples: [],
sourceTag: "HSK 3.0 syllabus"
});
}
});
}
S.grammar[lvl] = out;
return out;
}

async function loadPhrases(force = false) {
if (S.phrases && !force) return S.phrases;
const sources = [
[`${LEON}/hsk2.0/main/HSK2.0_chengyu.json`, "HSK 2.0 chengyu"],
[`${LEON}/hsk3.0/main/HSK3.0_chengyu.json`, "HSK 3.0 chengyu"],
[`${LEON}/hsk3.1/main/HSK3.1_chengyu.json`, "HSK 3.1 chengyu"],
[`${LEON}/hsk3.1/main/HSK3.1_4char_phrases.json`, "HSK 3.1 four-character"]
];
const lists = await Promise.all(sources.map(s => fetchRemote(s[0], "json", force)));
const map = new Map();
lists.forEach((arr, i) => {
if (!Array.isArray(arr)) return;
arr.forEach(p => {
if (typeof p !== "string" || !p) return;
if (map.has(p)) map.get(p).tags.add(sources[i][1]);
else map.set(p, { hanzi: p, tags: new Set([sources[i][1]]) });
});
});
S.phrases = Array.from(map.values()).map(p => {
const d = S.dict.get(p.hanzi) || {};
return { hanzi: p.hanzi, pinyin: d.pinyin || "", meaning: d.meaning || "", tags: Array.from(p.tags) };
});
return S.phrases;
}

function initCorpus() {
BUILTIN_SENTENCES.forEach(([zh, en]) => addCorpus(zh, en, "Built-in"));
}

async function ensureCorpus() {
if (S.corpusState !== "idle") return;
S.corpusState = "loading";
updateCorpusStatus();
try {
await Promise.all([1, 2, 3, 4, 5, 6].map(l => loadGrammar(l)));
const urls = [
`${LEON}/tatoeba-sentence-pairs-in-mandarin-chinese-english/main/sentences.json`,
"https://cdn.jsdelivr.net/gh/leonsilicon/tatoeba-sentence-pairs-in-mandarin-chinese-english@main/sentences.json"
];
let pairs = null;
for (const u of urls) {
pairs = await fetchRemote(u, "json");
if (Array.isArray(pairs) && pairs.length) break;
}
if (Array.isArray(pairs)) {
const max = Math.min(pairs.length, 45000);
for (let i = 0; i < max; i++) {
const row = pairs[i];
if (Array.isArray(row) && row.length >= 4) addCorpus(row[1], row[3], "Tatoeba");
}
}
} catch (e) {}
S.corpusState = "ready";
updateCorpusStatus();
document.dispatchEvent(new CustomEvent("corpus-ready"));
}
function updateCorpusStatus() {
const el = $("#corpus-status");
if (!el) return;
if (S.corpusState === "loading") el.textContent = "Loading corpora…";
else el.textContent = `${S.corpus.length.toLocaleString()} sentences indexed`;
}

function searchCorpus(q, source) {
const query = q.trim();
if (!query) return [];
const hasZh = Array.from(query).some(isZh);
const low = query.toLowerCase();
const out = [];
for (let i = 0; i < S.corpus.length; i++) {
const it = S.corpus[i];
if (source && it.src !== source) continue;
if (hasZh ? it.zh.includes(query) : it.en.toLowerCase().includes(low)) out.push(it);
}
if (hasZh) out.sort((a, b) => a.zh.length - b.zh.length);
return out;
}

function segment(text) {
const chars = Array.from(text || "");
const out = [];
let i = 0;
const hasSeg = typeof Intl !== "undefined" && Intl.Segmenter;
const segmenter = hasSeg ? new Intl.Segmenter("zh", { granularity: "word" }) : null;
const dictReady = S.dict.size > 500;
const fmm = run => {
const rc = Array.from(run);
const res = [];
let p = 0;
while (p < rc.length) {
let m = 0;
for (let L = Math.min(8, rc.length - p); L >= 2; L--) {
if (S.dict.has(rc.slice(p, p + L).join(""))) {
m = L;
break;
}
}
if (m) {
res.push(rc.slice(p, p + m).join(""));
p += m;
} else {
res.push(rc[p]);
p++;
}
}
return res;
};
const splitRun = run => {
let toks;
if (segmenter) {
toks = [];
for (const part of segmenter.segment(run)) toks.push(part.segment);
} else {
toks = fmm(run);
return toks;
}
if (!dictReady) return toks;
const merged = [];
let p = 0;
while (p < toks.length) {
let best = 1;
let acc = toks[p];
for (let k = 2; k <= 4 && p + k <= toks.length; k++) {
acc += toks[p + k - 1];
if (Array.from(acc).length <= 8 && S.dict.has(acc)) best = k;
}
merged.push(toks.slice(p, p + best).join(""));
p += best;
}
const final = [];
merged.forEach(t => {
if (Array.from(t).length > 1 && !S.dict.has(t)) {
const parts = fmm(t);
if (parts.every(x => S.dict.has(x))) final.push(...parts);
else final.push(t);
} else {
final.push(t);
}
});
return final;
};
while (i < chars.length) {
const c = chars[i];
if (isZh(c)) {
let j = i;
while (j < chars.length && isZh(chars[j])) j++;
splitRun(chars.slice(i, j).join("")).forEach(t => out.push({ text: t, zh: true }));
i = j;
} else if (/[A-Za-z0-9]/.test(c)) {
let j = i;
while (j + 1 < chars.length && /[A-Za-z0-9.]/.test(chars[j + 1])) j++;
out.push({ text: chars.slice(i, j + 1).join(""), zh: false });
i = j + 1;
} else {
out.push({ text: c, zh: false });
i++;
}
}
return out;
}

function levelOfWord(word) {
if (S.levelOf.has(word)) return { level: S.levelOf.get(word), inferred: false };
let max = 0;
for (const c of Array.from(word)) {
const l = S.levelOf.get(c) || 0;
if (l > max) max = l;
}
return { level: max, inferred: max > 0 };
}

function levelTagHTML(lvl) {
const label = lvl === 0 ? "Unlisted" : lvl === 7 ? "HSK 7–9" : `HSK ${lvl}`;
return `<span class="lvl-tag l-${lvl}">${label}</span>`;
}

function getEntry(key) {
const d = S.dict.get(key);
const dk = S.deck.get(key);
const sr = S.srs[key];
if (!d && !dk && !sr) return null;
return {
key,
hanzi: (sr && sr.h) || key,
pinyin: (d && d.pinyin) || (dk && dk.pinyin) || (sr && sr.p) || "",
meaning: (d && d.meaning) || (dk && dk.meaning) || (sr && sr.m) || "",
pos: (d && d.pos) || "",
level: S.levelOf.get(key) || (sr && sr.l) || 0
};
}

const TR = { pref: store.get("hsk_hub_tr_pref", ""), cool: {}, fail: new Map(), src: new Map(), report: "", edge: null, pending: new Map(), mem: new Map() };
const TR_TTL = 365 * DAY;

async function trFetch(url, init, ms = 7000) {
const ctl = new AbortController();
const timer = setTimeout(() => ctl.abort(), ms);
try {
const res = await fetch(url, Object.assign({ signal: ctl.signal, credentials: "omit", referrerPolicy: "no-referrer" }, init || {}));
if (!res.ok) throw new Error(`HTTP ${res.status}`);
return await res.json();
} catch (e) {
throw new Error(e && e.name === "AbortError" ? "timeout" : e && e.message ? e.message : "network error");
} finally {
clearTimeout(timer);
}
}

function trLang(id, lang) {
if (id === "mymemory") return lang === "auto" ? "Autodetect" : lang;
if (id === "lingva") return lang === "zh-CN" ? "zh" : lang === "zh-TW" ? "zh_HANT" : lang;
if (id === "edge") return lang === "zh-CN" ? "zh-Hans" : lang === "zh-TW" ? "zh-Hant" : lang === "tl" ? "fil" : lang;
if (id === "libre") {
if (lang === "zh-TW") throw new Error("traditional Chinese unsupported");
return lang === "zh-CN" ? "zh" : lang;
}
return lang;
}

const trGoogle = (id, base) => async (text, from, to) => {
const d = await trFetch(`${base}/translate_a/single?client=gtx&sl=${encodeURIComponent(trLang(id, from))}&tl=${encodeURIComponent(trLang(id, to))}&dt=t&q=${encodeURIComponent(text)}`);
return { text: d && Array.isArray(d[0]) ? d[0].map(x => (x && x[0]) || "").join("") : "", detected: d && typeof d[2] === "string" ? d[2] : "" };
};

const TR_PROVIDERS = [
{ id: "google", name: "Google Translate", run: trGoogle("google", "https://translate.googleapis.com") },
{ id: "google-web", name: "Google Translate (web)", run: trGoogle("google-web", "https://translate.google.com") },
{ id: "google-dict", name: "Google Translate (dictionary)", run: async (text, from, to) => {
const d = await trFetch(`https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=${encodeURIComponent(from)}&tl=${encodeURIComponent(to)}&q=${encodeURIComponent(text)}`);
if (d && Array.isArray(d.sentences)) return { text: d.sentences.map(x => x.trans || "").join(""), detected: d.src || "" };
if (Array.isArray(d)) {
if (typeof d[0] === "string") return { text: d[0], detected: "" };
if (Array.isArray(d[0]) && typeof d[0][0] === "string") return { text: d[0][0], detected: typeof d[0][1] === "string" ? d[0][1] : "" };
}
return { text: "", detected: "" };
} },
{ id: "mymemory", name: "MyMemory", run: async (text, from, to) => {
const d = await trFetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(trLang("mymemory", from) + "|" + trLang("mymemory", to))}`);
if (!d || Number(d.responseStatus) !== 200 || !d.responseData) return { text: "", detected: "" };
const box = document.createElement("textarea");
box.innerHTML = String(d.responseData.translatedText || "");
return { text: box.value, detected: "" };
} },
{ id: "lingva", name: "Lingva Translate", run: async (text, from, to) => {
const bases = ["https://lingva.ml", "https://lingva.thedaviddelta.com", "https://lingva.lunar.icu"];
let last = null;
for (const b of bases) {
try {
const d = await trFetch(`${b}/api/v1/${encodeURIComponent(trLang("lingva", from))}/${encodeURIComponent(trLang("lingva", to))}/${encodeURIComponent(text)}`, null, 6000);
if (d && d.translation) return { text: String(d.translation), detected: d.info && d.info.detectedSource ? String(d.info.detectedSource) : "" };
} catch (e) {
last = e;
}
}
throw last || new Error("no result");
} },
{ id: "edge", name: "Microsoft Translator", run: async (text, from, to) => {
if (!TR.edge || TR.edge.exp < Date.now()) {
const res = await fetch("https://edge.microsoft.com/translate/auth", { credentials: "omit", referrerPolicy: "no-referrer" });
if (!res.ok) throw new Error(`HTTP ${res.status}`);
TR.edge = { tok: (await res.text()).trim(), exp: Date.now() + 8 * 60000 };
}
const f = from === "auto" ? "" : `from=${encodeURIComponent(trLang("edge", from))}&`;
const d = await trFetch(`https://api-edge.cognitive.microsofttranslator.com/translate?${f}to=${encodeURIComponent(trLang("edge", to))}&api-version=3.0`, {
method: "POST",
headers: { "Content-Type": "application/json", Authorization: `Bearer ${TR.edge.tok}` },
body: JSON.stringify([{ Text: text }])
});
const first = d && d[0];
return { text: first && first.translations && first.translations[0] ? first.translations[0].text : "", detected: first && first.detectedLanguage ? first.detectedLanguage.language : "" };
} },
{ id: "libre", name: "LibreTranslate", run: async (text, from, to) => {
const bases = ["https://translate.argosopentech.com", "https://libretranslate.de", "https://translate.terraprint.co"];
const src = trLang("libre", from);
const tgt = trLang("libre", to);
let last = null;
for (const b of bases) {
try {
const d = await trFetch(`${b}/translate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ q: text, source: src, target: tgt, format: "text" }) }, 6000);
if (d && d.translatedText) return { text: String(d.translatedText), detected: d.detectedLanguage && d.detectedLanguage.language ? d.detectedLanguage.language : "" };
} catch (e) {
last = e;
}
}
throw last || new Error("no result");
} }
];

function trValid(input, out, to) {
const t = String(out || "").trim();
if (!t || t === input) return false;
if (/MYMEMORY WARNING|QUERY LENGTH LIMIT|INVALID|PLEASE SELECT|NO QUERY SPECIFIED/i.test(t)) return false;
const chars = Array.from(t);
const zh = chars.filter(isZh).length;
if (String(to).startsWith("zh")) return zh / chars.length > 0.3 || zh >= 1;
if (to === "ja" || to === "ko") return true;
return zh / chars.length < 0.4;
}

function trOrder() {
const now = Date.now();
const list = TR_PROVIDERS.slice();
list.sort((a, b) => (a.id === TR.pref ? -1 : 0) - (b.id === TR.pref ? -1 : 0));
const ready = list.filter(p => !(TR.cool[p.id] > now));
return ready.length ? ready : list;
}

async function translateFull(text, opts = {}) {
const key = String(text || "").trim();
const from = opts.from || "zh-CN";
const to = opts.to || "en";
if (!key) return { text: "", provider: "", detected: "" };
if (from === to) return { text: key, provider: "", detected: from };
const ck = from === "zh-CN" && to === "en" ? key : `${from}>${to}|${key}`;
if (TR.mem.has(ck)) return TR.mem.get(ck);
if (opts.force) TR.fail.delete(ck);
const failedAt = TR.fail.get(ck);
if (failedAt && Date.now() - failedAt < 30000) return { text: "", provider: "", detected: "" };
if (TR.pending.has(ck)) return TR.pending.get(ck);
const p = (async () => {
const hit = await idb.get(`tr|${ck}`);
if (hit && hit.v && Date.now() - hit.t < TR_TTL) {
const r = { text: hit.v, provider: hit.s || "saved copy", detected: hit.d || "" };
TR.mem.set(ck, r);
TR.src.set(ck, r.provider);
return r;
}
const errors = [];
for (const prov of trOrder()) {
try {
const out = await prov.run(key, from, to);
if (trValid(key, out.text, to)) {
const r = { text: String(out.text).trim(), provider: prov.name, detected: out.detected || "" };
TR.mem.set(ck, r);
TR.src.set(ck, prov.name);
TR.pref = prov.id;
store.set("hsk_hub_tr_pref", prov.id);
delete TR.cool[prov.id];
idb.set(`tr|${ck}`, { t: Date.now(), v: r.text, s: prov.name, d: r.detected });
return r;
}
errors.push(`${prov.name}: empty result`);
TR.cool[prov.id] = Date.now() + 20000;
} catch (e) {
errors.push(`${prov.name}: ${e.message}`);
TR.cool[prov.id] = Date.now() + 60000;
}
}
TR.report = errors.slice(0, 6).join("; ");
TR.fail.set(ck, Date.now());
return { text: "", provider: "", detected: "" };
})();
TR.pending.set(ck, p);
p.finally(() => TR.pending.delete(ck));
return p;
}

async function translateText(text, opts = {}) {
return (await translateFull(text, opts)).text;
}

function splitForTranslate(text) {
const src = String(text || "").replace(/\r/g, "").trim();
if (!src) return [];
const enc = new TextEncoder();
const pieces = src.split(/(?<=[。！？…；।။؟])|(?<=[.!?;])\s+|\n+/u).map(x => x.trim()).filter(Boolean);
const chunks = [];
let cur = "";
const fits = s => Array.from(s).length <= 200 && enc.encode(s).length <= 450;
const push = piece => {
if (fits(piece)) {
if (cur && fits(cur + " " + piece)) cur += " " + piece;
else {
if (cur) chunks.push(cur);
cur = piece;
}
return;
}
if (cur) {
chunks.push(cur);
cur = "";
}
let buf = "";
for (const ch of Array.from(piece)) {
if (!fits(buf + ch)) {
chunks.push(buf);
buf = "";
}
buf += ch;
}
cur = buf;
};
pieces.forEach(push);
if (cur) chunks.push(cur);
return chunks;
}

function splitSentences(text) {
const parts = text.split(/([。！？!?；;\n]+)/);
const out = [];
for (let i = 0; i < parts.length; i += 2) {
const body = (parts[i] || "").trim();
const tail = parts[i + 1] || "";
if (body) out.push(body + tail.replace(/\n/g, ""));
}
const final = [];
out.forEach(s => {
if (Array.from(s).length <= 90) {
final.push(s);
return;
}
const bits = s.split(/(?<=[，,、：:])/);
let cur = "";
bits.forEach(b => {
if (Array.from(cur + b).length > 90 && cur) {
final.push(cur);
cur = b;
} else {
cur += b;
}
});
if (cur) final.push(cur);
});
return final;
}

async function mapLimit(items, limit, fn) {
const results = new Array(items.length);
let next = 0;
const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
while (next < items.length) {
const idx = next++;
results[idx] = await fn(items[idx], idx);
}
});
await Promise.all(workers);
return results;
}

function srsRecord(key) {
return S.srs[key] || null;
}
function srsNext(rec, rating) {
let iv = rec ? rec.iv : 0;
let ease = rec ? rec.ease : 2.5;
let reps = rec ? rec.reps : 0;
let lapses = rec ? rec.lapses : 0;
let due;
if (rating === 0) {
reps = 0;
lapses++;
ease = Math.max(1.3, ease - 0.2);
iv = 0;
due = Date.now() + 10 * MINUTE;
} else {
if (rating === 1) {
iv = reps === 0 ? 1 : Math.max(1, Math.round(iv * 1.2));
ease = Math.max(1.3, ease - 0.15);
} else if (rating === 2) {
iv = reps === 0 ? 1 : reps === 1 ? 3 : Math.max(1, Math.round(iv * ease));
} else {
iv = reps === 0 ? 3 : Math.max(4, Math.round(iv * ease * 1.3));
ease += 0.15;
}
reps++;
due = Date.now() + iv * DAY;
}
return { iv, ease, reps, lapses, due };
}
function intervalLabel(rec, rating) {
if (rating === 0) return "10 min";
const iv = srsNext(rec, rating).iv;
if (iv < 30) return `${iv} d`;
if (iv < 365) return `${Math.round(iv / 30)} mo`;
return `${(iv / 365).toFixed(1)} y`;
}
function srsRate(word, rating, silent) {
const key = word.key;
const rec = S.srs[key] || null;
const nx = srsNext(rec, rating);
S.srs[key] = Object.assign({}, rec || {}, {
k: key,
h: word.hanzi || key,
p: word.pinyin || "",
m: word.meaning || "",
l: word.level || levelOfWord(key).level || 0,
iv: nx.iv,
ease: nx.ease,
reps: nx.reps,
lapses: nx.lapses,
due: nx.due,
last: Date.now()
});
persist.srs();
if (!silent) trackActivity("fc", rating >= 2);
refreshBadges();
}
function srsStatus(key) {
const rec = S.srs[key];
if (!rec) return "new";
if (rec.due <= Date.now()) return "due";
if (rec.iv >= 21) return "mature";
return "learning";
}
function dueKeys() {
const now = Date.now();
return Object.keys(S.srs).filter(k => S.srs[k].due <= now).sort((a, b) => S.srs[a].due - S.srs[b].due);
}
function wordFromKey(key) {
const rec = S.srs[key];
const e = getEntry(key);
return {
key,
hanzi: (rec && rec.h) || key,
pinyin: (e && e.pinyin) || (rec && rec.p) || "",
meaning: (e && e.meaning) || (rec && rec.m) || "",
pos: (e && e.pos) || "",
level: (e && e.level) || (rec && rec.l) || 0
};
}

function trackActivity(kind, ok) {
const k = dayKey();
const d = S.stats.days[k] || (S.stats.days[k] = { n: 0, ok: 0, fc: 0, rv: 0, qz: 0 });
d.n++;
if (ok) d.ok++;
d[kind] = (d[kind] || 0) + 1;
const s = calcStreak();
if (s > (S.stats.best || 0)) S.stats.best = s;
persist.stats();
}
function calcStreak() {
const d = new Date();
if (!(S.stats.days[dayKey(d)] && S.stats.days[dayKey(d)].n > 0)) d.setDate(d.getDate() - 1);
let n = 0;
for (;;) {
const e = S.stats.days[dayKey(d)];
if (e && e.n > 0) {
n++;
d.setDate(d.getDate() - 1);
} else {
break;
}
}
return n;
}
function todayCount() {
const e = S.stats.days[dayKey()];
return e ? e.n : 0;
}

let VOICES = [];
const TTS = { unlocked: false };
const FONTS = [
{ id: "sans", label: "Sans (Noto Sans)", stack: '"Noto Sans SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Source Han Sans SC", "WenQuanYi Micro Hei", sans-serif', gf: "Noto+Sans+SC:wght@400;500;700" },
{ id: "serif", label: "Serif (Song / Ming)", stack: '"Noto Serif SC", "Songti SC", "Source Han Serif SC", "STSong", "SimSun", serif', gf: "Noto+Serif+SC:wght@400;600;700" },
{ id: "kai", label: "Kai (regular script)", stack: '"LXGW WenKai TC", "Kaiti SC", "STKaiti", "KaiTi", "BiauKai", "DFKai-SB", "AR PL UKai CN", "Noto Serif SC", serif', gf: "LXGW+WenKai+TC:wght@400;700" },
{ id: "brush", label: "Brush calligraphy (Ma Shan Zheng)", stack: '"Ma Shan Zheng", "Kaiti SC", "KaiTi", "Noto Sans SC", sans-serif', gf: "Ma+Shan+Zheng" },
{ id: "running", label: "Running script (Zhi Mang Xing)", stack: '"Zhi Mang Xing", "Kaiti SC", "KaiTi", "Noto Sans SC", sans-serif', gf: "Zhi+Mang+Xing" },
{ id: "cursive", label: "Cursive (Liu Jian Mao Cao)", stack: '"Liu Jian Mao Cao", "Kaiti SC", "KaiTi", "Noto Sans SC", sans-serif', gf: "Liu+Jian+Mao+Cao" },
{ id: "hand", label: "Casual handwriting (Long Cang)", stack: '"Long Cang", "Kaiti SC", "KaiTi", "Noto Sans SC", sans-serif', gf: "Long+Cang" },
{ id: "playful", label: "Playful hand (ZCOOL KuaiLe)", stack: '"ZCOOL KuaiLe", "Noto Sans SC", sans-serif', gf: "ZCOOL+KuaiLe" },
{ id: "elegant", label: "Elegant display (ZCOOL XiaoWei)", stack: '"ZCOOL XiaoWei", "Noto Serif SC", serif', gf: "ZCOOL+XiaoWei" },
{ id: "bold", label: "Bold display (ZCOOL QingKe HuangYou)", stack: '"ZCOOL QingKe HuangYou", "Noto Sans SC", sans-serif', gf: "ZCOOL+QingKe+HuangYou" }
];
const fontById = id => FONTS.find(f => f.id === id) || FONTS[0];
const fontLoaded = new Set();
function ensureFont(id) {
const f = fontById(id);
if (!f.gf || fontLoaded.has(f.id)) return;
fontLoaded.add(f.id);
const l = document.createElement("link");
l.rel = "stylesheet";
l.href = `https://fonts.googleapis.com/css2?family=${f.gf}&display=swap`;
document.head.append(l);
}
function fillFontSelects() {
const opts = FONTS.map(f => `<option value="${f.id}">${esc(f.label)}</option>`).join("");
$$('[data-setting="hanFont"]').forEach(el => (el.innerHTML = opts));
const ws = $("#ws-font");
if (ws) ws.innerHTML = opts;
}
function applyFont(id) {
const f = fontById(id);
ensureFont(f.id);
document.documentElement.style.setProperty("--font-han", f.stack);
}

function normLang(l) {
return String(l || "").replace("_", "-");
}
function loadVoices() {
if (!("speechSynthesis" in window)) return 0;
const all = speechSynthesis.getVoices() || [];
VOICES = all.filter(v => /^(zh|cmn|yue)/i.test(normLang(v.lang)) || /chinese|mandarin|普通话|國語|国语|中文/i.test(v.name));
VOICES.sort((a, b) => (/^zh-CN/i.test(normLang(b.lang)) ? 1 : 0) - (/^zh-CN/i.test(normLang(a.lang)) ? 1 : 0));
const sel = $("#voice-select");
if (sel) {
sel.innerHTML = VOICES.length
? VOICES.map(v => `<option value="${esc(v.voiceURI)}">${esc(v.name)} (${esc(normLang(v.lang))})</option>`).join("")
: '<option value="">Default system voice</option>';
sel.value = VOICES.some(v => v.voiceURI === S.settings.voiceURI) ? S.settings.voiceURI : VOICES[0] ? VOICES[0].voiceURI : "";
}
return VOICES.length;
}
function retryVoices() {
let n = 0;
const t = setInterval(() => {
if (loadVoices() || ++n > 16) clearInterval(t);
}, 400);
}
function unlockSpeech() {
if (TTS.unlocked || !("speechSynthesis" in window)) return;
TTS.unlocked = true;
try {
const u = new SpeechSynthesisUtterance(" ");
u.volume = 0;
u.lang = "zh-CN";
speechSynthesis.speak(u);
} catch (e) {}
loadVoices();
}
function speak(text, slow) {
if (!("speechSynthesis" in window) || !text) {
toast("Speech is not supported in this browser");
return;
}
const synth = speechSynthesis;
if (!VOICES.length) loadVoices();
const raw = String(text).trim();
const parts = splitSentences(raw);
const chunks = parts.length ? parts : [raw];
const v = VOICES.find(x => x.voiceURI === S.settings.voiceURI) || VOICES.find(x => /^zh-CN/i.test(normLang(x.lang))) || VOICES[0];
if (!v && !S.noVoiceWarned && (synth.getVoices() || []).length > 0) {
S.noVoiceWarned = true;
toast("No Chinese voice found on this device. Add one in your system speech settings.");
}
const rate = slow ? Math.min(0.6, S.settings.speechRate) : S.settings.speechRate;
const run = () => {
chunks.forEach(chunk => {
const u = new SpeechSynthesisUtterance(chunk);
u.lang = v ? normLang(v.lang) : "zh-CN";
if (v) u.voice = v;
u.rate = rate;
u.onerror = ev => {
if (ev && ev.error && ev.error !== "canceled" && ev.error !== "interrupted") toast(`Speech failed (${ev.error}). On iPhone, check the silent switch and volume.`);
};
synth.speak(u);
});
try {
if (synth.paused) synth.resume();
} catch (e) {}
};
if (synth.speaking || synth.pending) {
synth.cancel();
setTimeout(run, 90);
} else run();
}

function applySettings() {
const st = S.settings;
const root = document.documentElement;
const dark = st.theme === "dark" || (st.theme === "auto" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
root.setAttribute("data-theme", dark ? "dark" : "light");
root.style.setProperty("--scale", String(st.scale));
applyFont(st.hanFont);
document.body.classList.toggle("no-tone", !st.toneColors);
document.body.classList.toggle("hide-py", !!st.hidePinyin);
document.body.classList.toggle("hide-mn", !!st.hideMeaning);
document.body.classList.toggle("reduce-motion", !!st.reduceMotion);
const btn = $("#theme-btn");
if (btn) btn.innerHTML = ico(dark ? "sun" : "moon");
const meta = $('meta[name="theme-color"]');
if (meta) meta.setAttribute("content", dark ? "#14110e" : "#c43d2f");
$$("[data-setting]").forEach(el => {
const v = st[el.dataset.setting];
if (el.type === "checkbox") el.checked = !!v;
else el.value = String(v);
});
const rv = $("#rate-val");
if (rv) rv.textContent = `${st.speechRate.toFixed(2)}×`;
}
