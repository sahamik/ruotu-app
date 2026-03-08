import { useState } from "react";
import Icon from "../../components/Icon";
import { Modal, SubTabs, Placeholder, Row, SummaryCard } from "../../components/UI";
import { inp, lbl, btnG, cardS } from "../../components/SharedStyles";
import { MONTHS_FI, DAYS_FI, getDIM, getFDOM, dkey, today, pad } from "../../utils/helpers";

// ══════════════════════════════════════════════════════════════════════════════
// CALENDAR
// ══════════════════════════════════════════════════════════════════════════════
const NOTIF_OPTIONS = [
  { key:"7d",  label:"7 pv ennen",  days:7  },
  { key:"2d",  label:"2 pv ennen",  days:2  },
  { key:"1d",  label:"Päivää ennen",days:1  },
  { key:"0d",  label:"Päivänä itse",days:0  },
];

function daysUntilBday(dateStr) {
  const [,bm,bd] = dateStr.split("-");
  const now = new Date(); now.setHours(0,0,0,0);
  const next = new Date(now.getFullYear(), parseInt(bm)-1, parseInt(bd));
  if (next < now) next.setFullYear(now.getFullYear()+1);
  return Math.round((next - now) / (1000*60*60*24));
}

function CalendarView({ data, onAddEvent, onDeleteEvent, notifStatus }) {
  const now = new Date();
  const [year,setYear]   = useState(now.getFullYear());
  const [month,setMonth] = useState(now.getMonth());
  const [selected,setSelected] = useState(today());
  const [calSub,setCalSub]     = useState("events"); // "events" | "birthdays"
  const [showAdd,setShowAdd]   = useState(false);
  const [showBday,setShowBday] = useState(false);
  const [editBday,setEditBday] = useState(null); // birthday being edited for notifs
  const [form,setForm] = useState({ title:"",time:"",type:"event",note:"" });
  const [bdayForm,setBdayForm] = useState({ name:"",date:"",note:"",reminders:["7d","1d"] });

  const dim=getDIM(year,month), fd=getFDOM(year,month), todayStr=today();
  const typeColors = { event:"#7c3aed", task:"#0ea5e9", reminder:"#f59e0b", birthday:"#ec4899" };
  const typeLabels = { event:"Tapahtuma", task:"Tehtävä", reminder:"Muistutus", birthday:"Syntymäpäivä" };

  // Map birthdays onto calendar year (repeat annually)
  const bdayItems = data.birthdays.map(b => {
    const [,bm,bd] = b.date.split("-");
    return { ...b, date: dkey(year, parseInt(bm)-1, parseInt(bd)), _type:"birthday" };
  });
  const allItems = [
    ...data.events.map(e=>({...e,_type:"event"})),
    ...data.tasks.filter(t=>t.date).map(t=>({...t,_type:"task"})),
    ...data.reminders.map(r=>({...r,_type:"reminder"})),
    ...bdayItems,
  ];
  function ifd(dk) { return allItems.filter(i=>i.date===dk); }
  function prevM(){ if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1); }
  function nextM(){ if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1); }

  function addEvent() {
    if(!form.title.trim()) return;
    onAddEvent(form.type, {id:Date.now(),title:form.title,date:selected,time:form.time,note:form.note});
    setForm({title:"",time:"",type:"event",note:""});
    setShowAdd(false);
  }

  function addBirthday() {
    if(!bdayForm.name.trim()||!bdayForm.date) return;
    onAddEvent("birthday", {id:Date.now(),name:bdayForm.name,date:bdayForm.date,note:bdayForm.note,reminders:bdayForm.reminders});
    setBdayForm({name:"",date:"",note:"",reminders:["7d","1d"]});
    setShowBday(false);
  }

  function toggleReminderOption(key) {
    setBdayForm(f => ({
      ...f,
      reminders: f.reminders.includes(key)
        ? f.reminders.filter(r=>r!==key)
        : [...f.reminders, key]
    }));
  }

  function saveNotifSettings(b, reminders) {
    // update birthday reminders in place
    onAddEvent && onDeleteEvent && (() => {
      onDeleteEvent("birthday", b.id);
      onAddEvent("birthday", {...b, reminders});
    })();
    setEditBday(null);
  }

  const selItems = ifd(selected);
  const [sy,sm,sd] = selected.split("-");
  const selLabel = `${parseInt(sd)}. ${MONTHS_FI[parseInt(sm)-1]} ${sy}`;

  // Upcoming birthdays for the side list
  const sortedBdays = [...data.birthdays].sort((a,b)=>daysUntilBday(a.date)-daysUntilBday(b.date));

  return (
    <div>
      {/* Month nav */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <button onClick={prevM} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:9,padding:"7px 10px",color:"#6b7280",cursor:"pointer"}}><Icon name="chevL" size={18}/></button>
        <span style={{color:"#f1f5f9",fontFamily:"'Syne',serif",fontSize:19,fontWeight:800}}>{MONTHS_FI[month]} {year}</span>
        <button onClick={nextM} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:9,padding:"7px 10px",color:"#6b7280",cursor:"pointer"}}><Icon name="chevR" size={18}/></button>
      </div>

      {/* Day grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:3}}>
        {DAYS_FI.map(d=><div key={d} style={{textAlign:"center",color:"#374151",fontSize:10,fontWeight:800,padding:"4px 0"}}>{d}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:16}}>
        {Array.from({length:fd}).map((_,i)=><div key={`e${i}`}/>)}
        {Array.from({length:dim}).map((_,i)=>{
          const d=i+1, dk=dkey(year,month,d), isT=dk===todayStr, isSel=dk===selected, dots=ifd(dk);
          return (
            <button key={d} onClick={()=>setSelected(dk)} style={{background:isSel?"linear-gradient(135deg,#10b981,#059669)":isT?"rgba(16,185,129,0.12)":"rgba(255,255,255,0.03)",border:isT&&!isSel?"1.5px solid #10b981":"1.5px solid transparent",borderRadius:9,padding:"7px 3px 5px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
              <span style={{color:isSel?"#fff":isT?"#6ee7b7":"#9ca3af",fontSize:12,fontWeight:isT||isSel?800:400}}>{d}</span>
              {dots.length>0&&<div style={{display:"flex",gap:2,justifyContent:"center"}}>{dots.slice(0,3).map((it,ii)=><div key={ii} style={{width:4,height:4,borderRadius:"50%",background:typeColors[it._type]}}/>)}</div>}
            </button>
          );
        })}
      </div>

      {/* Sub-tabs: Tapahtumat / Syntymäpäivät */}
      <SubTabs tabs={[["events","📅 Tapahtumat"],["birthdays","🎂 Syntymäpäivät"]]} value={calSub} onChange={setCalSub}/>

      {/* ── EVENTS TAB ── */}
      {calSub==="events"&&<div>
        <div style={{background:"rgba(255,255,255,0.03)",borderRadius:15,padding:15}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:11}}>
            <span style={{color:"#f1f5f9",fontWeight:800,fontSize:14}}>{selLabel}</span>
            <button onClick={()=>setShowAdd(true)} style={{background:"linear-gradient(135deg,#10b981,#059669)",border:"none",borderRadius:9,padding:"6px 11px",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",gap:5,fontSize:12,fontWeight:800}}><Icon name="plus" size={14}/> Lisää</button>
          </div>
          {selItems.length===0
            ? <p style={{color:"#374151",fontSize:13,textAlign:"center",margin:"10px 0"}}>Ei merkintöjä tälle päivälle</p>
            : selItems.map(item=>(
              <div key={item.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 11px",background:"rgba(255,255,255,0.04)",borderRadius:10,marginBottom:7,borderLeft:`3px solid ${typeColors[item._type]}`}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
                    <span style={{color:"#f1f5f9",fontSize:13,fontWeight:700}}>{item.title||item.name}</span>
                    <span style={{background:typeColors[item._type]+"22",color:typeColors[item._type],fontSize:9,fontWeight:800,padding:"1px 6px",borderRadius:4}}>{typeLabels[item._type]}</span>
                  </div>
                  {item.time&&<span style={{color:"#4b5563",fontSize:11}}>{item.time}</span>}
                </div>
                <button onClick={()=>onDeleteEvent(item._type,item.id)} style={{background:"rgba(239,68,68,0.1)",border:"none",borderRadius:7,padding:"5px",color:"#ef4444",cursor:"pointer"}}><Icon name="trash" size={13}/></button>
              </div>
            ))
          }
        </div>
      </div>}

      {/* ── BIRTHDAYS TAB ── */}
      {calSub==="birthdays"&&<div>
        <button onClick={()=>setShowBday(true)} style={{...btnG("#ec4899","#db2777"),marginBottom:14,display:"flex",alignItems:"center",justifyContent:"center",gap:7}}><Icon name="plus" size={17}/> Lisää syntymäpäivä</button>

        {/* Notification status note */}
        {notifStatus!=="granted"&&<div style={{background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:11,padding:"10px 13px",marginBottom:12,display:"flex",gap:9,alignItems:"center"}}>
          <span style={{fontSize:16}}>🔔</span>
          <p style={{color:"#fbbf24",fontSize:11,margin:0}}>Salli ilmoitukset otsikkopalkista saadaksesi syntymäpäivämuistutukset.</p>
        </div>}

        {sortedBdays.length===0
          ? <Placeholder text="Ei syntymäpäiviä. Lisää läheisten syntymäpäivät!"/>
          : sortedBdays.map(b=>{
            const days = daysUntilBday(b.date);
            const age  = now.getFullYear() - parseInt(b.date.split("-")[0]);
            const soon = days<=7;
            const reminders = b.reminders||["7d","1d"];
            return (
              <div key={b.id} style={{background:"rgba(255,255,255,0.04)",borderRadius:14,padding:"14px 15px",marginBottom:10,border:`1px solid ${soon?"rgba(236,72,153,0.3)":"rgba(255,255,255,0.06)"}`}}>
                <div style={{display:"flex",alignItems:"center",gap:11}}>
                  <div style={{width:40,height:40,borderRadius:12,background:"rgba(236,72,153,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🎂</div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
                      <span style={{color:"#f1f5f9",fontSize:14,fontWeight:800}}>{b.name}</span>
                      <span style={{color:"#6b7280",fontSize:11}}>täyttää {age+1} v.</span>
                      {soon&&<span style={{background:"rgba(236,72,153,0.2)",color:"#ec4899",fontSize:9,fontWeight:800,padding:"2px 7px",borderRadius:5}}>🎉 Pian!</span>}
                    </div>
                    <div style={{display:"flex",gap:10,marginTop:2,alignItems:"center",flexWrap:"wrap"}}>
                      <span style={{color:"#4b5563",fontSize:11}}>{b.date.split("-").slice(1).join(".")}.</span>
                      <span style={{color:soon?"#ec4899":"#6ee7b7",fontSize:11,fontWeight:700}}>{days===0?"Tänään! 🎂":`${days} pv`}</span>
                      <span style={{color:"#374151",fontSize:10}}>🔔 {reminders.map(r=>NOTIF_OPTIONS.find(o=>o.key===r)?.label).filter(Boolean).join(", ")}</span>
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    <button onClick={()=>setEditBday({...b,reminders})} style={{background:"rgba(236,72,153,0.1)",border:"none",borderRadius:7,padding:"5px 7px",color:"#ec4899",cursor:"pointer",fontSize:10,fontWeight:800}}>🔔</button>
                    <button onClick={()=>onDeleteEvent("birthday",b.id)} style={{background:"rgba(239,68,68,0.1)",border:"none",borderRadius:7,padding:"5px",color:"#ef4444",cursor:"pointer"}}><Icon name="trash" size={13}/></button>
                  </div>
                </div>
              </div>
            );
          })
        }
      </div>}

      {/* Add event modal */}
      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Lisää merkintä">
        <div style={{display:"flex",flexDirection:"column",gap:13}}>
          <div>
            <label style={lbl}>Tyyppi</label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
              {Object.entries(typeLabels).filter(([k])=>k!=="birthday").map(([k,v])=>(
                <button key={k} onClick={()=>setForm(f=>({...f,type:k}))} style={{background:form.type===k?typeColors[k]+"33":"rgba(255,255,255,0.05)",border:`1.5px solid ${form.type===k?typeColors[k]:"transparent"}`,borderRadius:9,padding:"9px",color:form.type===k?typeColors[k]:"#4b5563",cursor:"pointer",fontSize:12,fontWeight:800}}>{v}</button>
              ))}
            </div>
          </div>
          <div><label style={lbl}>Otsikko</label><input style={inp} placeholder="Anna otsikko..." value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}/></div>
          <div><label style={lbl}>Aika</label><input style={inp} type="time" value={form.time} onChange={e=>setForm(f=>({...f,time:e.target.value}))}/></div>
          <div><label style={lbl}>Muistiinpano</label><input style={inp} placeholder="Lisätietoja..." value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))}/></div>
          <button style={btnG("#10b981","#059669")} onClick={addEvent}>Tallenna</button>
        </div>
      </Modal>

      {/* Add birthday modal */}
      <Modal open={showBday} onClose={()=>setShowBday(false)} title="Lisää syntymäpäivä">
        <div style={{display:"flex",flexDirection:"column",gap:13}}>
          <div><label style={lbl}>Nimi</label><input style={inp} placeholder="Henkilön nimi" value={bdayForm.name} onChange={e=>setBdayForm(f=>({...f,name:e.target.value}))}/></div>
          <div><label style={lbl}>Syntymäpäivä</label><input style={inp} type="date" value={bdayForm.date} onChange={e=>setBdayForm(f=>({...f,date:e.target.value}))}/></div>
          <div>
            <label style={lbl}>Muistutukset 🔔</label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
              {NOTIF_OPTIONS.map(o=>{
                const on=bdayForm.reminders.includes(o.key);
                return <button key={o.key} onClick={()=>toggleReminderOption(o.key)} style={{background:on?"rgba(236,72,153,0.2)":"rgba(255,255,255,0.05)",border:`1.5px solid ${on?"#ec4899":"transparent"}`,borderRadius:9,padding:"9px 10px",color:on?"#f9a8d4":"#4b5563",cursor:"pointer",fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:6}}><span>{on?"🔔":"🔕"}</span>{o.label}</button>;
              })}
            </div>
            {notifStatus!=="granted"&&<p style={{color:"#6b7280",fontSize:11,margin:"8px 0 0"}}>Salli ilmoitukset otsikkopalkista, jotta muistutukset toimivat.</p>}
          </div>
          <div><label style={lbl}>Muistiinpano</label><input style={inp} placeholder="Esim. lahjatoiveita..." value={bdayForm.note} onChange={e=>setBdayForm(f=>({...f,note:e.target.value}))}/></div>
          <button style={btnG("#ec4899","#db2777")} onClick={addBirthday}>Tallenna</button>
        </div>
      </Modal>

      {/* Edit notification settings modal */}
      <Modal open={!!editBday} onClose={()=>setEditBday(null)} title={`Muistutukset — ${editBday?.name}`}>
        {editBday&&<div style={{display:"flex",flexDirection:"column",gap:13}}>
          <p style={{color:"#9ca3af",fontSize:13,margin:0}}>Valitse milloin haluat ilmoituksen syntymäpäivästä.</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
            {NOTIF_OPTIONS.map(o=>{
              const on=(editBday.reminders||[]).includes(o.key);
              return <button key={o.key} onClick={()=>setEditBday(b=>({...b,reminders:on?b.reminders.filter(r=>r!==o.key):[...b.reminders,o.key]}))} style={{background:on?"rgba(236,72,153,0.2)":"rgba(255,255,255,0.05)",border:`1.5px solid ${on?"#ec4899":"transparent"}`,borderRadius:9,padding:"11px 10px",color:on?"#f9a8d4":"#4b5563",cursor:"pointer",fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:6}}><span>{on?"🔔":"🔕"}</span>{o.label}</button>;
            })}
          </div>
          {notifStatus!=="granted"&&<div style={{background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:10,padding:"10px 12px"}}>
            <p style={{color:"#fbbf24",fontSize:12,margin:0}}>⚠️ Ilmoitukset eivät ole käytössä. Salli ne otsikkopalkista.</p>
          </div>}
          <button style={btnG("#ec4899","#db2777")} onClick={()=>saveNotifSettings(editBday,editBday.reminders||[])}>Tallenna asetukset</button>
        </div>}
      </Modal>
    </div>
  );
}

export default CalendarView;
