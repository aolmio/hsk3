"use strict";
const DECOMP = { map: new Map(), full: false, loading: null };
const DECOMP_URLS = [
"https://raw.githubusercontent.com/skishore/makemeahanzi/master/dictionary.txt",
"https://cdn.jsdelivr.net/gh/skishore/makemeahanzi@master/dictionary.txt"
];
const IDS_ARITY = { "⿰": 2, "⿱": 2, "⿲": 3, "⿳": 3, "⿴": 2, "⿵": 2, "⿶": 2, "⿷": 2, "⿸": 2, "⿹": 2, "⿺": 2, "⿻": 2 };
const COMP_VARIANT = { "⻊": "足", "⺼": "月", "⻌": "辶", "⻍": "辶", "⺾": "艹", "⺮": "竹", "⻗": "雨", "⺌": "小", "⻖": "阝", "⻏": "阝", "⺖": "忄", "⺡": "氵", "⺘": "扌", "⺳": "罒", "⺪": "止", "⺨": "犬", "⺭": "礻", "⻂": "衤", "⻆": "角", "⺀": "冫" };
const COMP_NAMES = {
"亻": ["rén", "person"], "忄": ["xīn", "heart"], "饣": ["shí", "food"], "钅": ["jīn", "metal"], "辶": ["chuò", "walk"], "阝": ["fù", "mound / city"],
"宀": ["mián", "roof"], "丷": ["bā", "two dots"], "冖": ["mì", "cover"], "夂": ["zhǐ", "go slowly"], "止": ["zhǐ", "stop"], "口": ["kǒu", "mouth"],
"足": ["zú", "foot"], "艹": ["cǎo", "grass"], "氵": ["shuǐ", "water"], "扌": ["shǒu", "hand"], "讠": ["yán", "speech"], "彳": ["chì", "step"],
"广": ["guǎng", "building"], "尸": ["shī", "body"], "疒": ["nè", "sickness"], "礻": ["shì", "spirit"], "衤": ["yī", "clothing"], "犭": ["quǎn", "animal"],
"冫": ["bīng", "ice"], "囗": ["wéi", "enclosure"], "门": ["mén", "door"], "刂": ["dāo", "knife"], "灬": ["huǒ", "fire"], "罒": ["wǎng", "net"],
"爫": ["zhǎo", "claw"], "一": ["yī", "one; horizontal stroke"], "十": ["shí", "ten; cross"], "干": ["gān", "dry; shield"], "女": ["nǚ", "woman"],
"日": ["rì", "sun"], "月": ["yuè", "moon; flesh"], "木": ["mù", "tree"], "火": ["huǒ", "fire"], "土": ["tǔ", "earth"], "心": ["xīn", "heart"], "人": ["rén", "person"],
"大": ["dà", "big"], "小": ["xiǎo", "small"], "子": ["zǐ", "child"], "手": ["shǒu", "hand"], "目": ["mù", "eye"], "竹": ["zhú", "bamboo"], "寸": ["cùn", "inch"], "力": ["lì", "strength"]
};
const SEED_DECOMP = `路|⿰⻊各
各|⿱夂口
足|⿱口止
平|⿻干丷
干|⿻一十
安|⿱宀女
大|⿱一人
明|⿰日月
林|⿰木木
森|⿱木⿰木木
休|⿰亻木
体|⿰亻本
本|⿻木一
们|⿰亻门
他|⿰亻也
她|⿰女也
好|⿰女子
你|⿰亻尔
妈|⿰女马
吗|⿰口马
吃|⿰口乞
喝|⿰口曷
叫|⿰口丩
听|⿰口斤
吧|⿰口巴
呢|⿰口尼
哪|⿰口那
河|⿰氵可
海|⿰氵每
清|⿰氵青
情|⿰忄青
晴|⿰日青
睛|⿰目青
青|⿱主月
请|⿰讠青
说|⿰讠兑
话|⿰讠舌
读|⿰讠卖
语|⿰讠吾
吾|⿱五口
认|⿰讠人
识|⿰讠只
谢|⿰讠射
射|⿰身寸
打|⿰扌丁
找|⿰扌戈
把|⿰扌巴
拿|⿱合手
时|⿰日寸
间|⿵门日
问|⿵门口
闻|⿵门耳
看|⿱手目
家|⿱宀豕
字|⿱宀子
室|⿱宀至
笔|⿱竹毛
笑|⿱竹夭
男|⿱田力
您|⿱你心
想|⿱相心
相|⿰木目
思|⿱田心
念|⿱今心
忘|⿱亡心
息|⿱自心
怎|⿱乍心
的|⿰白勺
地|⿰土也
做|⿰亻故
作|⿰亻乍
住|⿰亻主
往|⿰彳主
钱|⿰钅戋
银|⿰钅艮
饭|⿰饣反
饱|⿰饣包
饿|⿰饣我
都|⿰者阝
起|⿺走己
过|⿺辶寸
这|⿺辶文
还|⿺辶不
进|⿺辶井
近|⿺辶斤
远|⿺辶元
道|⿺辶首
校|⿰木交
样|⿰木羊
桌|⿱卓木
椅|⿰木奇
花|⿱艹化
茶|⿱艹⿱人木
菜|⿱艹采
药|⿱艹约
草|⿱艹早
早|⿱日十
星|⿱日生
晚|⿰日免
昨|⿰日乍
国|⿴囗玉
同|⿵冂一口
回|⿴囗口
因|⿴囗大
图|⿴囗冬
们|⿰亻门
伞|⿱𠆢十
爸|⿱父巴
哥|⿱可可
姐|⿰女且
妹|⿰女未
朋|⿰月月
友|⿻ナ又
候|⿰亻侯
钟|⿰钅中
热|⿱执灬
冷|⿰冫令
累|⿱田糸
忙|⿰忄亡
快|⿰忄夬
慢|⿰忄曼
饿|⿰饣我
病|⿹疒丙
鸡|⿰又鸟
鱼|⿱𠂊田
`;

