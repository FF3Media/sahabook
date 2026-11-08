"use strict";
/* Sahabook — version 1.
   One page per section, one spotlight card. Tap anything to hear it. "Test me" checks recall on the same page.
   Progress lives in this device's storage (localStorage). */

// ---------- Static data ----------
const LETTERS = [
  ["ا","Alif","ā","A long “aa”. At the start of a word it carries a vowel.","Alif"],
  ["ب","Bā’","b","b, as in “boy”.","Ba"],
  ["ت","Tā’","t","t, a little softer than English.","Ta"],
  ["ث","Thā’","th","th, as in “think”.","Tha"],
  ["ج","Jīm","j","j, as in “jam”.","Jeem"],
  ["ح","Ḥā’","ḥ","A breathy h from deep in the throat.","Hha"],
  ["خ","Khā’","kh","Like the “ch” in Scottish “loch”.","Kha"],
  ["د","Dāl","d","d, as in “door”.","Dal"],
  ["ذ","Dhāl","dh","th, as in “this”.","zal"],
  ["ر","Rā’","r","A rolled or tapped r.","Ra"],
  ["ز","Zāy","z","z, as in “zoo”.","Zai"],
  ["س","Sīn","s","s, as in “sun”.","Seen"],
  ["ش","Shīn","sh","sh, as in “ship”.","Sheen"],
  ["ص","Ṣād","ṣ","A heavy s: tongue low, mouth slightly rounded.","sad"],
  ["ض","Ḍād","ḍ","A heavy d.","Dad"],
  ["ط","Ṭā’","ṭ","A heavy t.","Tah"],
  ["ظ","Ẓā’","ẓ","A heavy “th”, as in “this”.","Zah"],
  ["ع","ʿAyn","ʿ","A squeeze deep in the throat. No English equivalent.","Ayn"],
  ["غ","Ghayn","gh","Like a French r, lightly gargled.","Gheen"],
  ["ف","Fā’","f","f, as in “far”.","Fa"],
  ["ق","Qāf","q","A k made far back in the throat.","Qaf"],
  ["ك","Kāf","k","k, as in “kite”.","Kaf"],
  ["ل","Lām","l","l, as in “lamp”.","Lam"],
  ["م","Mīm","m","m, as in “moon”.","Meem"],
  ["ن","Nūn","n","n, as in “noon”.","Noon"],
  ["ه","Hā’","h","h, as in “hat”.","Ha"],
  ["و","Wāw","w","w, as in “wow”, or a long “oo”.","Wow"],
  ["ي","Yā’","y","y, as in “yes”, or a long “ee”.","Ya"],
].map((a, i) => ({ i, ch: a[0], name: a[1], tr: a[2], sound: a[3], audio: "audio/l/" + a[4] + ".m4a" }));
const AR_NAMES = {"ا":"ألف","ب":"باء","ت":"تاء","ث":"ثاء","ج":"جيم","ح":"حاء","خ":"خاء","د":"دال","ذ":"ذال","ر":"راء","ز":"زاي","س":"سين","ش":"شين","ص":"صاد","ض":"ضاد","ط":"طاء","ظ":"ظاء","ع":"عين","غ":"غين","ف":"فاء","ق":"قاف","ك":"كاف","ل":"لام","م":"ميم","ن":"نون","ه":"هاء","و":"واو","ي":"ياء"};
const NON_JOINING = "اأإآٱدذرزوؤةءى";
const ZWJ = "‍";
const GROUP_SIZE = 7;
const LOOKALIKES = [["ب","ت","ث","ن","ي"],["ج","ح","خ"],["د","ذ"],["ر","ز"],["س","ش"],["ص","ض"],["ط","ظ"],["ع","غ"],["ف","ق"]];
const SURAH_ORDER_FOR_EXAMPLES = [1, 112, 108, 103, 110, 114, 113, 111, 109, 107, 106, 105, 104, 102, 101, 100];
const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const arNum = n => String(n).split("").map(d => AR_DIGITS[d]).join("");

const I = {
  play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>',
  stop: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2.5"/></svg>',
  speak: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 10v4h4l5 4V6L8 10H4z"/><path d="M16.5 9a4 4 0 0 1 0 6M19 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  text: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h10M4 17h13"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
  right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
  loop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/></svg>',
};

