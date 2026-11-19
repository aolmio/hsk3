"use strict";
const LANGS = [
["en", "English"], ["my", "Burmese · မြန်မာ"], ["th", "Thai · ไทย"], ["vi", "Vietnamese · Tiếng Việt"], ["id", "Indonesian"], ["ms", "Malay"], ["tl", "Filipino"],
["ja", "Japanese · 日本語"], ["ko", "Korean · 한국어"], ["hi", "Hindi · हिन्दी"], ["bn", "Bengali · বাংলা"], ["ta", "Tamil · தமிழ்"], ["ur", "Urdu · اردو"], ["ne", "Nepali · नेपाली"],
["si", "Sinhala · සිංහල"], ["km", "Khmer · ខ្មែរ"], ["lo", "Lao · ລາວ"], ["mn", "Mongolian"], ["ar", "Arabic · العربية"], ["fa", "Persian · فارسی"], ["tr", "Turkish"], ["he", "Hebrew · עברית"],
["ru", "Russian · Русский"], ["uk", "Ukrainian · Українська"], ["pl", "Polish"], ["cs", "Czech"], ["ro", "Romanian"], ["hu", "Hungarian"], ["el", "Greek · Ελληνικά"],
["de", "German"], ["fr", "French"], ["es", "Spanish"], ["pt", "Portuguese"], ["it", "Italian"], ["nl", "Dutch"], ["sv", "Swedish"], ["da", "Danish"], ["no", "Norwegian"], ["fi", "Finnish"],
["sw", "Swahili"], ["af", "Afrikaans"]
];
const ZH_TARGETS = [["zh-CN", "Chinese, Simplified · 简体中文"], ["zh-TW", "Chinese, Traditional · 繁體中文"]];
const TRN = { mode: "to", run: 0, input: "", out: "", chinese: "", autorun: false };

const langName = code => {
const c = String(code || "").toLowerCase();
if (c.startsWith("zh")) return c.includes("tw") || c.includes("hant") ? "Chinese (Traditional)" : "Chinese";
const hit = LANGS.find(l => l[0] === c || l[0] === c.split("-")[0]);
return hit ? hit[1].split(" · ")[0] : code || "";
};

function trFill() {
const mode = TRN.mode;
const fromSel = $("#tr-from");
const toSel = $("#tr-to");
const optList = list => list.map(([c, n]) => `<option value="${c}">${esc(n)}</option>`).join("");
if (mode === "to") {
fromSel.innerHTML = `<option value="auto">Detect language</option>${optList(LANGS)}`;
toSel.innerHTML = optList(ZH_TARGETS);
fromSel.value = S.misc.trFromTo || "auto";
toSel.value = S.misc.trToZh || "zh-CN";
} else {
fromSel.innerHTML = optList(ZH_TARGETS);
toSel.innerHTML = optList(LANGS);
fromSel.value = "zh-CN";
toSel.value = S.misc.trToLang || "en";
}
$$("#tr-mode button").forEach(b => b.classList.toggle("on", b.dataset.m === mode));
$("#tr-input").placeholder = mode === "to" ? "Type or paste text in any language, for example: Where is the nearest subway station?" : "输入或粘贴中文，例如：请问最近的地铁站在哪里？";
}

function trCount() {
$("#tr-count").textContent = `${Array.from($("#tr-input").value).length} / 3000`;
}

VIEW_ENTER.translate = () => {
TRN.mode = S.misc.trMode === "from" ? "from" : "to";
trFill();
trCount();
trHistory();
if (TRN.autorun) {
TRN.autorun = false;
trRun(false);
}
};

function trChineseSide() {
return TRN.mode === "to" ? TRN.out : $("#tr-input").value.trim();
}

