import { useState } from "react";
import { THEMES } from "../../theme/themes";

// ─── WelcomeScreen ────────────────────────────────────────────────────────────
export function WelcomeScreen({ onDone }) {
  const [name, setName] = useState("");
  const [themeId, setThemeId] = useState("green");
  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];

  function finish() {
    if (!name.trim()) return;
    onDone({ name: name.trim(), themeId });
  }

  return (
    <div className="min-h-screen bg-[#080d08] flex flex-col items-center justify-center p-8 font-['DM_Sans'] max-w-120 mx-auto select-none">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>
      
      {/* Logo Section */}
      <div className="text-center mb-10 animate-in fade-in zoom-in duration-700">
        <div className="flex items-baseline gap-0.5 justify-center mb-2">
          <span className="text-gray-100 font-['Syne'] text-5xl font-extrabold tracking-tighter">Ruotu</span>
          <span style={{ color: theme.primary }} className="text-5xl font-extrabold font-['Syne']">.</span>
        </div>
        <p className="text-gray-600 text-[13px] font-bold uppercase tracking-[0.2em] ml-1">Henkilökohtainen apuri</p>
      </div>

      {/* Card Section */}
      <div className="w-full bg-white/5 backdrop-blur-sm rounded-4xl p-8 border border-white/5 shadow-2xl shadow-black/50">
        <h1 className="text-gray-100 text-2xl font-extrabold font-['Syne'] mb-1.5">Tervetuloa! 👋</h1>
        <p className="text-gray-500 text-sm mb-8">Aloitetaan asettamalla nimesi ja teemaväri.</p>

        <div className="space-y-6">
          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-gray-600 text-[10px] font-black uppercase tracking-widest ml-1">Nimesi</label>
            <input
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-lg text-white outline-none focus:ring-2 transition-all placeholder:text-gray-700"
              style={{ '--tw-ring-color': `${theme.primary}44` }}
              placeholder="Esim. Mikko"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && finish()}
              autoFocus
            />
          </div>

          {/* Theme Grid */}
          <div className="space-y-3">
            <label className="text-gray-600 text-[10px] font-black uppercase tracking-widest ml-1">Valitse teema</label>
            <div className="grid grid-cols-3 gap-3">
              {THEMES.map(t => (
                <button 
                  key={t.id} 
                  onClick={() => setThemeId(t.id)} 
                  style={{ 
                    backgroundColor: themeId === t.id ? `${t.primary}15` : '',
                    borderColor: themeId === t.id ? t.primary : 'transparent'
                  }}
                  className={`group flex flex-col items-center gap-3 p-4 rounded-[20px] border-2 transition-all cursor-pointer ${themeId === t.id ? 'shadow-lg shadow-black/20' : 'bg-white/5 border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <div 
                    className="w-10 h-10 rounded-full shadow-inner transition-transform group-hover:scale-110" 
                    style={{ background: `linear-gradient(135deg, ${t.primary}, ${t.secondary})` }}
                  />
                  <span className={`text-[10px] font-black uppercase tracking-tighter ${themeId === t.id ? 'text-gray-100' : 'text-gray-600'}`}>
                    {t.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <button 
            onClick={finish} 
            disabled={!name.trim()} 
            style={{ 
              background: name.trim() ? `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` : '#1f2937',
              boxShadow: name.trim() ? `0 10px 25px -5px ${theme.primary}44` : 'none'
            }}
            className="w-full text-white rounded-[20px] py-4.5 font-black text-[15px] uppercase tracking-widest transition-all active:scale-[0.98] disabled:cursor-not-allowed mt-4"
          >
            Aloita käyttö →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SettingsView ─────────────────────────────────────────────────────────────
export function SettingsView({ profile, onSave, notifStatus, onEnableNotif }) {
  const [name, setName] = useState(profile.name);
  const [themeId, setThemeId] = useState(profile.themeId || "green");
  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];

  function save() { 
    onSave({ name: name.trim() || profile.name, themeId }); 
  }

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-10">
      {/* Profiili Card */}
      <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1.5 h-4 rounded-full" style={{ backgroundColor: theme.primary }} />
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Käyttäjäprofiili</p>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="text-gray-600 text-[10px] font-black uppercase tracking-widest ml-1 mb-2 block">Nimesi</label>
            <input 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-[15px] text-white outline-none focus:border-white/20 transition-all"
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="Kirjoita nimesi"
            />
          </div>

          <div>
            <label className="text-gray-600 text-[10px] font-black uppercase tracking-widest ml-1 mb-3 block">Sovelluksen teema</label>
            <div className="grid grid-cols-3 gap-2.5">
              {THEMES.map(t => (
                <button 
                  key={t.id} 
                  onClick={() => setThemeId(t.id)} 
                  style={{ 
                    backgroundColor: themeId === t.id ? `${t.primary}15` : '',
                    borderColor: themeId === t.id ? t.primary : 'transparent'
                  }}
                  className={`flex flex-col items-center gap-2.5 p-3 rounded-2xl border-[1.5px] transition-all ${themeId === t.id ? 'shadow-lg' : 'bg-white/5 opacity-50 hover:opacity-100'}`}
                >
                  <div className="w-8 h-8 rounded-full" style={{ background: `linear-gradient(135deg, ${t.primary}, ${t.secondary})` }} />
                  <span className={`text-[10px] font-black uppercase tracking-tighter ${themeId === t.id ? 'text-gray-200' : 'text-gray-500'}`}>
                    {t.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={save} 
            style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
            className="w-full text-white rounded-2xl py-3.5 font-black text-sm uppercase tracking-widest shadow-lg active:scale-[0.98] transition-all"
          >
            Tallenna muutokset
          </button>
        </div>
      </div>

      {/* Ilmoitukset Card */}
      <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Ilmoitukset</p>
        <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
          <div className="space-y-1">
            <p className="text-gray-100 text-[13px] font-bold">Selainilmoitukset</p>
            <p className={`text-[11px] font-bold uppercase tracking-tighter ${notifStatus === "granted" ? 'text-emerald-500' : 'text-gray-600'}`}>
              {notifStatus === "granted" ? "Aktiivinen ✓" : notifStatus === "denied" ? "Estetty asetuksista" : "Ei käytössä"}
            </p>
          </div>
          
          {notifStatus !== "granted" && notifStatus !== "denied" && (
            <button 
              onClick={onEnableNotif} 
              className="bg-linear-to-br from-pink-500 to-rose-600 text-white border-none rounded-xl px-4 py-2 text-[11px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-rose-900/20"
            >
              Salli
            </button>
          )}
          {notifStatus === "granted" && <span className="text-2xl animate-bounce">✅</span>}
          {notifStatus === "denied" && <span className="grayscale opacity-50 text-2xl">🚫</span>}
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-white/5 rounded-3xl p-6 border border-white/5 border-dashed">
        <p className="text-gray-600 text-[9px] font-black uppercase tracking-[0.2em] mb-2 text-center">Järjestelmätiedot</p>
        <p className="text-gray-500 text-[11px] font-medium leading-relaxed text-center px-4">
          Ruotu v5 — Kaikki tiedot tallennetaan paikallisesti laitteellesi. Mitään ei lähetetä palvelimelle.
        </p>
      </div>
    </div>
  );
}