// ---------- Saved progress ----------
const KEY = "qwr-v1";
const today = () => new Date().toLocaleDateString("en-CA");
const addDays = (d, n) => { const t = new Date(d + "T12:00:00"); t.setDate(t.getDate() + n); return t.toLocaleDateString("en-CA"); };
const INTERVALS = [0, 1, 3, 7, 14, 30];
function fresh() { return { letters: {}, words: {}, days: [], settings: { size: 1, speed: 1, gloss: "off" }, ui: { view: "home", letter: null, surah: null } }; }
let S = fresh();
function load() {
  try { const raw = localStorage.getItem(KEY); if (raw) { const s = JSON.parse(raw); S = Object.assign(fresh(), s); S.settings = Object.assign(fresh().settings, s.settings || {}); S.ui = Object.assign(fresh().ui, s.ui || {}); } } catch (e) {}
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
function practiced() { const d = today(); if (!S.days.includes(d)) { S.days.push(d); S.days = S.days.slice(-60); save(); } }
function record(store, key, correct) {
  const r = store[key] || (store[key] = { days: [], box: 0, seen: true });
  r.seen = true;
  if (correct) {
    if (!r.days.includes(today())) r.days.push(today());
    r.box = Math.min(r.box + 1, INTERVALS.length - 1);
    r.next = addDays(today(), INTERVALS[r.box]);
  } else {
    r.box = 0; r.next = today(); r.wrong = (r.wrong || 0) + 1;
    if (r.days.length >= 2) r.days = r.days.slice(-1);
  }
  practiced(); save();
}

// ---------- Audio ----------
const player = new Audio();
player.preload = "auto";
// iOS only lets a page play sound after a tap. Play one muted clip on the first tap so later
// sounds (including ones started after loading) are allowed.
let unlocked = false;
function unlock() {
  if (unlocked) return; unlocked = true;
  try { player.muted = true; player.src = LETTERS[0].audio; const p = player.play(); if (p) p.then(() => { if (player.muted) player.pause(); }).catch(() => {}); } catch (e) {}
}
["touchend", "click"].forEach(ev => document.addEventListener(ev, unlock, { capture: true, once: true }));
const dataUrls = {};
async function asDataUrl(src) {
  if (dataUrls[src]) return dataUrls[src];
  const blob = await (await fetch(src)).blob();
  return dataUrls[src] = await new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(blob); });
}
let onEndCb = null;
player.addEventListener("ended", () => { const cb = onEndCb; onEndCb = null; cb && cb(); });
function play(src, onEnd, quran) {
  try { speechSynthesis.cancel(); } catch (e) {}
  onEndCb = null;
  if (!src) return;
  const rate = quran ? S.settings.speed : 1;
  const start = url => { player.muted = false; player.src = url; player.defaultPlaybackRate = rate; player.playbackRate = rate; onEndCb = onEnd || null; return player.play(); };
  const p = start(src);
  if (p) p.catch(async err => {
    if (err && err.name === "AbortError") return;
    try { await start(await asDataUrl(src)); } catch (e) { onEnd && onEnd(); }
  });
  practiced();
}
const canSpeak = (() => { try { return "speechSynthesis" in window; } catch (e) { return false; } })();
function speak(text) {
  if (!canSpeak) return;
  try { player.pause(); speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = "ar-SA"; u.rate = .75; speechSynthesis.speak(u); } catch (e) {}
}
function pulse(el) { if (!el) return; el.classList.remove("pulse"); void el.offsetWidth; el.classList.add("pulse"); }

// ---------- Content helpers ----------
let C = null;
const strip = s => s.replace(/[ً-ٰٟۖ-ۭـ]/g, "");
const wkey = w => w.lemma ? "L:" + w.lemma : "A:" + strip(w.ar);
const words = () => Object.entries(C.words).map(([k, w]) => Object.assign({ key: k }, w));
function surah(n) { return C.surahs.find(s => s.n === n); }
function surahWords(n) { return surah(n).verses.flatMap(v => v.words.map(k => Object.assign({ key: k, v: v.v }, C.words[k]))); }
function wordState(w) { const r = S.words[wkey(w)]; if (!r || !r.seen) return "new"; return r.days && r.days.length >= 2 ? "known" : "learning"; }
function uniqueKeys(list) { return [...new Set(list.map(wkey))]; }
function knownShare(list) { const keys = uniqueKeys(list); const k = keys.filter(x => { const r = S.words[x]; return r && r.days && r.days.length >= 2; }).length; return { known: k, total: keys.length }; }
function wordsKnownCount(list) { return list.filter(w => wordState(w) === "known").length; }
function letterExample(ch) {
  const norm = s => strip(s).replace(/[ٱأإآ]/g, "ا").replace(/ى/g, "ي");
  for (const n of SURAH_ORDER_FOR_EXAMPLES) {
    const cands = surahWords(n).filter(w => w.audio && norm(w.ar).includes(ch));
    if (cands.length) return cands.sort((a, b) => strip(a.ar).length - strip(b.ar).length)[0];
  }
  return null;
}

