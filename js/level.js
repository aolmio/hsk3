"use strict";
const LV = { filtered: [], grammarShown: 40, phraseShown: 60, loaded: 0 };

function sortStatusOrder(a, b) {
return (S.srs[a.key] ? S.srs[a.key].due : Infinity) - (S.srs[b.key] ? S.srs[b.key].due : Infinity);
}

function currentVocab() {
const rec = S.vocab[S.level];
return rec ? rec.list : [];
}

function applyLevelFilters() {
const q = ($("#lvl-search").value || "").trim().toLowerCase();
const plainQ = plainPinyin(q);
const status = $("#lvl-status").value;
const sort = $("#lvl-sort").value;
S.syllabus = $("#lvl-syllabus").value;
let list = currentVocab().filter(w => {
if (S.syllabus !== "all" && !w.versions.includes(S.syllabus)) return false;
if (status === "saved") {
if (!S.deck.has(w.key)) return false;
} else if (status !== "all" && srsStatus(w.key) !== status) {
return false;
}
if (!q) return true;
return w.hanzi.toLowerCase().includes(q) || w.key.includes(q) || (plainQ && plainPinyin(w.pinyin).includes(plainQ)) || w.meaning.toLowerCase().includes(q);
});
if (sort === "pinyin") list = list.slice().sort((a, b) => plainPinyin(a.pinyin).localeCompare(plainPinyin(b.pinyin)));
else if (sort === "length") list = list.slice().sort((a, b) => Array.from(a.key).length - Array.from(b.key).length);
else if (sort === "random") list = shuffle(list);
LV.filtered = list;
S.page = 1;
}

async function openLevel(lvl, tab) {
const levelChanged = S.level !== lvl || !S.vocab[lvl];
S.level = lvl;
S.tab = tab;
const info = LEVELS[lvl];
$("#lvl-eyebrow").textContent = `${info.cefr} · ${info.band}`;
$("#lvl-title").textContent = lvl === 7 ? "HSK Levels 7–9" : `HSK Level ${lvl}`;
$("#lvl-desc").textContent = info.desc;
$$("#lvl-tabs button").forEach(b => {
b.classList.toggle("on", b.dataset.tab === tab);
b.setAttribute("aria-selected", b.dataset.tab === tab ? "true" : "false");
});
["vocab", "flash", "quiz", "grammar", "idioms", "strokes"].forEach(t => ($(`#lp-${t}`).hidden = t !== tab));
$("#lvl-filters").hidden = tab === "strokes" || tab === "grammar" || tab === "idioms" ? tab === "strokes" : false;
const showSel = tab === "vocab" || tab === "flash" || tab === "quiz";
["lvl-syllabus", "lvl-status", "lvl-sort"].forEach(id => ($(`#${id}`).hidden = !showSel));
if (tab === "grammar" || tab === "idioms") $("#lvl-search").placeholder = tab === "grammar" ? "Filter grammar points…" : "Filter idioms…";
else $("#lvl-search").placeholder = "Filter by hanzi, pinyin (ni hao) or meaning…";
if (levelChanged) {
$("#lvl-search").value = "";
$("#lvl-pills").innerHTML = "";
$("#lvl-banner").innerHTML = "";
$("#lp-vocab").innerHTML = '<div class="wgrid">' + '<div class="skeleton"></div>'.repeat(12) + "</div>";
const token = ++S.levelToken;
const [vocabRec, grammar, phrases] = await Promise.all([loadVocabLevel(lvl), loadGrammar(lvl), loadPhrases()]);
if (token !== S.levelToken || S.level !== lvl) return;
LV.grammar = grammar;
LV.phrases = phrases;
$("#lvl-pills").innerHTML = `<span class="chip">${ico("list")}${vocabRec.list.length.toLocaleString()} words</span><span class="chip">${ico("book")}${grammar.length} grammar</span><span class="chip">${ico("sparkle")}${phrases.length} idioms</span>`;
$("#lvl-banner").innerHTML = vocabRec.offline
? `<div class="banner">${ico("wifi-off")}<span class="grow">Showing the built-in sample for this level because the full word lists could not be downloaded.</span><button class="btn sm" data-act="lvl-retry">${ico("repeat")}Retry download</button></div>`
: "";
applyLevelFilters();
}
if (!S.vocab[lvl]) return;
renderLevelTab();
}

