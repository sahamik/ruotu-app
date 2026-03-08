import { useState } from "react";
import Icon from "../../components/Icon";
import { Modal, Placeholder } from "../../components/UI";
import { MUSCLE_GROUPS, curMonthKey, today } from "../../utils/helpers";

// ─── Päänäkymä ─────────────────────────────────────────────────────────────
export function WorkoutView({ data, onData }) {
  const [sub, setSub] = useState("plans");
  
  const tabs = [
    { id: "plans", label: "Ohjelmat", icon: "clipboard" },
    { id: "log", label: "Treenikirja", icon: "calendar" },
    { id: "stats", label: "Tilastot", icon: "bar-chart-2" }
  ];

  return (
    <div className="space-y-5">
      <div className="flex bg-white/5 p-1 rounded-2xl gap-1">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setSub(t.id)}
            className={`flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
              sub === t.id ? "bg-amber-500 text-white shadow-lg shadow-amber-900/20" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Icon name={t.icon} size={14} /> {t.label}
          </button>
        ))}
      </div>

      {sub === "plans" && <WorkoutPlans data={data} onData={onData} />}
      {sub === "log" && <WorkoutLog data={data} onData={onData} />}
      {sub === "stats" && <WorkoutStats data={data} />}
    </div>
  );
}

// ─── Ohjelmat ─────────────────────────────────────────────────────────────
function WorkoutPlans({ data, onData }) {
  const [showPlan, setShowPlan] = useState(false);
  const [showEx, setShowEx] = useState(null);
  const [planForm, setPlanForm] = useState({ name: "", description: "", daysPerWeek: 3 });
  const [exForm, setExForm] = useState({ name: "", sets: "3", reps: "10", weight: "", muscleGroup: "Koko keho", note: "" });
  const [expanded, setExpanded] = useState(null);

  const addPlan = () => {
    if (!planForm.name.trim()) return;
    onData(d => ({
      ...d,
      workoutPlans: [...d.workoutPlans, { 
        id: Date.now(), 
        ...planForm, 
        daysPerWeek: parseInt(planForm.daysPerWeek), 
        exercises: [], 
        active: false 
      }]
    }));
    setPlanForm({ name: "", description: "", daysPerWeek: 3 });
    setShowPlan(false);
  };

  const addEx = (pid) => {
    if (!exForm.name.trim()) return;
    const ex = { id: Date.now(), ...exForm, sets: parseInt(exForm.sets) };
    onData(d => ({
      ...d,
      workoutPlans: d.workoutPlans.map(p => p.id === pid ? { ...p, exercises: [...p.exercises, ex] } : p)
    }));
    setExForm({ name: "", sets: "3", reps: "10", weight: "", muscleGroup: "Koko keho", note: "" });
    setShowEx(null);
  };

  return (
    <div className="space-y-4">
      <button onClick={() => setShowPlan(true)} className="w-full bg-amber-600 hover:bg-amber-500 text-white rounded-2xl py-4 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-900/20 active:scale-95">
        <Icon name="plus" size={18} /> Uusi treeniohjelma
      </button>

      {data.workoutPlans.length === 0 ? (
        <Placeholder text="Ei ohjelmia vielä. Rakenna tavoitteitasi vastaava rutiini!" />
      ) : (
        data.workoutPlans.map(plan => (
          <div key={plan.id} className={`bg-white/5 rounded-3xl overflow-hidden border transition-all ${plan.active ? 'border-amber-500/40 shadow-lg shadow-amber-950/20' : 'border-white/5'}`}>
            <div className="p-5 flex items-center gap-4">
              <div className="flex-1 cursor-pointer" onClick={() => setExpanded(expanded === plan.id ? null : plan.id)}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-gray-100 font-bold text-lg">{plan.name}</span>
                  {plan.active && <span className="bg-amber-500/10 text-amber-500 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Aktiivinen</span>}
                </div>
                <div className="flex gap-3 text-gray-500 text-[11px] font-semibold uppercase tracking-tighter">
                  <span>{plan.daysPerWeek}x / vko</span>
                  <span>•</span>
                  <span>{plan.exercises.length} liikettä</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onData(d => ({ ...d, workoutPlans: d.workoutPlans.map(p => ({ ...p, active: p.id === plan.id ? !p.active : p.active })) }))}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${plan.active ? 'bg-amber-500 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
                >
                  {plan.active ? 'Käytössä' : 'Aktivoi'}
                </button>
                <button onClick={() => onData(d => ({ ...d, workoutPlans: d.workoutPlans.filter(p => p.id !== plan.id) }))} className="p-2 text-rose-500/40 hover:text-rose-500 transition-colors">
                  <Icon name="trash" size={16} />
                </button>
              </div>
            </div>

            {expanded === plan.id && (
              <div className="px-5 pb-5 pt-2 border-t border-white/5 bg-white/2 animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-3">
                  {plan.exercises.map(ex => (
                    <div key={ex.id} className="flex items-center justify-between py-2 border-b border-white/3 last:border-0">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-200 text-sm font-bold">{ex.name}</span>
                          <span className="text-[9px] bg-white/5 text-gray-500 px-1.5 py-0.5 rounded lowercase">{ex.muscleGroup}</span>
                        </div>
                        <p className="text-gray-500 text-xs">{ex.sets} x {ex.reps} {ex.weight && `• ${ex.weight}kg`}</p>
                      </div>
                      <button onClick={() => onData(d => ({ ...d, workoutPlans: d.workoutPlans.map(p => p.id === plan.id ? { ...p, exercises: p.exercises.filter(e => e.id !== ex.id) } : p) }))} className="p-1.5 text-gray-700 hover:text-rose-500">
                        <Icon name="x" size={12} />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => setShowEx(plan.id)} className="w-full py-3 rounded-xl border-2 border-dashed border-white/10 text-gray-500 text-[11px] font-bold uppercase tracking-widest hover:border-amber-500/50 hover:text-amber-500 transition-all mt-2">
                    + Lisää liike
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}

      {/* New Plan Modal */}
      <Modal open={showPlan} onClose={() => setShowPlan(false)} title="Luo ohjelma">
        <div className="space-y-4 py-2 text-left">
          <div className="space-y-2">
            <label className="text-gray-600 text-[10px] font-black uppercase tracking-widest ml-1">Nimi</label>
            <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500/50" placeholder="Esim. Arnold Split" value={planForm.name} onChange={e => setPlanForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <label className="text-gray-600 text-[10px] font-black uppercase tracking-widest ml-1">Treenit / vko</label>
            <div className="grid grid-cols-5 gap-2">
              {[2, 3, 4, 5, 6].map(n => (
                <button key={n} onClick={() => setPlanForm(f => ({ ...f, daysPerWeek: n }))} className={`py-3 rounded-xl font-black text-xs transition-all ${planForm.daysPerWeek === n ? 'bg-amber-500 text-white shadow-lg shadow-amber-900/40' : 'bg-white/5 text-gray-500'}`}>
                  {n}
                </button>
              ))}
            </div>
          </div>
          <button onClick={addPlan} className="w-full bg-amber-600 text-white rounded-xl py-4 font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-900/20 active:scale-95 transition-all mt-2">Luo ohjelma</button>
        </div>
      </Modal>

      {/* New Exercise Modal (simplified for display) */}
      <Modal open={showEx !== null} onClose={() => setShowEx(null)} title="Uusi liike">
         <div className="space-y-4 py-2">
           <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none" placeholder="Liikkeen nimi" value={exForm.name} onChange={e => setExForm(f => ({ ...f, name: e.target.value }))} />
           <div className="flex flex-wrap gap-2">
             {MUSCLE_GROUPS.map(mg => (
               <button key={mg} onClick={() => setExForm(f => ({ ...f, muscleGroup: mg }))} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase ${exForm.muscleGroup === mg ? 'bg-amber-500 text-white' : 'bg-white/5 text-gray-500'}`}>{mg}</button>
             ))}
           </div>
           <div className="grid grid-cols-3 gap-3">
             <input type="number" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-white" placeholder="S" value={exForm.sets} onChange={e => setExForm(f => ({ ...f, sets: e.target.value }))} />
             <input className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-white" placeholder="T" value={exForm.reps} onChange={e => setExForm(f => ({ ...f, reps: e.target.value }))} />
             <input type="number" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-white" placeholder="kg" value={exForm.weight} onChange={e => setExForm(f => ({ ...f, weight: e.target.value }))} />
           </div>
           <button onClick={() => addEx(showEx)} className="w-full bg-amber-600 text-white rounded-xl py-4 font-black uppercase tracking-widest text-xs">Lisää liike</button>
         </div>
      </Modal>
    </div>
  );
}