// ---------- Letters: status and Test me ----------
function letterRec(L) { return S.letters[L.ch]; }
function letterLearned(L) { const r = letterRec(L); return !!(r && r.days && r.days.length >= 2); }
// Letters are learned in 4 fixed sets of 7. The current set is the first one with a letter not yet learned.
const SETS = Math.ceil(LETTERS.length / GROUP_SIZE);
function setOf(L) { return Math.floor(L.i / GROUP_SIZE); }
function currentSetIndex() { const L = LETTERS.find(x => !letterLearned(x)); return L ? setOf(L) : SETS; }
function currentGroup() { const k = currentSetIndex(); return LETTERS.filter(L => setOf(L) === k && !letterLearned(L)); }
function passedOn(L, d) { const r = letterRec(L); return !!(r && r.days && r.days.includes(d)); }
function dayDots(L) { const r = letterRec(L); return Math.min(2, r && r.days ? r.days.length : 0); }
function needToday() { const t = today(); return currentGroup().filter(L => !passedOn(L, t)); }
function nextStep() {
  const k = currentSetIndex();
  if (k >= SETS) return "All 28 letters learned. On to reading.";
  const set = `Set ${k + 1} of ${SETS}.`;
  const need = needToday(), group = currentGroup();
  if (!need.length) return `${set} Done for today. Pass the quiz again tomorrow to finish this set.`;
  if (group.every(L => !dayDots(L))) return `${set} Today: study the ${group.length} outlined letters, then take the quiz.`;
  if (need.length === group.length && group.every(L => dayDots(L))) return `${set} Today: pass the quiz again to finish this set.`;
  return `${set} Today: pass the quiz on ${need.length} more letter${need.length === 1 ? "" : "s"}.`;
}
function letterState(L) { if (letterLearned(L)) return "learned"; return currentGroup().includes(L) ? "learning" : "new"; }
function sayLetter(L, el) { play(L.audio); pulse(el); }
function forms(ch) {
  const nj = NON_JOINING.includes(ch);
  return [[ch, "On its own"], [nj ? ch : ch + ZWJ, "Start"], [ZWJ + ch + (nj ? "" : ZWJ), "Middle"], [ZWJ + ch, "End"]];
}
let LT = null; // letter test: {target, answered, right, n, last}
function pickLetterTarget() {
  const t = today();
  const due = LETTERS.filter(L => letterLearned(L) && (letterRec(L).next || t) <= t);
  let pool = [...currentGroup(), ...due];
  if (!pool.length) pool = LETTERS.slice();
  if (LT && LT.target && pool.length > 1) pool = pool.filter(L => L !== LT.target);
  // favor letters missed before and letters never answered right
  const weight = L => { const r = letterRec(L) || {}; return 1 + (r.wrong || 0) * .5 + (!r.days || !r.days.length ? 1 : 0); };
  const total = pool.reduce((a, L) => a + weight(L), 0); let x = Math.random() * total;
  for (const L of pool) { x -= weight(L); if (x <= 0) return L; }
  return pool[pool.length - 1];
}
// Short test after "Done": each letter you're learning once, plus up to 3 learned letters due for review.
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function buildLetterQuiz() {
  const t = today();
  const group = needToday().length ? needToday() : currentGroup();
  const due = shuffle(LETTERS.filter(L => letterLearned(L) && (letterRec(L).next || t) <= t)).slice(0, 3);
  let q = [...group, ...due];
  if (!q.length) q = shuffle(LETTERS).slice(0, GROUP_SIZE);
  return shuffle(q);
}
let autoNext = null;
function startLetterTest() { LT = { setAtStart: currentSetIndex(), queue: buildLetterQuiz(), idx: 0, right: 0, missed: [], target: null, answered: null, finished: false }; askLetter(); }
function askLetter() {
  clearTimeout(autoNext);
  if (LT.idx >= LT.queue.length) { LT.finished = true; LT.target = null; LT.answered = null; renderLetters(); return; }
  LT.target = LT.queue[LT.idx]; LT.answered = null; renderLetters(); play(LT.target.audio);
}
function nextLetterQ() { LT.idx++; askLetter(); }
function answerLetter(L) {
  if (!LT || LT.answered || LT.finished) return;
  const ok = L === LT.target;
  LT.answered = L; if (ok) LT.right++; else LT.missed.push(LT.target);
  record(S.letters, LT.target.ch, ok);
  renderLetters();
  if (ok) autoNext = setTimeout(nextLetterQ, 900); else play(LT.target.audio);
}
function endLetterTest() { clearTimeout(autoNext); LT = null; S.ui.letter = (currentGroup()[0] || LETTERS[S.ui.letter] || LETTERS[0]).i; save(); renderLetters(); }

// ---------- Views ----------
const main = () => document.getElementById("main");
function ringSvg(id, frac) {
  const c = 2 * Math.PI * 25;
  return `<svg viewBox="0 0 60 60" aria-hidden="true"><circle class="track" cx="30" cy="30" r="25" fill="none" stroke-width="8"/><circle class="val" id="${id}" cx="30" cy="30" r="25" fill="none" stroke-width="8" stroke-linecap="round" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c * (1 - frac)).toFixed(1)}"/></svg>`;
}

function renderLetters() {
  const learned = LETTERS.filter(letterLearned).length;
  if (S.ui.letter == null || !LETTERS[S.ui.letter]) S.ui.letter = (currentGroup()[0] || LETTERS[0]).i;
  const sel = LETTERS[S.ui.letter];
  let h = `<div class="head"><div><p class="eyebrow">Stage 1 · Letters</p><h1 class="title">The Arabic letters</h1><p class="sub nextstep">${nextStep()}</p></div>
    <div class="ring">${ringSvg("lr", learned / 28)}<div><b>${learned} of 28</b><span>letters learned</span></div></div></div>`;
  h += `<div class="split letters"><aside class="spot" id="spot">${LT ? letterTestCard() : letterCard(sel)}</aside>`;
  h += `<div><div class="lgrid ${LT ? "testing" : ""}" id="lgrid">` + LETTERS.map(L => {
    const st = letterState(L);
    let cls = "ltile " + st;
    if (!LT && L === sel) cls += " selected";
    if (LT && LT.answered) { if (L === LT.target) cls += " right"; else if (L === LT.answered) cls += " wrong"; }
    const pips = st === "learning" && !LT ? `<span class="pips" aria-hidden="true"><i class="${dayDots(L) > 0 ? "on" : ""}"></i><i class="${dayDots(L) > 1 ? "on" : ""}"></i></span>` : "";
    return `<button class="${cls}" data-i="${L.i}" aria-label="${L.name}">${st === "learned" && !LT ? `<span class="dot">${I.check}</span>` : ""}${pips}<span class="g">${L.ch}</span><small>${L.name}</small></button>`;
  }).join("") + `</div><p class="small" style="margin-top:14px">Outlined letters are your current set. Each dot is a day you passed that letter in the quiz. Two dots and it turns green: learned. Learn all 7 and the next set unlocks.</p></div></div>`;
  main().innerHTML = h;
  document.querySelectorAll(".ltile").forEach(b => b.onclick = () => {
    const L = LETTERS[+b.dataset.i];
    if (LT) { if (LT.target && !LT.answered) answerLetter(L); else sayLetter(L, b); return; }
    S.ui.letter = L.i; save(); renderLetters(); sayLetter(L, document.querySelector(`.ltile[data-i="${L.i}"]`));
  });
  wireSpot();
}