function renderLevelTab() {
const tab = S.tab;
if (tab === "vocab") renderVocab();
else if (tab === "flash") renderFlashTab();
else if (tab === "quiz") renderQuizTab();
else if (tab === "grammar") renderGrammar();
else if (tab === "idioms") renderIdioms();
else if (tab === "strokes") renderStrokesTab();
}

A["lvl-tab"] = el => go(`/level/${S.level}/${el.dataset.tab}`);
A["lvl-retry"] = async () => {
delete S.vocab[S.level];
delete S.grammar[S.level];
S.phrases = null;
$("#lvl-banner").innerHTML = '<div class="banner">Downloading…</div>';
await idb.clear();
S.levelToken++;
openLevel(S.level, S.tab);
};

function onLevelFilter() {
if (S.route.name !== "level") return;
if (S.tab === "grammar") {
LV.grammarShown = 40;
renderGrammar();
return;
}
if (S.tab === "idioms") {
LV.phraseShown = 60;
renderIdioms();
return;
}
applyLevelFilters();
renderLevelTab();
}

function renderVocab() {
const box = $("#lp-vocab");
const total = LV.filtered.length;
const size = window.innerWidth <= 960 ? 24 : 48;
const pages = Math.max(1, Math.ceil(total / size));
S.page = clamp(S.page, 1, pages);
if (!total) {
box.innerHTML = `<div class="empty"><div class="em-ico">字</div>No words match these filters.</div>`;
return;
}
const slice = LV.filtered.slice((S.page - 1) * size, S.page * size);
box.innerHTML = `
<div class="row between mb"><span class="small muted">${total.toLocaleString()} words · page ${S.page} of ${pages}</span>
<div class="row">
<button class="btn sm ${S.settings.hidePinyin ? "on" : ""}" data-act="toggle-hide" data-k="hidePinyin">${ico("eye")}Hide pinyin</button>
<button class="btn sm ${S.settings.hideMeaning ? "on" : ""}" data-act="toggle-hide" data-k="hideMeaning">${ico("eye")}Hide meaning</button>
<button class="btn sm" data-act="learn-page">${ico("cards")}Add page to review</button>
</div></div>
<div class="wgrid">${slice.map(w => wordCardHTML(w)).join("")}</div>
${pages > 1 ? `<div class="pager"><button class="btn" data-act="page" data-d="-1" ${S.page <= 1 ? "disabled" : ""}>${ico("left")}Prev</button><span>Page ${S.page} / ${pages}</span><button class="btn" data-act="page" data-d="1" ${S.page >= pages ? "disabled" : ""}>Next${ico("right")}</button></div>` : ""}`;
}
A.page = el => {
S.page += Number(el.dataset.d);
renderVocab();
window.scrollTo({ top: 120, behavior: "smooth" });
};
A["toggle-hide"] = el => {
const k = el.dataset.k;
S.settings[k] = !S.settings[k];
persist.settings();
applySettings();
renderVocab();
};
A["learn-page"] = () => {
const size = window.innerWidth <= 960 ? 24 : 48;
const slice = LV.filtered.slice((S.page - 1) * size, S.page * size);
let added = 0;
slice.forEach(w => {
if (!S.srs[w.key]) {
S.srs[w.key] = { k: w.key, h: w.hanzi, p: w.pinyin, m: w.meaning, l: w.level, iv: 0, ease: 2.5, reps: 0, lapses: 0, due: Date.now(), last: 0 };
added++;
}
});
persist.srs();
refreshBadges();
toast(added ? `Added ${added} words to your review queue` : "These words are already in review");
renderVocab();
};

function buildQueue(words) {
const due = words.filter(w => srsStatus(w.key) === "due").sort(sortStatusOrder).slice(0, 40);
const fresh = shuffle(words.filter(w => srsStatus(w.key) === "new")).slice(0, S.settings.newPerSession);
return due.concat(fresh);
}