function trRenderOut(results, final, force) {
const box = $("#tr-out");
box.hidden = false;
const toZh = TRN.mode === "to";
const okAll = results.filter(r => r && r.text);
const joined = results.map(r => (r && r.text) || "").join(toZh ? "" : " ").trim();
if (!okAll.length) {
if (!final) {
box.innerHTML = '<div class="card"><p class="muted">Translating…</p></div>';
return;
}
const offline = navigator.onLine === false;
box.innerHTML = `<div class="card"><p>${offline ? "You are offline, so the translation could not be fetched." : "The translation services could not be reached just now."}</p><div class="row mt-s"><button class="btn primary" data-act="tr-retry">Try again</button></div>${!offline && TR.report ? `<p class="tiny faint mt-s">${esc(TR.report)}</p>` : ""}</div>`;
return;
}
TRN.out = joined;
const detected = (results.find(r => r && r.detected) || {}).detected;
const providers = Array.from(new Set(okAll.map(r => r.provider).filter(Boolean)));
const partial = final && okAll.length < results.length;
const chips = `${detected && $("#tr-from").value === "auto" ? `<span class="chip">Detected: ${esc(langName(detected))}</span>` : ""}${providers.length ? `<span class="chip">${esc(providers.join(", "))}</span>` : ""}${partial ? '<span class="chip seal">Some parts failed</span>' : ""}`;
let body;
if (toZh) {
const an = analyzeText(joined);
const ruby = `<div class="ruby-view">${an.tokens.map(t => {
if (t.text === "\n") return "<br>";
if (!t.zh) return esc(t.text);
return `<ruby class="rw" data-act="open-word" data-key="${esc(t.text)}">${esc(t.text)}<rt>${pinyinHTML(t.spoken)}</rt></ruby>`;
}).join("")}</div>`;
body = `<div class="row between"><h2 class="sec" style="margin:0">Chinese</h2><div class="row">${chips}</div></div>
${ruby}
<div class="line-box mt-s" id="tr-py">${tokensPinyinHTML(an.tokens)}</div>
${an.notes.length ? `<p class="tiny faint mt-s">${an.notes.length} tone ${an.notes.length === 1 ? "change" : "changes"} applied in the pinyin above.</p>` : ""}`;
} else {
const orig = $("#tr-input").value.trim();
body = `<div class="row between"><h2 class="sec" style="margin:0">${esc(langName($("#tr-to").value))}</h2><div class="row">${chips}</div></div>
<div class="line-box mt-s" id="tr-text" style="font-family:var(--font-ui);font-weight:600;white-space:pre-wrap">${esc(joined)}</div>
<h3 class="sub mt">Pinyin of the original</h3>
<div class="line-box" id="tr-py">${sentenceBlockHTML(orig).html}</div>`;
}
const cn = trChineseSide();
const saved = cn && S.deck.has(cn);
box.innerHTML = `<div class="card">${body}
<div class="row mt">
<button class="btn" data-act="tr-speak">${ico("volume")}Listen</button>
<button class="btn" data-act="tr-speak" data-slow="1">${ico("volume")}Slow</button>
<button class="btn" data-act="tr-copy" data-what="main">${ico("copy")}Copy ${toZh ? "Chinese" : "translation"}</button>
<button class="btn" data-act="tr-copy" data-what="pinyin">${ico("copy")}Copy pinyin</button>
<button class="btn ${saved ? "on" : ""}" data-act="tr-save">${ico("star")}Save</button>
<button class="btn" data-act="tr-analyze">${ico("type")}Analyze</button>
</div></div>`;
}

async function trRun(force) {
const text = $("#tr-input").value.replace(/\r/g, "").trim();
trCount();
if (!text) {
$("#tr-out").hidden = true;
return;
}
if (text.length > 3000) return;
const from = $("#tr-from").value;
const to = $("#tr-to").value;
if (TRN.mode === "to") {
S.misc.trFromTo = from;
S.misc.trToZh = to;
} else S.misc.trToLang = to;
persist.misc();
const id = ++TRN.run;
const parts = splitForTranslate(text);
const results = new Array(parts.length).fill(null);
trRenderOut(results, false);
await mapLimit(parts, 3, async (p, i) => {
const r = await translateFull(p, { from, to, force });
if (id !== TRN.run) return;
results[i] = r;
if (results.some(x => x && x.text)) trRenderOut(results, false);
});
if (id !== TRN.run) return;
trRenderOut(results, true);
const okCount = results.filter(r => r && r.text).length;
if (okCount) {
const hist = S.misc.trHist || [];
const entry = { src: text.slice(0, 400), out: TRN.out.slice(0, 600), from, to, mode: TRN.mode, t: Date.now() };
S.misc.trHist = [entry].concat(hist.filter(h => !(h.src === entry.src && h.to === entry.to))).slice(0, 15);
persist.misc();
trHistory();
}
}

