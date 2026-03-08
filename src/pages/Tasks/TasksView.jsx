import { useState } from "react";
import Icon from "../../components/Icon";
import { Modal, Placeholder } from "../../components/UI";
import { PRIO_CLR, PRIO_LBL } from "../../utils/helpers";

function TasksView({ data, onAddTask, onToggleTask, onDeleteTask }) {
  const [show, setShow] = useState(false);
  const [filter, setFilter] = useState("active");
  const [form, setForm] = useState({ title: "", priority: "medium", date: "", note: "" });

  function add() {
    if (!form.title.trim()) return;
    onAddTask({ 
      id: Date.now(), 
      ...form, 
      done: false 
    });
    setForm({ title: "", priority: "medium", date: "", note: "" });
    setShow(false);
  }

  const tasks = data.tasks.filter(t => 
    filter === "all" ? true : filter === "active" ? !t.done : t.done
  );

  const counts = {
    all: data.tasks.length,
    active: data.tasks.filter(t => !t.done).length,
    done: data.tasks.filter(t => t.done).length
  };

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex bg-white/5 p-1 rounded-xl gap-1">
        {[["active", "Aktiiviset"], ["done", "Tehdyt"], ["all", "Kaikki"]].map(([k, v]) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`flex-1 py-2 px-1 rounded-lg text-[11px] font-black uppercase tracking-tighter transition-all ${
              filter === k 
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20" 
                : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
            }`}
          >
            {v} <span className="opacity-50 ml-0.5">{counts[k]}</span>
          </button>
        ))}
      </div>

      {/* Quick Add Trigger */}
      <button 
        onClick={() => setShow(true)} 
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-3.5 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-emerald-900/20"
      >
        <Icon name="plus" size={16} /> Uusi tehtävä
      </button>

      {/* Task List */}
      <div className="space-y-2.5">
        {tasks.length === 0 ? (
          <Placeholder text={filter === "done" ? "Ei suoritettuja tehtäviä" : "Kaikki tehty! Lepää hetki."} />
        ) : (
          tasks.map(task => (
            <div 
              key={task.id} 
              className={`group bg-white/5 rounded-2xl p-4 border border-solid transition-all duration-300 ${
                task.done ? "opacity-40 grayscale-[0.5] border-transparent" : "border-white/5 hover:bg-white/[0.07]"
              }`}
              style={{ borderLeft: task.done ? '' : `4px solid ${PRIO_CLR[task.priority]}` }}
            >
              <div className="flex items-start gap-4">
                {/* Custom Checkbox */}
                <button 
                  onClick={() => onToggleTask(task.id)} 
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all mt-0.5 ${
                    task.done 
                      ? "bg-emerald-500 border-emerald-500 text-white" 
                      : "border-white/20 hover:border-white/40"
                  }`}
                >
                  {task.done && <Icon name="check" size={14} />}
                </button>

                <div className="flex-1 min-w-0">
                  <span className={`block text-[15px] font-bold leading-tight transition-all ${
                    task.done ? "text-gray-500 line-through" : "text-gray-100"
                  }`}>
                    {task.title}
                  </span>
                  
                  <div className="flex items-center gap-3 mt-2">
                    <span 
                      style={{ color: PRIO_CLR[task.priority], backgroundColor: `${PRIO_CLR[task.priority]}15` }}
                      className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md"
                    >
                      {PRIO_LBL[task.priority]}
                    </span>
                    {task.date && (
                      <span className="text-gray-600 text-[11px] font-medium flex items-center gap-1">
                        <Icon name="calendar" size={10} /> {task.date}
                      </span>
                    )}
                  </div>
                  
                  {task.note && (
                    <p className="text-gray-600 text-[11px] mt-2 italic line-clamp-2">
                      {task.note}
                    </p>
                  )}
                </div>

                <button 
                  onClick={() => onDeleteTask(task.id)} 
                  className="p-2 text-rose-500/30 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Icon name="trash" size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Task Modal */}
      <Modal open={show} onClose={() => setShow(false)} title="Uusi tehtävä">
        <div className="flex flex-col gap-5 py-2">
          <div className="space-y-2">
            <label className="text-gray-600 text-[10px] font-black uppercase tracking-widest ml-1">Tehtävän kuvaus</label>
            <input 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-emerald-500/50 transition-all"
              placeholder="Esim. Käy kaupassa..." 
              value={form.title} 
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-gray-600 text-[10px] font-black uppercase tracking-widest ml-1">Prioriteetti</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(PRIO_LBL).map(([k, v]) => (
                <button 
                  key={k} 
                  onClick={() => setForm(f => ({ ...f, priority: k }))} 
                  style={{ 
                    borderColor: form.priority === k ? PRIO_CLR[k] : 'transparent',
                    backgroundColor: form.priority === k ? `${PRIO_CLR[k]}15` : ''
                  }}
                  className={`py-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-tighter transition-all ${
                    form.priority === k ? '' : 'bg-white/5 text-gray-600'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-gray-600 text-[10px] font-black uppercase tracking-widest ml-1">Päivä</label>
              <input 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none" 
                type="date" 
                value={form.date} 
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-gray-600 text-[10px] font-black uppercase tracking-widest ml-1">Lisätiedot</label>
              <input 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none" 
                placeholder="Valinnainen" 
                value={form.note} 
                onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              />
            </div>
          </div>

          <button 
            onClick={add} 
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-4 font-black text-sm uppercase tracking-widest mt-2 shadow-lg shadow-emerald-900/20 active:scale-95 transition-all"
          >
            Lisää listalle
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default TasksView;
