import { useState } from "react";
import Icon from "../../components/Icon";
import { Modal, SubTabs, Placeholder, Row, SummaryCard } from "../../components/UI";
import { inp, lbl, btnG, cardS } from "../../components/SharedStyles";
import { today } from "../../utils/helpers";
import TodaySummary from "./TodaySummary";
import WeekView from "./WeekView";

function HomeView({ data, onData, profile, theme, onQuickAdd }) {
  const [homeSub, setHomeSub] = useState("today");
  const ac = theme?.primary||"#10b981";
  return (
    <div>
      {/* Tänään / Viikko toggle */}
      <div style={{display:"flex",gap:4,marginBottom:16,background:"rgba(255,255,255,0.04)",borderRadius:13,padding:4}}>
        {[["today","☀️ Tänään"],["week","📅 Viikko"]].map(([k,l])=>(
          <button key={k} onClick={()=>setHomeSub(k)} style={{flex:1,background:homeSub===k?`linear-gradient(135deg,${ac},${ac}cc)`:"transparent",border:"none",borderRadius:10,padding:"9px 0",color:homeSub===k?"#fff":"#4b5563",cursor:"pointer",fontSize:13,fontWeight:800,transition:"all 0.15s"}}>{l}</button>
        ))}
      </div>
      {homeSub==="today" && <TodaySummary data={data} profile={profile} theme={theme} onData={onData} onQuickAdd={onQuickAdd}/>}
      {homeSub==="week"  && <WeekView data={data} onData={onData} theme={theme} onQuickAdd={onQuickAdd}/>}
    </div>
  );
}

export default HomeView;
