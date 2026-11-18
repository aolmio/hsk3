"use strict";
const A = {};
const flashes = {};
const shortMeaning = (m, n = 2) => String(m || "").split(";").slice(0, n).map(s => s.trim()).filter(Boolean).join("; ");
const levelLabel = l => (l === 7 ? "HSK 7–9" : l ? `HSK ${l}` : "Unlisted");

function analyzeText(text) {
const chars = Array.from(text);
const a = analyzeSandhi(chars, baseSyllables(text));
let pos = 0;
const tokens = segment(text).map(sg => {
const len = Array.from(sg.text).length;
const t = { text: sg.text, zh: sg.zh, start: pos, len, spoken: a.spoken.slice(pos, pos + len), orig: a.orig.slice(pos, pos + len), rules: a.rule.slice(pos, pos + len).filter(Boolean) };
pos += len;
return t;
});
return { chars, tokens, notes: a.notes };
}
function tokensPinyinHTML(tokens) {
let out = "";
tokens.forEach((t, i) => {
if (t.text === "\n") {
out += "<br>";
return;
}
const punct = !t.zh && !/[A-Za-z0-9\s]/.test(t.text);
const h = t.zh ? pinyinHTML(t.spoken) : esc(t.text);
out += (i > 0 && !punct && !/^\s/.test(t.text) && out && !/<br>$/.test(out) ? " " : "") + h;
});
return out;
}
function sentenceBlockHTML(zh) {
const an = analyzeText(zh);
return { html: tokensPinyinHTML(an.tokens), notes: an.notes };
}
function highlightHTML(text, q) {
if (!q || !Array.from(q).some(isZh)) return esc(text);
return text.split(q).map(esc).join(`<span class="hl">${esc(q)}</span>`);
}

function deckItemFor(key) {
return S.deck.get(key) || null;
}
function toggleSave(key, ctx = {}) {
if (!key) return;
if (S.deck.has(key)) {
const old = S.deck.get(key);
S.deck.delete(key);
persist.deck();
toast(`Removed “${key.length > 12 ? key.slice(0, 12) + "…" : key}”`, { label: "Undo", run: () => {
S.deck.set(key, old);
persist.deck();
afterDeckChange();
} });
} else {
const e = getEntry(key) || {};
S.deck.set(key, {
hanzi: key,
pinyin: ctx.pinyin || e.pinyin || (Array.from(key).length < 12 ? joinText(analyzeWord(key).spoken) : ""),
meaning: ctx.meaning || e.meaning || "",
level: ctx.level || (e.level ? levelLabel(e.level) : "Saved"),
note: "",
added: Date.now()
});
persist.deck();
toast(`Saved “${key.length > 12 ? key.slice(0, 12) + "…" : key}”`);
}
afterDeckChange();
}
function afterDeckChange() {
refreshBadges();
$$(`[data-act="save"]`).forEach(b => b.classList.toggle("on", S.deck.has(b.dataset.key)));
if (S.route.name === "saved") renderSaved();
}

function refreshBadges() {
const due = dueKeys().length;
const bn = $("#bn-due");
if (bn) {
bn.hidden = due === 0;
bn.textContent = due > 99 ? "99+" : String(due);
}
renderNav();
}