function createFlash(id, root, getWords, opts = {}) {
const F = { id, root, words: [], i: 0, flipped: false, mode: opts.mode || "study", results: [], startedAt: 0, getWords, opts };
F.start = mode => {
if (mode) F.mode = mode;
const pool = F.getWords();
F.words = F.mode === "study" ? buildQueue(pool) : pool.slice();
F.i = 0;
F.flipped = false;
F.results = [];
F.startedAt = Date.now();
F.render();
F.autoplay();
};
F.autoplay = () => {
const w = F.words[F.i];
if (w && S.settings.autoSpeak && (S.settings.fcDirection === "audio" || F.flipped === false)) speak(w.key);
};
F.render = () => {
const r = F.root;
if (!F.words.length) {
r.innerHTML = `<div class="empty"><div class="em-ico">${F.mode === "study" ? "✓" : "字"}</div><b>${F.mode === "study" ? "Nothing to study right now" : "No cards match these filters"}</b><p class="small mt-s">${F.mode === "study" ? "No cards are due and no new words are available with the current filters." : "Try clearing the search or status filter."}</p>${F.opts.emptyExtra || ""}${F.mode === "study" && F.opts.canBrowse ? `<button class="btn mt" data-act="fc-mode" data-m="browse">Browse all cards</button>` : ""}</div>`;
return;
}
const seg = F.opts.canBrowse ? `<div class="seg" role="group" aria-label="Mode"><button data-act="fc-mode" data-m="study" class="${F.mode === "study" ? "on" : ""}">Study</button><button data-act="fc-mode" data-m="browse" class="${F.mode === "browse" ? "on" : ""}">Browse</button></div>` : "";
if (F.mode === "study" && F.i >= F.words.length) {
const good = F.results.filter(x => x >= 2).length;
const mins = Math.max(1, Math.round((Date.now() - F.startedAt) / 60000));
r.innerHTML = `<div class="flash-wrap"><div class="card center"><div class="em-ico" style="font-size:2.5rem">🎉</div><div class="summary-big">${F.results.length} cards</div><p class="muted">${F.results.length ? Math.round((good / F.results.length) * 100) : 0}% recalled · about ${mins} min</p>
<div class="row mt" style="justify-content:center"><button class="btn primary" data-act="fc-restart">${ico("repeat")}Another round</button>${F.opts.canBrowse ? `<button class="btn" data-act="fc-mode" data-m="browse">Browse cards</button>` : ""}<a class="btn" href="#/stats">${ico("chart")}Progress</a></div></div></div>`;
return;
}
const w = F.words[F.i];
const dir = S.settings.fcDirection;
const a = analyzeWord(w.key, w.pinyin);
const back = `<div class="hz-lg">${hanziHTML(w.hanzi, w.key, w.pinyin)}</div><div style="font-size:1.35rem" class="py">${a.spoken.length ? pinyinHTML(a.spoken) : pinyinStrHTML(w.pinyin)}</div>${a.notes.length ? sandhiPill(a, false) : ""}<div style="max-width:380px;margin-top:.3rem">${w.meaning ? esc(shortMeaning(w.meaning, 4)) : '<span class="faint">No definition available</span>'}</div><div class="row" style="justify-content:center;margin-top:.5rem"><button class="btn sm" data-act="speak" data-t="${esc(w.key)}">${ico("volume")}Listen</button><button class="btn sm" data-act="open-word" data-key="${esc(w.key)}">Details</button><button class="btn sm ${S.deck.has(w.key) ? "on" : ""}" data-act="save" data-key="${esc(w.key)}">${ico("star")}</button></div>`;
let front;
if (dir === "en") front = `<span class="chip">${levelLabel(w.level)}</span><div style="font-size:1.5rem;font-weight:700;max-width:400px;line-height:1.35">${esc(shortMeaning(w.meaning, 3) || "—")}</div><div class="hint">What is the Chinese?</div>`;
else if (dir === "audio") front = `<button class="btn primary lg" data-act="speak" data-t="${esc(w.key)}">${ico("volume")}Play audio</button><div class="hint">Listen, then recall the word</div>`;
else front = `<span class="chip">${levelLabel(w.level)}</span><div class="hz-xl">${hanziHTML(w.hanzi, w.key, w.pinyin)}</div><div class="hint">Tap or press Space to reveal</div>`;
const pct = Math.round((F.i / F.words.length) * 100);
const rec = S.srs[w.key] || null;
const controls = F.mode === "study"
? (F.flipped
? `<div class="rate">${["Again", "Hard", "Good", "Easy"].map((n, r2) => `<button class="r${r2}" data-act="fc-rate" data-r="${r2}"><span>${r2 + 1} · ${n}</span><small>${intervalLabel(rec, r2)}</small></button>`).join("")}</div>`
: `<button class="btn primary lg" style="width:100%" data-act="fc-flip">Show answer <span class="kbd" style="color:var(--ink)">Space</span></button>`)
: `<div class="row" style="justify-content:center"><button class="btn" data-act="fc-nav" data-d="-1">${ico("left")}Previous</button><button class="btn primary" data-act="fc-flip">${ico("repeat")}Flip</button><button class="btn" data-act="fc-nav" data-d="1">Next${ico("right")}</button><button class="btn ghost icon" data-act="fc-shuffle" aria-label="Shuffle">${ico("shuffle")}</button></div>`;
r.innerHTML = `<div class="flash-wrap" data-fc="${F.id}">
<div class="row between">${seg}<span class="chip">${F.i + 1} / ${F.words.length}</span></div>
<div class="prog mt-s"><i style="width:${pct}%"></i></div>
<div class="flip ${F.flipped ? "flipped" : ""}" data-act="fc-flip" role="button" tabindex="0" aria-label="Flashcard, press to flip"><div class="flip-in"><div class="face front">${front}</div><div class="face back">${back}</div></div></div>
${controls}</div>`;
};
flashes[id] = F;
return F;
}

