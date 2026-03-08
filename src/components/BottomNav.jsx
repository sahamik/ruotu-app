import Icon from "./Icon";

const TABS = [
  { id:"home",     icon:"bell",     label:"Koti"     },
  { id:"calendar", icon:"calendar", label:"Kalenteri"},
  { id:"finance",  icon:"wallet",   label:"Talous"   },
  { id:"more",     icon:"grid",     label:"Lisää"    },
];

const MORE_ITEMS = [
  { id:"tasks",    icon:"task",     label:"Tehtävät",  color:"#0ea5e9" },
  { id:"savings",  icon:"piggy",    label:"Säästöt",   color:"#14b8a6" },
  { id:"workout",  icon:"dumbbell", label:"Treeni",    color:"#f59e0b" },
  { id:"settings", icon:"gear",     label:"Asetukset", color:"#6b7280" },
];

export default function BottomNav({ tab, setTab, moreMenu, setMoreMenu, theme, badges = {} }) {
  const bgR = parseInt(theme.bg.slice(1,3), 16);
  const bgG = parseInt(theme.bg.slice(3,5), 16);
  const bgB = parseInt(theme.bg.slice(5,7), 16);

  return (
    <>
      {/* "Lisää" drawer */}
      {moreMenu && (
        <div
          style={{ position:"fixed", inset:0, zIndex:150, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(6px)" }}
          onClick={() => setMoreMenu(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ position:"absolute", bottom:80, left:"50%", transform:"translateX(-50%)", width:"calc(100% - 36px)", maxWidth:444, background:"#0c140c", borderRadius:20, padding:"16px 14px", boxShadow:"0 -4px 40px rgba(0,0,0,0.6)" }}
          >
            <p style={{ color:"#4b5563", fontSize:10, fontWeight:800, letterSpacing:"0.1em", textTransform:"uppercase", margin:"0 0 12px 4px" }}>LISÄÄ OSIOITA</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
              {MORE_ITEMS.map(item => {
                const active = tab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setTab(item.id); setMoreMenu(false); }}
                    style={{ background:active?`${item.color}22`:"rgba(255,255,255,0.05)", border:`1.5px solid ${active?item.color:"transparent"}`, borderRadius:14, padding:"14px 8px", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:7 }}
                  >
                    <div style={{ color:active?item.color:"#4b5563" }}><Icon name={item.icon} size={22}/></div>
                    <span style={{ color:active?item.color:"#4b5563", fontSize:11, fontWeight:800 }}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <div style={{
        position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
        width:"100%", maxWidth:480,
        background:`rgba(${bgR},${bgG},${bgB},0.97)`,
        backdropFilter:"blur(24px)",
        borderTop:`1px solid ${theme.primary}14`,
        padding:"8px 8px 18px",
        display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:2,
      }}>
        {TABS.map(t => {
          const badge  = badges[t.id] || 0;
          const active = t.id === "more"
            ? moreMenu || MORE_ITEMS.map(i => i.id).includes(tab)
            : tab === t.id && !moreMenu;
          return (
            <button
              key={t.id}
              onClick={() => {
                if (t.id === "more") { setMoreMenu(m => !m); }
                else { setTab(t.id); setMoreMenu(false); }
              }}
              style={{ background:"transparent", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:"7px 4px", borderRadius:12, position:"relative" }}
            >
              <div style={{ color:active?theme.primary:"#2d3d2d", transition:"color 0.15s" }}>
                <Icon name={t.icon} size={22}/>
              </div>
              <span style={{ color:active?theme.primary:"#2d3d2d", fontSize:9, fontWeight:800, letterSpacing:"0.02em", lineHeight:1 }}>{t.label}</span>
              {badge > 0 && (
                <div style={{ position:"absolute", top:3, right:"18%", background:"#ef4444", borderRadius:"50%", width:14, height:14, display:"flex", alignItems:"center", justifyContent:"center", fontSize:8, fontWeight:800, color:"#fff" }}>{badge}</div>
              )}
              {active && <div style={{ position:"absolute", bottom:-2, width:20, height:2, background:theme.primary, borderRadius:2 }}/>}
            </button>
          );
        })}
      </div>
    </>
  );
}