function renderNav() {
const nav = $("#nav");
if (!nav) return;
const cur = S.route.name;
const due = dueKeys().length;
const counts = { review: due, saved: S.deck.size };
let html = "";
let lastGroup = null;
const item = it => {
const on = cur === it.id ? " on" : "";
const c = counts[it.id];
const badge = c ? `<span class="nav-count${it.id === "review" ? " alert" : ""}">${c > 999 ? "999+" : c}</span>` : "";
return `<a class="nav-item${on}" href="#/${it.id}" ${on ? 'aria-current="page"' : ""}>${ico(it.icon)}<span class="grow">${it.label}</span>${badge}</a>`;
};
NAV_ITEMS.filter(i => i.id === "home").forEach(i => (html += item(i)));
html += '<div class="nav-label">Learn</div>';
NAV_ITEMS.filter(i => i.group === "Learn").forEach(i => (html += item(i)));
for (let l = 1; l <= 7; l++) {
const learned = Object.values(S.srs).filter(r => r.l === l && r.reps >= 1).length;
const pct = Math.min(100, Math.round((learned / LEVELS[l].total) * 100));
const on = cur === "level" && S.level === l ? " on" : "";
html += `<a class="nav-item nav-level${on}" href="#/level/${l}/${on ? S.tab : "vocab"}"><span class="lv-top"><span class="lv-dot l-${l}">${l === 7 ? "9" : l}</span><span class="grow">${LEVELS[l].name}</span><span class="nav-count">${LEVELS[l].cefr}</span></span><span class="lv-bar"><i style="width:${pct}%"></i></span></a>`;
}
["Tools", "Library", "Guide"].forEach(g => {
html += `<div class="nav-label">${g}</div>`;
NAV_ITEMS.filter(i => i.group === g).forEach(i => (html += item(i)));
});
nav.innerHTML = html;
$$(".bn[data-nav]").forEach(b => b.classList.toggle("on", b.dataset.nav === cur));
}

const ROUTE_TITLES = { home: "Home", review: "Daily review", analyzer: "Text analyzer", radicals: "Radicals", measure: "Measure words", worksheet: "Worksheets", sentences: "Sentence search", confuse: "Confusables", saved: "Saved words", stats: "Progress", facts: "Facts & tips", settings: "Settings", level: "Level" };
const VIEW_ENTER = {};

function parseHash() {
const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean).map(decodeURIComponent);
return { name: parts[0] || "home", args: parts.slice(1) };
}
function go(path) {
if (location.hash === "#" + path) route();
else location.hash = path;
}
function route() {
let { name, args } = parseHash();
if (!ROUTE_TITLES[name]) name = "home";
const prev = S.route.name;
S.route = { name, args };
if ("speechSynthesis" in window) speechSynthesis.cancel();
$$(".view").forEach(v => (v.hidden = true));
const view = $(`#v-${name}`);
view.hidden = false;
view.style.animation = "none";
void view.offsetWidth;
view.style.animation = "";
let title = ROUTE_TITLES[name];
if (name === "level") {
const lvl = clamp(parseInt(args[0], 10) || 1, 1, 7);
const tab = ["vocab", "flash", "quiz", "grammar", "idioms", "strokes"].includes(args[1]) ? args[1] : "vocab";
title = `${LEVELS[lvl].name} · ${tab}`;
openLevel(lvl, tab);
S.misc.last = `#/level/${lvl}/${tab}`;
persist.misc();
} else if (VIEW_ENTER[name]) {
VIEW_ENTER[name]();
}
document.title = `${title} · HSK Hub`;
renderNav();
closeMenu();
if (prev !== name || name !== "level") window.scrollTo({ top: 0 });
const h1 = $(".title", view);
if (h1 && prev !== name) h1.focus({ preventScroll: true });
}

function closeMenu() {
$("#app").classList.remove("menu-open");
}
A["close-menu"] = closeMenu;
A["toggle-side"] = () => {
const app = $("#app");
if (window.innerWidth <= 960) app.classList.toggle("menu-open");
else app.classList.toggle("collapsed");
};
A["toggle-theme"] = () => {
const dark = document.documentElement.getAttribute("data-theme") === "dark";
S.settings.theme = dark ? "light" : "dark";
persist.settings();
applySettings();
};
A["open-more"] = () => {
$("#more-grid").innerHTML = NAV_ITEMS.map(i => `<a class="tool-card" href="#/${i.id}" data-act="close-more">${`<span class="ti">${ico(i.icon)}</span>`}<div><b>${i.label}</b></div></a>`).join("") +
[1, 2, 3, 4, 5, 6, 7].map(l => `<a class="tool-card" href="#/level/${l}/vocab" data-act="close-more"><span class="ti">${l === 7 ? "9" : l}</span><div><b>${LEVELS[l].name}</b><span>${LEVELS[l].cefr}</span></div></a>`).join("");
$("#dlg-more").showModal();
};
A["close-more"] = () => $("#dlg-more").close();
A["show-keys"] = () => $("#dlg-keys").showModal();
A.speak = el => speak(el.dataset.t, el.dataset.slow === "1");