function flashOf(el) {
const host = el.closest("[data-fc]");
return host ? flashes[host.dataset.fc] : activeFlash();
}
function activeFlash() {
if (S.route.name === "level" && S.tab === "flash") return flashes.level;
if (S.route.name === "review") return flashes.review;
return null;
}
A["fc-flip"] = el => {
const F = flashOf(el);
if (!F) return;
F.flipped = !F.flipped;
const wrap = F.root.querySelector(".flip");
if (F.mode === "study") {
F.render();
} else if (wrap) wrap.classList.toggle("flipped", F.flipped);
if (F.flipped && F.words[F.i] && S.settings.autoSpeak && S.settings.fcDirection !== "audio") speak(F.words[F.i].key);
};
A["fc-rate"] = el => {
const F = flashOf(el);
if (!F || !F.flipped) return;
const r = Number(el.dataset.r);
srsRate(F.words[F.i], r);
F.results.push(r);
F.i++;
F.flipped = false;
F.render();
F.autoplay();
if (F.opts.onRate) F.opts.onRate();
};
A["fc-nav"] = el => {
const F = flashOf(el);
if (!F) return;
F.i = (F.i + Number(el.dataset.d) + F.words.length) % F.words.length;
F.flipped = false;
F.render();
F.autoplay();
};
A["fc-shuffle"] = el => {
const F = flashOf(el);
F.words = shuffle(F.words);
F.i = 0;
F.flipped = false;
F.render();
};
A["fc-mode"] = el => {
const F = flashOf(el) || flashes.level;
F.start(el.dataset.m);
};
A["fc-restart"] = el => {
const F = flashOf(el);
F.start();
};

function renderFlashTab() {
if (!flashes.level) createFlash("level", $("#lp-flash"), () => LV.filtered, { canBrowse: true, mode: "study" });
flashes.level.root = $("#lp-flash");
flashes.level.start();
}

function shortOpt(w) {
return shortMeaning(w.meaning, 2) || "—";
}

