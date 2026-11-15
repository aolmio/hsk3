"use strict";
const LOOKALIKES = [
{ tip: "己 is open at the top, 已 is half open, 巳 is fully closed.", m: [["己", "jǐ", "self; oneself"], ["已", "yǐ", "already"], ["巳", "sì", "snake (zodiac)"]] },
{ tip: "The top stroke is longer in 未, shorter in 末.", m: [["未", "wèi", "not yet"], ["末", "mò", "end; tip"]] },
{ tip: "曰 is wider and flatter than 日.", m: [["日", "rì", "sun; day"], ["曰", "yuē", "to say (classical)"]] },
{ tip: "土 has the longer bottom stroke; 士 has the longer top stroke.", m: [["土", "tǔ", "earth; soil"], ["士", "shì", "scholar; soldier"]] },
{ tip: "Count the horizontal strokes and look at the hook.", m: [["干", "gān", "dry; to do"], ["千", "qiān", "thousand"], ["于", "yú", "at; in; to"]] },
{ tip: "太 is 大 plus a dot below; 犬 has the dot at the top right.", m: [["大", "dà", "big"], ["太", "tài", "too; extremely"], ["犬", "quǎn", "dog"]] },
{ tip: "人 spreads apart at the bottom, 入 points inward, 八 is two separate strokes.", m: [["人", "rén", "person"], ["入", "rù", "to enter"], ["八", "bā", "eight"]] },
{ tip: "卖 has an extra 十 on top, think of putting goods out to sell.", m: [["买", "mǎi", "to buy"], ["卖", "mài", "to sell"]] },
{ tip: "休 = person beside a tree (rest). 体 = person with 本 (body).", m: [["休", "xiū", "to rest"], ["体", "tǐ", "body"]] },
{ tip: "The door radical 门 encloses 日, 口 or 耳.", m: [["间", "jiān", "between; room"], ["问", "wèn", "to ask"], ["闻", "wén", "to hear; to smell"]] },
{ tip: "Same sound root 青, different radicals: speech, water, heart, sun.", m: [["请", "qǐng", "please; to invite"], ["清", "qīng", "clear"], ["情", "qíng", "feeling"], ["晴", "qíng", "sunny"]] },
{ tip: "在 is location (at); 再 is repetition (again). Both are zài.", m: [["在", "zài", "at; in; to be present"], ["再", "zài", "again"]] },
{ tip: "Radical shows the referent: person 亻, woman 女, other 宀.", m: [["他", "tā", "he; him"], ["她", "tā", "she; her"], ["它", "tā", "it"]] },
{ tip: "的 links nouns, 地 builds adverbs, 得 follows verbs to describe degree.", m: [["的", "de", "possessive / modifier"], ["地", "de", "adverbial marker"], ["得", "de", "complement marker"]] },
{ tip: "做 is to do or make something concrete; 作 is work, writing and fixed terms.", m: [["做", "zuò", "to do; to make"], ["作", "zuò", "to work; to write"]] },
{ tip: "住 has 亻 (person), 往 has 彳 (step).", m: [["住", "zhù", "to live; to stay"], ["往", "wǎng", "toward; to go"]] },
{ tip: "午 has a vertical stroke that passes through; 牛 has a short bottom bar.", m: [["午", "wǔ", "noon"], ["牛", "niú", "ox; cow"]] },
{ tip: "刀 bends and hooks; 力 has a left falling stroke.", m: [["刀", "dāo", "knife"], ["力", "lì", "strength"]] },
{ tip: "自 is 白 with a stroke on top; 目 has two inner bars.", m: [["目", "mù", "eye"], ["自", "zì", "self"], ["白", "bái", "white"]] },
{ tip: "今 has 一 under the roof; 令 has a dot.", m: [["今", "jīn", "today; now"], ["令", "lìng", "command"], ["含", "hán", "to contain"]] },
{ tip: "找 has a hand 扌, 我 has a different right part.", m: [["找", "zhǎo", "to look for"], ["我", "wǒ", "I; me"]] },
{ tip: "候 has a short vertical stroke in the middle; 侯 does not.", m: [["候", "hòu", "to wait; season"], ["侯", "hóu", "marquis"]] },
{ tip: "苦 has 古 below the grass radical; 若 has 右.", m: [["苦", "kǔ", "bitter"], ["若", "ruò", "if; like"]] },
{ tip: "Same sound root 戈 with different bottoms.", m: [["戴", "dài", "to wear"], ["载", "zài", "to carry"], ["栽", "zāi", "to plant"]] },
{ tip: "辨 has 刂 between; 辩 has 讠 (speech); 辫 has 纟 (thread).", m: [["辨", "biàn", "to distinguish"], ["辩", "biàn", "to argue"], ["辫", "biàn", "braid"]] },
{ tip: "Both contain 更 or 吏 on the right; 便 is also biàn / pián.", m: [["使", "shǐ", "to use; to cause"], ["便", "biàn", "convenient"]] },
{ tip: "Water radical vs hand radical for the same sound.", m: [["河", "hé", "river"], ["何", "hé", "what; how"], ["荷", "hé", "lotus"]] },
{ tip: "Different radicals change meaning, not sound.", m: [["材", "cái", "material"], ["财", "cái", "wealth"], ["才", "cái", "only then; talent"]] }
];

