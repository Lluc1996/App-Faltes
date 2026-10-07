const STORAGE_KEY = "faltes-v1";
const LIMIT = 0.15;
const LATES_PER_ABSENCE = 3;
const PROJ = Object.fromEntries(PROJECTS.map((p) => [p.id, p]));
const WEEKDAYS = ["Dll", "Dm", "Dx", "Dj", "Dv"];

// ── Estat (absences: data -> projecte -> {hours, lates}; overrides: data -> {projecte: hores})
let state = load();

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (s && s.absences && s.overrides) return s;
  } catch (e) {}
  return { absences: {}, overrides: {} };
}
function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  render();
}

// ── Dates
const toKey = (d) => d.toISOString().slice(0, 10);
const fromKey = (k) => new Date(k + "T00:00:00Z");
const todayKey = (() => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
})();
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const fmtLong = (k) => cap(fromKey(k).toLocaleDateString("ca-ES", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }));
const fmtShort = (k) => fromKey(k).toLocaleDateString("ca-ES", { day: "numeric", month: "short", timeZone: "UTC" });

function daySchedule(key) {
  return state.overrides[key] || SCHEDULE[key] || {};
}
function allDays() {
  return [...new Set([...Object.keys(SCHEDULE), ...Object.keys(state.overrides)])].sort();
}

// ── Càlcul per projecte
function computeStats() {
  const stats = Object.fromEntries(PROJECTS.map((p) => [p.id, { total: 0, done: 0, hours: 0, lates: 0 }]));
  for (const key of allDays()) {
    for (const [pid, h] of Object.entries(daySchedule(key))) {
      if (!stats[pid]) continue;
      stats[pid].total += h;
      if (key <= todayKey) stats[pid].done += h;
    }
  }
  for (const [key, day] of Object.entries(state.absences)) {
    for (const [pid, a] of Object.entries(day)) {
      if (!stats[pid]) continue;
      stats[pid].hours += a.hours || 0;
      stats[pid].lates += a.lates || 0;
    }
  }
  for (const s of Object.values(stats)) {
    s.missed = s.hours + Math.floor(s.lates / LATES_PER_ABSENCE);
    s.limit = s.total * LIMIT;
    s.left = s.limit - s.missed;
    s.pct = s.total ? (s.missed / s.total) * 100 : 0;
    s.level = s.missed >= s.limit && s.total ? "bad" : s.missed >= s.limit * 0.6 ? "warn" : "ok";
  }
  return stats;
}

const n1 = (x) => (Math.round(x * 10) / 10).toLocaleString("ca-ES");

// ── Render
function render() {
  const stats = computeStats();
  renderGlobal(stats);
  renderCards(stats);
  renderCalendar();
  renderLog();
}

function renderGlobal(stats) {
  const missed = Object.values(stats).reduce((a, s) => a + s.missed, 0);
  const worst = Object.entries(stats).filter(([, s]) => s.total).sort((a, b) => b[1].missed / b[1].limit - a[1].missed / a[1].limit)[0];
  document.getElementById("global").innerHTML =
    `<strong>${n1(missed)} h</strong>faltades en total` +
    (worst && worst[1].missed ? `<br>Més a prop del límit: ${PROJ[worst[0]].name}` : "");
}

function renderCards(stats) {
  document.getElementById("cards").innerHTML = PROJECTS.map((p) => {
    const s = stats[p.id];
    const fill = s.limit ? Math.min(100, (s.missed / s.limit) * 100) : 0;
    const leftTxt = s.left >= 0 ? `${n1(s.left)} h` : `+${n1(-s.left)} h passat`;
    return `<article class="card">
      <div class="card-head">
        <span class="dot" style="background:${p.color}"></span>
        <span class="card-name">${p.name}</span>
        <span class="pct ${s.level}">${n1(s.pct)}%</span>
      </div>
      <div class="bar" title="Ús del 15% permès"><span class="bg-${s.level}" style="width:${fill}%"></span></div>
      <div class="stats">
        <span>Faltades <b>${n1(s.missed)} / ${n1(s.limit)} h</b></span>
        <span>Et queden <b class="${s.level}">${leftTxt}</b></span>
        <span>Projecte <b>${s.total} h</b></span>
        <span>Retards <b>${s.lates}</b>${s.lates % LATES_PER_ABSENCE ? ` (${s.lates % LATES_PER_ABSENCE}/3)` : ""}</span>
      </div>
    </article>`;
  }).join("");
}

function renderCalendar() {
  const start = fromKey(COURSE_START);
  const end = fromKey(COURSE_END);
  const months = [];
  for (let d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1)); d <= end; d.setUTCMonth(d.getUTCMonth() + 1)) {
    months.push(new Date(d));
  }
  document.getElementById("calendar").innerHTML = months.map(renderMonth).join("");
}