function createQuiz(id, root, getPool) {
const Q = { id, root, getPool, mode: store.get("hsk_hub_qmode", "meaning"), ans: store.get("hsk_hub_qans", "meaning"), score: 0, total: 0, streak: 0, best: (S.misc.qbest || 0), wrong: new Map(), cur: null, answered: false, onlyWrong: false };
Q.pool = () => {
const base = Q.onlyWrong ? Array.from(Q.wrong.values()) : Q.getPool();
return base.filter(w => w.meaning);
};
Q.label = o => {
if (Q.mode === "reverse" || (Q.mode === "listen" && Q.ans === "hanzi")) return o.hanzi;
if (Q.mode === "listen" && Q.ans === "pinyin") return wordPinyinText(o.key, o.pinyin);
return shortOpt(o);
};
Q.next = () => {
const pool = Q.pool();
if (pool.length < 4 && !Q.onlyWrong) {
Q.cur = null;
Q.render();
return;
}
if (!pool.length) {
Q.onlyWrong = false;
Q.next();
return;
}
const target = pool[Math.floor(Math.random() * pool.length)];
const all = Q.onlyWrong ? Q.getPool().filter(w => w.meaning) : pool;
let opts = [target];
const used = new Set([target.key, Q.label(target)]);
let guard = 0;
if (Q.mode === "listen" && Q.ans !== "meaning") {
const tp = plainPinyin(target.pinyin);
const near = shuffle(all.filter(c => c.key !== target.key && tp && plainPinyin(c.pinyin) === tp));
for (const c of near) {
if (opts.length >= 3) break;
if (!used.has(Q.label(c))) {
used.add(c.key);
used.add(Q.label(c));
opts.push(c);
}
}
}
while (opts.length < 4 && guard++ < 200 && all.length >= 4) {
const c = all[Math.floor(Math.random() * all.length)];
if (!used.has(c.key) && !used.has(Q.label(c))) {
used.add(c.key);
used.add(Q.label(c));
opts.push(c);
}
}
Q.cur = { target, opts: shuffle(opts) };
Q.answered = false;
Q.render();
if (Q.mode === "listen") speak(target.key);
};
Q.header = () => `<div class="row between mb"><span class="chip">Score ${Q.score}/${Q.total}${Q.total ? ` · ${Math.round((Q.score / Q.total) * 100)}%` : ""}</span><span class="chip gold">${ico("flame")}Streak ${Q.streak} · best ${Q.best}</span>${Q.wrong.size ? `<button class="btn sm" data-act="q-mistakes">${Q.onlyWrong ? "All words" : `Retry ${Q.wrong.size} mistake${Q.wrong.size > 1 ? "s" : ""}`}</button>` : ""}</div>
<div class="center mb"><div class="seg" role="group" aria-label="Quiz type"><button data-act="q-mode" data-m="meaning" class="${Q.mode === "meaning" ? "on" : ""}">Hanzi → English</button><button data-act="q-mode" data-m="reverse" class="${Q.mode === "reverse" ? "on" : ""}">English → Hanzi</button><button data-act="q-mode" data-m="listen" class="${Q.mode === "listen" ? "on" : ""}">Listening</button><button data-act="q-mode" data-m="type" class="${Q.mode === "type" ? "on" : ""}">Type pinyin</button></div></div>${Q.mode === "listen" ? `<div class="center mb"><span class="small muted" style="margin-right:.5rem">Choose the</span><div class="seg" role="group" aria-label="Answer type"><button data-act="q-ans" data-a="meaning" class="${Q.ans === "meaning" ? "on" : ""}">Meaning</button><button data-act="q-ans" data-a="pinyin" class="${Q.ans === "pinyin" ? "on" : ""}">Pinyin</button><button data-act="q-ans" data-a="hanzi" class="${Q.ans === "hanzi" ? "on" : ""}">Hanzi</button></div></div>` : ""}`;
Q.render = () => {
const r = Q.root;
r.dataset.q = Q.id;
if (!Q.cur) {
r.innerHTML = `<div class="quiz card">${Q.header()}<div class="empty">Not enough words with definitions to build a quiz. Clear your filters or choose another level.</div></div>`;
return;
}
const t = Q.cur.target;
const a = analyzeWord(t.key, t.pinyin);
let prompt = "";
let body = "";
if (Q.mode === "meaning") {
prompt = `<div class="hz-xl">${hanziHTML(t.hanzi, t.key, t.pinyin)}</div><div class="py" style="font-size:1.1rem">${a.spoken.length ? pinyinHTML(a.spoken) : ""}</div><button class="btn sm mt-s" data-act="speak" data-t="${esc(t.key)}">${ico("volume")}Listen</button>`;
body = Q.cur.opts.map((o, i) => `<button class="q-opt" data-act="q-pick" data-i="${i}"><span class="n">${i + 1}</span>${esc(shortOpt(o))}</button>`).join("");
} else if (Q.mode === "reverse") {
prompt = `<div style="font-size:1.6rem;font-weight:700;line-height:1.35">${esc(shortOpt(t))}</div><div class="hint">Which word means this?</div>`;
body = Q.cur.opts.map((o, i) => `<button class="q-opt hz-opt" data-act="q-pick" data-i="${i}"><span class="n">${i + 1}</span>${esc(o.hanzi)}</button>`).join("");
} else if (Q.mode === "listen") {
prompt = `<div class="row" style="justify-content:center"><button class="btn primary lg" data-act="speak" data-t="${esc(t.key)}">${ico("volume")}Play again</button><button class="btn lg" data-act="speak" data-t="${esc(t.key)}" data-slow="1">${ico("volume")}Slow</button></div><div class="hint mt-s">Hanzi and pinyin are hidden. Which ${Q.ans === "meaning" ? "meaning" : Q.ans === "pinyin" ? "pinyin" : "word"} did you hear?</div>`;
body = Q.cur.opts.map((o, i) => `<button class="q-opt ${Q.ans === "hanzi" ? "hz-opt" : ""}" data-act="q-pick" data-i="${i}"><span class="n">${i + 1}</span>${Q.ans === "hanzi" ? esc(o.hanzi) : Q.ans === "pinyin" ? `<span class="py" style="font-size:1.1rem;font-weight:700">${wordPinyinHTML(o.key, o.pinyin)}</span>` : esc(shortOpt(o))}</button>`).join("");
} else {
prompt = `<div class="hz-xl">${esc(t.hanzi)}</div><div class="muted">${esc(shortOpt(t))}</div><button class="btn sm mt-s" data-act="speak" data-t="${esc(t.key)}">${ico("volume")}Listen</button>`;
body = `<form class="row mt" data-act="q-type" style="flex-wrap:nowrap"><input class="input han" id="q-input" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Type pinyin, e.g. ni3 hao3 or nǐ hǎo" aria-label="Pinyin answer"><button class="btn primary" type="submit">Check</button></form><p class="hint mt-s">Tones count. Use numbers (ni3) or marks (nǐ); “v” works for ü.</p>`;
}
r.innerHTML = `<div class="quiz card">${Q.header()}<div class="q-prompt">${prompt}</div><div class="q-opts">${body}</div><div class="feedback" id="q-fb" aria-live="polite"></div><div class="center"><button class="btn" data-act="q-next" ${Q.answered ? "" : "hidden"} id="q-next">Next ${ico("right")}</button></div></div>`;
if (Q.mode === "type") {
const inp = $("#q-input", r);
if (inp) inp.focus();
}
};
Q.settle = (ok, t, extra) => {
Q.answered = true;
Q.total++;
if (ok) {
Q.score++;
Q.streak++;
if (Q.streak > Q.best) {
Q.best = Q.streak;
S.misc.qbest = Q.best;
persist.misc();
}
Q.wrong.delete(t.key);
} else {
Q.streak = 0;
Q.wrong.set(t.key, t);
srsRate(t, 0, true);
}
trackActivity("qz", ok);
const fb = $("#q-fb", Q.root);
fb.className = `feedback ${ok ? "ok" : "bad"}`;
fb.innerHTML = (ok ? "Correct! " : "Not quite. ") + `<span class="han">${esc(t.hanzi)}</span> · ${wordPinyinHTML(t.key, t.pinyin)} · ${esc(shortOpt(t))}${extra ? "<br><span class='small'>" + extra + "</span>" : ""}`;
$("#q-next", Q.root).hidden = false;
if (Q.mode === "reverse" || Q.mode === "type" || (Q.mode === "meaning" && ok)) speak(t.key);
$("#q-next", Q.root).focus();
const hdr = $(".row.between.mb .chip", Q.root);
if (hdr) hdr.textContent = `Score ${Q.score}/${Q.total} · ${Math.round((Q.score / Q.total) * 100)}%`;
const gold = $(".chip.gold", Q.root);
if (gold) gold.innerHTML = `${ico("flame")}Streak ${Q.streak} · best ${Q.best}`;
};
Q.pick = i => {
if (Q.answered || !Q.cur) return;
const o = Q.cur.opts[i];
const ok = o.key === Q.cur.target.key;
$$(".q-opt", Q.root).forEach((b, idx) => {
b.disabled = true;
if (Q.cur.opts[idx].key === Q.cur.target.key) b.classList.add("correct");
else if (idx === i) b.classList.add("wrong");
});
Q.settle(ok, Q.cur.target);
};
Q.typed = value => {
if (Q.answered || !Q.cur) return;
const t = Q.cur.target;
const a = analyzeWord(t.key, t.pinyin);
const norm = s => s.toLowerCase().replace(/[\s’'·-]/g, "").replace(/v/g, "ü");
const forms = new Set();
[a.orig, a.spoken].forEach(arr => {
[arr.join(""), arr.map(toNumbered).join(""), arr.map(s => stripTone(s) + toneOf(s)).join("")].forEach(f => forms.add(norm(f)));
});
const ans = norm(value);
const plainOk = norm(stripTone(a.orig.join(""))) === norm(stripTone(ans));
const ok = forms.has(ans);
$$("input,button", $("form", Q.root)).forEach(x => (x.disabled = true));
Q.settle(ok, t, !ok && plainOk ? "Right letters, but check the tones." : "");
};
Q.setAns = a => {
Q.ans = a;
store.set("hsk_hub_qans", a);
Q.next();
};
Q.setMode = m => {
Q.mode = m;
store.set("hsk_hub_qmode", m);
Q.next();
};
flashes[id + "_q"] = Q;
return Q;
}
const quizzes = {};
function quizOf(el) {
const host = el.closest("[data-q]");
return host ? quizzes[host.dataset.q] : activeQuiz();
}
function activeQuiz() {
if (S.route.name === "level" && S.tab === "quiz") return quizzes.level;
if (S.route.name === "saved") return quizzes.saved;
return null;
}
A["q-pick"] = el => quizOf(el).pick(Number(el.dataset.i));
A["q-next"] = el => quizOf(el).next();
A["q-ans"] = el => quizOf(el).setAns(el.dataset.a);
A["q-mode"] = el => quizOf(el).setMode(el.dataset.m);
A["q-mistakes"] = el => {
const Q = quizOf(el);
Q.onlyWrong = !Q.onlyWrong;
Q.next();
};
document.addEventListener("submit", e => {
const f = e.target.closest('[data-act="q-type"]');
if (!f) return;
e.preventDefault();
quizOf(f).typed($("#q-input", f).value);
});

function renderQuizTab() {
if (!quizzes.level) quizzes.level = createQuiz("level", $("#lp-quiz"), () => LV.filtered);
quizzes.level.root = $("#lp-quiz");
quizzes.level.next();
}

function renderGrammar() {
const box = $("#lp-grammar");
const q = $("#lvl-search").value.trim().toLowerCase();
const all = (LV.grammar || []).filter(g => !q || g.title.toLowerCase().includes(q) || g.struct.toLowerCase().includes(q) || g.usage.toLowerCase().includes(q) || g.examples.some(ex => ex.zh.includes(q) || ex.en.toLowerCase().includes(q)));
if (!all.length) {
box.innerHTML = `<div class="empty"><div class="em-ico">语</div>${(LV.grammar || []).length ? "No grammar points match." : "Grammar data for this level could not be loaded. Check your connection and use Retry."}</div>`;
return;
}
const shown = all.slice(0, LV.grammarShown);
box.innerHTML = `<div class="stack">${shown.map(g => `<div class="gcard"><div class="row between" style="align-items:flex-start"><b style="font-size:1.05rem">${esc(g.title)}</b><div class="row"><span class="ver">${esc(g.sourceTag)}</span>${g.link ? `<a class="btn sm" href="${esc(g.link)}" target="_blank" rel="noopener">Source ${ico("link")}</a>` : ""}</div></div>
${g.struct ? `<div class="formula han" data-act="speak" data-t="${esc(g.struct)}" title="Click to hear">${esc(g.struct)}</div>` : ""}
${g.usage ? `<div class="small muted">${esc(g.usage)}</div>` : ""}
${g.examples.map(ex => {
const b = sentenceBlockHTML(ex.zh);
return `<div class="example"><div class="row between" style="flex-wrap:nowrap"><span class="zh">${esc(ex.zh)}</span><button class="mini" data-act="speak" data-t="${esc(ex.zh)}" aria-label="Listen">${ico("volume")}</button></div><div class="small py">${b.html}</div><div class="small">${esc(ex.en)}</div></div>`;
}).join("")}</div>`).join("")}</div>
${all.length > shown.length ? `<div class="center mt"><button class="btn" data-act="more-grammar">Show more (${all.length - shown.length} left)</button></div>` : ""}`;
}
A["more-grammar"] = () => {
LV.grammarShown += 40;
renderGrammar();
};

function renderIdioms() {
const box = $("#lp-idioms");
const q = $("#lvl-search").value.trim().toLowerCase();
const plainQ = plainPinyin(q);
const all = (LV.phrases || []).filter(p => !q || p.hanzi.includes(q) || p.meaning.toLowerCase().includes(q) || (plainQ && plainPinyin(p.pinyin).includes(plainQ)));
if (!all.length) {
box.innerHTML = `<div class="empty"><div class="em-ico">成</div>${(LV.phrases || []).length ? "No idioms match." : "Idiom data could not be loaded. Check your connection."}</div>`;
return;
}
const shown = all.slice(0, LV.phraseShown);
box.innerHTML = `<p class="small muted mb">Four-character phrases and chengyu from the HSK 2.0, 3.0 and 3.1 lists (shared across all levels).</p><div class="wgrid">${shown.map(p => wordCardHTML({ key: p.hanzi, hanzi: p.hanzi, pinyin: p.pinyin, meaning: p.meaning, pos: "", versions: [], level: 0 })).join("")}</div>${all.length > shown.length ? `<div class="center mt"><button class="btn" data-act="more-idioms">Show more (${all.length - shown.length} left)</button></div>` : ""}`;
}
A["more-idioms"] = () => {
LV.phraseShown += 60;
renderIdioms();
};

function renderStrokesTab() {
const box = $("#lp-strokes");
if (!box.dataset.ready) {
box.dataset.ready = "1";
box.innerHTML = `<div class="card center"><h2 class="sec" style="justify-content:center">Stroke order trainer</h2><p class="muted small" style="max-width:560px;margin:0 auto 1rem">Watch the correct stroke order, then trace each character yourself. Stroke data from hanzi-writer-data.</p>
<form class="row" style="justify-content:center" data-act="stroke-load"><input class="input han" id="stroke-input" value="你好" maxlength="6" style="width:170px;text-align:center;font-size:1.3rem;font-weight:700" aria-label="Characters to practise"><button class="btn primary" type="submit">Load</button></form>
<div class="row mt-s" style="justify-content:center"><button class="btn" data-act="stroke-animate">${ico("play")}Animate</button><button class="btn" data-act="stroke-quiz">${ico("pen")}Trace quiz</button><button class="btn" data-act="stroke-reset">${ico("repeat")}Reset</button><button class="btn" data-act="stroke-speak">${ico("volume")}Pronounce</button></div>
<div class="stroke-stage" id="stroke-stage"></div><div class="feedback" id="stroke-fb"></div></div>`;
const first = currentVocab()[0];
if (first && S.misc.strokeText === undefined) $("#stroke-input").value = Array.from(first.key).slice(0, 4).join("");
else if (S.misc.strokeText) $("#stroke-input").value = S.misc.strokeText;
}
buildStrokes();
}
function buildStrokes() {
const chars = Array.from($("#stroke-input").value).filter(isZh).slice(0, 6);
$("#stroke-fb").textContent = chars.length ? "" : "Enter at least one Chinese character.";
S.misc.strokeText = chars.join("");
makeWriters($("#stroke-stage"), chars, window.innerWidth < 560 ? 130 : 170, { prefix: "sk" });
}
document.addEventListener("submit", e => {
if (e.target.closest('[data-act="stroke-load"]')) {
e.preventDefault();
buildStrokes();
}
});
A["stroke-animate"] = async () => {
$("#stroke-fb").textContent = "Animating…";
for (const w of STROKE.writers) await new Promise(r => w.animateCharacter({ onComplete: r }));
$("#stroke-fb").textContent = "Done. Tap a character to replay it.";
};
A["stroke-quiz"] = () => {
$("#stroke-fb").textContent = "Trace each stroke in order.";
STROKE.writers.forEach(w => w.quiz({ onComplete: r => {
$("#stroke-fb").textContent = `Finished “${r.character}” with ${r.totalMistakes} mistake${r.totalMistakes === 1 ? "" : "s"}.`;
trackActivity("qz", r.totalMistakes === 0);
} }));
};
A["stroke-reset"] = () => buildStrokes();
A["stroke-speak"] = () => speak($("#stroke-input").value);