function wordCardHTML(w, opts = {}) {
const saved = S.deck.has(w.key);
const st = srsStatus(w.key);
const a = analyzeWord(w.key, w.pinyin);
const badges = (w.versions || []).map(v => `<span class="ver">${v === "hsk20" ? "2.0" : v === "hsk30" ? "3.0" : "3.1"}</span>`).join("") + (w.pos ? `<span class="pos">${esc(w.pos)}</span>` : "") + (st === "due" ? '<span class="chip seal">Due</span>' : st === "mature" ? '<span class="chip jade">Mastered</span>' : "");
return `<div class="vcard ${st === "mature" ? "known" : ""}" tabindex="0" role="button" data-act="open-word" data-key="${esc(w.key)}" aria-label="${esc(w.key)} details">
<div><div class="hd"><span class="hanzi">${hanziHTML(w.hanzi, w.key, w.pinyin)}</span>
<span class="acts"><button class="mini ${saved ? "on" : ""}" data-act="save" data-key="${esc(w.key)}" aria-label="Save ${esc(w.key)}" title="Save">${ico("star")}</button><button class="mini" data-act="speak" data-t="${esc(w.key)}" aria-label="Listen" title="Listen">${ico("volume")}</button></span></div>
<div class="py py-hide">${a.spoken.length ? pinyinHTML(a.spoken) : pinyinStrHTML(w.pinyin)}</div>
${a.notes.length ? sandhiPill(a, false) : ""}
<div class="mean mn-hide" style="margin-top:.3rem">${w.meaning ? esc(w.meaning) : '<span class="faint">No definition in dataset – open for a translation</span>'}</div></div>
<div class="badges">${badges}</div></div>`;
}
A.save = el => toggleSave(el.dataset.key);

const STROKE = { writers: [] };
function makeWriters(container, chars, size, opts = {}) {
STROKE.writers = [];
container.innerHTML = "";
if (typeof HanziWriter === "undefined") {
container.innerHTML = '<p class="muted small">Stroke data library could not be loaded. Check your connection.</p>';
return [];
}
const dark = document.documentElement.getAttribute("data-theme") === "dark";
const list = [];
chars.forEach((ch, i) => {
const div = document.createElement("div");
div.className = "hz-box";
div.id = `${opts.prefix || "sw"}-${i}`;
div.style.width = div.style.height = size + "px";
container.append(div);
try {
const w = HanziWriter.create(div.id, ch, { charDataLoader: (c, ok, bad) => { fetchRemote(STROKE_URL(c)).then(d => (d ? ok(d) : bad()), () => bad()); }, width: size, height: size, padding: 8, showOutline: true, strokeAnimationSpeed: 1.2, delayBetweenStrokes: 150, strokeColor: dark ? "#f2ece0" : "#a82f23", radicalColor: dark ? "#e8584a" : "#c43d2f", outlineColor: dark ? "#3d3529" : "#d8cfba", drawingColor: dark ? "#f2ece0" : "#1e1a15" });
list.push(w);
div.addEventListener("click", () => w.animateCharacter());
} catch (e) {}
});
STROKE.writers = list;
return list;
}

