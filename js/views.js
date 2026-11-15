"use strict";
const AN = { text: "", tokens: [], notes: [], words: [], view: "ruby", run: 0, trans: "", pinyinText: "", gloss: new Map(), hard: [] };

function tokensPinyinText(tokens) {
let out = "";
tokens.forEach((t, i) => {
if (t.text === "\n") {
out += "\n";
return;
}
const punct = !t.zh && !/[A-Za-z0-9\s]/.test(t.text);
const h = t.zh ? joinText(t.spoken) : t.text;
out += (i > 0 && !punct && !/^\s/.test(t.text) && out && !/\n$/.test(out) ? " " : "") + h;
});
return out;
}

function anCount() {
const v = $("#an-input").value;
$("#an-count").textContent = `${Array.from(v).length} / 3000`;
}

function anTarget() {
return clamp(parseInt($("#an-target").value, 10) || 3, 1, 7);
}

function analyzerRun(force) {
const text = $("#an-input").value.replace(/\r/g, "").trim();
anCount();
if (!text) {
AN.text = "";
$("#an-out").hidden = true;
return;
}
if (!force && text === AN.text) return;
AN.text = text;
const an = analyzeText(text);
AN.tokens = an.tokens;
AN.notes = an.notes;
const map = new Map();
an.tokens.forEach(t => {
if (!t.zh) return;
let w = map.get(t.text);
if (!w) {
const e = getEntry(t.text);
const lv = levelOfWord(t.text);
w = { key: t.text, count: 0, spoken: t.spoken, pinyin: e ? e.pinyin : "", meaning: e ? e.meaning : "", level: lv.level, inferred: lv.inferred };
map.set(t.text, w);
}
w.count++;
});
AN.words = Array.from(map.values());
$("#an-out").hidden = false;
$("#an-pinyin").innerHTML = tokensPinyinHTML(an.tokens);
const sandhiBox = $("#an-sandhi");
sandhiBox.innerHTML = an.notes.length
? `<div class="stack-s mt-s"><span class="eyebrow">Tone changes applied</span>${an.notes.slice(0, 12).map(n => `<div class="small"><span class="pill-sandhi">${esc(n.rule || n.name || "sandhi")}</span> ${esc(n.detail || "")}</div>`).join("")}${an.notes.length > 12 ? `<div class="tiny faint">+${an.notes.length - 12} more</div>` : ""}</div>`
: '<p class="tiny faint mt-s">No tone changes needed in this text.</p>';
AN.pinyinText = tokensPinyinText(an.tokens);
analyzerRender();
analyzerTranslate(text);
}

function analyzerRender() {
if (!AN.text) return;
const target = anTarget();
const zhTokens = AN.tokens.filter(t => t.zh);
const chars = AN.tokens.reduce((n, t) => n + (t.zh ? t.len : 0), 0);
const sentences = splitSentences(AN.text).length;
$("#an-stats").innerHTML = `<span class="chip">${chars} characters</span><span class="chip">${zhTokens.length} words</span><span class="chip">${AN.words.length} unique</span><span class="chip">${sentences} ${sentences === 1 ? "sentence" : "sentences"}</span>`;
const counts = [0, 0, 0, 0, 0, 0, 0, 0];
zhTokens.forEach(t => {
counts[levelOfWord(t.text).level]++;
});
const total = zhTokens.length || 1;
$("#an-bar").innerHTML = counts.map((c, l) => (c ? `<i style="width:${((c / total) * 100).toFixed(2)}%;background:${l ? `var(--l${l})` : "var(--ink-3)"}" title="${levelLabel(l)}: ${c}"></i>` : "")).join("");
$("#an-legend").innerHTML = counts.map((c, l) => (c ? `<span class="chip"><span class="dotc" style="background:${l ? `var(--l${l})` : "var(--ink-3)"}"></span>${levelLabel(l)} · ${Math.round((c / total) * 100)}%</span>` : "")).join("");
let known = 0;
for (let l = 1; l <= target; l++) known += counts[l];
const pct = Math.round((known / total) * 100);
const verdict = pct >= 98 ? "Comfortable reading." : pct >= 95 ? "Readable with some lookups." : pct >= 90 ? "A challenge, good for intensive reading." : "Likely too hard without help.";
$("#an-coverage").textContent = `${pct}% of the words are within HSK ${target === 7 ? "7–9" : target} (${counts[0]} unlisted). ${verdict}`;
AN.hard = AN.words.filter(w => w.level > target).sort((a, b) => b.count - a.count || a.level - b.level);
$("#an-hard-card").hidden = !AN.hard.length;
$("#an-hard").innerHTML = AN.hard.slice(0, 60).map(w => `<button class="chip" data-act="open-word" data-key="${esc(w.key)}"><span class="han">${esc(w.key)}</span>${levelTagHTML(w.level)}</button>`).join("") + (AN.hard.length > 60 ? `<span class="small muted">+${AN.hard.length - 60} more</span>` : "");
analyzerView();
}

function anMeaning(w) {
if (w.meaning) return shortMeaning(w.meaning, 3);
return AN.gloss.get(w.key) || "";
}

