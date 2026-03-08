import { useState } from "react";
import Icon from "../../components/Icon";
import { Modal, SubTabs, Placeholder } from "../../components/UI";
import { fmt, today } from "../../utils/helpers";

const SAVINGS_CATS = [
  { id: "home", label: "Asunto", icon: "🏠", color: "#f43f5e" },
  { id: "travel", label: "Lomamatka", icon: "✈️", color: "#0ea5e9" },
  { id: "car", label: "Auto", icon: "🚗", color: "#f59e0b" },
  { id: "emergency", label: "Puskuri", icon: "🛡️", color: "#8b5cf6" },
  { id: "gadget", label: "Laitteet", icon: "📱", color: "#ec4899" },
  { id: "study", label: "Koulutus", icon: "🎓", color: "#22c55e" },
  { id: "invest", label: "Sijoitus", icon: "📈", color: "#14b8a6" },
  { id: "other", label: "Muu", icon: "🎯", color: "#94a3b8" },
];

function SavingsView({ data, onData }) {
  const [sub, setSub] = useState("goals");
  
  return (
    <div className="w-full space-y-4">
      <SubTabs 
        tabs={[
          ["goals", "🎯 Tavoitteet"], 
          ["deposit", "➕ Lisää säästö"], 
          ["history", "📋 Historia"]
        ]} 
        value={sub} 
        onChange={setSub} 
        color="#14b8a6"
      />
      <div className="animate-in fade-in duration-300">
        {sub === "goals" && <SavingsGoals data={data} onData={onData} onDeposit={() => setSub("deposit")} />}
        {sub === "deposit" && <SavingsDeposit data={data} onData={onData} onDone={() => setSub("goals")} />}
        {sub === "history" && <SavingsHistory data={data} onData={onData} />}
      </div>
    </div>
  );
}