function renderMonth(first) {
  const y = first.getUTCFullYear(), m = first.getUTCMonth();
  const label = cap(first.toLocaleDateString("ca-ES", { month: "long", timeZone: "UTC" })) + " " + y;
  const cells = [];
  const offset = (first.getUTCDay() + 6) % 7; // 0 = dilluns
  if (offset < 5) for (let i = 0; i < offset; i++) cells.push(`<div class="cell empty"></div>`);
  for (let d = new Date(first); d.getUTCMonth() === m; d.setUTCDate(d.getUTCDate() + 1)) {
    const wd = (d.getUTCDay() + 6) % 7;
    if (wd > 4) continue;
    cells.push(renderDay(toKey(d)));
  }
  return `<div class="month"><h3>${label}</h3><div class="grid">
    ${WEEKDAYS.map((w) => `<div class="wd">${w}</div>`).join("")}
    ${cells.join("")}
  </div></div>`;
}

function renderDay(key) {
  const day = +key.slice(8);
  const sched = daySchedule(key);
  const ids = Object.keys(sched).filter((pid) => sched[pid] > 0);
  const todayCls = key === todayKey ? " today" : "";
  if (HOLIDAYS.includes(key) && !state.overrides[key]) {
    return `<div class="cell holiday${todayCls}"><span class="num">${day}</span><span class="tag" style="color:inherit">Festiu</span></div>`;
  }
  const abs = state.absences[key] || {};
  const missedH = Object.values(abs).reduce((a, x) => a + (x.hours || 0), 0);
  const lates = Object.values(abs).reduce((a, x) => a + (x.lates || 0), 0);
  const tag = [missedH ? `−${missedH}h` : "", lates ? `${lates}R` : ""].filter(Boolean).join(" ");
  const cls = ids.length ? "" : " none";
  const chips = ids.map((pid) => {
    const p = PROJ[pid];
    const full = abs[pid] && abs[pid].hours >= sched[pid];
    return `<span class="chip${full ? " x" : ""}" style="background:${p.color}">${p.name} ${sched[pid]}h</span>`;
  }).join("");
  return `<button type="button" class="cell${cls}${todayCls}${tag ? " missed" : ""}" data-day="${key}">
    <span class="num">${day}<span class="tag">${tag}</span></span>${chips}</button>`;
}

function renderLog() {
  const rows = [];
  for (const key of Object.keys(state.absences).sort().reverse()) {
    for (const [pid, a] of Object.entries(state.absences[key])) {
      const p = PROJ[pid];
      if (!p) continue;
      const parts = [a.hours ? `${a.hours} h de falta` : "", a.lates ? `${a.lates} retard${a.lates > 1 ? "s" : ""}` : ""].filter(Boolean).join(" · ");
      rows.push(`<div class="log-row"><span class="d">${fmtShort(key)}</span>
        <span class="p"><span class="dot" style="background:${p.color}"></span>${p.name} — ${parts}</span>
        <button class="link" data-open="${key}">Editar</button></div>`);
    }
  }
  document.getElementById("log").innerHTML = rows.length
    ? `<div class="log">${rows.join("")}</div>`
    : `<p class="empty-msg">Encara no has apuntat cap falta.</p>`;
}

// ── Diàleg d'un dia
const dlg = document.getElementById("day");
let openKey = null;

function openDay(key) {
  openKey = key;
  document.getElementById("day-title").textContent = fmtLong(key);
  renderDayBody();
  renderDayEdit();
  dlg.querySelector("details").open = false;
  dlg.showModal();
}

function getAbs(key, pid) {
  return (state.absences[key] && state.absences[key][pid]) || { hours: 0, lates: 0 };
}
function setAbs(key, pid, patch) {
  const a = { ...getAbs(key, pid), ...patch };
  state.absences[key] = state.absences[key] || {};
  if (!a.hours && !a.lates) delete state.absences[key][pid];
  else state.absences[key][pid] = a;
  if (!Object.keys(state.absences[key]).length) delete state.absences[key];
  save();
  renderDayBody();
}