function letterCard(L) {
  const st = letterState(L);
  const ex = letterExample(L.ch);
  let h = `<div class="spot-top"><button class="navbtn" data-step="1" aria-label="Next letter">${I.left}</button><span class="pill ${st === "learned" ? "known" : st}">${{ learned: "Learned", learning: "Learning now", new: "Coming up" }[st]}</span><button class="navbtn" data-step="-1" aria-label="Previous letter">${I.right}</button></div>`;
  h += `<button class="hero" id="heroL" aria-label="Hear ${L.name}"><span class="glyph">${L.ch}</span><span class="name">${L.name}<span class="spk">${I.speak}</span></span></button>`;
  h += `<p class="hint">${L.sound}${NON_JOINING.includes(L.ch) ? " Never joins to the letter after it." : ""}</p>`;
  h += `<p class="subhead">Shapes and vowels</p><div class="tiles">` + forms(L.ch).map(f => `<button class="tile shape"><span class="g">${f[0]}</span><small>${f[1]}</small></button>`).join("");
  if (L.ch !== "ا") h += `<span class="break"></span>` + [["َ", "a"], ["ِ", "i"], ["ُ", "u"]].map(v => `<button class="tile vowel" data-say="${L.ch + v[0]}"><span class="g">${L.ch + v[0]}</span><small>${L.tr + v[1]}</small></button>`).join("");
  h += `</div>`;
  if (ex) h += `<p class="subhead exlabel">In the Quran</p><button class="example" id="exL" aria-label="Hear ${ex.tr}"><span class="txt">${ex.en}<span>${ex.tr}</span></span><span class="ar">${ex.ar}</span></button>`;
  h += `<p class="meta quizhint">Studied the outlined letters? Take a 1-minute quiz.</p><div class="actions"><button class="btn primary" id="testL">${needToday().length ? `Quiz me on these ${needToday().length}` : "Practice quiz"}</button></div>`;
  return h;
}
function letterTestCard() {
  const total = LT.queue.length;
  if (LT.finished) {
    const learned = LETTERS.filter(letterLearned).length;
    const k = currentSetIndex();
    const unlocked = k > LT.setAtStart;
    const msg = unlocked ? (k >= SETS ? "All 28 letters learned." : `Set ${LT.setAtStart + 1} done. Set ${k + 1} unlocked.`)
      : (LT.missed.length ? "Tap a letter you missed to hear it again. " : "") + nextStep().replace(/^Set \d+ of \d+\. /, "");
    return `<div class="spot-top"><span class="pill test">Quiz done</span><span class="meta">${learned} of 28 learned</span></div>
      <div class="testcard"><p class="score">${LT.right} of ${total}</p><p class="meta" style="margin:0 0 6px">right</p>
      ${LT.missed.length ? `<div class="tiles missed">${LT.missed.map(L => `<button class="tile" data-miss="${L.i}"><span class="g">${L.ch}</span><small>${L.name}</small></button>`).join("")}</div>` : ""}
      <p class="hint ${unlocked ? "unlocked" : ""}">${msg}</p></div>
      <div class="actions"><button class="btn primary" id="backL">Keep learning</button><button class="btn" id="againL">Quiz again</button></div>`;
  }
  const t = LT.target, a = LT.answered;
  let fb = "";
  if (a) fb = a === t ? `<p class="feedback ok">Right. That's ${t.name}.</p>` : `<p class="feedback no">That was ${t.name}. You tapped ${a.name}.</p>`;
  const done = LT.idx + (a ? 1 : 0);
  return `<div class="spot-top"><span class="pill test">Quiz</span><span class="meta">${LT.idx + 1} of ${total}</span></div>
    <div class="qbar"><span style="width:${(done / total * 100).toFixed(0)}%"></span></div>
    <div class="testcard"><button class="bigplay" id="replayL" aria-label="Play the sound again">${I.speak}</button>
    <p class="q">${a ? "" : "Which letter is this?"}</p><p class="meta" style="margin:0">${a ? "" : "Tap it in the grid."}</p>${fb}</div>
    <div class="actions">${a && a !== t ? `<button class="btn primary" id="nextL">${LT.idx + 1 < total ? "Next" : "See score"}</button>` : ""}<button class="btn" id="stopL">Stop quiz</button></div>`;
}