const CF = { tab: "homo", q: "", drillKind: "mixed", score: 0, total: 0, streak: 0, cur: null, answered: false, index: null, indexSize: 0 };

VIEW_ENTER.confuse = () => {
if (!$("#cf-chips").children.length) {
$("#cf-chips").innerHTML = ["shi", "ji", "yi", "zhi", "xi", "qi", "mai", "zuo", "shi4", "shiyan"].map(w => `<button class="chip" data-act="cf-chip" data-q="${w}">${w}</button>`).join("");
}
cfTab(S.misc.cfTab || "homo");
};
function cfTab(t) {
CF.tab = t;
S.misc.cfTab = t;
$$("#cf-tabs button").forEach(b => b.classList.toggle("on", b.dataset.t === t));
$("#cf-homo").hidden = t !== "homo";
$("#cf-look").hidden = t !== "look";
$("#cf-drill").hidden = t !== "drill";
if (t === "homo") cfExplore();
else if (t === "look") cfLook();
else if (!CF.cur) cfNext();
else cfDrillRender();
}
A["cf-tab"] = el => cfTab(el.dataset.t);
A["cf-chip"] = el => {
$("#cf-q").value = el.dataset.q;
cfExplore();
};
A["cf-search"] = () => cfExplore();

const normSyl = s => stripTone(s).toLowerCase().replace(/v/g, "ü");
const hasMark = s => stripTone(s) !== s;

