// ─── Vakiot ───────────────────────────────────────────────────────────────────
export const MONTHS_FI    = ["Tammikuu","Helmikuu","Maaliskuu","Huhtikuu","Toukokuu","Kesäkuu","Heinäkuu","Elokuu","Syyskuu","Lokakuu","Marraskuu","Joulukuu"];
export const MONTHS_SHORT = ["Tam","Hel","Maa","Huh","Tou","Kes","Hei","Elo","Syy","Lok","Mar","Jou"];
export const DAYS_FI      = ["Ma","Ti","Ke","To","Pe","La","Su"];
export const PRIO_CLR     = { high:"#ef4444", medium:"#f59e0b", low:"#22c55e" };
export const PRIO_LBL     = { high:"Korkea",  medium:"Normaali", low:"Matala" };
export const ANN_INT      = {
  monthly:   "Kuukausittain",
  quarterly: "Neljännesvuosittain",
  biannual:  "Puolivuosittain",
  annual:    "Vuosittain",
};
export const MUSCLE_GROUPS = [
  "Koko keho","Rintalihas","Selkä","Jalat","Hartiat",
  "Hauikset","Ojentajat","Vatsa","Pakarat","Cardio",
];

export const DEFAULT_CATEGORIES = [
  { id:1,  name:"Ruokakauppa",        color:"#f59e0b", icon:"🛒" },
  { id:2,  name:"Ravintolat",         color:"#fb923c", icon:"🍽️" },
  { id:3,  name:"Kahvilat",           color:"#a16207", icon:"☕" },
  { id:4,  name:"Liikenne",           color:"#0ea5e9", icon:"🚗" },
  { id:5,  name:"Bensa",              color:"#0369a1", icon:"⛽" },
  { id:6,  name:"Julkinen liikenne",  color:"#38bdf8", icon:"🚌" },
  { id:7,  name:"Asuminen",           color:"#f43f5e", icon:"🏠" },
  { id:8,  name:"Sähkö & vesi",       color:"#facc15", icon:"💡" },
  { id:9,  name:"Viihde",             color:"#8b5cf6", icon:"🎬" },
  { id:10, name:"Tilaukset",          color:"#7c3aed", icon:"📺" },
  { id:11, name:"Terveys",            color:"#22c55e", icon:"💊" },
  { id:12, name:"Urheilu & kunto",    color:"#16a34a", icon:"💪" },
  { id:13, name:"Vaatteet",           color:"#ec4899", icon:"👗" },
  { id:14, name:"Elektroniikka",      color:"#64748b", icon:"📱" },
  { id:15, name:"Kauneus & hygienia", color:"#db2777", icon:"🧴" },
  { id:16, name:"Lapset",             color:"#f97316", icon:"🧒" },
  { id:17, name:"Lemmikit",           color:"#84cc16", icon:"🐾" },
  { id:18, name:"Matkailu",           color:"#06b6d4", icon:"✈️" },
  { id:19, name:"Lahjat",             color:"#e879f9", icon:"🎁" },
  { id:20, name:"Koulutus",           color:"#3b82f6", icon:"🎓" },
  { id:21, name:"Säästö & rahasto",   color:"#10b981", icon:"🏦" },
  { id:22, name:"Muut",               color:"#94a3b8", icon:"📦" },
];

// ─── Apufunktiot ──────────────────────────────────────────────────────────────
export const getDIM      = (y, m)    => new Date(y, m + 1, 0).getDate();
export const getFDOM     = (y, m)    => { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; };
export const pad         = (n)       => String(n).padStart(2, "0");
export const dkey        = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
export const today       = ()        => { const n = new Date(); return dkey(n.getFullYear(), n.getMonth(), n.getDate()); };
export const fmt         = (n)       => Number(n).toLocaleString("fi-FI", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const curMonthKey = ()        => { const n = new Date(); return `${n.getFullYear()}-${pad(n.getMonth() + 1)}`; };
export const hexToRgb    = (hex)     => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
};

export function getGreeting(name) {
  const h = new Date().getHours();
  const n = name ? `, ${name}` : "";
  if (h >= 5  && h < 11) return `Hyvää huomenta${n} ☀️`;
  if (h >= 11 && h < 17) return `Hyvää päivää${n} 👋`;
  if (h >= 17 && h < 22) return `Hyvää iltaa${n} 🌙`;
  return `Hyvää yötä${n} 🌟`;
}