function wireSpot() {
  const $ = id => document.getElementById(id);
  document.querySelectorAll("[data-step]").forEach(b => b.onclick = () => {
    S.ui.letter = (S.ui.letter + +b.dataset.step + 28) % 28; save(); renderLetters();
    const L = LETTERS[S.ui.letter]; sayLetter(L, document.querySelector(`.ltile[data-i="${L.i}"]`));
  });
  if ($("heroL")) $("heroL").onclick = () => sayLetter(LETTERS[S.ui.letter], $("heroL"));
  document.querySelectorAll(".tile.shape").forEach(b => b.onclick = () => sayLetter(LETTERS[S.ui.letter], b));
  document.querySelectorAll(".tile.vowel").forEach(b => b.onclick = () => { speak(b.dataset.say); pulse(b); });
  if ($("exL")) $("exL").onclick = () => { const ex = letterExample(LETTERS[S.ui.letter].ch); play(ex.audio, null, true); pulse($("exL")); };
  if ($("testL")) $("testL").onclick = startLetterTest;
  if ($("replayL")) $("replayL").onclick = () => { if (LT.target) play(LT.target.audio); pulse($("replayL")); };
  if ($("nextL")) $("nextL").onclick = nextLetterQ;
  if ($("stopL")) $("stopL").onclick = endLetterTest;
  if ($("backL")) $("backL").onclick = endLetterTest;
  if ($("againL")) $("againL").onclick = startLetterTest;
  document.querySelectorAll("[data-miss]").forEach(b => b.onclick = () => sayLetter(LETTERS[+b.dataset.miss], b));
  const spot = $("spot");
  if (spot && !LT && S.ui.view === "letters") {
    let x0 = null, y0 = null;
    spot.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    spot.addEventListener("touchend", e => {
      if (x0 === null || e.target.closest(".tiles")) return;
      const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) { S.ui.letter = (S.ui.letter + (dx > 0 ? 1 : -1) + 28) % 28; save(); renderLetters(); sayLetter(LETTERS[S.ui.letter]); }
    }, { passive: true });
  }
}

// ---------- Read ----------
let RT = null;          // reader test
let selWord = null;     // selected word key
let playingVerse = null;
const showTrans = new Set();

function surahRows(onlyList) {
  const rows = C.surahs.map(s => { const ws = surahWords(s.n); const ks = knownShare(ws); return { s, pct: Math.round(100 * ks.known / ks.total), n: ws.length }; });
  rows.sort((a, b) => b.pct - a.pct || a.n - b.n || a.s.n - b.s.n);
  const next = rows.find(r => r.pct < 100);
  return `<ul class="slist">` + rows.map(r => `<li><button data-surah="${r.s.n}"><span class="num">${r.s.n}</span><span class="nm">${r.s.name}<span class="ar">${r.s.ar}</span>${r === next ? `<span class="tag">Read next</span>` : ""}<small>${r.s.meaning} · ${r.s.verses.length} verses · ${r.n} words</small></span><span class="minibar"><i style="width:${r.pct}%"></i></span><span class="pct">${r.pct}%</span></button></li>`).join("") + `</ul>`;
}

function renderRead() {
  if (!S.ui.surah) {
    const all = words(); const ks = knownShare(all);
    main().innerHTML = `<div class="head"><div><p class="eyebrow">Stage 3 · Understand</p><h1 class="title">Understand the surahs</h1><p class="sub">Your 16 surahs, the ones you can read best first.</p></div>
      <div class="ring">${ringSvg("wr", ks.known / ks.total)}<div><b>${ks.known} of ${ks.total}</b><span>words known</span></div></div></div>` + surahRows();
    document.querySelectorAll("[data-surah]").forEach(b => b.onclick = () => openSurah(+b.dataset.surah));
    return;
  }
  const s = surah(S.ui.surah); const ws = surahWords(s.n); const ks = knownShare(ws);
  let h = `<div class="toolbar"><button class="back" id="backS">${I.left}All surahs</button>
    <div class="seg" role="group" aria-label="Meanings under words"><button data-gloss="off" aria-pressed="${S.settings.gloss === "off"}">Arabic only</button><button data-gloss="new" aria-pressed="${S.settings.gloss === "new"}">Help with new words</button></div></div>`;
  h += `<div class="head"><div><h1 class="title">${s.name} <span class="ar" style="font-weight:400;color:var(--muted);font-size:.8em">${s.ar}</span></h1><p class="sub">${s.meaning}. Tap any word to hear it.</p></div>
    <div class="ring">${ringSvg("sr", ks.known / ks.total)}<div><b>${Math.round(100 * ks.known / ks.total)}%</b><span>${ks.known} of ${ks.total} words known</span></div></div></div>`;
  h += `<div class="split reader"><div class="verses">` + s.verses.map(v => {
    const ww = v.words.map(k => { const w = Object.assign({ key: k }, C.words[k]); const st = wordState(w);
      const cls = "word s-" + st + (selWord === k && !RT ? " selected" : "") + (RT && RT.target && RT.target.key === k ? " target" : "");
      const gl = S.settings.gloss === "new" && st !== "known" && !(RT && RT.target && RT.target.key === k) ? `<span class="gl">${w.en}</span>` : "";
      return `<button class="${cls}" data-w="${k}" aria-label="${w.tr}"><span class="ar">${w.ar}</span>${gl}</button>`; }).join("");
    return `<div class="verse ${playingVerse === v.v ? "playing" : ""}" id="v-${v.v}"><div class="words" lang="ar">${ww}<span class="endmark">${arNum(v.v)}</span></div>
      <div class="vfoot"><button class="btn plain" data-play="${v.v}">${playingVerse === v.v ? I.stop + "Stop" : I.play + "Play"}</button><button class="btn plain" data-loop="${v.v}">${I.loop}Repeat</button><button class="btn plain" data-tr="${v.v}">${I.text}${showTrans.has(v.v) ? "Hide" : "Translate"}</button></div>
      ${showTrans.has(v.v) ? `<p class="translation">${v.en}</p>` : ""}</div>`;
  }).join("") + `</div><aside class="spot" id="spot">${RT ? readerTestCard() : wordCard()}</aside></div>`;
  main().innerHTML = h;
  wireReader(s);
}

