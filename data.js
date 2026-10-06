// Temporització curs 2026-27, transcrita de la imatge del professorat.
// Format: data -> { projecte: hores }. Els dies que no surten no tenen classe.
// Si alguna dada està malament, es pot corregir des de la web (Editar hores del dia).

const PROJECTS = [
  { id: "portfoli", name: "Portfoli", color: "#7c5cff" },
  { id: "noves", name: "Noves tecs", color: "#0ea5e9" },
  { id: "30xtu", name: "30xTu", color: "#14b8a6" },
  { id: "monart", name: "Monar'T", color: "#f59e0b" },
  { id: "equips", name: "Equips", color: "#84cc16" },
  { id: "publi", name: "Publi", color: "#ef4444" },
  { id: "llancament", name: "Llançament", color: "#ec4899" },
  { id: "jpo", name: "JPO", color: "#6366f1" },
];

const COURSE_START = "2026-09-14";
const COURSE_END = "2027-05-21";

// Dies festius (columnes grogues) i vacances.
const HOLIDAYS = [
  "2026-10-12", "2026-10-29", "2026-10-30",
  "2026-12-07", "2026-12-08",
  "2027-02-05", "2027-02-08",
  "2027-05-17",
];

const SCHEDULE = {
  // ── Setembre
  "2026-09-14": { publi: 6 }, "2026-09-15": { publi: 4 }, "2026-09-16": { publi: 3 },
  "2026-09-17": { noves: 3 }, "2026-09-18": { noves: 3 },
  "2026-09-21": { publi: 6 }, "2026-09-22": { publi: 4 }, "2026-09-23": { publi: 3 },
  "2026-09-24": { monart: 3 }, "2026-09-25": { noves: 3 },
  "2026-09-28": { publi: 6 }, "2026-09-29": { publi: 4 }, "2026-09-30": { publi: 3 },
  // ── Octubre
  "2026-10-01": { noves: 3 }, "2026-10-02": { noves: 3 },
  "2026-10-05": { publi: 6 }, "2026-10-06": { publi: 4 }, "2026-10-07": { publi: 3 },
  "2026-10-08": { noves: 3 }, "2026-10-09": { noves: 3 },
  "2026-10-13": { publi: 4 }, "2026-10-14": { publi: 3 },
  "2026-10-15": { monart: 3 }, "2026-10-16": { noves: 3 },
  "2026-10-19": { publi: 6 }, "2026-10-20": { publi: 4 }, "2026-10-21": { publi: 3 },
  "2026-10-22": { noves: 3 }, "2026-10-23": { noves: 3 },
  "2026-10-26": { noves: 3 }, "2026-10-27": { publi: 4 }, "2026-10-28": { publi: 3 },
  // ── Novembre
  "2026-11-02": { publi: 6 }, "2026-11-03": { equips: 4 }, "2026-11-04": { equips: 3 },
  "2026-11-05": { noves: 3 }, "2026-11-06": { noves: 3 },
  "2026-11-09": { equips: 6 }, "2026-11-10": { equips: 4 }, "2026-11-11": { equips: 3 },
  "2026-11-12": { noves: 3 }, "2026-11-13": { noves: 3 },
  "2026-11-16": { equips: 6 }, "2026-11-17": { jpo: 4 }, "2026-11-18": { jpo: 3 },
  "2026-11-19": { "30xtu": 3 }, "2026-11-20": { "30xtu": 3 },
  "2026-11-23": { jpo: 6 }, "2026-11-24": { jpo: 4 }, "2026-11-25": { jpo: 3 },
  "2026-11-26": { "30xtu": 3 }, "2026-11-27": { "30xtu": 3 },
  "2026-11-30": { jpo: 6 },
  // ── Desembre
  "2026-12-01": { jpo: 4 }, "2026-12-02": { jpo: 3 },
  "2026-12-03": { "30xtu": 3 }, "2026-12-04": { monart: 3 },
  "2026-12-09": { jpo: 3 }, "2026-12-10": { monart: 3 }, "2026-12-11": { monart: 3 },
  "2026-12-14": { jpo: 6 }, "2026-12-15": { jpo: 4 }, "2026-12-16": { jpo: 3 },
  "2026-12-17": { monart: 3 }, "2026-12-18": { monart: 3 },
  "2026-12-21": { jpo: 3 }, // a la imatge posa "3?"
  // ── Gener
  "2027-01-08": { portfoli: 1, monart: 2 },
  "2027-01-11": { jpo: 6 }, "2027-01-12": { jpo: 4 }, "2027-01-13": { jpo: 3 },
  "2027-01-14": { monart: 3 }, "2027-01-15": { portfoli: 1, monart: 2 },
  "2027-01-18": { jpo: 6 }, "2027-01-19": { jpo: 4 }, "2027-01-20": { jpo: 3 },
  "2027-01-21": { monart: 3 }, "2027-01-22": { portfoli: 1, monart: 2 },
  "2027-01-25": { jpo: 6 }, "2027-01-26": { jpo: 4 }, "2027-01-27": { jpo: 3 },
  "2027-01-28": { monart: 3 }, "2027-01-29": { portfoli: 1, monart: 2 },
  // ── Febrer
  "2027-02-01": { jpo: 6 }, "2027-02-02": { jpo: 4 }, "2027-02-03": { jpo: 3 },
  "2027-02-04": { monart: 3 },
  "2027-02-09": { llancament: 4 }, "2027-02-10": { llancament: 3 },
  "2027-02-11": { monart: 3 }, "2027-02-12": { portfoli: 1, monart: 2 },
  "2027-02-15": { llancament: 6 }, "2027-02-16": { llancament: 4 }, "2027-02-17": { llancament: 3 },
  "2027-02-18": { monart: 3 }, "2027-02-19": { portfoli: 1, monart: 2 },
  "2027-02-22": { llancament: 6 }, "2027-02-23": { llancament: 4 }, "2027-02-24": { llancament: 3 },
  "2027-02-25": { monart: 3 }, "2027-02-26": { portfoli: 1, monart: 2 },
  // ── Març
  "2027-03-01": { publi: 3, llancament: 3 }, "2027-03-02": { llancament: 4 }, "2027-03-03": { llancament: 3 },
  "2027-03-04": { monart: 3 }, "2027-03-05": { portfoli: 1, monart: 2 },
  "2027-03-08": { publi: 2, llancament: 4 }, "2027-03-09": { llancament: 4 }, "2027-03-10": { llancament: 3 },
  "2027-03-11": { monart: 3 }, "2027-03-12": { portfoli: 1, monart: 2 },
  "2027-03-15": { llancament: 6 }, "2027-03-16": { llancament: 4 }, "2027-03-17": { llancament: 3 },
  "2027-03-18": { monart: 3 }, "2027-03-19": { portfoli: 1, monart: 2 },
  "2027-03-30": { llancament: 4 }, "2027-03-31": { llancament: 3 },
  // ── Abril
  "2027-04-01": { monart: 3 }, "2027-04-02": { portfoli: 1, monart: 2 },
  "2027-04-05": { llancament: 6 }, "2027-04-06": { llancament: 4 }, "2027-04-07": { llancament: 3 },
  "2027-04-08": { monart: 3 }, "2027-04-09": { portfoli: 1, monart: 2 },
  "2027-04-12": { llancament: 6 }, "2027-04-13": { llancament: 4 }, "2027-04-14": { llancament: 3 },
  "2027-04-15": { monart: 3 }, "2027-04-16": { portfoli: 1, monart: 2 },
  "2027-04-19": { llancament: 6 }, "2027-04-20": { llancament: 4 }, "2027-04-21": { llancament: 3 },
  "2027-04-22": { monart: 3 }, "2027-04-23": { portfoli: 1, monart: 2 },
  "2027-04-26": { llancament: 6 }, "2027-04-27": { llancament: 4 }, "2027-04-28": { llancament: 3 },
  "2027-04-29": { "30xtu": 3 }, "2027-04-30": { portfoli: 1, monart: 2 },
  // ── Maig
  "2027-05-03": { llancament: 6 }, "2027-05-04": { llancament: 4 }, "2027-05-05": { llancament: 3 },
  "2027-05-06": { monart: 3 }, "2027-05-07": { portfoli: 1, monart: 2 },
  "2027-05-10": { llancament: 6 }, "2027-05-11": { jpo: 4 }, "2027-05-12": { jpo: 3 },
  "2027-05-13": { monart: 3 }, "2027-05-14": { portfoli: 1, monart: 2 },
  "2027-05-18": { llancament: 2, jpo: 2 }, "2027-05-19": { llancament: 3 },
  "2027-05-20": { monart: 3 }, "2027-05-21": { monart: 2 },
};
