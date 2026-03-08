import { useState } from "react";
import Icon from "../../components/Icon";
import { Modal, SubTabs, Placeholder, Row, SummaryCard } from "../../components/UI";
// 'inp' ja 'btnG' korvattu Tailwind-luokilla alla
import { dkey, today, pad } from "../../utils/helpers";

function WeekView({ data, onData, theme, onQuickAdd }) {
  const ac = theme?.primary || "#10b981";
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  weekStart.setHours(0, 0, 0, 0);

  const [weekOffset, setWeekOffset] = useState(0);
  const [expandedDay, setExpandedDay] = useState(today());
  const [addingTo, setAddingTo] = useState(null);
  const [addType, setAddType] = useState("task");
  const [addForm, setAddForm] = useState({ title: "", time: "", note: "", priority: "medium", duration: "", planId: null });

  const baseStart = new Date(weekStart);
  baseStart.setDate(baseStart.getDate() + weekOffset * 7);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(baseStart); d.setDate(d.getDate() + i);
    return { date: dkey(d.getFullYear(), d.getMonth(), d.getDate()), dow: i, d };
  });

  const todayStr = today();
  const weekLabel = (() => {
    const s = weekDays[0].d, e = weekDays[6].d;
    if (weekOffset === 0) return "Tämä viikko";
    if (weekOffset === -1) return "Viime viikko";
    if (weekOffset === 1) return "Ensi viikko";
    return `${s.getDate()}.${s.getMonth() + 1}. – ${e.getDate()}.${e.getMonth() + 1}.`;
  })();

  function itemsForDay(dateStr) {
    const tasks = data.tasks.filter(t => t.date === dateStr);
    const events = [...data.events, ...data.reminders].filter(e => e.date === dateStr);
    const workouts = data.workoutLogs.filter(w => w.date === dateStr);
    const bdays = data.birthdays.map(b => {
      const [, bm, bd] = b.date.split("-");
      const dk = dkey(new Date(dateStr).getFullYear(), parseInt(bm) - 1, parseInt(bd));
      return dk === dateStr ? { ...b, _bday: true } : null;
    }).filter(Boolean);
    return { tasks, events, workouts, bdays };
  }

  function saveItem() {
    if (!addForm.title.trim() && addType !== "workout") return;
    if (addType === "task") {
      onData(d => ({ ...d, tasks: [...d.tasks, { id: Date.now(), title: addForm.title, priority: addForm.priority, date: addingTo, note: addForm.note, done: false }] }));
    } else if (addType === "event") {
      onData(d => ({ ...d, events: [...d.events, { id: Date.now(), title: addForm.title, date: addingTo, time: addForm.time, note: addForm.note }] }));
    } else if (addType === "workout") {
      const plan = data.workoutPlans.find(p => p.id === addForm.planId);
      onData(d => ({ ...d, workoutLogs: [{ id: Date.now(), date: addingTo, planId: plan?.id || null, planName: addForm.title || plan?.name || "Treeni", duration: parseInt(addForm.duration) || 0, note: addForm.note, exercises: [] }, ...d.workoutLogs] }));
    }
    setAddingTo(null);
    setAddForm({ title: "", time: "", note: "", priority: "medium", duration: "", planId: null });
  }

  const DAY_FI = ["Ma", "Ti", "Ke", "To", "Pe", "La", "Su"];
  const DAY_FULL = ["Maanantai", "Tiistai", "Keskiviikko", "Torstai", "Perjantai", "Lauantai", "Sunnuntai"];

  return (
    <div className="w-full">
      {/* Week navigation */}
      <div className="flex items-center justify-between mb-4 px-1">
        <button onClick={() => setWeekOffset(o => o - 1)} className="bg-white/5 border-none rounded-lg p-2 text-gray-500 cursor-pointer active:scale-95 transition-transform">
          <Icon name="chevL" size={17} />
        </button>
        <div className="text-center">
          <p className="text-gray-100 font-extrabold text-[15px] font-['Syne'] m-0 uppercase tracking-tight">{weekLabel}</p>
          <p className="text-gray-600 text-[10px] m-0 font-bold uppercase tracking-wider">
            {weekDays[0].d.getDate()}.{weekDays[0].d.getMonth() + 1}. – {weekDays[6].d.getDate()}.{weekDays[6].d.getMonth() + 1}.
          </p>
        </div>
        <button onClick={() => setWeekOffset(o => o + 1)} className="bg-white/5 border-none rounded-lg p-2 text-gray-500 cursor-pointer active:scale-95 transition-transform">
          <Icon name="chevR" size={17} />
        </button>
      </div>

      {/* Mini week strip */}
      <div className="grid grid-cols-7 gap-1.5 mb-4">
        {weekDays.map(({ date, dow, d }) => {
          const { tasks, events, workouts, bdays } = itemsForDay(date);
          const total = tasks.length + events.length + workouts.length + bdays.length;
          const isToday = date === todayStr, isOpen = expandedDay === date;
          
          return (
            <button
              key={date}
              onClick={() => setExpandedDay(isOpen ? null : date)}
              style={{ 
                backgroundColor: isOpen ? `${ac}22` : isToday ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
                borderColor: isOpen ? ac : isToday ? `${ac}44` : 'transparent'
              }}
              className="border-[1.5px] rounded-xl py-2 px-1 cursor-pointer flex flex-col items-center gap-1 transition-all"
            >
              <span style={{ color: isToday ? ac : '' }} className={`text-[9px] font-extrabold ${!isToday && 'text-gray-600'}`}>{DAY_FI[dow]}</span>
              <span style={{ color: isOpen ? ac : '' }} className={`text-sm font-extrabold ${!isOpen && (isToday ? 'text-gray-100' : 'text-gray-500')}`}>{d.getDate()}</span>
              
              <div className="flex gap-0.5 justify-center flex-wrap h-1.5 min-w-2.5">
                {tasks.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-sky-500" />}
                {events.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-violet-600" />}
                {workouts.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                {bdays.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-pink-500" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Expanded day cards */}
      <div className="space-y-2.5">
        {weekDays.map(({ date, dow }) => {
          if (expandedDay && expandedDay !== date) return null;
          const { tasks, events, workouts, bdays } = itemsForDay(date);
          const isToday = date === todayStr;
          const hasItems = tasks.length + events.length + workouts.length + bdays.length > 0;
          
          return (
            <div key={date} 
              style={{ borderColor: isToday ? `${ac}33` : 'rgba(255,255,255,0.06)' }}
              className="bg-white/5 rounded-2xl p-[13px_14px] border border-solid"
            >
              {/* Day header */}
              <div className={`flex items-center justify-between ${hasItems || addingTo === date ? 'mb-2.5' : 'mb-0'}`}>
                <div className="flex items-center gap-2">
                  <span style={{ color: isToday ? ac : '' }} className={`text-sm font-extrabold ${!isToday && 'text-gray-100'}`}>{DAY_FULL[dow]}</span>
                  {isToday && <span style={{ backgroundColor: `${ac}22`, color: ac }} className="text-[9px] font-extrabold px-2 py-0.5 rounded-md">TÄNÄÄN</span>}
                </div>
                <button 
                  onClick={() => { setAddingTo(date); setAddType("task"); setAddForm({ title: "", time: "", note: "", priority: "medium", duration: "", planId: null }); }}
                  style={{ backgroundColor: `${ac}22`, borderColor: `${ac}33`, color: ac }}
                  className="border rounded-lg py-1.5 px-2.5 cursor-pointer text-[11px] font-extrabold flex items-center gap-1 active:scale-95 transition-transform"
                >
                  <Icon name="plus" size={13} /> Lisää
                </button>
              </div>

              {/* Add form inline */}
              {addingTo === date && (
                <div className="bg-white/5 rounded-xl p-3 mb-2.5 border border-white/10">
                  <div className="flex gap-1.5 mb-2.5">
                    {[["task", "✅ Tehtävä"], ["event", "📅 Tapahtuma"], ["workout", "💪 Treeni"]].map(([t, l]) => (
                      <button 
                        key={t} onClick={() => setAddType(t)} 
                        style={{ 
                          backgroundColor: addType === t ? `${ac}33` : '',
                          borderColor: addType === t ? ac : 'transparent'
                        }}
                        className={`flex-1 border-[1.5px] rounded-lg py-1.5 text-[11px] font-extrabold cursor-pointer transition-colors ${addType === t ? '' : 'bg-white/5 text-gray-600'}`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                  
                  {addType === "workout" ? (
                    <div className="mb-2">
                      {data.workoutPlans.length > 0 ? (
                        <>
                          <p className="text-gray-600 text-[10px] font-extrabold tracking-tight uppercase mb-2">VALITSE OHJELMA</p>
                          <div className="flex flex-col gap-1.5 mb-2.5">
                            {data.workoutPlans.map(plan => (
                              <button 
                                key={plan.id} onClick={() => setAddForm(f => ({ ...f, title: plan.name, planId: plan.id }))} 
                                className={`border-[1.5px] rounded-xl p-2.5 cursor-pointer text-left flex items-center justify-between transition-all ${addForm.planId === plan.id ? 'bg-amber-500/20 border-amber-500' : 'bg-white/5 border-transparent'}`}
                              >
                                <div>
                                  <span className={`text-[13px] font-bold ${addForm.planId === plan.id ? 'text-amber-400' : 'text-gray-300'}`}>{plan.name}</span>
                                  <span className="text-gray-600 text-[11px] ml-2">{plan.exercises?.length || 0} liikettä</span>
                                </div>
                                {addForm.planId === plan.id && <Icon name="check" size={14} />}
                              </button>
                            ))}
                          </div>
                          <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[13px] text-white outline-none focus:border-white/20" type="number" placeholder="Kesto (min)" value={addForm.duration} onChange={e => setAddForm(f => ({ ...f, duration: e.target.value }))} />
                        </>
                      ) : (
                        <div className="bg-amber-500/10 rounded-lg p-3 text-center border border-amber-500/20">
                          <p className="text-amber-500 text-xs font-bold mb-1">Ei luotuja ohjelmia</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-2 mb-2">
                      <input className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[13px] text-white outline-none focus:border-white/20" placeholder={addType === "task" ? "Tehtävän nimi..." : "Tapahtuman nimi..."} value={addForm.title} onChange={e => setAddForm(f => ({ ...f, title: e.target.value }))} autoFocus onKeyDown={e => e.key === "Enter" && saveItem()} />
                      {addType === "event" && <input className="w-24 bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-[13px] text-white outline-none" type="time" value={addForm.time} onChange={e => setAddForm(f => ({ ...f, time: e.target.value }))} />}
                    </div>
                  )}

                  {addType === "task" && (
                    <div className="flex gap-1.5 mb-2.5">
                      {[["high", "Kiire", "text-red-500", "bg-red-500/10"], ["medium", "Normaali", "text-amber-500", "bg-amber-500/10"], ["low", "Matala", "text-green-500", "bg-green-500/10"]].map(([k, l, c, b]) => (
                        <button key={k} onClick={() => setAddForm(f => ({ ...f, priority: k }))} className={`flex-1 border rounded-lg py-1.5 text-[10px] font-extrabold cursor-pointer transition-all ${addForm.priority === k ? `${c} border-current ${b}` : 'bg-white/5 border-transparent text-gray-600'}`}>{l}</button>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button 
                      onClick={saveItem} 
                      style={{ backgroundColor: ac }}
                      className="flex-1 rounded-xl py-2 text-[13px] text-white font-extrabold border-none cursor-pointer active:brightness-90 transition-all"
                    >
                      Tallenna
                    </button>
                    <button onClick={() => setAddingTo(null)} className="bg-white/10 border-none rounded-xl px-4 py-2 text-gray-500 cursor-pointer text-[13px] font-bold">Peruuta</button>
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-0.5">
                {tasks.map(t => (
                  <div key={t.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                    <button 
                      onClick={() => onData(d => ({ ...d, tasks: d.tasks.map(x => x.id === t.id ? { ...x, done: !x.done } : x) }))} 
                      style={{ 
                        borderColor: t.done ? '#10b981' : 'rgba(255,255,255,0.2)',
                        background: t.done ? 'linear-gradient(135deg,#10b981,#059669)' : 'transparent'
                      }}
                      className="w-4.5 h-4.5 rounded-md border-2 cursor-pointer text-white flex items-center justify-center shrink-0 transition-colors"
                    >
                      {t.done && <Icon name="check" size={10} />}
                    </button>
                    <span className={`text-[13px] flex-1 ${t.done ? 'text-gray-600 line-through' : 'text-gray-300'}`}>{t.title}</span>
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${{ high: "bg-red-500", medium: "bg-amber-500", low: "bg-green-500" }[t.priority]}`} />
                  </div>
                ))}
                
                {events.map(e => (
                  <div key={e.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                    <div className="w-2 h-2 rounded-full bg-violet-600 shrink-0" />
                    <span className="text-gray-300 text-[13px] flex-1">
                      {e.time && <span className="text-gray-600 mr-2 font-mono text-xs">{e.time}</span>}{e.title}
                    </span>
                  </div>
                ))}

                {workouts.map(w => (
                  <div key={w.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                    <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    <span className="text-gray-300 text-[13px] flex-1">💪 {w.planName || "Treeni"}{w.duration > 0 && <span className="text-gray-600 ml-1">· {w.duration} min</span>}</span>
                  </div>
                ))}

                {bdays.map(b => (
                  <div key={b.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                    <div className="w-2 h-2 rounded-full bg-pink-500 shrink-0" />
                    <span className="text-pink-300 text-[13px]">🎂 {b.name}</span>
                  </div>
                ))}

                {!hasItems && addingTo !== date && (
                  <p className="text-gray-700 text-xs mt-1 text-center italic">Vapaa päivä</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WeekView;