function analyzerView() {
const box = $("#an-view");
if (!AN.text) return;
$$("#an-views button").forEach(b => b.classList.toggle("on", b.dataset.v === AN.view));
const target = anTarget();
const unique = $("#an-unique").checked;
$("#an-unique").closest("label").hidden = AN.view === "ruby";
if (AN.view === "ruby") {
box.innerHTML = `<div class="ruby-view">${AN.tokens
.map(t => {
if (t.text === "\n") return "<br>";
if (!t.zh) return esc(t.text);
const lv = levelOfWord(t.text).level;
return `<ruby class="rw ${lv > target ? "hard" : ""}" data-act="open-word" data-key="${esc(t.text)}">${esc(t.text)}<rt>${pinyinHTML(t.spoken)}</rt></ruby>`;
})
.join("")}</div>`;
return;
}
const list = unique ? AN.words : AN.tokens.filter(t => t.zh).map(t => Object.assign({}, AN.words.find(w => w.key === t.text), { spoken: t.spoken, count: 1 }));
const missing = AN.words.filter(w => !w.meaning && !AN.gloss.has(w.key)).slice(0, 20);
if (missing.length) autoGloss(missing, AN.run);
if (AN.view === "cards") {
const shown = list.slice(0, 200);
box.innerHTML = `<div class="tile-wrap">${shown
.map(w => {
const mean = anMeaning(w);
const e = getEntry(w.key);
const chars = Array.from(w.key);
return `<div class="tile"><span class="t-py">${pinyinHTML(w.spoken)}</span><span class="t-hz han" data-act="open-word" data-key="${esc(w.key)}">${hanziHTML(w.key, w.key, e ? e.pinyin : "")}</span>${levelTagHTML(w.level)}<span class="t-mn">${mean ? esc(mean) : '<span class="faint">…</span>'}</span>${chars.length > 1 ? `<div class="t-chars">${chars.map((c, i) => `<span class="t-ch" data-act="open-word" data-key="${esc(c)}"><b>${esc(c)}</b>${esc(shortMeaning((getEntry(c) || {}).meaning, 1))}</span>`).join("")}</div>` : ""}<div class="t-acts"><button class="mini" data-act="speak" data-t="${esc(w.key)}" aria-label="Listen">${ico("volume")}</button><button class="mini ${S.deck.has(w.key) ? "on" : ""}" data-act="save" data-key="${esc(w.key)}" aria-label="Save">${ico("star")}</button></div></div>`;
})
.join("")}</div>${list.length > shown.length ? `<p class="small muted mt-s">Showing the first ${shown.length} of ${list.length}.</p>` : ""}`;
return;
}
box.innerHTML = `<div class="tbl-wrap"><table><thead><tr><th>Word</th><th>Pinyin</th><th>Meaning</th><th>Level</th>${unique ? "<th>Count</th>" : ""}<th></th></tr></thead><tbody>${list
.slice(0, 400)
.map(w => `<tr><td class="hz-cell"><a href="#" data-act="open-word" data-key="${esc(w.key)}" style="color:inherit">${esc(w.key)}</a></td><td class="py">${pinyinHTML(w.spoken)}</td><td>${esc(anMeaning(w)) || '<span class="faint">…</span>'}</td><td>${levelTagHTML(w.level)}</td>${unique ? `<td>${w.count}</td>` : ""}<td><button class="mini ${S.deck.has(w.key) ? "on" : ""}" data-act="save" data-key="${esc(w.key)}" aria-label="Save">${ico("star")}</button></td></tr>`)
.join("")}</tbody></table></div><div class="row mt-s"><button class="btn sm" data-act="an-copy" data-what="table">${ico("copy")}Copy as TSV</button></div>`;
}

const anGlossRender = debounce(() => {
if (AN.view !== "ruby") analyzerView();
}, 250);
async function autoGloss(words, runId) {
const keys = words.map(w => w.key).filter(k => !AN.gloss.has(k));
keys.forEach(k => AN.gloss.set(k, ""));
await mapLimit(keys, 3, async k => {
const t = await translateText(k);
if (runId !== AN.run) return;
AN.gloss.set(k, t ? shortMeaning(t.replace(/,/g, ";"), 2) : "");
anGlossRender();
});
}

async function analyzerTranslate(text) {
const runId = ++AN.run;
const box = $("#an-trans");
const note = $("#an-trans-note");
const parts = splitSentences(text);
AN.trans = "";
box.textContent = "Translating…";
note.textContent = "";
const results = new Array(parts.length).fill(null);
let anyOk = false;
await mapLimit(parts, 3, async (p, i) => {
if (!Array.from(p).some(isZh)) {
results[i] = p;
return;
}
const t = await translateText(p);
if (runId !== AN.run) return;
results[i] = t || null;
if (t) anyOk = true;
const shown = results.map(r => (r == null ? "…" : r)).join(" ");
box.textContent = shown;
});
if (runId !== AN.run) return;
if (anyOk) {
AN.trans = results.map(r => r || "").join(" ").trim();
box.textContent = AN.trans;
note.textContent = results.some(r => !r) ? "Some sentences could not be translated." : "Machine translation (Google Translate). Treat it as a guide, not a reference.";
} else {
const gloss = AN.words
.filter(w => w.meaning)
.slice(0, 40)
.map(w => `${w.key}: ${shortMeaning(w.meaning, 1)}`)
.join(" · ");
AN.trans = "";
box.textContent = gloss || "Translation unavailable offline.";
note.textContent = gloss ? "You appear to be offline, so these are dictionary glosses rather than a translation." : "";
}
}

const analyzerLive = debounce(() => {
if ($("#an-live").checked) analyzerRun(false);
}, 450);

VIEW_ENTER.analyzer = () => {
const t = S.misc.anTarget;
if (t) $("#an-target").value = String(t);
anCount();
if ($("#an-input").value.trim()) analyzerRun(false);
};
A["an-run"] = () => analyzerRun(true);
A["an-sample"] = el => {
$("#an-input").value = SAMPLE_TEXTS[Number(el.dataset.i)] || "";
analyzerRun(true);
};
A["an-paste"] = async () => {
try {
const t = await navigator.clipboard.readText();
if (t) {
$("#an-input").value = t.slice(0, 3000);
analyzerRun(true);
} else toast("Clipboard is empty");
} catch (e) {
toast("Paste is blocked here. Use Ctrl/Cmd+V in the box.");
$("#an-input").focus();
}
};
A["an-clear"] = () => {
$("#an-input").value = "";
AN.run++;
analyzerRun(true);
$("#an-input").focus();
};
A["an-speak"] = () => speak(AN.text);
A["an-view"] = el => {
AN.view = el.dataset.v;
analyzerView();
};
A["an-copy"] = el => {
const w = el.dataset.what;
if (w === "pinyin") copyText(AN.pinyinText, "Pinyin");
else if (w === "trans") copyText(AN.trans || $("#an-trans").textContent, "Translation");
else {
const rows = AN.words.map(x => [x.key, joinText(x.spoken), anMeaning(x), levelLabel(x.level), x.count].join("\t"));
copyText(["Word\tPinyin\tMeaning\tLevel\tCount"].concat(rows).join("\n"), "Table");
}
};
A["an-save-hard"] = () => {
let n = 0;
AN.hard.forEach(w => {
if (!S.deck.has(w.key)) {
S.deck.set(w.key, { hanzi: w.key, pinyin: joinText(w.spoken), meaning: anMeaning(w), level: levelLabel(w.level), note: "", added: Date.now() });
n++;
}
});
persist.deck();
afterDeckChange();
toast(n ? `Saved ${n} words` : "All of them are already saved");
};

