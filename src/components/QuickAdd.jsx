import { useState } from "react";
import Icon from "./Icon";
import { inp, lbl, btnG } from "./SharedStyles";
import { today } from "../utils/helpers";

export default function QuickAdd({ open, onClose, data, onData, theme }) {
  const ac = theme?.primary || "#10b981";
  const [step, setStep] = useState("pick");
  const [expForm, setExpForm]   = useState({ amount:"", categoryId:"", note:"", date:today() });
  const [taskForm, setTaskForm] = useState({ title:"", date:"", priority:"medium" });
  const [wlogForm, setWlogForm] = useState({ duration:"", note:"", date:today() });

  function reset() {
    setStep("pick");
    setExpForm({ amount:"", categoryId:"", note:"", date:today() });
    setTaskForm({ title:"", date:"", priority:"medium" });
    setWlogForm({ duration:"", note:"", date:today() });
  }
  function close() { reset(); onClose(); }

  function saveExpense() {
    if (!expForm.amount || !expForm.categoryId) return;
    const cat = data.categories.find(c => c.id === parseInt(expForm.categoryId));
    onData(d => ({ ...d, expenses: [...d.expenses, { id:Date.now(), amount:parseFloat(expForm.amount), categoryId:parseInt(expForm.categoryId), categoryName:cat?.name||"", date:expForm.date, note:expForm.note }] }));
    close();
  }
  function saveTask() {
    if (!taskForm.title.trim()) return;
    onData(d => ({ ...d, tasks: [...d.tasks, { id:Date.now(), title:taskForm.title, priority:taskForm.priority, date:taskForm.date, note:"", done:false }] }));
    close();
  }
  function saveWorkout() {
    const activePlan = data.workoutPlans.find(p => p.active);
    onData(d => ({ ...d, workoutLogs: [{ id:Date.now(), date:wlogForm.date, planId:activePlan?.id||null, planName:activePlan?.name||"Vapaa treeni", duration:parseInt(wlogForm.duration)||0, note:wlogForm.note, exercises:[] }, ...d.workoutLogs] }));
    close();
  }

  if (!open) return null;

  return (
    <div style={{ position:"fixed", inset:0, zIndex:300, display:"flex", alignItems:"flex-end", justifyContent:"center", background:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)" }} onClick={close}>
      <div onClick={e => e.stopPropagation()} style={{ background:"#0c140c", borderRadius:"24px 24px 0 0", width:"100%", maxWidth:480, padding:"22px 20px 44px", boxShadow:"0 -8px 60px rgba(0,0,0,0.8)", maxHeight:"90vh", overflowY:"auto" }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            {step !== "pick" && <button onClick={() => setStep("pick")} style={{ background:"rgba(255,255,255,0.07)", border:"none", borderRadius:8, padding:"5px 9px", color:"#6b7280", cursor:"pointer", fontSize:12 }}>← Takaisin</button>}
            <h3 style={{ color:"#f1f5f9", fontSize:17, fontWeight:800, fontFamily:"'Syne',serif", margin:0 }}>
              {step==="pick" ? "Lisää nopeasti" : step==="expense" ? "💸 Uusi meno" : step==="task" ? "✅ Uusi tehtävä" : "💪 Kirjaa treeni"}
            </h3>
          </div>
          <button onClick={close} style={{ background:"rgba(255,255,255,0.07)", border:"none", borderRadius:10, padding:"6px 8px", color:"#6b7280", cursor:"pointer" }}><Icon name="close" size={17}/></button>
        </div>

        {/* Pick type */}
        {step === "pick" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
            {[
              { id:"expense", icon:"💸", label:"Meno",     color:"#f43f5e" },
              { id:"task",    icon:"✅", label:"Tehtävä",  color:"#0ea5e9" },
              { id:"workout", icon:"💪", label:"Treeni",   color:"#f59e0b" },
            ].map(o => (
              <button key={o.id} onClick={() => setStep(o.id)} style={{ background:`${o.color}18`, border:`1.5px solid ${o.color}33`, borderRadius:16, padding:"20px 10px", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:28 }}>{o.icon}</span>
                <span style={{ color:o.color, fontSize:13, fontWeight:800 }}>{o.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Expense */}
        {step === "expense" && (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div>
              <label style={lbl}>Summa (€)</label>
              <input style={{ ...inp, fontSize:24, fontWeight:800, textAlign:"center" }} type="number" step="0.01" placeholder="0.00" value={expForm.amount} onChange={e => setExpForm(f => ({ ...f, amount:e.target.value }))} autoFocus/>
            </div>
            <div>
              <label style={lbl}>Kategoria</label>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, maxHeight:220, overflowY:"auto" }}>
                {data.categories.map(cat => (
                  <button key={cat.id} onClick={() => setExpForm(f => ({ ...f, categoryId:String(cat.id) }))} style={{ background:expForm.categoryId===String(cat.id)?cat.color+"33":"rgba(255,255,255,0.05)", border:`1.5px solid ${expForm.categoryId===String(cat.id)?cat.color:"transparent"}`, borderRadius:10, padding:"9px 10px", color:expForm.categoryId===String(cat.id)?cat.color:"#4b5563", cursor:"pointer", fontSize:12, fontWeight:700, textAlign:"left", display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ fontSize:15 }}>{cat.icon}</span>{cat.name}
                  </button>
                ))}
              </div>
            </div>
            <div><label style={lbl}>Muistiinpano</label><input style={inp} placeholder="Valinnainen..." value={expForm.note} onChange={e => setExpForm(f => ({ ...f, note:e.target.value }))}/></div>
            <div><label style={lbl}>Päivämäärä</label><input style={inp} type="date" value={expForm.date} onChange={e => setExpForm(f => ({ ...f, date:e.target.value }))}/></div>
            <button style={btnG("#f43f5e","#e11d48")} onClick={saveExpense}>Tallenna meno</button>
          </div>
        )}

        {/* Task */}
        {step === "task" && (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div><label style={lbl}>Tehtävä</label><input style={inp} placeholder="Mitä pitää tehdä?" value={taskForm.title} onChange={e => setTaskForm(f => ({ ...f, title:e.target.value }))} autoFocus/></div>
            <div>
              <label style={lbl}>Prioriteetti</label>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:7 }}>
                {[["high","Korkea","#ef4444"],["medium","Normaali","#f59e0b"],["low","Matala","#22c55e"]].map(([k, v, c]) => (
                  <button key={k} onClick={() => setTaskForm(f => ({ ...f, priority:k }))} style={{ background:taskForm.priority===k?c+"33":"rgba(255,255,255,0.05)", border:`1.5px solid ${taskForm.priority===k?c:"transparent"}`, borderRadius:9, padding:"9px", color:taskForm.priority===k?c:"#4b5563", cursor:"pointer", fontSize:12, fontWeight:800 }}>{v}</button>
                ))}
              </div>
            </div>
            <div><label style={lbl}>Deadline</label><input style={inp} type="date" value={taskForm.date} onChange={e => setTaskForm(f => ({ ...f, date:e.target.value }))}/></div>
            <button style={btnG("#0ea5e9","#0284c7")} onClick={saveTask}>Lisää tehtävä</button>
          </div>
        )}

        {/* Workout */}
        {step === "workout" && (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {data.workoutPlans.find(p => p.active)
              ? <div style={{ background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:12, padding:"11px 13px" }}>
                  <p style={{ color:"#fbbf24", fontSize:12, fontWeight:800, margin:"0 0 2px" }}>Aktiivinen ohjelma</p>
                  <p style={{ color:"#f1f5f9", fontSize:14, margin:0 }}>{data.workoutPlans.find(p => p.active).name}</p>
                </div>
              : <p style={{ color:"#4b5563", fontSize:13, margin:0 }}>Vapaa treeni</p>}
            <div><label style={lbl}>Kesto (min)</label><input style={{ ...inp, fontSize:20, fontWeight:800, textAlign:"center" }} type="number" placeholder="45" value={wlogForm.duration} onChange={e => setWlogForm(f => ({ ...f, duration:e.target.value }))} autoFocus/></div>
            <div><label style={lbl}>Päivämäärä</label><input style={inp} type="date" value={wlogForm.date} onChange={e => setWlogForm(f => ({ ...f, date:e.target.value }))}/></div>
            <div><label style={lbl}>Muistiinpano</label><input style={inp} placeholder="Esim. hyvä treeni!" value={wlogForm.note} onChange={e => setWlogForm(f => ({ ...f, note:e.target.value }))}/></div>
            <button style={btnG("#f59e0b","#d97706")} onClick={saveWorkout}>Kirjaa treeni</button>
          </div>
        )}
      </div>
    </div>
  );
}
