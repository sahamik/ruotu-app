export const THEMES = [
  { id:"green",  name:"Vihreä",   primary:"#10b981", secondary:"#059669", bg:"#080d08", cardBg:"rgba(16,185,129,0.06)",  headerBg:"rgba(16,185,129,0.06)"  },
  { id:"blue",   name:"Sininen",  primary:"#3b82f6", secondary:"#2563eb", bg:"#080d12", cardBg:"rgba(59,130,246,0.06)",  headerBg:"rgba(59,130,246,0.06)"  },
  { id:"purple", name:"Violetti", primary:"#8b5cf6", secondary:"#7c3aed", bg:"#0d0812", cardBg:"rgba(139,92,246,0.06)", headerBg:"rgba(139,92,246,0.06)"  },
  { id:"red",   name:"Punainen",    primary:"#f43f5e", secondary:"#e11d48", bg:"#120808", cardBg:"rgba(244,63,94,0.06)",   headerBg:"rgba(244,63,94,0.06)"   },
  { id:"amber",  name:"Kulta",    primary:"#f59e0b", secondary:"#d97706", bg:"#0d0b05", cardBg:"rgba(245,158,11,0.06)",  headerBg:"rgba(245,158,11,0.06)"  },
  { id:"cyan",   name:"Syaani",   primary:"#06b6d4", secondary:"#0891b2", bg:"#05100d", cardBg:"rgba(6,182,212,0.06)",   headerBg:"rgba(6,182,212,0.06)"   },
];

export const getTheme = (id) => THEMES.find(t => t.id === id) ?? THEMES[0];