VIEW_ENTER.radicals = () => renderRadicals();
function renderRadicals() {
const q = $("#rad-search").value.trim().toLowerCase();
const hit = (...parts) => !q || parts.some(p => String(p).toLowerCase().includes(q));
const fams = PHONO_FAMILIES.filter(f => hit(f.root, f.py, f.note, plainPinyin(f.py)) || f.members.some(m => hit(m.hz, m.py, m.mean, m.rad)));
$("#rad-fams").innerHTML = fams.length
? fams.map(f => `<div class="rad-card"><div class="row" style="flex-wrap:nowrap"><div class="rad-glyph">${esc(f.root)}</div><div><b class="py">${pinyinStrHTML(f.py)}</b><div class="small muted">${esc(f.note)}</div></div></div><div class="stack-s">${f.members.map(m => `<button class="fam-row" data-act="open-word" data-key="${esc(m.hz)}"><span><b class="han" style="font-size:1.1rem">${esc(m.hz)}</b> <span class="py">${pinyinStrHTML(m.py)}</span></span><span class="small muted">${esc(m.rad)} · ${esc(m.mean)}</span></button>`).join("")}</div></div>`).join("")
: '<div class="empty small">No families match.</div>';
const rads = RADICALS_DB.filter(r => hit(r.rad, r.alt, r.py, r.name, r.meaning, plainPinyin(r.py)) || r.examples.some(e => e === q));
$("#rad-grid").innerHTML = rads.length
? rads.map(r => `<div class="rad-card"><div class="row" style="flex-wrap:nowrap"><div class="rad-glyph">${esc(r.rad)}</div><div><b>${esc(r.name)}</b><div class="small muted"><span class="py">${pinyinStrHTML(r.py)}</span>${r.alt !== r.rad ? ` · full form ${esc(r.alt)}` : ""}</div></div></div><div class="small">${esc(r.meaning)}</div><div class="ex-chips">${r.examples.map(e => `<button class="ex-chip" data-act="open-word" data-key="${esc(e)}">${esc(e)}</button>`).join("")}</div></div>`).join("")
: '<div class="empty small">No radicals match.</div>';
}

const MWQ = { score: 0, total: 0, streak: 0, cur: null, answered: false };
VIEW_ENTER.measure = () => {
mwTab(S.misc.mwTab || "quiz");
};
function mwTab(t) {
S.misc.mwTab = t;
$$("#mw-tabs button").forEach(b => b.classList.toggle("on", b.dataset.t === t));
$("#mw-quiz").hidden = t !== "quiz";
$("#mw-ref").hidden = t !== "ref";
if (t === "quiz") {
if (!MWQ.cur) mwNext();
else mwRender();
} else renderMwRef();
}
A["mw-tab"] = el => mwTab(el.dataset.t);
function mwNext() {
const entry = MEASURE_WORDS[Math.floor(Math.random() * MEASURE_WORDS.length)];
const noun = entry.nouns[Math.floor(Math.random() * entry.nouns.length)];
const opts = [entry];
const bad = shuffle(MEASURE_WORDS.filter(m => m.mw !== entry.mw && !m.nouns.some(n => n[0] === noun[0])));
while (opts.length < 4 && bad.length) opts.push(bad.pop());
MWQ.cur = { entry, noun, opts: shuffle(opts) };
MWQ.answered = false;
mwRender();
}
function mwRender() {
const c = MWQ.cur;
if (!c) return;
$("#mw-quiz").innerHTML = `<div class="quiz card" data-mw="1"><div class="row between mb"><span class="chip">Score ${MWQ.score}/${MWQ.total}</span><span class="chip gold">${ico("flame")}Streak ${MWQ.streak}</span></div>
<div class="q-prompt"><div class="hz-xl">一 <span style="color:var(--seal)">___</span> ${esc(c.noun[0])}</div><div class="py" style="font-size:1.1rem">${pinyinStrHTML(c.noun[1])}</div><div class="muted">${esc(c.noun[2])}</div><button class="btn sm mt-s" data-act="speak" data-t="${esc(c.noun[0])}">${ico("volume")}Listen</button></div>
<div class="q-opts">${c.opts.map((o, i) => `<button class="q-opt hz-opt" data-act="mw-pick" data-i="${i}"><span class="n">${i + 1}</span>${esc(o.mw)} <span class="small py">${pinyinStrHTML(o.py)}</span></button>`).join("")}</div>
<div class="feedback" id="mw-fb" aria-live="polite"></div><div class="center"><button class="btn" data-act="mw-next" id="mw-next" hidden>Next ${ico("right")}</button></div></div>`;
}
A["mw-pick"] = el => {
const c = MWQ.cur;
if (!c || MWQ.answered) return;
MWQ.answered = true;
const i = Number(el.dataset.i);
const ok = c.opts[i].mw === c.entry.mw;
MWQ.total++;
if (ok) {
MWQ.score++;
MWQ.streak++;
} else MWQ.streak = 0;
trackActivity("qz", ok);
$$("#mw-quiz .q-opt").forEach((b, idx) => {
b.disabled = true;
if (c.opts[idx].mw === c.entry.mw) b.classList.add("correct");
else if (idx === i) b.classList.add("wrong");
});
const fb = $("#mw-fb");
fb.className = `feedback ${ok ? "ok" : "bad"}`;
fb.innerHTML = `${ok ? "Correct! " : "Not quite. "}一<b class="han">${esc(c.entry.mw)}</b>${esc(c.noun[0])} · ${esc(c.entry.use)}`;
$("#mw-next").hidden = false;
$("#mw-next").focus();
};
A["mw-next"] = () => mwNext();
function renderMwRef() {
const q = $("#mw-search").value.trim().toLowerCase();
const list = MEASURE_WORDS.filter(m => !q || m.mw.includes(q) || m.py.toLowerCase().includes(q) || plainPinyin(m.py).includes(plainPinyin(q)) || m.use.toLowerCase().includes(q) || m.nouns.some(n => n[0].includes(q) || n[2].toLowerCase().includes(q)));
$("#mw-count").textContent = `${list.length} of ${MEASURE_WORDS.length}`;
$("#mw-grid").innerHTML = list.length
? list.map(m => `<div class="mw-card"><div class="row between"><span class="mw-big han">${esc(m.mw)}</span><div class="row"><span class="py" style="font-weight:700">${pinyinStrHTML(m.py)}</span><button class="mini" data-act="speak" data-t="${esc(m.mw)}" aria-label="Listen">${ico("volume")}</button></div></div><div class="small muted">${esc(m.use)}</div><div class="ex-chips">${m.nouns.map(n => `<button class="ex-chip" data-act="open-word" data-key="${esc(n[0])}" title="${esc(n[1])} · ${esc(n[2])}">一${esc(m.mw)}${esc(n[0])}</button>`).join("")}</div></div>`).join("")
: '<div class="empty small">No measure words match.</div>';
}