function renderDayBody() {
  const sched = daySchedule(openKey);
  const ids = Object.keys(sched).filter((pid) => sched[pid] > 0);
  const body = document.getElementById("day-body");
  if (!ids.length) {
    body.innerHTML = `<p class="empty-msg">Aquest dia no hi ha classe. Si n'hi ha, afegeix les hores a sota.</p>`;
    return;
  }
  body.innerHTML = ids.map((pid) => {
    const p = PROJ[pid], h = sched[pid], a = getAbs(openKey, pid);
    return `<div class="proj">
      <div class="proj-head"><span class="dot" style="background:${p.color}"></span><b>${p.name}</b><span class="h">${h} h de classe</span></div>
      <div class="ctrl"><span>Hores faltades</span>
        <span class="step">
          <button type="button" data-act="h-" data-p="${pid}">−</button>
          <output>${a.hours}</output>
          <button type="button" data-act="h+" data-p="${pid}">+</button>
          <button type="button" class="btn ghost" data-act="hall" data-p="${pid}">${a.hours >= h ? "Treure" : "Tot"}</button>
        </span></div>
      <div class="ctrl"><span>Retards</span>
        <span class="step">
          <button type="button" data-act="l-" data-p="${pid}">−</button>
          <output>${a.lates}</output>
          <button type="button" data-act="l+" data-p="${pid}">+</button>
        </span></div>
    </div>`;
  }).join("");
}

function renderDayEdit() {
  const sched = daySchedule(openKey);
  document.getElementById("day-edit").innerHTML = `<div class="edit-grid">${PROJECTS.map((p) =>
    `<label for="e-${p.id}"><span class="dot" style="background:${p.color};display:inline-block;margin-right:6px"></span>${p.name}</label>
     <input id="e-${p.id}" type="number" min="0" max="8" step="1" value="${sched[p.id] || 0}">`).join("")}</div>`;
}

document.getElementById("day-body").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-act]");
  if (!b) return;
  const pid = b.dataset.p, h = daySchedule(openKey)[pid], a = getAbs(openKey, pid);
  const act = b.dataset.act;
  if (act === "h+") setAbs(openKey, pid, { hours: Math.min(h, a.hours + 1) });
  if (act === "h-") setAbs(openKey, pid, { hours: Math.max(0, a.hours - 1) });
  if (act === "hall") setAbs(openKey, pid, { hours: a.hours >= h ? 0 : h });
  if (act === "l+") setAbs(openKey, pid, { lates: a.lates + 1 });
  if (act === "l-") setAbs(openKey, pid, { lates: Math.max(0, a.lates - 1) });
});

document.getElementById("edit-save").addEventListener("click", () => {
  const o = {};
  for (const p of PROJECTS) {
    const v = Math.max(0, Math.round(+document.getElementById(`e-${p.id}`).value || 0));
    if (v) o[p.id] = v;
  }
  state.overrides[openKey] = o;
  // Les faltes no poden superar les hores noves
  const abs = state.absences[openKey] || {};
  for (const pid of Object.keys(abs)) abs[pid].hours = Math.min(abs[pid].hours, o[pid] || 0);
  save();
  renderDayBody();
});
document.getElementById("edit-reset").addEventListener("click", () => {
  delete state.overrides[openKey];
  save();
  renderDayBody();
  renderDayEdit();
});

// ── Obrir dies
document.getElementById("calendar").addEventListener("click", (e) => {
  const c = e.target.closest("[data-day]");
  if (c) openDay(c.dataset.day);
});
document.getElementById("log").addEventListener("click", (e) => {
  const b = e.target.closest("[data-open]");
  if (b) openDay(b.dataset.open);
});

// ── Còpia de seguretat (text) / esborrar
const msg = (t) => { document.getElementById("msg").textContent = t; };
const backup = document.getElementById("backup");

document.getElementById("export").addEventListener("click", () => {
  backup.value = JSON.stringify(state);
  backup.select();
  if (navigator.clipboard) {
    navigator.clipboard.writeText(backup.value)
      .then(() => msg("Còpia copiada. Guarda-la en una nota."))
      .catch(() => msg("Selecciona el text i copia'l."));
  } else msg("Selecciona el text i copia'l.");
});
document.getElementById("import").addEventListener("click", () => {
  try {
    const s = JSON.parse(backup.value);
    if (!s.absences || !s.overrides) throw new Error();
    state = s;
    save();
    msg("Còpia restaurada.");
  } catch (err) {
    msg("Aquest text no és una còpia vàlida. Enganxa el text que vas copiar.");
  }
});
let resetArmed = null;
document.getElementById("reset").addEventListener("click", (e) => {
  if (resetArmed) {
    clearTimeout(resetArmed);
    resetArmed = null;
    e.target.textContent = "Esborrar-ho tot";
    state = { absences: {}, overrides: {} };
    save();
    msg("Tot esborrat.");
    return;
  }
  e.target.textContent = "Toca de nou per confirmar";
  resetArmed = setTimeout(() => { resetArmed = null; e.target.textContent = "Esborrar-ho tot"; }, 4000);
});

render();
