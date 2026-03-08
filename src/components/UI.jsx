import Icon from "./Icon";
import { hexToRgb } from "../utils/helpers";

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div
      style={{ position:"fixed", inset:0, zIndex:200, display:"flex", alignItems:"flex-end", justifyContent:"center", background:"rgba(0,0,0,0.65)", backdropFilter:"blur(6px)" }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background:"#0c140c", borderRadius:"24px 24px 0 0", width:"100%", maxWidth:480, padding:"26px 22px 44px", boxShadow:"0 -8px 60px rgba(0,0,0,0.7)", maxHeight:"92vh", overflowY:"auto" }}
      >
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <h3 style={{ color:"#f1f5f9", fontSize:17, fontWeight:800, fontFamily:"'Syne',serif", margin:0 }}>{title}</h3>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.07)", border:"none", borderRadius:10, padding:"6px 8px", color:"#6b7280", cursor:"pointer" }}>
            <Icon name="close" size={17} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── SubTabs ──────────────────────────────────────────────────────────────────
export function SubTabs({ tabs, value, onChange, color = "#10b981" }) {
  return (
    <div style={{ display:"flex", gap:5, marginBottom:16, overflowX:"auto", paddingBottom:3 }}>
      {tabs.map(([k, v]) => (
        <button
          key={k}
          onClick={() => onChange(k)}
          style={{
            background: value === k ? `linear-gradient(135deg,${color},${color}bb)` : "rgba(255,255,255,0.05)",
            border: "none", borderRadius:9, padding:"7px 13px",
            color: value === k ? "#fff" : "#4b5563",
            cursor: "pointer", fontSize:11, fontWeight:800,
            whiteSpace: "nowrap", flexShrink:0,
          }}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

// ─── Pienet apukomponentit ────────────────────────────────────────────────────
export function Placeholder({ text }) {
  return <div style={{ textAlign:"center", color:"#374151", padding:"36px 0", fontSize:13 }}>{text}</div>;
}

export function Row({ color, children }) {
  return <div style={{ color, fontSize:12, padding:"3px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>{children}</div>;
}

export function SummaryCard({ color, title, icon: iconName, children }) {
  return (
    <div style={{ background:`rgba(${hexToRgb(color)},0.07)`, border:`1px solid rgba(${hexToRgb(color)},0.18)`, borderRadius:15, padding:"13px 15px", marginBottom:11 }}>
      <p style={{ color, fontWeight:800, fontSize:12, margin:"0 0 8px", display:"flex", alignItems:"center", gap:7 }}>
        {iconName && <Icon name={iconName} size={14} />}
        {title}
      </p>
      {children}
    </div>
  );
}