function openWord(key) {
const entry = getEntry(key) || { key, hanzi: key, pinyin: "", meaning: "", pos: "", level: 0 };
const lv = levelOfWord(key);
const a = analyzeWord(key, entry.pinyin);
const chars = Array.from(key).filter(isZh);
const saved = S.deck.has(key);
const st = srsStatus(key);
const vers = S.versions.get(key);
const meanings = entry.meaning ? entry.meaning.split(";").map(s => s.trim()).filter(Boolean) : [];
const charRows = chars.length > 1 ? chars.map((c, i) => {
const ce = getEntry(c) || {};
const sy = a.spoken[i] || (ce.pinyin ? rawSyllables(ce.pinyin)[0] : "");
const rad = RADICALS_DB.find(r => r.examples.includes(c));
return `<button class="char-row" data-act="open-word" data-key="${esc(c)}"><span class="hz tone-${toneOf(sy)}">${esc(c)}</span><span class="grow"><b class="py">${sy ? sylHTML(sy) : ""}</b> <span class="small muted">${esc(shortMeaning(ce.meaning, 3) || "—")}</span>${rad ? `<div class="tiny faint">Radical ${esc(rad.rad)} · ${esc(rad.meaning.split(",")[0])}</div>` : ""}</span>${ce.level ? levelTagHTML(ce.level) : ""}</button>`;
}).join("") : "";
const related = [];
if (chars.length) {
const first = chars[0];
for (const [k, d] of S.dict) {
if (k !== key && k.includes(first) && Array.from(k).length <= 4 && d.meaning) related.push(k);
if (related.length > 80) break;
}
related.sort((x, y) => (S.levelOf.get(x) || 9) - (S.levelOf.get(y) || 9));
}
const body = $("#word-body");
body.innerHTML = `
<div class="d-top"><span class="chip">${levelTagHTML(lv.level)}${lv.inferred ? "<span class='tiny'>est.</span>" : ""}</span><button class="btn ghost icon" data-act="close-word" aria-label="Close">${ico("x")}</button></div>
<div class="d-hanzi">${hanziHTML(key, key, entry.pinyin)}</div>
<div style="font-size:1.4rem;margin:.2rem 0" class="py">${a.spoken.length ? pinyinHTML(a.spoken) : pinyinStrHTML(entry.pinyin)}</div>
${a.notes.length ? `<div class="mt-s">${sandhiPill(a, true)}</div><p class="tiny faint mt-s">${esc(a.notes[0].detail)}</p>` : ""}
<div class="row mt">
<button class="btn" data-act="speak" data-t="${esc(key)}">${ico("volume")}Listen</button>
<button class="btn" data-act="speak" data-t="${esc(key)}" data-slow="1">${ico("volume")}Slow</button>
<button class="btn ${saved ? "on" : ""}" data-act="save" data-key="${esc(key)}">${ico("star")}${saved ? "Saved" : "Save"}</button>
<button class="btn" data-act="learn" data-key="${esc(key)}">${ico("cards")}${st === "new" ? "Add to review" : "In review"}</button>
</div>
<div class="d-sec"><h3 class="sub">Meaning</h3>
${meanings.length ? `<ol style="padding-left:1.2rem;display:flex;flex-direction:column;gap:.2rem">${meanings.map(m => `<li>${esc(m)}</li>`).join("")}</ol>` : `<p class="muted small" id="gloss-slot">No definition in the offline dictionary. <button class="btn sm" data-act="gloss" data-key="${esc(key)}">${ico("globe")}Translate</button></p>`}
<div class="row mt-s">${entry.pos ? `<span class="pos">${esc(entry.pos)}</span>` : ""}${vers ? Array.from(vers).map(v => `<span class="ver">${v === "hsk20" ? "HSK 2.0" : v === "hsk30" ? "HSK 3.0" : "HSK 3.1"}</span>`).join("") : ""}${st !== "new" ? `<span class="chip ${st === "due" ? "seal" : "jade"}">${st}</span>` : ""}</div></div>
${charRows ? `<div class="d-sec"><h3 class="sub">Characters</h3>${charRows}</div>` : ""}
${chars.length ? `<div class="d-sec" id="d-struct">${structInnerHTML(chars.slice(0, 6))}</div>` : ""}
${chars.length ? `<div class="d-sec"><h3 class="sub">Stroke order <span class="faint" style="text-transform:none;letter-spacing:0">· tap to animate</span></h3><div class="stroke-stage" id="d-strokes" style="justify-content:flex-start;margin:.3rem 0"></div></div>` : ""}
<div class="d-sec"><h3 class="sub">Example sentences</h3><div id="d-examples"></div></div>
${related.length ? `<div class="d-sec"><h3 class="sub">Related words</h3><div class="row">${related.slice(0, 14).map(k => `<button class="chip" data-act="open-word" data-key="${esc(k)}"><span class="han">${esc(k)}</span></button>`).join("")}</div></div>` : ""}
<div class="row mt" style="margin-top:1.6rem"><a class="btn sm" href="#/analyzer" data-act="analyze-word" data-key="${esc(key)}">${ico("type")}Analyze</a><button class="btn sm" data-act="copy" data-t="${esc(key)}">${ico("copy")}Copy</button></div>`;
const dlg = $("#dlg-word");
if (!dlg.open) dlg.showModal();
body.parentElement.scrollTop = 0;
fillExamples(key);
ensureCorpus();
if (chars.length) makeWriters($("#d-strokes"), chars.slice(0, 5), 88, { prefix: "dw" });
S.drawerKey = key;
}
function fillExamples(key) {
const box = $("#d-examples");
if (!box) return;
const list = searchCorpus(key).slice(0, 4);
if (!list.length) {
box.innerHTML = `<p class="small muted">${S.corpusState === "loading" ? "Loading example sentences…" : "No example sentences found yet."}</p>`;
return;
}
box.innerHTML = list.map(it => {
const b = sentenceBlockHTML(it.zh);
return `<div class="example"><div class="row between" style="flex-wrap:nowrap;align-items:flex-start"><div class="zh">${highlightHTML(it.zh, key)}</div><button class="mini" data-act="speak" data-t="${esc(it.zh)}" aria-label="Listen">${ico("volume")}</button></div><div class="small py">${b.html}</div><div class="small muted">${esc(it.en)}</div></div>`;
}).join("");
}
document.addEventListener("corpus-ready", () => {
if ($("#dlg-word").open && S.drawerKey) fillExamples(S.drawerKey);
});
A["open-word"] = el => openWord(el.dataset.key);
A["close-word"] = () => $("#dlg-word").close();
A.copy = el => copyText(el.dataset.t, "Copied");
A.learn = el => {
const key = el.dataset.key;
if (S.srs[key]) {
toast("Already in your review queue");
return;
}
const w = wordFromKey(key);
S.srs[key] = { k: key, h: w.hanzi, p: w.pinyin, m: w.meaning, l: w.level, iv: 0, ease: 2.5, reps: 0, lapses: 0, due: Date.now(), last: 0 };
persist.srs();
refreshBadges();
toast(`Added “${key}” to review`);
openWord(key);
};
A.gloss = async el => {
const key = el.dataset.key;
el.disabled = true;
el.textContent = "Translating…";
const t = await translateText(key);
const slot = $("#gloss-slot");
if (slot) slot.innerHTML = t ? esc(t) + ' <span class="tiny faint">· Google Translate</span>' : "Translation is unavailable right now. Try again in a moment.";
};
A["analyze-word"] = el => {
$("#an-input").value = el.dataset.key;
$("#dlg-word").close();
};