// ─── Treenikirja ────────────────────────────────────────────────────────────
function WorkoutLog({ data, onData }) {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ date: today(), planId: "", note: "", duration: "60", exercises: [] });
  const activePlan = data.workoutPlans.find(p => p.active);

  const saveLog = () => {
    const log = { id: Date.now(), ...form, planId: form.planId ? parseInt(form.planId) : null, duration: parseInt(form.duration) || 0 };
    onData(d => ({ ...d, workoutLogs: [log, ...d.workoutLogs] }));
    setForm({ date: today(), planId: "", note: "", duration: "60", exercises: [] });
    setShow(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        {activePlan && (
          <button onClick={() => { setForm(f => ({ ...f, planId: String(activePlan.id), exercises: activePlan.exercises.map(e => ({ ...e })) })); setShow(true); }} className="col-span-3 bg-amber-600 text-white rounded-2xl py-4 font-black text-[11px] uppercase tracking-widest shadow-lg shadow-amber-900/20 flex items-center justify-center gap-2">
            <Icon name="play" size={14} /> Aloita: {activePlan.name}
          </button>
        )}
        <button onClick={() => setShow(true)} className={`${activePlan ? 'col-span-1' : 'col-span-4'} bg-white/10 text-gray-300 rounded-2xl py-4 font-black text-[11px] uppercase tracking-widest`}>
          + Tyhjä
        </button>
      </div>

      <div className="space-y-3">
        {data.workoutLogs.length === 0 ? <Placeholder text="Ei vielä kuitattuja treenejä." /> : data.workoutLogs.sort((a,b)=>b.date.localeCompare(a.date)).map(log => {
          const plan = data.workoutPlans.find(p => p.id === log.planId);
          return (
            <div key={log.id} className="bg-white/5 border border-white/5 p-4 rounded-3xl relative">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-gray-100 font-bold text-sm">{log.date}</p>
                  <div className="flex gap-2 items-center mt-1">
                    <span className="text-amber-500 text-[10px] font-black uppercase tracking-widest">{plan?.name || "Vapaa treeni"}</span>
                    <span className="text-gray-600 text-[10px]">• {log.duration} min</span>
                  </div>
                </div>
                <button onClick={() => onData(d => ({ ...d, workoutLogs: d.workoutLogs.filter(l => l.id !== log.id) }))} className="text-gray-700 hover:text-rose-500 transition-colors">
                  <Icon name="trash" size={14} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {log.exercises.slice(0, 3).map((ex, i) => (
                  <span key={i} className="text-[10px] text-gray-500 bg-white/3 px-2 py-1 rounded-lg">
                    {ex.name} {ex.sets}×{ex.reps}
                  </span>
                ))}
                {log.exercises.length > 3 && <span className="text-[10px] text-gray-700 font-bold mt-1">+{log.exercises.length - 3} muuta</span>}
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={show} onClose={() => setShow(false)} title="Kirjaa treeni">
        <div className="space-y-4 py-2 text-left">
           <input type="date" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
           <div className="space-y-2">
             <label className="text-gray-600 text-[10px] font-black uppercase tracking-widest ml-1">Kesto (min)</label>
             <input type="number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
           </div>
           <button onClick={saveLog} className="w-full bg-amber-600 text-white rounded-xl py-4 font-black uppercase tracking-widest text-xs shadow-lg shadow-amber-900/20 active:scale-95 transition-all">Tallenna suoritus</button>
        </div>
      </Modal>
    </div>
  );
}

// ─── Tilastot ─────────────────────────────────────────────────────────────
function WorkoutStats({ data }) {
  const logs = data.workoutLogs;
  if (logs.length === 0) return <Placeholder text="Treenaa ensin, analysoidaan sitten!" />;

  const thisMonth = logs.filter(l => l.date.startsWith(curMonthKey()));
  const totalMin = logs.reduce((s, l) => s + (l.duration || 0), 0);
  const avgDur = Math.round(totalMin / logs.length);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard title="Yhteensä" val={logs.length} unit="treeniä" color="amber" />
        <StatCard title="Tässä kuussa" val={thisMonth.length} unit="krt" color="blue" />
        <StatCard title="Keskikesto" val={avgDur} unit="min" color="purple" />
        <StatCard title="Aika yhteensä" val={Math.round(totalMin/60)} unit="tuntia" color="emerald" />
      </div>

      <div className="bg-white/5 rounded-3xl p-5 border border-white/5">
        <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest mb-4">Aktiivisuus (8 vkoa)</p>
        <div className="flex items-end justify-between h-24 gap-1.5 px-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex-1 bg-white/5 rounded-t-lg relative group h-full flex flex-col justify-end">
              <div 
                className="w-full bg-linear-to-t from-amber-600 to-amber-400 rounded-t-lg transition-all duration-500" 
                style={{ height: `${Math.random() * 80 + 10}%` }} // Tähän oikea logiikka tarvittaessa
              />
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] text-gray-700 font-bold uppercase">V{8-i}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, val, unit, color }) {
  const colors = {
    amber: "border-amber-500 text-amber-500 bg-amber-500/5",
    blue: "border-blue-500 text-blue-500 bg-blue-500/5",
    purple: "border-purple-500 text-purple-500 bg-purple-500/5",
    emerald: "border-emerald-500 text-emerald-500 bg-emerald-500/5"
  };
  return (
    <div className={`p-4 rounded-3xl border-t-4 ${colors[color]}`}>
      <p className="text-gray-600 text-[9px] font-black uppercase tracking-widest mb-1">{title}</p>
      <p className="text-gray-100 text-xl font-black font-['Syne']">{val} <span className="text-[10px] text-gray-500 uppercase tracking-tighter">{unit}</span></p>
    </div>
  );
}

export default WorkoutView;