const WS = { token: 0, strokes: new Map(), loading: false, failed: false };
VIEW_ENTER.worksheet = async () => {
$("#ws-font").value = S.misc.wsFont || "kai";
const src = S.misc.wsSource;
if (src) {
$("#ws-source").value = src;
delete S.misc.wsSource;
persist.misc();
await wsFillFromSource();
}
wsRender();
};
async function wsFillFromSource() {
const src = $("#ws-source").value;
$("#ws-level-wrap").hidden = src !== "level";
if (src === "custom") return;
const token = ++WS.token;
let keys = [];
if (src === "saved") keys = Array.from(S.deck.keys());
else if (src === "review") keys = Object.keys(S.srs);
else {
const rec = await loadVocabLevel(clamp(parseInt($("#ws-level").value, 10) || 1, 1, 7));
keys = rec.list.slice(Math.max(0, parseInt($("#ws-offset").value, 10) || 0)).map(w => w.key);
}
if (token !== WS.token) return;
const set = [];
for (const k of keys) {
for (const c of Array.from(k)) {
if (isZh(c) && !set.includes(c)) set.push(c);
}
if (set.length >= 30) break;
}
$("#ws-chars").value = set.slice(0, 30).join("");
if (!set.length) toast("No characters found for this source yet");
}
function wsRender() {
const chars = [];
Array.from($("#ws-chars").value).forEach(c => {
if (isZh(c) && !chars.includes(c)) chars.push(c);
});
const list = chars.slice(0, 30);
const grid = $("#ws-grid").value;
const trace = Number($("#ws-trace").value);
const cols = Number($("#ws-cols").value);
const size = Number($("#ws-size").value);
$("#ws-size-val").textContent = String(size);
const sheet = $("#ws-sheet");
const wf = fontById($("#ws-font").value || "kai");
S.misc.wsFont = wf.id;
persist.misc();
sheet.style.setProperty("--wsf", wf.stack);
ensureFont(wf.id);
if (document.fonts && document.fonts.load && wf.gf) document.fonts.load(`${size}px ${wf.stack.split(",")[0]}`, list.join("")).then(() => {}, () => {});
sheet.className = `sheet g-${grid}`;
sheet.style.setProperty("--bs", size + "px");
const progressive = $("#ws-style").value === "progressive";
const missing = progressive ? list.filter(c => !WS.strokes.has(c)) : [];
if (missing.length && !WS.loading) {
WS.loading = true;
WS.failed = false;
mapLimit(missing, 6, async c => {
const d = await fetchRemote(STROKE_URL(c));
WS.strokes.set(c, d && Array.isArray(d.strokes) && d.strokes.length ? d.strokes : null);
}).then(() => {
WS.loading = false;
if (WS.strokes.size && missing.every(c => !WS.strokes.get(c))) WS.failed = true;
wsRender();
});
}
const showPy = $("#ws-py").checked;
const showEn = $("#ws-en").checked;
const rows = list.map(c => {
const e = getEntry(c);
const py = e && e.pinyin ? joinText(rawSyllables(e.pinyin).slice(0, 1)) : joinText(analyzeWord(c).spoken);
const mean = e ? shortMeaning(e.meaning, 2) : "";
const strokes = progressive ? WS.strokes.get(c) : null;
const boxes = [];
if (strokes) {
const slots = Math.min(strokes.length, cols);
for (let i = 1; i <= slots; i++) {
const k = Math.ceil((i * strokes.length) / slots);
boxes.push(`<div class="zbox step"><svg viewBox="0 0 1024 1024" aria-hidden="true"><g transform="translate(0,900) scale(1,-1)">${strokes.map((d, j) => `<path d="${d}" fill="${j < k - 1 ? "#222" : j === k - 1 ? "#d2281e" : "rgba(0,0,0,.09)"}"/>`).join("")}</g></svg></div>`);
}
} else boxes.push(`<div class="zbox model">${esc(c)}</div>`);
for (let i = 0; i < trace && boxes.length < cols; i++) boxes.push(`<div class="zbox trace">${esc(c)}</div>`);
while (boxes.length < cols) boxes.push('<div class="zbox"></div>');
return `<div class="ws-row"><div class="ws-meta"><div class="ws-hz">${esc(c)}</div>${showPy ? `<div class="ws-py">${esc(py)}</div>` : ""}${showEn && mean ? `<div class="ws-en">${esc(mean)}</div>` : ""}${strokes ? `<div class="ws-en">${strokes.length} strokes</div>` : ""}</div><div class="ws-boxes">${boxes.join("")}</div></div>`;
});
sheet.innerHTML = `<div class="ws-head"><div><h2 style="font-size:1.4rem;font-family:var(--font-display)">${esc($("#ws-title").value || "Practice sheet")}</h2><div style="font-size:.8rem;color:#555">${list.length} characters · ${new Date().toLocaleDateString()}</div></div><div style="font-size:.85rem">Name: ______________</div></div>${progressive && WS.loading ? '<p class="no-print small" style="color:#777">Loading stroke data…</p>' : ""}${progressive && WS.failed ? '<p class="no-print small" style="color:#b45309">Stroke data could not be downloaded, so the classic layout is shown. Check your connection.</p>' : ""}${rows.join("") || '<p style="color:#777;text-align:center;padding:2rem">Enter some Chinese characters above to build a sheet.</p>'}`;
}
A["ws-print"] = async () => {
if (!$("#ws-chars").value.trim()) {
toast("Add some characters first");
return;
}
try {
if (document.fonts && document.fonts.ready) await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 2500))]);
} catch (e) {}
window.print();
};