const PAL = { items: [], sel: 0 };
function paletteItems(q) {
const items = [];
const query = q.trim();
const low = query.toLowerCase();
const navMatches = NAV_ITEMS.filter(i => !low || i.label.toLowerCase().includes(low));
navMatches.forEach(i => items.push({ group: "Go to", icon: i.icon, label: i.label, run: () => go(`/${i.id}`) }));
for (let l = 1; l <= 7; l++) {
if (!low || LEVELS[l].name.toLowerCase().includes(low) || `hsk ${l}`.includes(low) || LEVELS[l].cefr.toLowerCase() === low) items.push({ group: "Go to", icon: "book", label: `${LEVELS[l].name} · ${LEVELS[l].band}`, run: () => go(`/level/${l}/vocab`) });
}
if (query) {
const hasZh = Array.from(query).some(isZh);
const plain = plainPinyin(query);
const found = [];
for (const [k, d] of S.dict) {
if (hasZh ? k.includes(query) : (plain && d.pn && d.pn.startsWith(plain)) || (low.length > 2 && d.meaning && d.meaning.toLowerCase().includes(low))) {
found.push(k);
if (found.length > 400) break;
}
}
found.sort((a, b) => Array.from(a).length - Array.from(b).length || (S.levelOf.get(a) || 9) - (S.levelOf.get(b) || 9));
found.slice(0, 8).forEach(k => {
const d = S.dict.get(k);
items.push({ group: "Words", hz: k, label: shortMeaning(d.meaning, 2) || "—", sub: d.pinyin, run: () => openWord(k) });
});
items.push({ group: "Actions", icon: "chat", label: `Find sentences for “${query}”`, run: () => {
$("#sen-q").value = query;
go("/sentences");
setTimeout(() => A["sen-search"](), 30);
} });
if (hasZh) items.push({ group: "Actions", icon: "type", label: `Analyze “${query}”`, run: () => {
$("#an-input").value = query;
go("/analyzer");
} });
}
return items;
}
function renderPalette() {
const items = paletteItems($("#pal-input").value);
PAL.items = items;
PAL.sel = clamp(PAL.sel, 0, Math.max(0, items.length - 1));
let html = "";
let last = "";
items.forEach((it, i) => {
if (it.group !== last) {
html += `<div class="pal-group">${it.group}</div>`;
last = it.group;
}
html += `<button class="pal-item ${i === PAL.sel ? "sel" : ""}" data-act="pal-run" data-i="${i}" role="option">${it.hz ? `<span class="hz han">${esc(it.hz)}</span>` : ico(it.icon)}<span class="grow">${esc(it.label)}</span>${it.sub ? `<span class="faint small py">${pinyinStrHTML(it.sub)}</span>` : ""}</button>`;
});
$("#pal-list").innerHTML = html || '<div class="empty small">Nothing found</div>';
const sel = $(".pal-item.sel");
if (sel) sel.scrollIntoView({ block: "nearest" });
}
A["open-palette"] = () => {
const dlg = $("#dlg-palette");
if (!dlg.open) dlg.showModal();
$("#pal-input").value = "";
PAL.sel = 0;
renderPalette();
$("#pal-input").focus();
};
A["pal-run"] = el => {
const it = PAL.items[Number(el.dataset.i)];
$("#dlg-palette").close();
if (it) it.run();
};

