import { useState, useEffect } from "react";
import { useAppData, loadProfile, saveProfile, checkBirthdayNotifications } from "./store/useAppData";
import { getTheme } from "./theme/themes";

// Pages
import HomeView     from "./pages/Home/HomeView";
import CalendarView from "./pages/Calendar/CalendarView";
import TasksView    from "./pages/Tasks/TasksView";
import FinanceView  from "./pages/Finance/FinanceView";
import SavingsView  from "./pages/Savings/SavingsView";
import WorkoutView  from "./pages/Workout/WorkoutView";
import { SettingsView, WelcomeScreen } from "./pages/Settings";

// Components
import BottomNav from "./components/BottomNav";
import QuickAdd  from "./components/QuickAdd";

export default function App() {
  const { data, onData, addEvent, delEvent, addTask, toggleTask, deleteTask, badges } = useAppData();

  const [profile,     setProfile]     = useState(loadProfile);
  const [tab,         setTab]         = useState("home");
  const [moreMenu,    setMoreMenu]    = useState(false);
  const [quickAdd,    setQuickAdd]    = useState(false);
  const [notifStatus, setNotifStatus] = useState(() => "Notification" in window ? Notification.permission : "unsupported");
  const [notifBanner, setNotifBanner] = useState(false);

  const theme = getTheme(profile?.themeId);

  // Tallennetaan profiili aina kun se muuttuu
  useEffect(() => { if (profile) saveProfile(profile); }, [profile]);

  // Tarkistetaan syntymäpäiväilmoitukset kun data latautuu
  useEffect(() => {
    if (notifStatus === "granted") checkBirthdayNotifications(data.birthdays);
  }, [data.birthdays, notifStatus]);

  // Näytetään ilmoitusbanneri ensikerralla
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") setNotifBanner(true);
  }, []);

  async function enableNotifications() {
    const perm = await Notification.requestPermission();
    setNotifStatus(perm);
    setNotifBanner(false);
    if (perm === "granted") checkBirthdayNotifications(data.birthdays);
  }

  function handleProfileSave(prof) {
    setProfile(prof);
    saveProfile(prof);
  }

  // Ensikirjautuminen → tervetulosivu
  if (!profile) return <WelcomeScreen onDone={handleProfileSave}/>;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: ${theme.bg}; }
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="month"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator { filter: invert(0.4); }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: ${theme.primary}44; border-radius: 4px; }
        input::placeholder { color: #374151; }
      `}</style>

      <div style={{ minHeight:"100vh", background:theme.bg, fontFamily:"'DM Sans',sans-serif", display:"flex", flexDirection:"column", maxWidth:480, margin:"0 auto" }}>

        {/* Header */}
        <div style={{ padding:"20px 20px 0", background:`linear-gradient(180deg,${theme.headerBg},transparent)`, flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"baseline", gap:1 }}>
            <h1 style={{ color:"#f1f5f9", fontFamily:"'Syne',serif", fontSize:27, fontWeight:800, margin:0, letterSpacing:"-0.03em" }}>Ruotu</h1>
            <span style={{ color:theme.primary, fontSize:27, fontWeight:800, fontFamily:"'Syne',serif" }}>.</span>
          </div>
          <p style={{ color:theme.bg==="#080d08"?"#1a2e1a":"#1a1a2e", fontSize:10, margin:"1px 0 14px", letterSpacing:"0.1em", fontWeight:800 }}>HENKILÖKOHTAINEN APURI</p>
        </div>

        {/* Ilmoitusbanneri */}
        {notifBanner && (
          <div style={{ margin:"0 18px 8px", background:"rgba(236,72,153,0.1)", border:"1px solid rgba(236,72,153,0.25)", borderRadius:14, padding:"12px 14px", display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:20 }}>🔔</span>
            <div style={{ flex:1 }}>
              <p style={{ color:"#f9a8d4", fontSize:12, fontWeight:800, margin:"0 0 2px" }}>Salli ilmoitukset</p>
              <p style={{ color:"#6b7280", fontSize:11, margin:0 }}>Saa muistutuksia syntymäpäivistä ja tapahtumista</p>
            </div>
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={enableNotifications} style={{ background:"linear-gradient(135deg,#ec4899,#db2777)", border:"none", borderRadius:9, padding:"7px 12px", color:"#fff", fontSize:11, fontWeight:800, cursor:"pointer" }}>Salli</button>
              <button onClick={() => setNotifBanner(false)} style={{ background:"rgba(255,255,255,0.06)", border:"none", borderRadius:9, padding:"7px 10px", color:"#6b7280", fontSize:11, cursor:"pointer" }}>✕</button>
            </div>
          </div>
        )}

        {/* Sisältö */}
        <div style={{ flex:1, padding:"0 18px 100px", overflowY:"auto" }}>
          {tab === "home"     && <HomeView     data={data} onData={onData} profile={profile} theme={theme} onQuickAdd={() => setQuickAdd(true)}/>}
          {tab === "calendar" && <CalendarView data={data} onAddEvent={addEvent} onDeleteEvent={delEvent} notifStatus={notifStatus}/>}
          {tab === "tasks"    && <TasksView    data={data} onAddTask={addTask} onToggleTask={toggleTask} onDeleteTask={deleteTask}/>}
          {tab === "finance"  && <FinanceView  data={data} onData={onData}/>}
          {tab === "savings"  && <SavingsView  data={data} onData={onData}/>}
          {tab === "workout"  && <WorkoutView  data={data} onData={onData}/>}
          {tab === "settings" && <SettingsView profile={profile} onSave={handleProfileSave} notifStatus={notifStatus} onEnableNotif={enableNotifications}/>}
        </div>

        <QuickAdd open={quickAdd} onClose={() => setQuickAdd(false)} data={data} onData={onData} theme={theme}/>

        <BottomNav tab={tab} setTab={setTab} moreMenu={moreMenu} setMoreMenu={setMoreMenu} theme={theme} badges={badges}/>
      </div>
    </>
  );
}