function parseSeedDecomp() {
SEED_DECOMP.split("\n").forEach(line => {
const i = line.indexOf("|");
if (i > 0) DECOMP.map.set(line.slice(0, i), { d: line.slice(i + 1), def: "", py: "" });
});
}

function parseDecompDictionary(text) {
let n = 0;
text.split("\n").forEach(line => {
const t = line.trim();
if (!t || t[0] !== "{") return;
try {
const o = JSON.parse(t);
if (o && o.character && typeof o.decomposition === "string") {
DECOMP.map.set(o.character, { d: o.decomposition, def: String(o.definition || ""), py: Array.isArray(o.pinyin) && o.pinyin[0] ? String(o.pinyin[0]) : "" });
n++;
}
} catch (e) {}
});
return n;
}

async function ensureDecomp(force) {
if (DECOMP.full && !force) return true;
if (DECOMP.loading) return DECOMP.loading;
DECOMP.loading = (async () => {
for (const url of DECOMP_URLS) {
const text = await fetchRemote(url, "text", !!force);
if (typeof text === "string" && text.length > 1000 && parseDecompDictionary(text) > 500) {
DECOMP.full = true;
break;
}
}
DECOMP.loading = null;
document.dispatchEvent(new CustomEvent("decomp-ready"));
return DECOMP.full;
})();
return DECOMP.loading;
}

function idsParse(str) {
const arr = Array.from(str);
let i = 0;
const node = () => {
const c = arr[i++];
if (c === undefined) return null;
if (IDS_ARITY[c]) {
const kids = [];
for (let k = 0; k < IDS_ARITY[c]; k++) kids.push(node());
return { op: c, kids: kids.filter(Boolean) };
}
return { ch: c };
};
return node();
}