const SEN = { results: [], shown: 0, q: "" };
VIEW_ENTER.sentences = () => {
ensureCorpus();
updateCorpusStatus();
senFillSources();
if (!$("#sen-chips").children.length) {
$("#sen-chips").innerHTML = ["喜欢", "因为", "但是", "谢谢", "学习", "coffee", "how much"].map(w => `<button class="chip" data-act="sen-chip" data-q="${esc(w)}">${esc(w)}</button>`).join("");
}
if (SEN.q) senRender();
};
function senFillSources() {
const sel = $("#sen-src");
const cur = sel.value;
sel.innerHTML = '<option value="">All sources</option>' + Array.from(S.corpusSources.entries()).map(([k, n]) => `<option value="${esc(k)}">${esc(k)} (${n.toLocaleString()})</option>`).join("");
sel.value = cur;
}
A["sen-chip"] = el => {
$("#sen-q").value = el.dataset.q;
A["sen-search"]();
};
A["sen-search"] = () => {
SEN.q = $("#sen-q").value.trim();
if (!SEN.q) {
$("#sen-results").innerHTML = '<div class="empty"><div class="em-ico">句</div>Type a word or phrase above to find example sentences.</div>';
return;
}
SEN.results = searchCorpus(SEN.q, $("#sen-src").value);
SEN.shown = 20;
senRender();
};
function senRender() {
const box = $("#sen-results");
if (!SEN.q) return;
if (!SEN.results.length) {
box.innerHTML = `<div class="empty"><div class="em-ico">句</div>No sentences found for “${esc(SEN.q)}”.${S.corpusState === "loading" ? "<p class='small mt-s'>The large corpus is still loading. Try again in a moment.</p>" : ""}</div>`;
return;
}
const slice = SEN.results.slice(0, SEN.shown);
box.innerHTML = `<p class="small muted">${SEN.results.length.toLocaleString()} sentences found${S.corpusState === "loading" ? " so far (corpus still loading)" : ""}.</p>` +
slice.map((it, i) => {
const b = sentenceBlockHTML(it.zh);
return `<div class="example"><div class="row between" style="flex-wrap:nowrap;align-items:flex-start"><div class="zh" style="font-size:1.15rem">${highlightHTML(it.zh, SEN.q)}</div><div class="row" style="flex-wrap:nowrap"><button class="mini" data-act="speak" data-t="${esc(it.zh)}" aria-label="Listen">${ico("volume")}</button><button class="mini ${S.deck.has(it.zh) ? "on" : ""}" data-act="sen-save" data-i="${i}" aria-label="Save sentence">${ico("star")}</button></div></div><div class="small py">${b.html}</div><div class="small">${esc(it.en)} <span class="chip" style="margin-left:.3rem">${esc(it.src)}</span></div></div>`;
}).join("") +
(SEN.results.length > SEN.shown ? `<div class="center"><button class="btn" data-act="sen-more">Load more (${SEN.results.length - SEN.shown} left)</button></div>` : "");
}
A["sen-more"] = () => {
SEN.shown += 20;
senRender();
};
A["sen-save"] = el => {
const it = SEN.results[Number(el.dataset.i)];
if (!it) return;
toggleSave(it.zh, { pinyin: tokensPinyinText(analyzeText(it.zh).tokens), meaning: it.en, level: "Sentence" });
el.classList.toggle("on", S.deck.has(it.zh));
};
document.addEventListener("corpus-ready", () => {
if (S.route.name === "sentences") {
senFillSources();
if (SEN.q) {
SEN.results = searchCorpus(SEN.q, $("#sen-src").value);
senRender();
}
}
});

const SV = { filtered: [] };
VIEW_ENTER.saved = () => renderSaved();
function deckWords() {
return Array.from(S.deck.values()).map(it => ({ key: it.hanzi, hanzi: it.hanzi, pinyin: it.pinyin || "", meaning: it.meaning || "", level: 0 }));
}
function renderSaved() {
if (!$("#v-saved") || $("#v-saved").hidden) return;
const q = $("#sv-search").value.trim().toLowerCase();
const plainQ = plainPinyin(q);
const sort = $("#sv-sort").value;
const tagSel = $("#sv-tag");
const tags = Array.from(new Set(Array.from(S.deck.values()).map(i => i.level || "Saved"))).sort();
const curTag = tagSel.value;
tagSel.innerHTML = '<option value="">All tags</option>' + tags.map(t => `<option value="${esc(t)}">${esc(t)}</option>`).join("");
tagSel.value = tags.includes(curTag) ? curTag : "";
let list = Array.from(S.deck.values()).filter(it => (!tagSel.value || (it.level || "Saved") === tagSel.value) && (!q || it.hanzi.toLowerCase().includes(q) || (it.meaning || "").toLowerCase().includes(q) || (it.note || "").toLowerCase().includes(q) || (plainQ && plainPinyin(it.pinyin || "").includes(plainQ))));
if (sort === "recent") list.sort((a, b) => (b.added || 0) - (a.added || 0));
else if (sort === "oldest") list.sort((a, b) => (a.added || 0) - (b.added || 0));
else if (sort === "level") list.sort((a, b) => String(a.level).localeCompare(String(b.level)));
else list.sort((a, b) => plainPinyin(a.pinyin || "").localeCompare(plainPinyin(b.pinyin || "")));
SV.filtered = list;
const grid = $("#sv-grid");
if (!S.deck.size) {
grid.innerHTML = `<div class="empty" style="grid-column:1/-1"><div class="em-ico">☆</div><b>Nothing saved yet</b><p class="small mt-s">Tap the star on any word, sentence or analyzer result to collect it here.</p><a class="btn primary mt" href="#/level/1/vocab">Browse HSK 1</a></div>`;
return;
}
if (!list.length) {
grid.innerHTML = '<div class="empty" style="grid-column:1/-1">No saved words match.</div>';
return;
}
grid.innerHTML = list.slice(0, 300).map(it => `<div class="stack-s">${wordCardHTML({ key: it.hanzi, hanzi: it.hanzi, pinyin: it.pinyin || "", meaning: it.meaning || "", pos: "", versions: [], level: 0 })}<div class="row between small" style="padding:0 .3rem"><span class="muted" style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${it.note ? esc(it.note) : '<span class="faint">No note</span>'}</span><span class="chip">${esc(it.level || "Saved")}</span><button class="mini" data-act="sv-note" data-key="${esc(it.hanzi)}" aria-label="Edit note">${ico("pen")}</button></div></div>`).join("") + (list.length > 300 ? `<p class="small muted" style="grid-column:1/-1">Showing 300 of ${list.length}. Use search to narrow down.</p>` : "");
}
A["sv-note"] = async el => {
const it = S.deck.get(el.dataset.key);
if (!it) return;
const v = await dialogAsk({ title: "Note", message: `Add a note for “${it.hanzi.length > 20 ? it.hanzi.slice(0, 20) + "…" : it.hanzi}”`, okLabel: "Save", input: it.note || "" });
if (v === null) return;
it.note = String(v).slice(0, 500);
persist.deck();
renderSaved();
};
A["sv-learn"] = () => {
let n = 0;
S.deck.forEach(it => {
if (!S.srs[it.hanzi] && Array.from(it.hanzi).length <= 12) {
S.srs[it.hanzi] = { k: it.hanzi, h: it.hanzi, p: it.pinyin || "", m: it.meaning || "", l: levelOfWord(it.hanzi).level, iv: 0, ease: 2.5, reps: 0, lapses: 0, due: Date.now(), last: 0 };
n++;
}
});
persist.srs();
refreshBadges();
toast(n ? `Added ${n} words to review` : "Nothing new to add");
};
A["sv-quiz"] = () => {
const box = $("#sv-quiz-box");
if (!box.hidden) {
box.hidden = true;
return;
}
const pool = deckWords().filter(w => w.meaning);
if (pool.length < 4) {
toast("Save at least 4 words with meanings to start a quiz");
return;
}
if (!quizzes.saved) quizzes.saved = createQuiz("saved", box, () => deckWords());
quizzes.saved.root = box;
box.hidden = false;
quizzes.saved.next();
box.scrollIntoView({ behavior: "smooth", block: "start" });
};
A["sv-print"] = () => {
S.misc.wsSource = "saved";
persist.misc();
go("/worksheet");
};
const csvCell = v => `"${String(v == null ? "" : v).replace(/"/g, '""')}"`;
A["sv-export"] = el => {
if (!S.deck.size) {
toast("Nothing to export yet");
return;
}
const items = Array.from(S.deck.values());
const fmt = el.dataset.fmt;
if (fmt === "json") downloadFile("hsk-hub-saved.json", JSON.stringify(items, null, 2), "application/json");
else if (fmt === "anki") downloadFile("hsk-hub-anki.txt", items.map(it => [it.hanzi, `${it.pinyin || ""}<br>${it.meaning || ""}`, it.level || ""].map(s => String(s).replace(/[\t\n]/g, " ")).join("\t")).join("\n"), "text/plain;charset=utf-8");
else downloadFile("hsk-hub-saved.csv", "﻿" + ["hanzi,pinyin,meaning,level,note"].concat(items.map(it => [it.hanzi, it.pinyin, it.meaning, it.level, it.note].map(csvCell).join(","))).join("\n"), "text/csv;charset=utf-8");
toast(`Exported ${items.length} items`);
};
A["sv-import"] = () => $("#sv-file").click();
function cleanItem(it) {
if (!it || typeof it.hanzi !== "string" || !it.hanzi.trim()) return null;
return { hanzi: it.hanzi.trim().slice(0, 300), pinyin: String(it.pinyin || "").slice(0, 400), meaning: String(it.meaning || "").slice(0, 600), level: String(it.level || "Saved").slice(0, 40), note: String(it.note || "").slice(0, 500), added: Number(it.added) || Date.now() };
}
async function readJSONFile(file) {
if (file.size > 20 * 1024 * 1024) throw new Error("File is too large");
return JSON.parse(await file.text());
}
A["sv-clear"] = async () => {
if (!S.deck.size) return;
const ok = await dialogAsk({ title: "Clear all saved words?", message: `This removes ${S.deck.size} saved items. Your review schedule is not affected.`, okLabel: "Clear", danger: true });
if (!ok) return;
const backup = Array.from(S.deck.entries());
S.deck.clear();
persist.deck();
afterDeckChange();
toast("Saved words cleared", { label: "Undo", run: () => {
backup.forEach(([k, v]) => S.deck.set(k, v));
persist.deck();
afterDeckChange();
} });
};