function wordCard() {
  if (!selWord) return `<div class="empty"><span class="lt">ٱقْرَأْ</span>Tap a word to hear it and see what it means.</div><div class="actions"><button class="btn primary" id="testW">Test me</button></div>`;
  const w = Object.assign({ key: selWord }, C.words[selWord]); const st = wordState(w);
  const wide = matchMedia("(min-width: 961px)").matches;
  const root = w.root && C.roots[w.root];
  let h = `<div class="spot-top"><span class="pill ${st}">${{ known: "Known", learning: "Learning", new: "New word" }[st]}</span><span class="meta">${w.rank ? "#" + w.rank + " most common" : ""}</span></div>`;
  h += `<button class="whero" id="heroW" aria-label="Hear ${w.tr} again"><span class="ar">${w.ar}</span><span class="tr">${w.tr}<span class="spk">${I.speak}</span></span></button>`;
  h += `<div class="meaning">${w.en}</div><p class="meta" style="margin:0">${w.freq ? "Used " + w.freq.toLocaleString() + " times in the Quran" : ""}</p>`;
  if ((w.parts && w.parts.length) || root) {
    h += `<details class="more"${wide ? " open" : ""}><summary>How it is built and related words</summary>`;
    if (w.parts && w.parts.length) h += `<p class="subhead">How it is built</p><div class="parts">` + joinParts(w.parts).map(p => `<div class="part"><span class="ar">${p[0]}</span><small>${p[2] === "stem" ? w.en.replace(/[()]/g, "") : p[1]}</small></div>`).join("") + `</div>`;
    if (root) h += `<p class="subhead">Same root</p><div class="rootrow"><span class="rootl">${root.letters}</span><span class="meta">${root.total.toLocaleString()} uses in the Quran</span></div><ul class="fam">` +
      root.family.filter(f => f.en).map(f => `<li><span><em>${f.tr || ""}</em> ${f.en} <span class="ct">×${f.count}</span></span><span class="ar">${f.ar}</span></li>`).join("") + `</ul>`;
    h += `</details>`;
  }
  h += `<div class="actions"><button class="btn primary" id="testW">Test me</button></div>`;
  return h;
}
function joinParts(parts) {
  const lastBase = s => { const b = strip(s); return b[b.length - 1]; };
  return parts.map((p, i) => {
    let t = p[0];
    if (i > 0 && !NON_JOINING.includes(lastBase(parts[i - 1][0]))) t = ZWJ + t;
    if (i < parts.length - 1 && !NON_JOINING.includes(lastBase(t))) t = t + ZWJ;
    return [t, p[1], p[2]];
  });
}