function cfParse(q) {
const text = q.trim();
if (!text) return null;
if (Array.from(text).some(isZh)) {
const word = Array.from(text).filter(isZh).slice(0, 4).join("");
const e = getEntry(word);
const syl = analyzeWord(word, e ? e.pinyin : "").orig;
if (!syl.length) return null;
return { plain: syl.map(normSyl), tones: syl.map(toneOf), label: syl.join(" "), from: word };
}
const low = text.toLowerCase().replace(/\s+/g, " ");
let parts = low.includes(" ") ? low.split(" ") : null;
if (!parts) {
const m = low.match(/^([a-zü:v]+)([1-5])$/);
if (m) parts = [low];
else {
const r = rawSyllables(low);
parts = r.length > 1 && r.join("") === low.replace(/[’'·-]/g, "") ? r : [low];
}
}
const plain = [];
const tones = [];
for (const p of parts) {
const m = p.match(/^([a-zü:v]+?)([1-5])?$/) || [];
let base = m[1] || p;
let tone = m[2] ? Number(m[2]) : 0;
if (!m[2] && hasMark(p)) {
tone = toneOf(p);
base = stripTone(p);
}
base = base.replace(/u:/g, "ü").replace(/v/g, "ü");
if (!/^[a-zü]+$/.test(base)) return null;
plain.push(base);
tones.push(tone === 5 && !m[2] && !hasMark(p) ? 0 : tone);
}
return { plain, tones, label: parts.join(" ") };
}

function cfBuildIndex() {
if (CF.index && CF.indexSize === S.dict.size) return CF.index;
const map = new Map();
for (const [k, d] of S.dict) {
if (!d.pinyin || !d.meaning) continue;
const n = Array.from(k).length;
if (n > 4 || !Array.from(k).every(isZh)) continue;
const syl = rawSyllables(d.pinyin);
if (syl.length !== n) continue;
const key = syl.map(normSyl).join(" ");
let arr = map.get(key);
if (!arr) {
arr = [];
map.set(key, arr);
}
arr.push({ key: k, pinyin: d.pinyin, syl, meaning: d.meaning, level: S.levelOf.get(k) || 9 });
}
CF.index = map;
CF.indexSize = S.dict.size;
return map;
}

function cfExplore() {
const out = $("#cf-out");
CF.q = $("#cf-q").value;
const parsed = cfParse(CF.q);
if (!parsed) {
out.innerHTML = `<div class="empty"><div class="em-ico">音</div><b>Pick a sound to explore</b><p class="small mt-s">Type pinyin without tones to see every tone, or add a tone number (shi4) to narrow it down. A Chinese word works too.</p></div>`;
return;
}
const list = cfBuildIndex().get(parsed.plain.join(" ")) || [];
const matched = list.filter(it => parsed.tones.every((t, i) => !t || toneOf(it.syl[i]) === t));
if (!matched.length) {
out.innerHTML = `<div class="empty"><div class="em-ico">音</div>No words found for “${esc(parsed.label)}”.${S.dictLoaded.size < 7 ? '<p class="small mt-s">The full dictionary is still loading or offline, so only the built-in words are searched.</p>' : ""}</div>`;
return;
}
const groups = new Map();
matched.forEach(it => {
const tk = it.syl.map(toneOf).join("");
if (!groups.has(tk)) groups.set(tk, []);
groups.get(tk).push(it);
});
const ordered = Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
out.innerHTML = `<p class="small muted mb">${matched.length} ${matched.length === 1 ? "word" : "words"} sounding like <b class="py">${esc(parsed.plain.join(" "))}</b>${parsed.from ? ` (from ${esc(parsed.from)})` : ""}. Tone groups are shown separately because the tone changes the meaning.</p>
<div class="grid g-auto" style="grid-template-columns:repeat(auto-fill,minmax(280px,1fr))">${ordered
.map(([tk, items]) => {
items.sort((a, b) => a.level - b.level || a.key.length - b.key.length);
const first = items[0];
const shown = items.slice(0, 40);
return `<div class="card"><div class="row between mb"><b class="py" style="font-size:1.15rem">${pinyinHTML(first.syl)}</b><div class="row"><span class="chip">${items.length}</span><button class="mini" data-act="speak" data-t="${esc(first.key)}" aria-label="Listen">${ico("volume")}</button><button class="mini" data-act="cf-practice" data-k="${esc(tk)}" aria-label="Practice this group" title="Practice this group">${ico("target")}</button></div></div><div class="stack-s">${shown
.map(it => `<button class="fam-row" data-act="open-word" data-key="${esc(it.key)}"><span><b class="han" style="font-size:1.15rem">${hanziHTML(it.key, it.key, it.pinyin)}</b></span><span class="small muted" style="text-align:right">${esc(shortMeaning(it.meaning, 2))}</span></button>`)
.join("")}${items.length > shown.length ? `<span class="tiny faint">+${items.length - shown.length} more</span>` : ""}</div></div>`;
})
.join("")}</div>`;
CF.lastGroups = groups;
}
A["cf-practice"] = el => {
const g = CF.lastGroups && CF.lastGroups.get(el.dataset.k);
if (!g || g.length < 2) {
toast("This group needs at least two words to practice");
return;
}
CF.custom = g.map(it => ({ hz: it.key, py: joinText(it.syl), en: shortMeaning(it.meaning, 2) }));
CF.drillKind = "custom";
cfTab("drill");
cfNext();
};

function cfLook() {
const q = $("#cf-look-q").value.trim().toLowerCase();
const list = LOOKALIKES.filter(g => !q || g.tip.toLowerCase().includes(q) || g.m.some(x => x[0].includes(q) || x[2].toLowerCase().includes(q) || plainPinyin(x[1]).includes(plainPinyin(q))));
$("#cf-look-count").textContent = `${list.length} of ${LOOKALIKES.length} groups`;
$("#cf-look-grid").innerHTML = list.length
? list.map(g => `<div class="card"><div class="row mb" style="gap:.6rem">${g.m.map(x => `<span class="rad-glyph" style="width:46px;height:46px;font-size:1.6rem">${esc(x[0])}</span>`).join("")}</div><div class="stack-s">${g.m.map(x => `<button class="fam-row" data-act="open-word" data-key="${esc(x[0])}"><span><b class="han" style="font-size:1.1rem">${esc(x[0])}</b> <span class="py">${pinyinStrHTML(x[1])}</span></span><span class="small muted">${esc(x[2])}</span></button>`).join("")}</div><p class="small mt-s"><b>Tip:</b> ${esc(g.tip)}</p></div>`).join("")
: '<div class="empty small">No groups match.</div>';
}

function cfHomoGroups() {
const idx = cfBuildIndex();
const out = [];
idx.forEach(items => {
const byTone = new Map();
items.filter(it => it.syl.length === 1).forEach(it => {
const k = toneOf(it.syl[0]);
if (!byTone.has(k)) byTone.set(k, []);
byTone.get(k).push(it);
});
byTone.forEach(arr => {
const uniq = [];
arr.forEach(it => {
if (!uniq.some(u => u.key === it.key)) uniq.push(it);
});
if (uniq.length >= 3) out.push(uniq.map(it => ({ hz: it.key, py: joinText(it.syl), en: shortMeaning(it.meaning, 2) })));
});
});
return out;
}

function cfNext() {
let group = null;
let kind = CF.drillKind;
if (kind === "custom" && CF.custom && CF.custom.length >= 2) group = CF.custom;
else {
if (kind === "custom") kind = "mixed";
if (kind === "mixed") kind = Math.random() < 0.5 ? "look" : "homo";
if (kind === "homo") {
const gs = cfHomoGroups();
if (gs.length) group = gs[Math.floor(Math.random() * gs.length)];
else kind = "look";
}
if (kind === "look") {
const g = LOOKALIKES[Math.floor(Math.random() * LOOKALIKES.length)];
group = g.m.map(x => ({ hz: x[0], py: x[1], en: x[2] }));
}
}
const target = group[Math.floor(Math.random() * group.length)];
let opts = shuffle(group.filter(x => x.hz !== target.hz)).slice(0, 3);
opts.push(target);
if (opts.length < 4) {
const extra = shuffle(LOOKALIKES.flatMap(g => g.m).filter(x => !opts.some(o => o.hz === x[0]) && x[2] !== target.en).map(x => ({ hz: x[0], py: x[1], en: x[2] })));
while (opts.length < 4 && extra.length) opts.push(extra.pop());
}
CF.cur = { target, opts: shuffle(opts), kind: CF.drillKind === "custom" ? "custom" : kind };
CF.answered = false;
cfDrillRender();
if (CF.tab === "drill") speak(target.hz);
}

function cfDrillRender() {
const c = CF.cur;
const box = $("#cf-drill");
if (!c) return;
const kinds = [["mixed", "Mixed"], ["look", "Look-alikes"], ["homo", "Same sound"]];
if (CF.drillKind === "custom") kinds.push(["custom", "Your group"]);
box.innerHTML = `<div class="quiz card" data-cf="1"><div class="row between mb"><span class="chip">Score ${CF.score}/${CF.total}</span><span class="chip gold">${ico("flame")}Streak ${CF.streak}</span></div>
<div class="center mb"><div class="seg" role="group" aria-label="Drill source">${kinds.map(([k, n]) => `<button data-act="cf-kind" data-k="${k}" class="${CF.drillKind === k ? "on" : ""}">${n}</button>`).join("")}</div></div>
<div class="q-prompt"><div style="font-size:1.5rem;font-weight:700;line-height:1.35">${esc(c.target.en)}</div><div class="py" style="font-size:1.15rem">${pinyinStrHTML(c.target.py)}</div><div class="row mt-s" style="justify-content:center"><button class="btn sm" data-act="speak" data-t="${esc(c.target.hz)}">${ico("volume")}Listen</button></div><div class="hint">Which character is it?</div></div>
<div class="q-opts">${c.opts.map((o, i) => `<button class="q-opt hz-opt" data-act="cf-pick" data-i="${i}"><span class="n">${i + 1}</span>${esc(o.hz)}</button>`).join("")}</div>
<div class="feedback" id="cf-fb" aria-live="polite"></div><div class="center"><button class="btn" data-act="cf-next" id="cf-next" hidden>Next ${ico("right")}</button></div></div>`;
}
A["cf-kind"] = el => {
CF.drillKind = el.dataset.k;
cfNext();
};
A["cf-next"] = () => cfNext();
A["cf-pick"] = el => {
const c = CF.cur;
if (!c || CF.answered) return;
CF.answered = true;
const i = Number(el.dataset.i);
const ok = c.opts[i].hz === c.target.hz;
CF.total++;
if (ok) {
CF.score++;
CF.streak++;
} else {
CF.streak = 0;
const w = { key: c.target.hz, hanzi: c.target.hz, pinyin: c.target.py, meaning: c.target.en, level: levelOfWord(c.target.hz).level };
srsRate(w, 0, true);
}
trackActivity("qz", ok);
$$("#cf-drill .q-opt").forEach((b, idx) => {
b.disabled = true;
if (c.opts[idx].hz === c.target.hz) b.classList.add("correct");
else if (idx === i) b.classList.add("wrong");
});
const fb = $("#cf-fb");
fb.className = `feedback ${ok ? "ok" : "bad"}`;
fb.innerHTML = (ok ? "Correct! " : "Not quite. It is ") + c.opts.map(o => `<span class="han">${esc(o.hz)}</span> ${pinyinStrHTML(o.py)} ${esc(o.en)}`).join(" · ");
if (!ok) fb.innerHTML += `<br><span class="small">Added to your review queue.</span>`;
$("#cf-next").hidden = false;
$("#cf-next").focus();
};

document.addEventListener("input", e => {
if (e.target.id === "cf-look-q") cfLook();
});
document.addEventListener("keydown", e => {
if (e.target.id === "cf-q" && e.key === "Enter") {
cfExplore();
return;
}
if (S.route.name !== "confuse" || CF.tab !== "drill" || e.ctrlKey || e.metaKey || e.altKey) return;
if (isTyping(e.target) || anyDialogOpen()) return;
const onBtn = e.target.tagName === "BUTTON" || e.target.tagName === "A";
if (/^[1-4]$/.test(e.key) && !CF.answered) {
const b = $$("#cf-drill .q-opt")[Number(e.key) - 1];
if (b) b.click();
} else if (e.key === "Enter" && CF.answered && !onBtn) cfNext();
});
document.addEventListener("dict-ready", () => {
if (S.route.name === "confuse" && CF.tab === "homo") cfExplore();
});