VIEW_ENTER.review = () => {
if (!flashes.review) createFlash("review", $("#rv-root"), () => dueKeys().slice(0, 60).map(wordFromKey), { canBrowse: false, mode: "study" });
const F = flashes.review;
F.root = $("#rv-root");
const next = Object.values(S.srs).filter(r => r.due > Date.now()).sort((a, b) => a.due - b.due)[0];
const total = Object.keys(S.srs).length;
F.opts.emptyExtra = total
? `<p class="small muted mt-s">${next ? `Your next card is due in about ${intervalText(next.due - Date.now())}.` : ""}</p><div class="row mt" style="justify-content:center"><a class="btn" href="#/level/1/flash">Learn new words</a><a class="btn" href="#/stats">${ico("chart")}Progress</a></div>`
: `<p class="small muted mt-s">You have no words in review yet. Open a level and add words, or save words and add them from your library.</p><div class="row mt" style="justify-content:center"><a class="btn primary" href="#/level/1/flash">Start with HSK 1</a><a class="btn" href="#/saved">Saved words</a></div>`;
F.start();
};
function intervalText(ms) {
const m = Math.max(1, Math.round(ms / MINUTE));
if (m < 60) return `${m} min`;
const h = Math.round(m / 60);
if (h < 48) return `${h} h`;
return `${Math.round(h / 24)} days`;
}

VIEW_ENTER.stats = () => renderStats();
function renderStats() {
const days = S.stats.days;
const all = Object.values(days);
const reviewed = all.reduce((n, d) => n + d.n, 0);
const okTotal = all.reduce((n, d) => n + d.ok, 0);
const recs = Object.values(S.srs);
const mature = recs.filter(r => r.iv >= 21 && r.due > Date.now()).length;
const learning = recs.filter(r => r.reps >= 1 && r.iv < 21 && r.due > Date.now()).length;
const due = recs.filter(r => r.due <= Date.now()).length;
const fresh = recs.filter(r => r.reps === 0 && r.due > Date.now()).length;
const goal = S.settings.dailyGoal;
const root = $("#st-root");
const now = new Date();
const bars = [];
let max = 1;
for (let i = 13; i >= 0; i--) {
const d = new Date(now);
d.setDate(d.getDate() - i);
const n = (days[dayKey(d)] || { n: 0 }).n;
max = Math.max(max, n);
bars.push({ n, label: ["S", "M", "T", "W", "T", "F", "S"][d.getDay()], today: i === 0 });
}
const start = new Date(now);
start.setDate(start.getDate() - start.getDay() - 15 * 7);
const cells = [];
for (let i = 0; i < 16 * 7 + now.getDay() + 1; i++) {
const d = new Date(start);
d.setDate(start.getDate() + i);
if (d > now) break;
const n = (days[dayKey(d)] || { n: 0 }).n;
const h = n === 0 ? "" : n >= goal ? "h4" : n >= goal * 0.6 ? "h3" : n >= goal * 0.3 ? "h2" : "h1";
cells.push(`<i class="${h}" title="${dayKey(d)}: ${n}"></i>`);
}
const hardest = recs.filter(r => r.lapses > 0).sort((a, b) => b.lapses - a.lapses).slice(0, 12);
const empty = !all.length && !recs.length;
root.innerHTML = `
${empty ? `<div class="banner mb">${ico("info")}<span class="grow">No activity yet. Review a few cards or take a quiz and your progress shows up here.</span><a class="btn sm primary" href="#/level/1/flash">Start</a></div>` : ""}
<div class="grid g-4 keep mb">
<div class="card stat"><span class="k">${ico("flame")}Streak</span><span class="v">${calcStreak()}</span><span class="s">best ${S.stats.best || 0} days</span></div>
<div class="card stat"><span class="k">${ico("check")}Answers</span><span class="v">${reviewed.toLocaleString()}</span><span class="s">${reviewed ? Math.round((okTotal / reviewed) * 100) : 0}% correct overall</span></div>
<div class="card stat"><span class="k">${ico("cards")}In review</span><span class="v">${recs.length.toLocaleString()}</span><span class="s">${due} due now</span></div>
<div class="card stat"><span class="k">${ico("star")}Saved</span><span class="v">${S.deck.size.toLocaleString()}</span><span class="s">${mature} mastered</span></div>
</div>
<div class="grid g-2 mb">
<div class="card"><h2 class="sec">Last 14 days</h2><div class="bars">${bars.map(b => `<div class="b ${b.today ? "today" : ""}" title="${b.n} answers"><i style="height:${Math.max(2, Math.round((b.n / max) * 100))}%"></i><span>${b.label}</span></div>`).join("")}</div></div>
<div class="card"><h2 class="sec">Memory strength</h2>
<div class="stack-s">${[["New", fresh, "var(--ink-3)"], ["Learning", learning, "var(--gold)"], ["Due", due, "var(--seal)"], ["Mastered", mature, "var(--jade)"]].map(([n, c, col]) => `<div><div class="row between small"><span>${n}</span><b>${c}</b></div><div class="prog"><i style="width:${recs.length ? Math.round((c / recs.length) * 100) : 0}%;background:${col}"></i></div></div>`).join("")}</div></div>
</div>
<div class="card mb"><h2 class="sec">Activity · last 16 weeks</h2><div class="heat" aria-label="Activity heatmap">${cells.join("")}</div><p class="tiny faint mt-s">Darker means closer to your daily goal of ${goal}.</p></div>
<div class="card mb"><h2 class="sec">Mastery by level</h2><div class="stack-s">${[1, 2, 3, 4, 5, 6, 7].map(l => {
const r = recs.filter(x => x.l === l);
const learned = r.filter(x => x.reps >= 1).length;
const m = r.filter(x => x.iv >= 21).length;
const p1 = Math.min(100, (learned / LEVELS[l].total) * 100);
const p2 = Math.min(100, (m / LEVELS[l].total) * 100);
return `<a href="#/level/${l}/vocab" style="color:inherit"><div class="row between small"><b>${LEVELS[l].name}</b><span class="muted">${learned} learned · ${m} mastered · of ${LEVELS[l].total.toLocaleString()}</span></div><div class="prog" style="position:relative"><i style="width:${p1}%;background:var(--l${l});opacity:.45"></i><i style="position:absolute;left:0;top:0;width:${p2}%;background:var(--l${l})"></i></div></a>`;
}).join("")}</div></div>
<div class="card"><h2 class="sec">Hardest words</h2>${hardest.length ? `<div class="row">${hardest.map(r => `<button class="chip" data-act="open-word" data-key="${esc(r.k)}"><span class="han">${esc(r.h)}</span> <span class="tiny">×${r.lapses}</span></button>`).join("")}</div>` : '<p class="small muted">Words you forget most often will appear here.</p>'}</div>`;
}