// ─── TAVOITTEET ───────────────────────────────────────────────────────────
function SavingsGoals({ data, onData, onDeposit }) {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name: "", category: "travel", target: "", deadline: "", note: "", color: "#0ea5e9", icon: "✈️" });

  const savedFor = (goalId) => (data.savingsDeposits || [])
    .filter(d => Number(d.goalId) === Number(goalId))
    .reduce((s, d) => s + (parseFloat(d.amount) || 0), 0);

  const totalSaved = (data.savingsGoals || []).reduce((s, g) => s + savedFor(g.id), 0);
  const totalTarget = (data.savingsGoals || []).reduce((s, g) => s + (parseFloat(g.target) || 0), 0);

  function add() {
    const targetNum = parseFloat(form.target);
    if (!form.name.trim() || isNaN(targetNum) || targetNum <= 0) return;
    
    onData(d => ({ 
      ...d, 
      savingsGoals: [
        ...(d.savingsGoals || []), 
        { id: Date.now(), ...form, target: targetNum, createdAt: today() }
      ] 
    }));
    setForm({ name: "", category: "travel", target: "", deadline: "", note: "", color: "#0ea5e9", icon: "✈️" });
    setShow(false);
  }

  const daysLeft = (deadline) => {
    if (!deadline) return null;
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const d = new Date(deadline);
    return Math.round((d - now) / (1000 * 60 * 60 * 24));
  };

  const monthlyNeeded = (goal) => {
    const saved = savedFor(goal.id);
    const remaining = goal.target - saved;
    const days = daysLeft(goal.deadline);
    if (remaining <= 0 || !days || days <= 0) return null;
    return remaining / (days / 30);
  };

  return (
    <div className="space-y-4">
      {/* Yhteenvetokortti */}
      {data.savingsGoals?.length > 0 && (
        <div className="bg-linear-to-br from-teal-500/20 to-emerald-500/10 border border-teal-500/25 rounded-3xl p-6 shadow-xl shadow-teal-950/20">
          <p className="text-teal-400 text-[10px] font-black tracking-widest mb-1 uppercase opacity-80">Säästöt yhteensä</p>
          <p className="text-white text-3xl font-black font-['Syne'] mb-4">{fmt(totalSaved)} €</p>
          <div className="flex justify-between mb-2 text-[11px] font-bold">
            <span className="text-gray-500 uppercase">Tavoite: {fmt(totalTarget)} €</span>
            <span className="text-teal-400">{totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0}%</span>
          </div>
          <div className="bg-white/10 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-linear-to-r from-teal-500 to-emerald-400 h-full transition-all duration-1000"
              style={{ width: `${totalTarget > 0 ? Math.min(100, (totalSaved / totalTarget) * 100) : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Toiminnot */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setShow(true)} className="bg-white/5 hover:bg-white/10 text-white rounded-2xl py-4 font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all border border-white/5 active:scale-95">
          <Icon name="plus" size={16} /> Uusi tavoite
        </button>
        <button onClick={onDeposit} className="bg-teal-600 hover:bg-teal-500 text-white rounded-2xl py-4 font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-900/20 active:scale-95">
          <Icon name="piggy-bank" size={16} /> Lisää säästö
        </button>
      </div>

      {/* Tavoitelista */}
      <div className="space-y-3">
        {!data.savingsGoals?.length ? (
          <Placeholder text="Ei tavoitteita. Unelmoi ja säästä!" />
        ) : (
          data.savingsGoals.map(goal => {
            const saved = savedFor(goal.id);
            const pct = Math.min(100, goal.target > 0 ? (saved / goal.target) * 100 : 0);
            const done = saved >= goal.target;
            const days = daysLeft(goal.deadline);
            const monthly = monthlyNeeded(goal);

            return (
              <div key={goal.id} className={`bg-white/5 rounded-[22px] p-5 border transition-all ${done ? 'border-emerald-500/40 bg-emerald-500/5 shadow-lg shadow-emerald-950/20' : 'border-white/5'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div style={{ backgroundColor: `${goal.color}20`, color: goal.color }} className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                      {goal.icon}
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-base leading-tight">{goal.name}</h4>
                      <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest mt-0.5">
                        {SAVINGS_CATS.find(c => c.id === goal.category)?.label || "Muu"}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => onData(d => ({ ...d, savingsGoals: d.savingsGoals.filter(g => g.id !== goal.id), savingsDeposits: d.savingsDeposits.filter(dep => Number(dep.goalId) !== Number(goal.id)) }))} className="p-2 text-gray-700 hover:text-rose-500 transition-colors">
                    <Icon name="trash" size={14} />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span style={{ color: goal.color }} className="text-xl font-black font-['Syne'] tracking-tight">{fmt(saved)} €</span>
                    <span className="text-gray-500 text-xs font-bold mb-0.5">/ {fmt(goal.target)} €</span>
                  </div>
                  <div className="bg-white/5 rounded-full h-3 overflow-hidden p-0.5 border border-white/5">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 relative"
                      style={{ 
                        width: `${pct}%`, 
                        background: done ? 'linear-gradient(90deg,#10b981,#34d399)' : `linear-gradient(90deg,${goal.color},${goal.color}aa)` 
                      }}
                    >
                      {pct > 20 && <div className="absolute inset-0 bg-white/20 animate-pulse" />}
                    </div>
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter pt-1">
                    <span className="text-gray-500">Jäljellä: {fmt(Math.max(0, goal.target - saved))} €</span>
                    {days !== null && (
                      <span className={days < 14 && !done ? 'text-orange-500 animate-pulse' : 'text-gray-600'}>
                        {done ? "Valmis!" : days <= 0 ? "Aika umpeutui" : `${days} päivää`}
                      </span>
                    )}
                  </div>
                </div>

                {monthly && !done && (
                  <div className="mt-4 bg-white/3 rounded-xl px-4 py-3 flex justify-between items-center border border-white/5">
                    <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Suositus / kk</span>
                    <span className="text-teal-400 text-sm font-black font-['Syne']">{fmt(monthly)} €</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Uusi tavoite Moduuli */}
      <Modal open={show} onClose={() => setShow(false)} title="Uusi tavoite">
        <div className="space-y-5 py-2">
          <div className="grid grid-cols-4 gap-2">
            {SAVINGS_CATS.map(cat => (
              <button 
                key={cat.id} 
                onClick={() => setForm(f => ({ ...f, category: cat.id, color: cat.color, icon: cat.icon }))} 
                className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all ${form.category === cat.id ? 'bg-white/10 border-white/20 scale-105' : 'bg-transparent border-transparent opacity-40'}`}
              >
                <span className="text-xl">{cat.icon}</span>
                <span className="text-[8px] font-black uppercase tracking-tighter text-gray-400">{cat.label}</span>
              </button>
            ))}
          </div>
          <div className="space-y-3">
            <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm text-white outline-none focus:border-teal-500/50" placeholder="Mitä varten säästät?" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <input className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm text-white outline-none focus:border-teal-500/50" type="number" placeholder="Summa (€)" value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))} />
              <input className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm text-white outline-none focus:border-teal-500/50" type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
            </div>
          </div>
          <button onClick={add} className="w-full bg-teal-600 text-white rounded-2xl py-4 font-black text-xs uppercase tracking-widest shadow-lg shadow-teal-900/20 active:scale-95 transition-all">Luo tavoite</button>
        </div>
      </Modal>
    </div>
  );
}

// ─── TALLENNUS (CORRECTED) ────────────────────────────────────────────────
function SavingsDeposit({ data, onData, onDone }) {
  const [form, setForm] = useState({ goalId: "", amount: "", date: today(), note: "" });

  const add = () => {
    const amountNum = parseFloat(form.amount);
    
    // Validointi
    if (!form.goalId) { alert("Valitse tavoite ensin!"); return; }
    if (isNaN(amountNum) || amountNum <= 0) { alert("Syötä kelvollinen summa!"); return; }

    onData(d => ({ 
      ...d, 
      savingsDeposits: [
        ...(d.savingsDeposits || []), 
        { 
          id: Date.now(), 
          goalId: Number(form.goalId), // Varmistetaan numeroformaatti
          amount: amountNum, 
          date: form.date, 
          note: form.note 
        }
      ] 
    }));
    
    setForm({ goalId: "", amount: "", date: today(), note: "" });
    onDone();
  };

  if (!data.savingsGoals?.length) return <Placeholder text="Luo ensin säästötavoite!" />;

  return (
    <div className="bg-white/5 border border-white/5 rounded-3xl p-6 space-y-5 animate-in zoom-in-95 duration-300">
      <p className="text-teal-400 text-[10px] font-black uppercase tracking-widest text-center">Valitse tavoite ja summa</p>
      
      <div className="space-y-2 max-h-55 overflow-y-auto pr-2 custom-scrollbar">
        {data.savingsGoals.map(g => {
          const saved = (data.savingsDeposits || [])
            .filter(d => Number(d.goalId) === Number(g.id))
            .reduce((s, d) => s + d.amount, 0);
          const isSelected = form.goalId === String(g.id);

          return (
            <button 
              key={g.id} 
              type="button"
              onClick={() => setForm(f => ({ ...f, goalId: String(g.id) }))} 
              className={`w-full p-4 rounded-[18px] border-2 text-left transition-all ${
                isSelected ? 'bg-teal-500/10 border-teal-500 shadow-lg shadow-teal-900/10' : 'bg-white/5 border-transparent opacity-60'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-white font-bold text-sm">{g.icon} {g.name}</span>
                <span className="text-teal-400 text-[10px] font-black">{fmt(saved)} / {fmt(g.target)} €</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="space-y-1">
          <label className="text-[9px] text-gray-600 font-black uppercase ml-1">Summa (€)</label>
          <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-teal-500" type="number" inputMode="decimal" placeholder="0.00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] text-gray-600 font-black uppercase ml-1">Päivä</label>
          <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-teal-500" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        </div>
      </div>
      
      <button onClick={add} className="w-full bg-teal-600 hover:bg-teal-500 text-white rounded-2xl py-4 font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-teal-900/20 active:scale-95">
        Tallenna säästö
      </button>
    </div>
  );
}

// ─── HISTORIA ─────────────────────────────────────────────────────────────
function SavingsHistory({ data, onData }) {
  const sorted = [...(data.savingsDeposits || [])].sort((a, b) => b.date.localeCompare(a.date));
  const total = sorted.reduce((s, d) => s + (parseFloat(d.amount) || 0), 0);

  if (sorted.length === 0) return <Placeholder text="Ei säästöhistoriaa vielä." />;

  return (
    <div className="space-y-4">
      <div className="bg-white/5 border border-white/5 rounded-2xl p-5 text-center">
        <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest mb-1">Säästetty yhteensä</p>
        <p className="text-teal-400 text-2xl font-black font-['Syne']">{fmt(total)} €</p>
      </div>
      
      <div className="space-y-2">
        {sorted.map(dep => {
          const goal = data.savingsGoals.find(g => Number(g.id) === Number(dep.goalId));
          return (
            <div key={dep.id} className="bg-white/3 rounded-[20px] p-4 flex items-center gap-4 border border-white/5 hover:bg-white/6 transition-all group">
              <span className="text-2xl shrink-0 drop-shadow-sm">{goal?.icon || "💰"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-bold truncate leading-tight">{goal?.name || "Poistettu tavoite"}</p>
                <div className="flex gap-2 text-[10px] font-bold text-gray-600 uppercase mt-0.5">
                  <span>{dep.date}</span>
                  {dep.note && <span className="truncate italic opacity-50">"{dep.note}"</span>}
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <span className="text-teal-400 text-sm font-black font-['Syne']">+{fmt(dep.amount)}€</span>
                <button 
                  onClick={() => onData(d => ({ ...d, savingsDeposits: d.savingsDeposits.filter(x => x.id !== dep.id) }))} 
                  className="p-1 text-gray-700 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Icon name="trash" size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SavingsView;
