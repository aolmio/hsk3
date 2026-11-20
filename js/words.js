"use strict";
WORD_CATS.forEach(c => {
c.groups = [];
let g = null;
c.raw.trim().split("\n").forEach(line => {
if (line[0] === "#") {
g = { h: line.slice(1), items: [] };
c.groups.push(g);
return;
}
const p = line.split("|");
g.items.push({ hz: p[0], py: p[1], en: p[2], lv: p[3], ex: p[4], exen: p[5] });
});
c.count = c.groups.reduce((n, x) => n + x.items.length, 0);
delete c.raw;
});

const WD = { q: "" };
const wordCat = id => WORD_CATS.find(c => c.id === id) || null;
const wordsTitle = id => (wordCat(id) ? wordCat(id).title : "Function words");

function wdRuby(text) {
const an = analyzeText(text);
return an.tokens.map(t => {
if (t.text === "\n") return "<br>";
if (!t.zh) return esc(t.text);
return `<ruby class="rw" data-act="open-word" data-key="${esc(t.text)}">${esc(t.text)}<rt>${pinyinHTML(t.spoken)}</rt></ruby>`;
}).join("");
}

function wdCard(it, cat, showCat) {
const open = !/…/.test(it.hz);
const hz = open ? `<button class="wd-hz" data-act="open-word" data-key="${esc(it.hz)}">${esc(it.hz)}</button>` : `<span class="wd-hz">${esc(it.hz)}</span>`;
const speakKey = it.hz.replace(/…/g, "，");
const lv = it.lv ? `<span class="chip">HSK ${esc(it.lv)}</span>` : "";
const cc = showCat ? `<a class="chip cat" href="#/words/${cat.id}">${esc(cat.short)}</a>` : "";
const ex = it.ex ? `<div class="wd-ex"><div class="ruby-view wd-exz">${wdRuby(it.ex)}</div><div class="wd-exe"><span>${esc(it.exen)}</span><button class="mini" data-act="speak" data-t="${esc(it.ex)}" aria-label="Listen to example" title="Listen">${ico("volume")}</button></div></div>` : "";
return `<article class="wd card">
<div class="wd-top">${hz}<div class="grow"><div class="py">${pinyinStrHTML(it.py)}</div><div class="wd-en mn-hide">${esc(it.en)}</div></div><button class="mini" data-act="speak" data-t="${esc(speakKey)}" aria-label="Listen" title="Listen">${ico("volume")}</button></div>
<div class="row wd-meta">${lv}${cc}</div>
${ex}
</article>`;
}

function wdMatch(it, q) {
if (!q) return true;
const low = q.toLowerCase();
return it.hz.includes(q) || plainPinyin(it.py).includes(plainPinyin(q) || "\u0000") || it.en.toLowerCase().includes(low) || (it.exen || "").toLowerCase().includes(low);
}

function wdList() {
const box = $("#wd-list");
if (!box) return;
const cat = wordCat(S.route.args[0]);
const q = WD.q.trim();
let html = "";
if (cat) {
cat.groups.forEach(g => {
const items = g.items.filter(it => wdMatch(it, q));
if (!items.length) return;
html += `<section class="mb"><h2 class="sec">${esc(g.h)}<span class="chip">${items.length}</span></h2><div class="grid g-wide">${items.map(it => wdCard(it, cat, false)).join("")}</div></section>`;
});
} else if (q) {
const found = [];
WORD_CATS.forEach(c => c.groups.forEach(g => g.items.forEach(it => { if (wdMatch(it, q)) found.push([it, c]); })));
html = found.length ? `<div class="grid g-wide">${found.slice(0, 80).map(([it, c]) => wdCard(it, c, true)).join("")}</div>${found.length > 80 ? `<p class="hint mt">Showing 80 of ${found.length} matches. Refine your search.</p>` : ""}` : "";
}
box.innerHTML = html || (q ? '<div class="empty small">No words match.</div>' : "");
}

function renderWords(id) {
const root = $("#wd-root");
const cat = wordCat(id);
const strip = `<nav class="wd-strip" aria-label="Function word categories"><a class="chip${cat ? "" : " on"}" href="#/words">All</a>${WORD_CATS.map(c => `<a class="chip${cat && cat.id === c.id ? " on" : ""}" href="#/words/${c.id}">${esc(c.short)}</a>`).join("")}</nav>`;
const search = `<div class="search-box mb"><input class="input" id="wd-q" type="search" placeholder="${cat ? "Filter this page…" : "Search all function words by Chinese, pinyin or meaning…"}" autocomplete="off" spellcheck="false" aria-label="Search words"></div>`;
let head;
let tail = "";
if (cat) {
const i = WORD_CATS.indexOf(cat);
const prev = WORD_CATS[i - 1];
const next = WORD_CATS[i + 1];
head = `<div class="page-head"><div><span class="eyebrow">${esc(cat.zh)} · ${cat.count} words</span><h1 class="title" tabindex="-1">${esc(cat.title)}</h1><p class="lede">${esc(cat.desc)}</p></div></div>
${strip}
<div class="card mb"><h3 class="sub">How they work</h3><ul class="facts">${cat.tips.map(t => `<li>${esc(t)}</li>`).join("")}</ul></div>
${search}`;
tail = `<div class="row between mt wd-pager">${prev ? `<a class="btn" href="#/words/${prev.id}">${ico("left")}${esc(prev.short)}</a>` : "<span></span>"}${next ? `<a class="btn" href="#/words/${next.id}">${esc(next.short)}${ico("right")}</a>` : "<span></span>"}</div><p class="hint mt">HSK labels are approximate: the 2.0, 3.0 and 3.1 syllabi group some words differently. Tap a word for full details.</p>`;
} else {
const total = WORD_CATS.reduce((n, c) => n + c.count, 0);
head = `<div class="page-head"><div><span class="eyebrow">虚词 · 功能词 · ${total} words</span><h1 class="title" tabindex="-1">Function words</h1><p class="lede">The small words that hold Chinese sentences together. Each category has its own page with usage tips, pinyin and example sentences. For classifiers see <a href="#/measure">Measure words</a>.</p></div></div>
${search}
<div id="wd-hub" class="grid g-auto mb">${WORD_CATS.map(c => `<a class="tool-card" href="#/words/${c.id}"><span class="ti">${ico(c.icon)}</span><div><b>${esc(c.title)} · ${esc(c.zh)}</b><span>${c.count} words · ${c.groups.map(g => g.h).slice(0, 3).join(", ")}</span></div></a>`).join("")}</div>`;
}
root.innerHTML = `${head}<div id="wd-list"></div>${tail}`;
const inp = $("#wd-q");
inp.addEventListener("input", () => {
WD.q = inp.value;
const hub = $("#wd-hub");
if (hub) hub.hidden = !!WD.q.trim();
wdList();
});
wdList();
}

VIEW_ENTER.words = () => {
WD.q = "";
renderWords(S.route.args[0]);
};

A["nav-fold"] = el => {
S.misc.navFold = S.misc.navFold || {};
const key = el.dataset.f;
const cur = key in S.misc.navFold ? S.misc.navFold[key] : key === "hsk";
S.misc.navFold[key] = !cur;
persist.misc();
renderNav();
};