VIEW_ENTER.settings = () => {
applySettings();
renderOfflineCard();
updateInstallUI();
loadVoices();
const note = $("#voice-note");
if (note) note.textContent = VOICES.length ? "Uses your device's Chinese voices. On iPhone, switch off silent mode and raise the volume." : "No Chinese voice found. Install one in your system speech settings.";
const days = Object.keys(S.stats.days).length;
$("#data-summary").textContent = `${S.deck.size} saved · ${Object.keys(S.srs).length} in review · ${days} days of activity`;
};
function onSettingChange(el) {
const k = el.dataset.setting;
if (!k) return;
let v;
if (el.dataset.type === "bool" || el.type === "checkbox") v = el.checked;
else if (el.dataset.type === "number") v = Number(el.value);
else v = el.value;
if (typeof v === "number" && !Number.isFinite(v)) return;
S.settings[k] = v;
persist.settings();
applySettings();
}
function backupObject() {
return { app: "hsk-hub", version: 1, exported: new Date().toISOString(), settings: S.settings, deck: Array.from(S.deck.values()), srs: S.srs, stats: S.stats, misc: S.misc };
}
A["data-export"] = () => {
downloadFile(`hsk-hub-backup-${dayKey()}.json`, JSON.stringify(backupObject(), null, 2), "application/json");
toast("Backup downloaded");
};
A["data-import"] = () => $("#data-file").click();
async function importBackup(file) {
try {
const data = await readJSONFile(file);
if (!data || data.app !== "hsk-hub") throw new Error("Not an HSK Hub backup");
const ok = await dialogAsk({ title: "Restore this backup?", message: `It contains ${Array.isArray(data.deck) ? data.deck.length : 0} saved items and ${data.srs ? Object.keys(data.srs).length : 0} review records. Your current data will be replaced.`, okLabel: "Restore", danger: true });
if (!ok) return;
S.deck.clear();
(Array.isArray(data.deck) ? data.deck : []).map(cleanItem).filter(Boolean).forEach(it => S.deck.set(it.hanzi, it));
const srs = {};
Object.entries(data.srs && typeof data.srs === "object" ? data.srs : {}).forEach(([k, r]) => {
if (r && typeof r === "object" && Number.isFinite(r.due)) srs[k] = { k, h: String(r.h || k), p: String(r.p || ""), m: String(r.m || ""), l: Number(r.l) || 0, iv: Number(r.iv) || 0, ease: Number(r.ease) || 2.5, reps: Number(r.reps) || 0, lapses: Number(r.lapses) || 0, due: r.due, last: Number(r.last) || 0 };
});
S.srs = srs;
S.stats = data.stats && typeof data.stats === "object" && data.stats.days ? data.stats : { days: {}, best: 0 };
S.misc = data.misc && typeof data.misc === "object" ? data.misc : {};
if (data.settings && typeof data.settings === "object") S.settings = Object.assign({}, DEFAULT_SETTINGS, data.settings);
persist.deck();
persist.srs();
persist.stats();
persist.misc();
persist.settings();
applySettings();
refreshBadges();
VIEW_ENTER.settings();
toast("Backup restored");
} catch (e) {
toast("Could not read that backup: " + (e.message || "invalid file"));
}
}
A["cache-clear"] = async () => {
await idb.clear();
S.vocab = {};
S.grammar = {};
S.phrases = null;
toast("Downloaded datasets cleared. They will be fetched again when needed.");
};
A["data-reset"] = async () => {
const v = await dialogAsk({ title: "Reset all progress?", message: "This deletes saved words, review schedule and statistics on this device. Type RESET to confirm.", okLabel: "Delete everything", danger: true, input: "" });
if (!v || String(v).trim().toUpperCase() !== "RESET") {
if (v !== null) toast("Nothing was deleted");
return;
}
S.deck.clear();
S.srs = {};
S.stats = { days: {}, best: 0 };
S.misc = {};
persist.deck();
persist.srs();
persist.stats();
persist.misc();
refreshBadges();
VIEW_ENTER.settings();
toast("All progress reset");
};

function isTyping(t) {
return t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);
}
function anyDialogOpen() {
return $$("dialog").some(d => d.open);
}
function mwActive() {
return S.route.name === "measure" && !$("#mw-quiz").hidden;
}

