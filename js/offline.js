"use strict";
const OFF = { running: false, cancel: false, pct: 0, msg: "" };

const sleep = ms => new Promise(r => setTimeout(r, ms));

function fmtBytes(n) {
if (!n) return "0 MB";
if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} KB`;
if (n < 1024 * 1024 * 1024) return `${(n / 1048576).toFixed(n < 10485760 ? 1 : 0)} MB`;
return `${(n / 1073741824).toFixed(1)} GB`;
}

async function storageInfo() {
try {
if (navigator.storage && navigator.storage.estimate) {
const e = await navigator.storage.estimate();
const persisted = navigator.storage.persisted ? await navigator.storage.persisted() : false;
return { usage: e.usage || 0, quota: e.quota || 0, persisted };
}
} catch (e) {}
return null;
}

function strokeChars() {
const set = new Set();
S.levelOf.forEach((l, k) => {
if (l >= 1 && l <= 7) Array.from(k).forEach(c => isZh(c) && set.add(c));
});
BUILTIN_SENTENCES.forEach(([zh]) => Array.from(zh).forEach(c => isZh(c) && set.add(c)));
return Array.from(set);
}

function offlineProgress(pct, msg) {
OFF.pct = clamp(pct, 0, 100);
OFF.msg = msg || OFF.msg;
const pill = $("#dict-pill");
if (pill && OFF.running) {
pill.classList.add("show");
pill.textContent = `Saving offline ${Math.round(OFF.pct)}%`;
}
renderOfflineCard();
}

async function waitFor(test, max = 120000) {
const t0 = Date.now();
while (test() && Date.now() - t0 < max) await sleep(250);
}

async function offlineDownload(opts = {}) {
if (OFF.running) return;
if (!navigator.onLine) {
toast("You are offline. Connect to the internet to download.");
return;
}
OFF.running = true;
OFF.cancel = false;
OFF.pct = 0;
OFF.msg = "Starting…";
try {
if (navigator.storage && navigator.storage.persist) navigator.storage.persist();
} catch (e) {}
let failed = 0;
const plan = [
{ label: "Dictionary", w: 12, run: async p => {
await loadAllDictionaries();
await waitFor(() => dictStatus.running);
if (S.dictLoaded.size < 7) failed += 7 - S.dictLoaded.size;
p(1);
} },
{ label: "Word lists", w: 22, run: async p => {
for (let l = 1; l <= 7 && !OFF.cancel; l++) {
const r = await loadVocabLevel(l);
if (r.offline) failed++;
p(l / 7);
}
} },
{ label: "Grammar", w: 10, run: async p => {
for (let l = 1; l <= 7 && !OFF.cancel; l++) {
const g = await loadGrammar(l);
if (!g || !g.length) failed++;
p(l / 7);
}
} },
{ label: "Idioms", w: 6, run: async p => {
const ph = await loadPhrases();
if (!ph || !ph.length) failed++;
p(1);
} }
];
if (opts.sentences !== false) {
plan.push({ label: "Example sentences", w: 18, run: async p => {
await ensureCorpus();
await waitFor(() => S.corpusState === "loading");
if (S.corpus.length < 200) failed++;
p(1);
} });
}
if (opts.strokes) {
plan.push({ label: "Stroke order data", w: 40, run: async p => {
const chars = strokeChars();
let n = 0;
await mapLimit(chars, 6, async c => {
if (OFF.cancel) return;
const d = await fetchRemote(STROKE_URL(c));
if (!d) failed++;
n++;
if (n % 20 === 0 || n === chars.length) p(n / chars.length);
});
} });
}
const total = plan.reduce((s, x) => s + x.w, 0);
let base = 0;
try {
for (const step of plan) {
if (OFF.cancel) break;
const start = base;
offlineProgress((start / total) * 100, `${step.label}…`);
await step.run(f => offlineProgress(((start + step.w * f) / total) * 100, `${step.label}…`));
base += step.w;
}
} catch (e) {
failed++;
}
const cancelled = OFF.cancel;
OFF.running = false;
if (!cancelled) {
S.misc.offlineAt = Date.now();
S.misc.offlineStrokes = !!opts.strokes;
persist.misc();
}
OFF.pct = cancelled ? OFF.pct : 100;
OFF.msg = cancelled ? "Download cancelled. What was saved so far is kept." : failed ? "Finished with some items missing. Run it again when your connection is stable." : "Everything is saved on this device.";
updateDictPill();
renderOfflineCard();
toast(cancelled ? "Download cancelled" : failed ? "Saved most data for offline use" : "Ready to use offline");
}

async function autoCore() {
if (!navigator.onLine || OFF.running) return;
const c = navigator.connection;
if (c && c.saveData) return;
if (S.misc.coreAt && Date.now() - S.misc.coreAt < 30 * DAY) return;
let ok = true;
await loadAllDictionaries();
await waitFor(() => dictStatus.running, 60000);
for (let l = 1; l <= 7; l++) {
const r = await loadVocabLevel(l);
if (r.offline) ok = false;
const g = await loadGrammar(l);
if (!g || !g.length) ok = false;
}
await loadPhrases();
if (ok && S.dictLoaded.size >= 7) {
S.misc.coreAt = Date.now();
persist.misc();
}
renderOfflineCard();
}

async function renderOfflineCard() {
const card = $("#off-card");
if (!card || $("#v-settings").hidden) return;
const info = await storageInfo();
const sw = "serviceWorker" in navigator && navigator.serviceWorker.controller;
const parts = [];
parts.push(sw ? "App files are cached, so it opens without internet." : swSupported() ? "App files will be cached after the first load." : "Offline app caching needs https. Downloaded data still works offline.");
if (S.misc.offlineAt) parts.push(`Last full download: ${new Date(S.misc.offlineAt).toLocaleDateString()}.`);
$("#off-status").textContent = parts.join(" ");
$("#off-version").textContent = `v${APP_VERSION}`;
$("#off-detail").textContent = info ? `Stored on this device: ${fmtBytes(info.usage)} of ${fmtBytes(info.quota)} available${info.persisted ? " · protected from automatic cleanup" : ""}.` : "Dictionary, word lists, grammar, idioms and example sentences.";
const prog = $("#off-prog");
prog.hidden = !OFF.running && OFF.pct === 0;
$("i", prog).style.width = `${OFF.pct}%`;
$("#off-msg").textContent = OFF.msg;
$("#off-btn").disabled = OFF.running;
$("#off-btn").textContent = OFF.running ? `Downloading ${Math.round(OFF.pct)}%` : S.misc.offlineAt ? "Update download" : "Download everything";
$("#off-cancel").hidden = !OFF.running;
$("#off-strokes").checked = OFF.running ? $("#off-strokes").checked : S.misc.offlineStrokes !== false;
}

A["off-download"] = () => offlineDownload({ strokes: $("#off-strokes").checked, sentences: true });
A["off-cancel"] = () => {
OFF.cancel = true;
};
A["off-clear"] = async () => {
const ok = await dialogAsk({ title: "Remove downloaded data?", message: "Dictionary, word lists, sentences and stroke data will be removed from this device. Your saved words and progress stay. They download again when needed.", okLabel: "Remove", danger: true });
if (!ok) return;
await idb.clear();
S.vocab = {};
S.grammar = {};
S.phrases = null;
delete S.misc.offlineAt;
delete S.misc.coreAt;
persist.misc();
OFF.pct = 0;
OFF.msg = "";
renderOfflineCard();
toast("Downloaded data removed");
};