function pickWordTarget(n) {
  const ws = surahWords(n).filter(w => w.audio);
  const t = today();
  const byKey = {}; ws.forEach(w => { (byKey[wkey(w)] = byKey[wkey(w)] || []).push(w); });
  let pool = Object.values(byKey).filter(g => { const r = S.words[wkey(g[0])]; return r && r.seen && (!(r.days && r.days.length >= 2) || (r.next || t) <= t); });
  if (RT && RT.target && pool.length > 1) pool = pool.filter(g => wkey(g[0]) !== wkey(RT.target));
  if (!pool.length) return null;
  const g = pool[Math.floor(Math.random() * pool.length)];
  return g[Math.floor(Math.random() * g.length)];
}
function startWordTest() { RT = { right: 0, n: 0 }; nextWordQ(); }
function nextWordQ() {
  const n = S.ui.surah; const target = pickWordTarget(n);
  if (!target) { RT = { empty: true, right: RT.right, n: RT.n }; renderRead(); return; }
  const others = [...new Map(surahWords(n).concat(words()).filter(w => wkey(w) !== wkey(target) && w.en && w.en !== target.en).map(w => [w.en, w])).values()];
  const sameSurah = others.filter(w => surahWords(n).some(x => x.key === w.key));
  const pick = (arr, k) => arr.sort(() => Math.random() - .5).slice(0, k);
  const distract = pick(sameSurah.length >= 2 ? sameSurah : others, 2).map(w => w.en);
  RT = Object.assign(RT, { target, answered: null, empty: false, choices: [target.en, ...distract].sort(() => Math.random() - .5) });
  renderRead();
  const el = document.querySelector(`[data-w="${target.key}"]`); if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
  play(target.audio, null, true);
}
function answerWord(choice) {
  if (!RT || RT.answered) return;
  const ok = choice === RT.target.en; RT.answered = choice; RT.n++; if (ok) RT.right++;
  record(S.words, wkey(RT.target), ok);
  renderRead();
  play(RT.target.audio, null, true);
}
function readerTestCard() {
  if (RT.empty) return `<div class="spot-top"><span class="pill test">Test me</span><span class="meta">${RT.right} of ${RT.n} right</span></div><p class="empty">${RT.n ? "Nothing else due in this surah. Nice work." : "Tap a few words first to hear them and see their meanings. Then test yourself."}</p><div class="actions"><button class="btn" id="doneW">Done</button></div>`;
  const a = RT.answered, t = RT.target;
  return `<div class="spot-top"><span class="pill test">Test me</span><span class="meta">${RT.right} of ${RT.n} right</span></div>
    <div class="testcard"><button class="whero" id="replayW" style="align-items:center" aria-label="Play the word again"><span class="ar">${t.ar}</span><span class="tr">${a ? t.tr : "Tap to hear it again"}<span class="spk">${I.speak}</span></span></button>
    <p class="q">${a ? "" : "What does it mean?"}</p></div>
    <div class="choices">${RT.choices.map(c => `<button class="choice ${a ? (c === t.en ? "right" : c === a ? "wrong" : "") : ""}" data-c="${c.replace(/"/g, "&quot;")}">${c}</button>`).join("")}</div>
    <div class="actions">${a ? `<button class="btn primary" id="nextW">Next</button>` : ""}<button class="btn" id="doneW">Done</button></div>`;
}

function wireReader(s) {
  const $ = id => document.getElementById(id);
  $("backS").onclick = () => { S.ui.surah = null; selWord = null; RT = null; save(); render(); window.scrollTo(0, 0); };
  document.querySelectorAll("[data-gloss]").forEach(b => b.onclick = () => { S.settings.gloss = b.dataset.gloss; save(); renderRead(); });
  document.querySelectorAll("[data-w]").forEach(b => b.onclick = () => {
    const w = Object.assign({ key: b.dataset.w }, C.words[b.dataset.w]);
    if (RT && !RT.empty && !RT.answered) { play(w.audio, null, true); return; }
    if (RT) RT = null;
    selWord = w.key;
    const r = S.words[wkey(w)] || (S.words[wkey(w)] = { days: [], box: 0 }); r.seen = true; if (!r.next) r.next = today(); save();
    renderRead();
    if (w.audio) play(w.audio, null, true); else playVerse(s, b.closest(".verse") && +b.closest(".verse").id.slice(2));
    pulse(document.querySelector(`[data-w="${w.key}"]`));
  });
  document.querySelectorAll("[data-play]").forEach(b => b.onclick = () => { const v = +b.dataset.play; if (playingVerse === v) { play(null); playingVerse = null; renderRead(); } else playVerse(s, v); });
  document.querySelectorAll("[data-loop]").forEach(b => b.onclick = () => playVerse(s, +b.dataset.loop, 3));
  document.querySelectorAll("[data-tr]").forEach(b => b.onclick = () => { const v = +b.dataset.tr; showTrans.has(v) ? showTrans.delete(v) : showTrans.add(v); renderRead(); });
  if ($("heroW")) $("heroW").onclick = () => { const w = C.words[selWord]; if (w.audio) play(w.audio, null, true); pulse($("heroW")); };
  if ($("testW")) $("testW").onclick = startWordTest;
  if ($("replayW")) $("replayW").onclick = () => { play(RT.target.audio, null, true); pulse($("replayW")); };
  document.querySelectorAll("[data-c]").forEach(b => b.onclick = () => answerWord(b.dataset.c));
  if ($("nextW")) $("nextW").onclick = nextWordQ;
  if ($("doneW")) $("doneW").onclick = () => { RT = null; renderRead(); };
}
function playVerse(s, v, times) {
  const verse = s.verses.find(x => x.v === v); if (!verse) return;
  let left = times || 1;
  playingVerse = v; renderRead();
  const go = () => play(verse.audio, () => { left--; if (left > 0 && playingVerse === v) go(); else { playingVerse = null; renderRead(); } }, true);
  go();
}
function openSurah(n) { S.ui.surah = n; selWord = null; RT = null; save(); renderRead(); window.scrollTo(0, 0); }

// ---------- Progress ----------
function renderProgress() {
  const learned = LETTERS.filter(letterLearned).length;
  const ks = knownShare(words());
  const d = new Date(); const dow = (d.getDay() + 6) % 7; // Monday first
  const week = Array.from({ length: 7 }, (_, i) => addDays(today(), i - dow));
  const thisWeek = week.filter(x => S.days.includes(x)).length;
  let h = `<div class="head"><div><p class="eyebrow">Your progress</p><h1 class="title">Progress</h1></div></div>
    <div class="stats"><div class="stat"><b>${learned} of 28</b><span>letters learned</span></div><div class="stat"><b>${ks.known} of ${ks.total}</b><span>words known</span></div>
    <div class="stat"><b>${thisWeek} of 7</b><span>days practiced this week</span><div class="week">${week.map(x => `<i class="${S.days.includes(x) ? "on" : ""}"></i>`).join("")}</div></div></div>`;
  h += `<h2 class="section-title">What you can read</h2>` + surahRows();
  h += `<h2 class="section-title">Settings</h2><div class="settings">
    <div class="setrow"><div class="lbl"><b>Arabic text size</b></div><div class="seg">${[[.88, "Small"], [1, "Medium"], [1.15, "Large"]].map(o => `<button data-size="${o[0]}" aria-pressed="${S.settings.size === o[0]}">${o[1]}</button>`).join("")}</div></div>
    <div class="setrow"><div class="lbl"><b>Quran audio speed</b><span>Slow plays recitation at 75% speed</span></div><div class="seg">${[[1, "Normal"], [.75, "Slow"]].map(o => `<button data-speed="${o[0]}" aria-pressed="${S.settings.speed === o[0]}">${o[1]}</button>`).join("")}</div></div>
    <div class="setrow" style="display:block"><div class="lbl"><b>Back up your progress</b><span>Copy this text somewhere safe. Paste it back here to restore.</span></div>
      <textarea class="backup" id="backup" aria-label="Backup">${JSON.stringify({ letters: S.letters, words: S.words, days: S.days }).replace(/</g, "&lt;")}</textarea>
      <div class="actions" style="margin-top:8px"><button class="btn" id="copyB">Copy</button><button class="btn" id="restoreB">Restore from text</button><button class="btn" id="resetB">Reset</button></div><p class="small" id="bmsg"></p></div>
  </div>
  <p class="credits">Text, word meanings and word audio: Quran.com. Roots and grammar: Quranic Arabic Corpus. Verse recitation: Mahmoud Khalil Al-Husary (EveryAyah). Translation: Saheeh International. Letter names: Abjad-Kids dataset (MIT license); vowel sounds use your device's voice for now.</p>`;
  main().innerHTML = h;
  document.querySelectorAll("[data-surah]").forEach(b => b.onclick = () => { S.ui.view = "read"; openSurah(+b.dataset.surah); syncTabs(); });
  document.querySelectorAll("[data-size]").forEach(b => b.onclick = () => { S.settings.size = +b.dataset.size; save(); applySettings(); renderProgress(); });
  document.querySelectorAll("[data-speed]").forEach(b => b.onclick = () => { S.settings.speed = +b.dataset.speed; save(); renderProgress(); });
  const msg = t => document.getElementById("bmsg").textContent = t;
  document.getElementById("copyB").onclick = async () => { const ta = document.getElementById("backup"); try { await navigator.clipboard.writeText(ta.value); msg("Copied."); } catch (e) { ta.focus(); ta.select(); msg("Selected. Use Copy from the menu."); } };
  document.getElementById("restoreB").onclick = () => { try { const v = JSON.parse(document.getElementById("backup").value); if (!v.letters || !v.words) throw 0; Object.assign(S, { letters: v.letters, words: v.words, days: v.days || [] }); save(); msg("Restored."); renderProgress(); } catch (e) { msg("That text isn't a valid backup. Paste the whole backup and try again."); } };
  let armed = false;
  document.getElementById("resetB").onclick = e => { if (!armed) { armed = true; e.target.textContent = "Tap again to erase everything"; return; } const s = S.settings; S = fresh(); S.settings = s; save(); renderProgress(); };
}