function trHistory() {
const box = $("#tr-hist");
const hist = S.misc.trHist || [];
box.hidden = !hist.length;
if (!hist.length) return;
box.innerHTML = `<div class="row between"><h2 class="sec" style="margin:0">Recent</h2><button class="btn sm ghost" data-act="tr-hist-clear">Clear</button></div><div class="stack-s mt-s">${hist.map((h, i) => `<button class="fam-row" data-act="tr-hist-use" data-i="${i}" style="align-items:flex-start"><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(h.src)}</span><span class="small muted" style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:right">${esc(h.out)}</span></button>`).join("")}</div>`;
}

A["tr-run"] = () => trRun(false);
A["tr-retry"] = () => {
TR.cool = {};
trRun(true);
};
A["tr-clear"] = () => {
TRN.run++;
$("#tr-input").value = "";
$("#tr-out").hidden = true;
trCount();
$("#tr-input").focus();
};
A["tr-paste"] = async () => {
try {
const t = await navigator.clipboard.readText();
if (t) {
$("#tr-input").value = t.slice(0, 3000);
trRun(false);
} else toast("Clipboard is empty");
} catch (e) {
toast("Paste is blocked here. Use Ctrl/Cmd+V in the box.");
$("#tr-input").focus();
}
};
A["tr-mode"] = el => {
if (TRN.mode === el.dataset.m) return;
TRN.mode = el.dataset.m;
S.misc.trMode = TRN.mode;
persist.misc();
trFill();
$("#tr-out").hidden = true;
if ($("#tr-input").value.trim()) trRun(false);
};
A["tr-swap"] = () => {
const out = TRN.out;
TRN.mode = TRN.mode === "to" ? "from" : "to";
S.misc.trMode = TRN.mode;
persist.misc();
trFill();
if (out) $("#tr-input").value = out.slice(0, 3000);
trCount();
$("#tr-out").hidden = true;
if ($("#tr-input").value.trim()) trRun(false);
};
A["tr-speak"] = el => {
const t = trChineseSide();
if (t) speak(t, el.dataset.slow === "1");
};
A["tr-copy"] = el => {
if (el.dataset.what === "pinyin") copyText(($("#tr-py") && $("#tr-py").innerText.trim()) || "", "Pinyin");
else copyText(TRN.out, "Translation");
};
A["tr-save"] = el => {
const cn = trChineseSide();
if (!cn) return;
const orig = $("#tr-input").value.trim();
const pinyin = tokensPinyinText(analyzeText(cn).tokens);
toggleSave(cn, { pinyin, meaning: TRN.mode === "to" ? orig : TRN.out, level: "Translation" });
el.classList.toggle("on", S.deck.has(cn));
};
A["tr-analyze"] = () => {
const cn = trChineseSide();
if (!cn) return;
$("#an-input").value = cn;
go("/analyzer");
};
A["tr-hist-use"] = el => {
const h = (S.misc.trHist || [])[Number(el.dataset.i)];
if (!h) return;
TRN.mode = h.mode === "from" ? "from" : "to";
S.misc.trMode = TRN.mode;
trFill();
$("#tr-from").value = h.from;
$("#tr-to").value = h.to;
$("#tr-input").value = h.src;
trRun(false);
};
A["tr-hist-clear"] = () => {
S.misc.trHist = [];
persist.misc();
trHistory();
};
A["an-to-zh"] = () => {
const text = $("#an-input").value.trim();
if (!text) return;
S.misc.trMode = "to";
persist.misc();
$("#tr-input").value = text;
TRN.autorun = true;
go("/translate");
};

document.addEventListener("input", e => {
if (e.target.id === "tr-input") trCount();
});
document.addEventListener("change", e => {
if (e.target.id === "tr-from" || e.target.id === "tr-to") {
if ($("#tr-input").value.trim()) trRun(false);
}
});
document.addEventListener("keydown", e => {
if (e.target.id === "tr-input" && e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
e.preventDefault();
trRun(false);
}
});