function idsLeaves(node) {
if (!node) return [];
if (node.ch !== undefined) return [node.ch];
return node.kids.flatMap(idsLeaves);
}

function compTree(c, depth = 0, seen = new Set()) {
const ch = COMP_VARIANT[c] || c;
const out = { ch, kids: [] };
const info = DECOMP.map.get(ch);
if (!info || !info.d || info.d === "？" || depth >= 4 || seen.has(ch)) return out;
const node = idsParse(info.d);
if (!node || node.ch !== undefined) return out;
const next = new Set(seen);
next.add(ch);
out.kids = idsLeaves(node)
.filter(p => p && p !== "？" && p !== ch && !/^[0-9A-Za-z\s]$/.test(p))
.map(p => compTree(p, depth + 1, next));
return out;
}

function compInfo(c) {
const n = COMP_NAMES[c];
if (n) return { py: n[0], en: n[1] };
const e = getEntry(c);
if (e && e.meaning) return { py: e.pinyin ? rawSyllables(e.pinyin)[0] || "" : "", en: shortMeaning(e.meaning, 1) };
const d = DECOMP.map.get(c);
if (d && (d.def || d.py)) return { py: d.py, en: shortMeaning(d.def.replace(/,/g, ";"), 1) };
const r = RADICALS_DB.find(x => x.rad === c || x.alt === c);
if (r) return { py: r.py, en: r.meaning.split(",")[0] };
return { py: "", en: "" };
}

function compChipHTML(ch) {
const i = compInfo(ch);
return `<button class="dc-chip" data-act="open-word" data-key="${esc(ch)}"><b class="han">${esc(ch)}</b>${i.py ? `<i class="py">${pinyinStrHTML(i.py)}</i>` : ""}${i.en ? `<small>${esc(i.en)}</small>` : ""}</button>`;
}

function compTreeHTML(t) {
return `<ul class="dc-tree">${t.kids.map(k => `<li>${compChipHTML(k.ch)}${k.kids.length ? compTreeHTML(k) : ""}</li>`).join("")}</ul>`;
}

function decompHTML(c) {
const t = compTree(c);
const known = DECOMP.map.has(COMP_VARIANT[c] || c);
let note = "";
if (!t.kids.length) {
if (known) note = '<span class="small muted">basic component, no smaller parts</span>';
else note = `<span class="small muted">${DECOMP.full ? "No structure data for this character." : DECOMP.loading ? "Loading structure data…" : "Structure data not downloaded yet."}</span>`;
}
return `<div class="dc"><div class="dc-head"><b class="han">${esc(c)}</b><span class="dc-arrow">⇒</span>${note}</div>${t.kids.length ? compTreeHTML(t) : ""}</div>`;
}

function compFlat(t) {
return t.kids.map(k => (k.kids.length ? `${k.ch} (${compFlat(k)})` : k.ch)).join(" ");
}

function structInnerHTML(chars) {
const on = !!S.settings.extBreakdown;
if (on) ensureDecomp();
return `<div class="row between"><h3 class="sub">Character structure</h3><label class="row small muted" style="gap:.4rem"><span class="switch"><input type="checkbox" data-setting="extBreakdown" data-type="bool" ${on ? "checked" : ""} aria-label="Extended breakdown"><span></span></span>Extended</label></div>${on ? chars.map(decompHTML).join("") : '<p class="small muted mt-s">Turn on Extended to split each character into its components.</p>'}`;
}

function extRefresh() {
const on = !!S.settings.extBreakdown;
if (on) ensureDecomp();
if (S.route.name === "analyzer" && AN.text) analyzerView();
const s = $("#d-struct");
if (s && S.drawerKey && $("#dlg-word").open) s.innerHTML = structInnerHTML(Array.from(S.drawerKey).filter(isZh).slice(0, 6));
}

parseSeedDecomp();
document.addEventListener("decomp-ready", () => {
if (S.settings.extBreakdown) extRefresh();
});