function wotd() {
const pool = [];
S.levelOf.forEach((l, k) => {
if (l <= 4 && Array.from(k).length >= 2) {
const d = S.dict.get(k);
if (d && d.meaning) pool.push(k);
}
});
if (!pool.length) return null;
pool.sort();
const n = Math.floor(Date.now() / DAY);
return pool[n % pool.length];
}

VIEW_ENTER.home = () => renderHome();
function renderHome() {
const due = dueKeys().length;
const goal = S.settings.dailyGoal;
const done = todayCount();
const streak = calcStreak();
const hour = new Date().getHours();
const greet = hour < 5 ? "夜深了" : hour < 12 ? "早上好" : hour < 18 ? "下午好" : "晚上好";
const pct = Math.min(1, done / goal);
const circ = 2 * Math.PI * 36;
const last = S.misc.last;
const wk = wotd();
const we = wk ? getEntry(wk) : null;
const lastLabel = last ? (last.match(/level\/(\d)\/(\w+)/) ? `${LEVELS[last.match(/level\/(\d)/)[1]].name} · ${last.match(/level\/\d\/(\w+)/)[1]}` : "") : "";
$("#home-root").innerHTML = `
<div class="hero">
<div class="han" style="font-size:1.1rem;opacity:.85;margin-bottom:.3rem">${greet}！</div>
<h1>${due ? `${due} ${due === 1 ? "word is" : "words are"} ready for review` : done >= goal ? "Daily goal complete. Nice work." : "Ready to learn some Chinese?"}</h1>
<p>${S.srs && Object.keys(S.srs).length ? "Short, regular sessions beat long cramming. Start with your review, then pick up where you left off." : "Pick an HSK level, star the words you want to remember, and your review schedule builds itself."}</p>
<div class="row mt">
${due ? `<a class="btn primary lg" href="#/review">${ico("cards")}Start review</a>` : `<a class="btn primary lg" href="#/level/1/vocab">${ico("book")}Browse HSK 1</a>`}
${last ? `<a class="btn lg" href="${esc(last)}">${ico("play")}Continue · ${esc(lastLabel)}</a>` : ""}
<a class="btn lg" href="#/analyzer">${ico("type")}Analyze a text</a>
</div></div>
<div class="grid g-4 keep mb">
<div class="card stat"><span class="k">${ico("flame")}Streak</span><span class="v">${streak}</span><span class="s">${streak === 1 ? "day" : "days"} · best ${S.stats.best || 0}</span></div>
<div class="card stat" style="flex-direction:row;align-items:center;gap:.9rem"><div class="ring"><svg viewBox="0 0 84 84"><circle class="bg" cx="42" cy="42" r="36"/><circle class="fg" cx="42" cy="42" r="36" stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${(circ * (1 - pct)).toFixed(1)}"/></svg><div class="lab"><div>${done}<small>/ ${goal}</small></div></div></div><div><span class="k">Today</span><span class="s">${done >= goal ? "Goal reached" : `${goal - done} to go`}</span></div></div>
<div class="card stat"><span class="k">${ico("cards")}Due now</span><span class="v">${due}</span><span class="s">${Object.keys(S.srs).length} in review</span></div>
<div class="card stat"><span class="k">${ico("star")}Saved</span><span class="v">${S.deck.size}</span><span class="s"><a href="#/saved">Open library</a></span></div>
</div>
${we ? `<div class="card mb"><div class="wotd"><div><span class="eyebrow">Word of the day</span><div class="big">${hanziHTML(wk, wk, we.pinyin)}</div></div><div class="grow"><div style="font-size:1.2rem" class="py">${wordPinyinHTML(wk, we.pinyin)}</div><div class="muted">${esc(shortMeaning(we.meaning, 3))}</div><div class="row mt-s">${levelTagHTML(we.level)}</div></div><div class="row"><button class="btn" data-act="speak" data-t="${esc(wk)}">${ico("volume")}Listen</button><button class="btn" data-act="open-word" data-key="${esc(wk)}">Details</button><button class="btn ${S.deck.has(wk) ? "on" : ""}" data-act="save" data-key="${esc(wk)}">${ico("star")}Save</button></div></div></div>` : ""}
<h2 class="sec">Levels</h2>
<div class="grid g-auto mb" style="grid-template-columns:repeat(auto-fill,minmax(210px,1fr))">
${[1, 2, 3, 4, 5, 6, 7].map(l => {
const learned = Object.values(S.srs).filter(r => r.l === l && r.reps >= 1).length;
const p = Math.min(100, Math.round((learned / LEVELS[l].total) * 100));
return `<a class="level-card" href="#/level/${l}/vocab"><div class="row between"><span class="nm">${LEVELS[l].name}</span><span class="lv-dot l-${l}" style="width:auto;padding:0 .45rem">${LEVELS[l].cefr}</span></div><span class="small muted">${LEVELS[l].band} · ~${LEVELS[l].total.toLocaleString()} words</span><div class="prog"><i style="width:${p}%"></i></div><span class="tiny faint">${learned} learned</span></a>`;
}).join("")}
</div>
<h2 class="sec">Tools</h2>
<div class="grid g-auto mb">
<a class="tool-card" href="#/analyzer"><span class="ti">${ico("type")}</span><div><b>Text analyzer</b><span>Pinyin with tone sandhi, translation and HSK difficulty for any passage.</span></div></a>
<a class="tool-card" href="#/radicals"><span class="ti">${ico("blocks")}</span><div><b>Radicals</b><span>43 radicals and phonetic families that explain how characters are built.</span></div></a>
<a class="tool-card" href="#/measure"><span class="ti">${ico("scale")}</span><div><b>Measure words</b><span>Quiz and reference for 40 classifiers.</span></div></a>
<a class="tool-card" href="#/worksheet"><span class="ti">${ico("print")}</span><div><b>Worksheets</b><span>Printable grid sheets from your own words.</span></div></a>
<a class="tool-card" href="#/sentences"><span class="ti">${ico("chat")}</span><div><b>Sentence search</b><span>Real example sentences for any word.</span></div></a>
<a class="tool-card" href="#/stats"><span class="ti">${ico("chart")}</span><div><b>Progress</b><span>Streaks, accuracy and mastery by level.</span></div></a>
</div>
<details class="fold"><summary>HSK 2.0 vs 3.0 / 3.1 at a glance</summary><div class="in"><div class="tbl-wrap"><table><thead><tr><th>Level</th><th>HSK 2.0 words (cumulative)</th><th>HSK 3.0 words (cumulative)</th><th>HSK 3.0 characters</th><th>Milestone</th></tr></thead><tbody>${SPEC_ROWS.map(r => `<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td></tr>`).join("")}</tbody></table></div></div></details>`;
}