// ---------- Shell ----------
function applySettings() { document.documentElement.style.setProperty("--ar-scale", S.settings.size); }
function syncTabs() { document.querySelectorAll("[role=tab][data-view]").forEach(t => t.setAttribute("aria-selected", t.dataset.view === S.ui.view ? "true" : "false")); }
function renderHome() {
  const learned = LETTERS.filter(letterLearned).length;
  const ks = knownShare(words());
  const current = learned < 28 ? 1 : 3; // stage 2 isn't built yet
  const stages = [
    { n: 1, view: "letters", title: "Learn the letters", desc: "The 28 letters: their sounds and shapes.", stat: learned < 28 ? `Set ${currentSetIndex() + 1} of ${SETS} · ${learned} of 28 letters learned` : "All 28 letters learned", frac: learned / 28 },
    { n: 2, title: "Learn to read", desc: "Vowel marks, joining letters, and sounding out words from your surahs.", stat: learned < 28 ? "Unlocks after the letters" : "Coming soon", locked: true },
    { n: 3, view: "read", title: "Understand the surahs", desc: "Word meanings in Al-Fatiha and the last 15 surahs.", stat: `${ks.known} of ${ks.total} words known`, frac: ks.known / ks.total },
  ];
  let h = `<div class="head"><div><p class="eyebrow">Sahabook</p><h1 class="title">Learn to read and understand the Quran</h1><p class="sub">Three stages, in order. Pick up where you left off.</p></div></div><div class="stages">`;
  h += stages.map(st => `<div class="stage ${st.n === current ? "current" : ""} ${st.locked ? "locked" : ""}" ${st.view ? `data-go="${st.view}" role="button" tabindex="0"` : ""}>
    <p class="snum">Stage ${st.n}${st.n === current ? " · You're here" : ""}</p><h2>${st.title}</h2><p class="sdesc">${st.desc}</p>
    ${st.frac != null ? `<div class="qbar"><span style="width:${(st.frac * 100).toFixed(0)}%"></span></div>` : ""}<p class="meta">${st.stat}</p>
    ${st.n === current ? `<button class="btn primary" data-go="${st.view}">Continue</button>` : ""}</div>`).join("");
  h += `</div>`;
  main().innerHTML = h;
  document.querySelectorAll(".stage[data-go]").forEach(el => {
    const go = () => { S.ui.view = el.dataset.go; LT = null; save(); render(); window.scrollTo(0, 0); };
    el.onclick = go; el.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } };
  });
}
function render() {
  syncTabs();
  if (S.ui.view === "read") renderRead(); else if (S.ui.view === "progress") renderProgress(); else if (S.ui.view === "letters") renderLetters(); else renderHome();
}
document.querySelector(".brand").onclick = () => { S.ui.view = "home"; LT = null; RT = null; save(); render(); window.scrollTo(0, 0); };
document.querySelectorAll("[role=tab][data-view]").forEach(t => t.onclick = () => {
  if (S.ui.view === t.dataset.view && t.dataset.view === "read") { S.ui.surah = null; RT = null; }
  S.ui.view = t.dataset.view; LT = null; save(); render(); window.scrollTo(0, 0);
});
let lastWide = matchMedia("(min-width: 961px)").matches;
window.addEventListener("resize", () => { const w = matchMedia("(min-width: 961px)").matches; if (w !== lastWide) { lastWide = w; render(); } });

(async function boot() {
  load(); S.ui.view = "home"; applySettings();
  try {
    C = await (await fetch("data/content.json")).json();
  } catch (e) {
    main().innerHTML = `<p class="empty">Couldn't load the Quran text. Check your connection and reload.</p>`; return;
  }
  render();
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
})();