document.addEventListener("click", e => {
const el = e.target.closest("[data-act]");
if (!el || el.tagName === "FORM") return;
const fn = A[el.dataset.act];
if (!fn) return;
fn(el, e);
});
document.addEventListener("keydown", e => {
const t = e.target;
if ((e.key === "Enter" || e.key === " ") && t.classList && t.classList.contains("vcard")) {
e.preventDefault();
t.click();
return;
}
if (e.target.id === "pal-input") {
if (e.key === "ArrowDown" || e.key === "ArrowUp") {
e.preventDefault();
PAL.sel = clamp(PAL.sel + (e.key === "ArrowDown" ? 1 : -1), 0, Math.max(0, PAL.items.length - 1));
renderPalette();
} else if (e.key === "Enter") {
e.preventDefault();
const it = PAL.items[PAL.sel];
$("#dlg-palette").close();
if (it) it.run();
}
return;
}
if (e.key === "Enter" && t.id === "sen-q") {
A["sen-search"]();
return;
}
if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
e.preventDefault();
A["open-palette"]();
return;
}
if (e.ctrlKey || e.metaKey || e.altKey) return;
if (isTyping(t)) return;
if (anyDialogOpen()) return;
if (e.key === "/") {
e.preventDefault();
A["open-palette"]();
return;
}
if (e.key === "?") {
A["show-keys"]();
return;
}
if (e.key === "[") {
A["toggle-side"]();
return;
}
const F = activeFlash();
const Q = activeQuiz();
const onBtn = t.tagName === "BUTTON" || t.tagName === "A";
if (F && F.words.length && !(F.mode === "study" && F.i >= F.words.length)) {
if ((e.key === " " || e.key === "Enter") && !onBtn) {
e.preventDefault();
A["fc-flip"](F.root);
} else if (/^[1-4]$/.test(e.key) && F.mode === "study" && F.flipped) {
A["fc-rate"]({ dataset: { r: String(Number(e.key) - 1) }, closest: () => F.root.querySelector("[data-fc]") });
} else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
if (F.mode === "browse") A["fc-nav"]({ dataset: { d: e.key === "ArrowRight" ? "1" : "-1" }, closest: () => F.root.querySelector("[data-fc]") });
}
return;
}
if (Q && Q.cur) {
if (/^[1-4]$/.test(e.key) && !Q.answered && Q.mode !== "type") Q.pick(Number(e.key) - 1);
else if (e.key === "Enter" && Q.answered && !onBtn) Q.next();
return;
}
if (mwActive()) {
if (/^[1-4]$/.test(e.key) && !MWQ.answered && MWQ.cur) {
const b = $$("#mw-quiz .q-opt")[Number(e.key) - 1];
if (b) b.click();
} else if (e.key === "Enter" && MWQ.answered && !onBtn) mwNext();
}
});
document.addEventListener("input", e => {
const t = e.target;
if (t.id === "lvl-search") debouncedLevelFilter();
else if (t.id === "an-input") {
anCount();
analyzerLive();
} else if (t.id === "rad-search") renderRadicals();
else if (t.id === "mw-search") renderMwRef();
else if (t.id === "sv-search") renderSaved();
else if (t.id === "pal-input") {
PAL.sel = 0;
renderPalette();
} else if (t.id === "ws-chars") {
if ($("#ws-source").value !== "custom") {
$("#ws-source").value = "custom";
$("#ws-level-wrap").hidden = true;
}
wsRender();
} else if (t.id === "ws-title" || t.id === "ws-size") wsRender();
else if (t.dataset && t.dataset.setting && t.type === "range") onSettingChange(t);
});
const debouncedLevelFilter = debounce(onLevelFilter, 180);
document.addEventListener("change", async e => {
const t = e.target;
if (t.id === "lvl-syllabus" || t.id === "lvl-status" || t.id === "lvl-sort") onLevelFilter();
else if (t.id === "an-target") {
S.misc.anTarget = Number(t.value);
persist.misc();
analyzerRender();
} else if (t.id === "an-unique") analyzerView();
else if (t.id === "an-live" && t.checked) analyzerRun(false);
else if (t.id === "sv-sort" || t.id === "sv-tag") renderSaved();
else if (t.id === "ws-source" || t.id === "ws-level" || t.id === "ws-offset") {
await wsFillFromSource();
wsRender();
} else if (["ws-font", "ws-style", "ws-grid", "ws-trace", "ws-cols", "ws-py", "ws-en"].includes(t.id)) wsRender();
else if (t.id === "sen-src") {
if (SEN.q) A["sen-search"]();
} else if (t.id === "voice-select") {
S.settings.voiceURI = t.value;
persist.settings();
} else if (t.id === "sv-file") {
const f = t.files[0];
t.value = "";
if (!f) return;
try {
const data = await readJSONFile(f);
const arr = Array.isArray(data) ? data : data && Array.isArray(data.deck) ? data.deck : [];
let n = 0;
arr.map(cleanItem).filter(Boolean).forEach(it => {
if (!S.deck.has(it.hanzi)) {
S.deck.set(it.hanzi, it);
n++;
}
});
persist.deck();
afterDeckChange();
toast(n ? `Imported ${n} items` : "No new items found in that file");
} catch (err) {
toast("Could not read that file. Use a JSON export from this app.");
}
} else if (t.id === "data-file") {
const f = t.files[0];
t.value = "";
if (f) importBackup(f);
} else if (t.dataset && t.dataset.setting && t.type !== "range") onSettingChange(t);
});
document.addEventListener("click", e => {
if (e.target.tagName === "DIALOG" && e.target.open) e.target.close();
});

window.addEventListener("hashchange", route);
window.addEventListener("online", () => {
document.body.classList.remove("offline");
toast("Back online");
});
window.addEventListener("offline", () => {
document.body.classList.add("offline");
toast("You are offline. Built-in words and your saved data still work.");
});
if ("speechSynthesis" in window) speechSynthesis.addEventListener && speechSynthesis.addEventListener("voiceschanged", loadVoices);
if (window.matchMedia) {
const mq = window.matchMedia("(prefers-color-scheme: dark)");
const onMq = () => {
if (S.settings.theme === "auto") applySettings();
};
mq.addEventListener ? mq.addEventListener("change", onMq) : mq.addListener && mq.addListener(onMq);
}
document.addEventListener("dict-ready", () => {
updateDictPill();
if (S.route.name === "home") renderHome();
else if (S.route.name === "analyzer" && AN.text) analyzerRun(true);
});

function init() {
loadDeck();
seedDictionary();
initCorpus();
applySettings();
fillFontSelects();
applySettings();
loadVoices();
retryVoices();
["pointerdown", "touchend", "keydown"].forEach(ev => document.addEventListener(ev, unlockSpeech, { once: true, capture: true, passive: true }));
if (!navigator.onLine) document.body.classList.add("offline");
renderNav();
if (!location.hash) history.replaceState(null, "", "#/home");
route();
updateDictPill();
const idle = window.requestIdleCallback || (fn => setTimeout(fn, 400));
idle(() => loadAllDictionaries());
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();
