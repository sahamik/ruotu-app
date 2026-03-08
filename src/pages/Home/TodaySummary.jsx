import { useState } from "react";
import Icon from "../../components/Icon";
import { Modal, SubTabs, Placeholder, Row, SummaryCard } from "../../components/UI";
// Huom: 'inp' tyyli on korvattu tässä Tailwind-luokilla
import { MONTHS_FI, fmt, curMonthKey, today, getGreeting, dkey } from "../../utils/helpers";

function TodaySummary({ data, profile, theme, onData, onQuickAdd }) {
  const todayStr = today(), now = new Date(), cmk = curMonthKey();
  const [noteText, setNoteText] = useState("");
  const [showAllNotes, setShowAllNotes] = useState(false);

  // Logic (ennallaan)
  const dueTasks = data.tasks.filter(t => !t.done && t.date && t.date <= todayStr);
  const todayEvents = [...data.events, ...data.reminders].filter(i => i.date === todayStr);
  function dU(ds) { const [, m, d] = ds.split("-"); let next = new Date(now.getFullYear(), parseInt(m) - 1, parseInt(d)); if (next < now) next.setFullYear(now.getFullYear() + 1); return Math.round((next - now) / (1000 * 60 * 60 * 24)); }
  const upcomingBdays = data.birthdays.filter(b => dU(b.date) <= 7).sort((a, b) => dU(a.date) - dU(b.date));
  const upcomingPayments = data.annualPayments.filter(p => { const d = new Date(p.nextDate), n = new Date(); n.setHours(0, 0, 0, 0); return Math.round((d - n) / (1000 * 60 * 60 * 24)) <= 14; });
  const thisMonthExp = data.expenses.filter(e => e.date.startsWith(cmk)).reduce((s, e) => s + e.amount, 0);
  const income = data.incomes.find(i => i.month === cmk);
  const balance = income ? (income.amount - thisMonthExp) : null;
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay() + 1); weekStart.setHours(0, 0, 0, 0);
  const weekDays = Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(d.getDate() + i); return dkey(d.getFullYear(), d.getMonth(), d.getDate()); });
  const weekExp = data.expenses.filter(e => weekDays.includes(e.date)).reduce((s, e) => s + e.amount, 0);
  const weekTasks = data.tasks.filter(t => t.done && t.date && weekDays.includes(t.date)).length;
  const weekWorkouts = data.workoutLogs.filter(l => weekDays.includes(l.date)).length;
  const totalTasksThisWeek = data.tasks.filter(t => t.date && weekDays.includes(t.date)).length;
  const activePlan = data.workoutPlans.find(p => p.active);
  const nearGoals = data.savingsGoals.filter(g => { const saved = data.savingsDeposits.filter(d => d.goalId === g.id).reduce((s, d) => s + d.amount, 0); return g.target > 0 && saved / g.target >= 0.9 && saved < g.target; });
  const sortedNotes = [...data.notes].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const visibleNotes = showAllNotes ? sortedNotes : sortedNotes.slice(0, 3);

  function addNote() {
    if (!noteText.trim()) return;
    onData(d => ({ ...d, notes: [...d.notes, { id: Date.now(), text: noteText.trim(), createdAt: new Date().toISOString() }] }));
    setNoteText("");
  }
  function delNote(id) { onData(d => ({ ...d, notes: d.notes.filter(n => n.id !== id) })); }

  const dayNames = ["Sunnuntai", "Maanantai", "Tiistai", "Keskiviikko", "Torstai", "Perjantai", "Lauantai"];
  const dateLabel = `${dayNames[now.getDay()]}, ${now.getDate()}. ${MONTHS_FI[now.getMonth()]} ${now.getFullYear()}`;
  const greeting = getGreeting(profile?.name);
  const ac = theme?.primary || "#10b981";

  return (
    <div className="space-y-3.5">
      {/* ── Greeting ── */}
      <div 
        style={{ background: `linear-gradient(135deg, ${ac}33, ${ac}0a)`, borderColor: `${ac}28` }}
        className="rounded-[20px] p-[18px_20px] border"
      >
        <p style={{ color: `${ac}cc` }} className="text-[10px] font-extrabold tracking-[0.09em] uppercase mb-1">
          {dateLabel}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-[#f1f5f9] text-[22px] font-extrabold font-['Syne'] leading-tight m-0">
            {greeting}
          </p>
          <button 
            onClick={onQuickAdd}
            style={{ background: `linear-gradient(135deg, ${ac}, ${ac}bb)`, boxShadow: `0 4px 14px ${ac}44` }}
            className="border-none rounded-[14px] w-10.5 h-10.5 flex items-center justify-center cursor-pointer shrink-0"
          >
            <Icon name="plus" size={22} />
          </button>
        </div>
      </div>

      {/* ── Quick notes ── */}
      <div className="bg-white/5 rounded-2xl p-[13px_14px] border border-white/10">
        <p className="text-gray-600 text-[10px] font-extrabold tracking-widest uppercase mb-2.25">
          📝 MUISTIINPANOT
        </p>
        <div className={`flex gap-2 ${visibleNotes.length > 0 ? 'mb-2.5' : 'mb-0'}`}>
          <input
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.25 text-[13px] text-white placeholder-gray-600 flex-1 outline-none focus:border-white/20"
            placeholder="Nopea muistiinpano..."
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addNote()}
          />
          <button 
            onClick={addNote}
            style={{ background: `linear-gradient(135deg, ${ac}, ${ac}bb)` }}
            className="border-none rounded-[11px] px-3.5 py-2.25 text-white cursor-pointer font-extrabold text-[13px] shrink-0"
          >
            +
          </button>
        </div>
        
        {visibleNotes.map(n => (
          <div key={n.id} className="flex items-start gap-2 py-1.75 border-b border-white/5 last:border-0">
            <p className="text-gray-300 text-[13px] m-0 flex-1 leading-relaxed">{n.text}</p>
            <button onClick={() => delNote(n.id)} className="bg-transparent border-none text-gray-700 cursor-pointer p-0.5 shrink-0">
              <Icon name="trash" size={13} />
            </button>
          </div>
        ))}
        
        {sortedNotes.length > 3 && (
          <button 
            onClick={() => setShowAllNotes(v => !v)}
            className="bg-transparent border-none text-gray-600 cursor-pointer text-[11px] font-extrabold pt-1.5 w-full text-center hover:text-gray-500"
          >
            {showAllNotes ? `▲ Näytä vähemmän` : `▼ Näytä kaikki (${sortedNotes.length})`}
          </button>
        )}
        {sortedNotes.length === 0 && <p className="text-gray-700 text-xs mt-1 text-center italic">Ei muistiinpanoja</p>}
      </div>

      {/* ── Weekly overview ── */}
      <div className="bg-white/5 rounded-2xl p-[13px_14px] border border-white/10">
        <p className="text-gray-600 text-[10px] font-extrabold tracking-widest uppercase mb-2.75">
          📊 VIIKON TILANNE
        </p>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            ["Kulutus", `${fmt(weekExp)} €`, "text-rose-500"],
            ["Tehtävät", `${weekTasks}/${totalTasksThisWeek || "-"}`, "text-sky-500"],
            ["Treenit", `${weekWorkouts} krt`, "text-amber-500"],
          ].map(([t, v, c]) => (
            <div key={t} className="bg-white/5 rounded-[11px] py-2.5 px-2 text-center">
              <p className="text-gray-600 text-[9px] font-extrabold tracking-wider mb-1 uppercase">{t}</p>
              <p className={`${c} text-sm font-extrabold font-['Syne'] m-0`}>{v}</p>
            </div>
          ))}
        </div>

        {/* Week day bar */}
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((dk, i) => {
            const dayExp = data.expenses.filter(e => e.date === dk).reduce((s, e) => s + e.amount, 0);
            const isToday = dk === todayStr;
            const dayLabel = ["Ma", "Ti", "Ke", "To", "Pe", "La", "Su"][i];
            const maxExp = Math.max(...weekDays.map(d => data.expenses.filter(e => e.date === d).reduce((s, e) => s + e.amount, 0)), 1);
            const barH = dayExp > 0 ? Math.max(4, Math.round((dayExp / maxExp) * 32)) : 2;
            
            return (
              <div key={dk} className="flex flex-col items-center gap-1">
                <div className="h-8 flex items-end">
                  <div 
                    style={{ height: `${barH}px`, backgroundColor: isToday ? ac : (dayExp > 0 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)") }}
                    className="w-4.5 rounded-sm transition-all duration-300"
                  />
                </div>
                <span 
                  style={{ color: isToday ? ac : "" }}
                  className={`text-[9px] ${isToday ? 'font-extrabold' : 'text-gray-700 font-normal'}`}
                >
                  {dayLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Alerts & Cards ── */}
      {dueTasks.length > 0 && (
        <SummaryCard color="#ef4444" title={`Tehtäviä odottaa (${dueTasks.length})`} icon="task">
          {dueTasks.slice(0, 3).map(t => <Row key={t.id} color="#fca5a5">{t.title}</Row>)}
        </SummaryCard>
      )}
      
      {todayEvents.length > 0 && (
        <SummaryCard color={ac} title={`Tänään (${todayEvents.length})`} icon="calendar">
          {todayEvents.map(e => (
            <Row key={e.id} color="#a7f3d0">
              {e.time && <span className="opacity-60">{e.time} — </span>}{e.title}
            </Row>
          ))}
        </SummaryCard>
      )}

      {/* ── Finance snapshot ── */}
      <SummaryCard color={ac} title="Talous tänä kuuna" icon="wallet">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-red-400 text-[13px]">Menot: {fmt(thisMonthExp)} €</span>
          {income && <span className="text-emerald-300 text-[13px]">Tulot: {fmt(income.amount)} €</span>}
        </div>
        {balance !== null && (
          <div className={`rounded-lg py-1.5 px-2.5 flex justify-between items-center ${balance >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
            <span className="text-gray-400 text-xs">Tasapaino</span>
            <span className={`text-sm font-extrabold ${balance >= 0 ? 'text-emerald-300' : 'text-red-400'}`}>
              {balance >= 0 ? "+" : ""}{fmt(balance)} €
            </span>
          </div>
        )}
        {upcomingPayments.length > 0 && (
          <div className="mt-2 pt-2 border-t border-emerald-500/10">
            <p className="text-amber-400 text-[11px] font-extrabold mb-1 uppercase">⏰ Tulevat maksut ({upcomingPayments.length})</p>
            {upcomingPayments.map(p => <Row key={p.id} color="#fde68a">{p.title} — {fmt(p.amount)} €</Row>)}
          </div>
        )}
      </SummaryCard>

      {/* Muut kortit... (samalla logiikalla) */}
      {activePlan && (
        <SummaryCard color="#f59e0b" title="Treeni" icon="dumbbell">
          <span className="text-amber-200 text-xs">Aktiivinen: {activePlan.name} · {activePlan.exercises.length} liikettä</span>
          {data.workoutLogs[0] && <Row color="#fbbf24">Viim. treeni: {data.workoutLogs[0].date}</Row>}
        </SummaryCard>
      )}

      {dueTasks.length === 0 && todayEvents.length === 0 && upcomingBdays.length === 0 && (
        <div className="text-center text-gray-700 py-5">
          <div className="text-4xl mb-1.5">✨</div>
          <p className="text-[13px] m-0 italic">Ei kiireellisiä asioita</p>
        </div>
      )}
    </div>
  );
}

export default TodaySummary;
