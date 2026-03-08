import { useState, useEffect, useCallback } from "react";
import { DEFAULT_CATEGORIES, today } from "../utils/helpers";

const STORAGE_KEY = "ruotu_v5";
const PROFILE_KEY = "ruotu_profile";

const defaultData = {
  tasks:[], reminders:[], birthdays:[], events:[],
  expenses:[], categories:[], annualPayments:[], budgets:[],
  incomes:[], workoutPlans:[], workoutLogs:[],
  savingsGoals:[], savingsDeposits:[],
  habits:[], habitLogs:[],
  notes:[],
};

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultData, ...JSON.parse(raw) };
  } catch {}
  return { ...defaultData, categories: DEFAULT_CATEGORIES };
}

function saveData(d) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch {}
}

// ─── Profiili ─────────────────────────────────────────────────────────────────
export function loadProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function saveProfile(p) {
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); } catch {}
}

// ─── Pääkoukku ────────────────────────────────────────────────────────────────
export function useAppData() {
  const [data, setData] = useState(loadData);

  // Tallennetaan aina kun data muuttuu
  useEffect(() => { saveData(data); }, [data]);

  // Geneerinen päivittäjä — komponentit käyttävät tätä suoraan
  const onData = useCallback(
    (updater) => setData(d => typeof updater === "function" ? updater(d) : updater),
    []
  );

  // ─── Kalenteri ──────────────────────────────────────────────────────────────
  const addEvent = useCallback((type, item) => {
    const key = { event:"events", task:"tasks", reminder:"reminders", birthday:"birthdays" }[type];
    setData(d => ({ ...d, [key]: [...d[key], item] }));
  }, []);

  const delEvent = useCallback((type, id) => {
    const key = { event:"events", task:"tasks", reminder:"reminders", birthday:"birthdays" }[type];
    setData(d => ({ ...d, [key]: d[key].filter(i => i.id !== id) }));
  }, []);

  // ─── Tehtävät ───────────────────────────────────────────────────────────────
  const addTask = useCallback((task) => {
    setData(d => ({ ...d, tasks: [...d.tasks, task] }));
  }, []);

  const toggleTask = useCallback((id) => {
    setData(d => ({ ...d, tasks: d.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t) }));
  }, []);

  const deleteTask = useCallback((id) => {
    setData(d => ({ ...d, tasks: d.tasks.filter(t => t.id !== id) }));
  }, []);

  // ─── Badges ─────────────────────────────────────────────────────────────────
  const pendingTasks = data.tasks.filter(t => !t.done && t.date && t.date <= today()).length;
  const badges = { tasks: pendingTasks };

  return {
    data,
    onData,
    addEvent,
    delEvent,
    addTask,
    toggleTask,
    deleteTask,
    badges,
  };
}

// ─── Ilmoitusapufunktiot ──────────────────────────────────────────────────────
export function canNotify() {
  return "Notification" in window && Notification.permission === "granted";
}

export function scheduleNotif(title, body, delayMs) {
  if (!canNotify()) return;
  setTimeout(() => { try { new Notification(title, { body, icon: "🎂" }); } catch {} }, Math.max(0, delayMs));
}

export function checkBirthdayNotifications(birthdays) {
  if (!canNotify()) return;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  birthdays.forEach(b => {
    const [, bm, bd] = b.date.split("-");
    const next = new Date(now.getFullYear(), parseInt(bm) - 1, parseInt(bd));
    if (next < now) next.setFullYear(now.getFullYear() + 1);
    const days = Math.round((next - now) / (1000 * 60 * 60 * 24));
    if (days === 7) scheduleNotif("🎂 Syntymäpäivä tulossa!",   `${b.name} täyttää vuosia 7 päivän kuluttua`, 100);
    if (days === 2) scheduleNotif("🎂 Syntymäpäivä ylihuomenna!", `${b.name} juhlii ylihuomenna — muista onnitella!`, 200);
    if (days === 1) scheduleNotif("🎂 Syntymäpäivä huomenna!",  `${b.name} juhlii huomenna!`, 300);
    if (days === 0) scheduleNotif("🎂 Tänään on syntymäpäivä!", `Hyvää syntymäpäivää ${b.name}! 🎉`, 400);
  });
}
