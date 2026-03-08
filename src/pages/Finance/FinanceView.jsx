import { useState } from "react";
import Icon from "../../components/Icon";
import { Modal, SubTabs, Placeholder, Row, SummaryCard } from "../../components/UI";
import { inp, lbl, btnG, cardS } from "../../components/SharedStyles";
import { MONTHS_FI, MONTHS_SHORT, ANN_INT, fmt, curMonthKey, pad, today } from "../../utils/helpers";

function FinanceView({ data, onData }) {
  const [sub, setSub] = useState("overview");
  return (
    <div>
      <SubTabs tabs={[["overview","📊 Yhteenveto"],["expenses","💸 Menot"],["income","💰 Tulot"],["annual","🔄 Toistuvat"],["categories","🏷️ Kategoriat"],["budget","🎯 Budjetti"]]} value={sub} onChange={setSub}/>
      {sub==="overview"   && <FinOverview   data={data} onData={onData}/>}
      {sub==="expenses"   && <FinExpenses   data={data} onData={onData}/>}
      {sub==="income"     && <FinIncome     data={data} onData={onData}/>}
      {sub==="annual"     && <FinAnnual     data={data} onData={onData}/>}
      {sub==="categories" && <FinCategories data={data} onData={onData}/>}
      {sub==="budget"     && <FinBudget     data={data} onData={onData}/>}
    </div>
  );
}

function FinOverview({ data }) {
  const now = new Date();
  const [viewMonth, setViewMonth] = useState(curMonthKey());
  const [vy, vm_] = viewMonth.split("-").map(Number);
  const vm = vm_ - 1;
  function prevM(){ const d=new Date(vy,vm-1,1); setViewMonth(`${d.getFullYear()}-${pad(d.getMonth()+1)}`); }
  function nextM(){ const d=new Date(vy,vm+1,1); setViewMonth(`${d.getFullYear()}-${pad(d.getMonth()+1)}`); }

  const monthExp  = data.expenses.filter(e=>e.date.startsWith(viewMonth));
  const totalExp  = monthExp.reduce((s,e)=>s+e.amount,0);
  const income    = data.incomes.find(i=>i.month===viewMonth);
  const incomeAmt = income?.amount||0;
  const balance   = incomeAmt - totalExp;
  const budget    = data.budgets.find(b=>b.month===viewMonth);

  const byCat = {};
  monthExp.forEach(e=>{ byCat[e.categoryId]=(byCat[e.categoryId]||0)+e.amount; });
  const catRows = Object.entries(byCat).map(([id,amt])=>({ cat:data.categories.find(c=>c.id===parseInt(id)), amt })).sort((a,b)=>b.amt-a.amt);

  const months6 = Array.from({length:6},(_,i)=>{
    const d=new Date(now.getFullYear(),now.getMonth()-5+i,1);
    const mk=`${d.getFullYear()}-${pad(d.getMonth()+1)}`;
    const exp=data.expenses.filter(e=>e.date.startsWith(mk)).reduce((s,e)=>s+e.amount,0);
    const inc=(data.incomes.find(i=>i.month===mk)?.amount)||0;
    return { label:MONTHS_SHORT[d.getMonth()], exp, inc, mk };
  });
  const maxV=Math.max(...months6.map(m=>Math.max(m.exp,m.inc)),1);

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <button onClick={prevM} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:9,padding:"7px 10px",color:"#6b7280",cursor:"pointer"}}><Icon name="chevL" size={18}/></button>
        <span style={{color:"#f1f5f9",fontFamily:"'Syne',serif",fontSize:17,fontWeight:800}}>{MONTHS_FI[vm]} {vy}</span>
        <button onClick={nextM} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:9,padding:"7px 10px",color:"#6b7280",cursor:"pointer"}}><Icon name="chevR" size={18}/></button>
      </div>

      <div style={{background:"linear-gradient(135deg,rgba(16,185,129,0.18),rgba(5,150,105,0.08))",border:"1px solid rgba(16,185,129,0.22)",borderRadius:20,padding:"18px 20px",marginBottom:12}}>
        <p style={{color:"#6ee7b7",fontSize:10,fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase",margin:"0 0 4px"}}>TALOUDENTASAPAINO</p>
        <p style={{color:balance>=0?"#f1f5f9":"#f87171",fontSize:34,fontWeight:800,margin:"0 0 14px",fontFamily:"'Syne',serif",letterSpacing:"-0.02em"}}>{balance>=0?"+":""}{fmt(balance)} €</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div style={{background:"rgba(16,185,129,0.1)",borderRadius:12,padding:"10px 12px"}}>
            <p style={{color:"#6ee7b7",fontSize:10,fontWeight:800,letterSpacing:"0.08em",margin:"0 0 2px"}}>TULOT</p>
            <p style={{color:"#f1f5f9",fontSize:18,fontWeight:800,margin:0,fontFamily:"'Syne',serif"}}>{fmt(incomeAmt)} €</p>
          </div>
          <div style={{background:"rgba(239,68,68,0.08)",borderRadius:12,padding:"10px 12px"}}>
            <p style={{color:"#f87171",fontSize:10,fontWeight:800,letterSpacing:"0.08em",margin:"0 0 2px"}}>MENOT</p>
            <p style={{color:"#f1f5f9",fontSize:18,fontWeight:800,margin:0,fontFamily:"'Syne',serif"}}>{fmt(totalExp)} €</p>
          </div>
        </div>
        {budget&&<div style={{marginTop:12}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
            <span style={{color:"#9ca3af",fontSize:11}}>Budjetti: {fmt(budget.amount)} €</span>
            <span style={{color:totalExp>budget.amount?"#f87171":"#6ee7b7",fontSize:11,fontWeight:800}}>{totalExp>budget.amount?"⚠️ Ylitetty":"✓ OK"}</span>
          </div>
          <div style={{background:"rgba(255,255,255,0.08)",borderRadius:6,height:5}}>
            <div style={{background:totalExp>budget.amount?"#ef4444":"#10b981",borderRadius:6,height:5,width:`${Math.min(100,budget.amount>0?(totalExp/budget.amount)*100:0)}%`}}/>
          </div>
        </div>}
      </div>

      {months6.some(m=>m.exp>0||m.inc>0)&&<div style={{background:"rgba(255,255,255,0.03)",borderRadius:16,padding:"14px 14px 8px",marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <p style={{color:"#4b5563",fontSize:10,fontWeight:800,letterSpacing:"0.09em",textTransform:"uppercase",margin:0}}>6 KK KEHITYS</p>
          <div style={{display:"flex",gap:10}}>
            <span style={{color:"#6ee7b7",fontSize:10,fontWeight:700}}>● Tulot</span>
            <span style={{color:"#f87171",fontSize:10,fontWeight:700}}>● Menot</span>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"flex-end",gap:6,height:70}}>
          {months6.map(m=>(
            <div key={m.mk} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
              <div style={{width:"100%",display:"flex",gap:2,alignItems:"flex-end",height:60}}>
                <div style={{flex:1,background:m.mk===viewMonth?"#10b981":"rgba(16,185,129,0.3)",borderRadius:"3px 3px 0 0",height:`${(m.inc/maxV)*58}px`,minHeight:m.inc>0?3:0}}/>
                <div style={{flex:1,background:m.mk===viewMonth?"#ef4444":"rgba(239,68,68,0.3)",borderRadius:"3px 3px 0 0",height:`${(m.exp/maxV)*58}px`,minHeight:m.exp>0?3:0}}/>
              </div>
              <span style={{color:m.mk===viewMonth?"#f1f5f9":"#374151",fontSize:9,fontWeight:700}}>{m.label}</span>
            </div>
          ))}
        </div>
      </div>}

      {catRows.length>0&&<div>
        <p style={{color:"#4b5563",fontSize:10,fontWeight:800,letterSpacing:"0.09em",textTransform:"uppercase",margin:"0 0 10px"}}>MENOT KATEGORIOITTAIN</p>
        {catRows.map(({cat,amt})=>{
          if(!cat) return null;
          const pct=totalExp>0?Math.round((amt/totalExp)*100):0;
          const isSav=cat.name.includes("Säästö");
          return (
            <div key={cat.id} style={{marginBottom:11}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,alignItems:"center"}}>
                <span style={{color:"#d1d5db",fontSize:13}}>{cat.icon} {cat.name}</span>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  {isSav&&<span style={{background:"rgba(16,185,129,0.15)",color:"#6ee7b7",fontSize:9,fontWeight:800,padding:"2px 6px",borderRadius:5}}>SÄÄSTÖ</span>}
                  <span style={{color:"#f1f5f9",fontSize:13,fontWeight:800}}>{fmt(amt)} €</span>
                  <span style={{color:"#4b5563",fontSize:11}}>{pct}%</span>
                </div>
              </div>
              <div style={{background:"rgba(255,255,255,0.06)",borderRadius:5,height:5}}>
                <div style={{background:cat.color,borderRadius:5,height:5,width:`${pct}%`}}/>
              </div>
            </div>
          );
        })}
        {incomeAmt>0&&totalExp>0&&<div style={{background:"rgba(255,255,255,0.04)",borderRadius:12,padding:"12px 14px",marginTop:14}}>
          <p style={{color:"#6b7280",fontSize:10,fontWeight:800,letterSpacing:"0.09em",margin:"0 0 8px"}}>TULOSTA KÄYTETTY</p>
          <div style={{background:"rgba(255,255,255,0.07)",borderRadius:6,height:10,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",left:0,top:0,bottom:0,background:"linear-gradient(90deg,#ef4444,#f59e0b)",width:`${Math.min(100,(totalExp/incomeAmt)*100)}%`,borderRadius:6}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:5}}>
            <span style={{color:"#f87171",fontSize:11}}>{Math.round((totalExp/incomeAmt)*100)}% käytetty</span>
            <span style={{color:"#6ee7b7",fontSize:11}}>{Math.round(((incomeAmt-totalExp)/incomeAmt)*100)}% jäljellä</span>
          </div>
        </div>}
      </div>}
    </div>
  );
}

function FinExpenses({ data, onData }) {
  const [show,setShow]=useState(false);
  const [filterCat,setFilterCat]=useState("all");
  const [form,setForm]=useState({ title:"",amount:"",categoryId:"",date:today(),note:"" });

  function add(){ if(!form.title.trim()||!form.amount||!form.categoryId) return; onData(d=>({...d,expenses:[{id:Date.now(),title:form.title,amount:parseFloat(form.amount),categoryId:parseInt(form.categoryId),date:form.date,note:form.note},...d.expenses]})); setForm({ title:"",amount:"",categoryId:"",date:today(),note:"" }); setShow(false); }

  const filtered=data.expenses.filter(e=>filterCat==="all"||e.categoryId===parseInt(filterCat));
  const grouped={};
  [...filtered].sort((a,b)=>b.date.localeCompare(a.date)).forEach(e=>{ grouped[e.date]=(grouped[e.date]||[]).concat(e); });

  return (
    <div>
      <button onClick={()=>setShow(true)} style={{...btnG("#10b981","#059669"),marginBottom:12,display:"flex",alignItems:"center",justifyContent:"center",gap:7}}><Icon name="plus" size={17}/> Lisää meno</button>
      <div style={{display:"flex",gap:5,overflowX:"auto",marginBottom:12,paddingBottom:3}}>
        <button onClick={()=>setFilterCat("all")} style={{background:filterCat==="all"?"rgba(16,185,129,0.2)":"rgba(255,255,255,0.05)",border:`1.5px solid ${filterCat==="all"?"#10b981":"transparent"}`,borderRadius:18,padding:"4px 11px",color:filterCat==="all"?"#6ee7b7":"#4b5563",cursor:"pointer",fontSize:11,fontWeight:700,whiteSpace:"nowrap",flexShrink:0}}>Kaikki</button>
        {data.categories.map(c=>(
          <button key={c.id} onClick={()=>setFilterCat(String(c.id))} style={{background:filterCat===String(c.id)?c.color+"33":"rgba(255,255,255,0.05)",border:`1.5px solid ${filterCat===String(c.id)?c.color:"transparent"}`,borderRadius:18,padding:"4px 11px",color:filterCat===String(c.id)?c.color:"#4b5563",cursor:"pointer",fontSize:11,fontWeight:700,whiteSpace:"nowrap",flexShrink:0}}>{c.icon}</button>
        ))}
      </div>
      {Object.keys(grouped).length===0 ? <Placeholder text="Ei kirjattuja menoja"/> : Object.entries(grouped).sort(([a],[b])=>b.localeCompare(a)).map(([date,items])=>{
        const dayTotal=items.reduce((s,e)=>s+e.amount,0);
        return (
          <div key={date} style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
              <span style={{color:"#4b5563",fontSize:11,fontWeight:800}}>{date}</span>
              <span style={{color:"#6b7280",fontSize:11,fontWeight:800}}>{fmt(dayTotal)} €</span>
            </div>
            {items.map(e=>{
              const cat=data.categories.find(c=>c.id===e.categoryId);
              return (
                <div key={e.id} style={{...cardS(cat?.color||"#4b5563"),display:"flex",alignItems:"center",gap:11}}>
                  <span style={{fontSize:18,flexShrink:0}}>{cat?.icon||"📦"}</span>
                  <div style={{flex:1}}>
                    <span style={{color:"#f1f5f9",fontSize:14,fontWeight:700}}>{e.title}</span>
                    {e.note&&<p style={{color:"#4b5563",fontSize:11,margin:"2px 0 0"}}>{e.note}</p>}
                  </div>
                  <span style={{color:"#f1f5f9",fontSize:15,fontWeight:800,flexShrink:0}}>{fmt(e.amount)} €</span>
                  <button onClick={()=>onData(d=>({...d,expenses:d.expenses.filter(x=>x.id!==e.id)}))} style={{background:"rgba(239,68,68,0.1)",border:"none",borderRadius:7,padding:"5px",color:"#ef4444",cursor:"pointer",flexShrink:0}}><Icon name="trash" size={13}/></button>
                </div>
              );
            })}
          </div>
        );
      })}
      <Modal open={show} onClose={()=>setShow(false)} title="Lisää meno">
        <div style={{display:"flex",flexDirection:"column",gap:13}}>
          <div><label style={lbl}>Kuvaus</label><input style={inp} placeholder="Mistä maksu?" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}/></div>
          <div><label style={lbl}>Summa (€)</label><input style={inp} type="number" step="0.01" placeholder="0.00" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))}/></div>
          <div>
            <label style={lbl}>Kategoria</label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {data.categories.map(c=>(
                <button key={c.id} onClick={()=>setForm(f=>({...f,categoryId:String(c.id)}))} style={{background:form.categoryId===String(c.id)?c.color+"33":"rgba(255,255,255,0.05)",border:`1.5px solid ${form.categoryId===String(c.id)?c.color:"transparent"}`,borderRadius:9,padding:"8px",color:form.categoryId===String(c.id)?c.color:"#4b5563",cursor:"pointer",fontSize:12,fontWeight:700,textAlign:"left"}}>{c.icon} {c.name}</button>
              ))}
            </div>
          </div>
          <div><label style={lbl}>Päivämäärä</label><input style={inp} type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/></div>
          <div><label style={lbl}>Muistiinpano</label><input style={inp} placeholder="Valinnainen..." value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))}/></div>
          <button style={btnG("#10b981","#059669")} onClick={add}>Tallenna meno</button>
        </div>
      </Modal>
    </div>
  );
}

function FinIncome({ data, onData }) {
  const now=new Date();
  const [viewMonth,setViewMonth]=useState(curMonthKey());
  const [form,setForm]=useState({ amount:"",note:"" });
  const existing=data.incomes.find(i=>i.month===viewMonth);
  const [vy,vm_]=viewMonth.split("-").map(Number); const vm=vm_-1;
  function prevM(){ const d=new Date(vy,vm-1,1); setViewMonth(`${d.getFullYear()}-${pad(d.getMonth()+1)}`); }
  function nextM(){ const d=new Date(vy,vm+1,1); setViewMonth(`${d.getFullYear()}-${pad(d.getMonth()+1)}`); }

  function save(){
    if(!form.amount) return;
    onData(d=>({...d,incomes:[...d.incomes.filter(i=>i.month!==viewMonth),{id:existing?.id||Date.now(),month:viewMonth,amount:parseFloat(form.amount),note:form.note}]}));
    setForm({ amount:"",note:"" });
  }

  const allIncomes=[...data.incomes].sort((a,b)=>b.month.localeCompare(a.month));

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <button onClick={prevM} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:9,padding:"7px 10px",color:"#6b7280",cursor:"pointer"}}><Icon name="chevL" size={18}/></button>
        <span style={{color:"#f1f5f9",fontFamily:"'Syne',serif",fontSize:17,fontWeight:800}}>{MONTHS_FI[vm]} {vy}</span>
        <button onClick={nextM} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:9,padding:"7px 10px",color:"#6b7280",cursor:"pointer"}}><Icon name="chevR" size={18}/></button>
      </div>
      <div style={{background:"rgba(255,255,255,0.04)",borderRadius:16,padding:18,marginBottom:16}}>
        {existing&&<div style={{background:"rgba(16,185,129,0.1)",borderRadius:12,padding:"12px 14px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <p style={{color:"#6ee7b7",fontSize:10,fontWeight:800,letterSpacing:"0.09em",margin:"0 0 2px"}}>TALLENNETTU TULO</p>
            <p style={{color:"#f1f5f9",fontSize:26,fontWeight:800,margin:0,fontFamily:"'Syne',serif"}}>{fmt(existing.amount)} €</p>
            {existing.note&&<p style={{color:"#6b7280",fontSize:12,margin:"3px 0 0"}}>{existing.note}</p>}
          </div>
          <button onClick={()=>onData(d=>({...d,incomes:d.incomes.filter(i=>i.id!==existing.id)}))} style={{background:"rgba(239,68,68,0.1)",border:"none",borderRadius:8,padding:"7px",color:"#ef4444",cursor:"pointer"}}><Icon name="trash" size={15}/></button>
        </div>}
        <label style={lbl}>{existing?"Päivitä tulo":"Aseta kuukausitulo"}</label>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <input style={inp} type="number" step="0.01" placeholder="Summa €" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))}/>
          <input style={inp} placeholder="Muistiinpano (esim. palkka, freelance...)" value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))}/>
          <button style={btnG("#10b981","#059669")} onClick={save}>{existing?"Päivitä":"Tallenna tulo"}</button>
        </div>
      </div>
      {allIncomes.length>0&&<div>
        <p style={{color:"#4b5563",fontSize:10,fontWeight:800,letterSpacing:"0.09em",textTransform:"uppercase",margin:"0 0 10px"}}>TALLENNETUT TULOT</p>
        {allIncomes.map(inc=>{
          const [iy,im]=inc.month.split("-").map(Number);
          const exp=data.expenses.filter(e=>e.date.startsWith(inc.month)).reduce((s,e)=>s+e.amount,0);
          const bal=inc.amount-exp;
          return (
            <div key={inc.id} style={{...cardS(bal>=0?"#10b981":"#ef4444"),display:"flex",alignItems:"center",gap:12}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{color:"#f1f5f9",fontSize:14,fontWeight:800}}>{MONTHS_FI[im-1]} {iy}</span>
                  <span style={{color:bal>=0?"#6ee7b7":"#f87171",fontSize:13,fontWeight:800}}>{bal>=0?"+":""}{fmt(bal)} €</span>
                </div>
                <div style={{display:"flex",gap:14,marginTop:3}}>
                  <span style={{color:"#6ee7b7",fontSize:11}}>↑ {fmt(inc.amount)} €</span>
                  <span style={{color:"#f87171",fontSize:11}}>↓ {fmt(exp)} €</span>
                </div>
                {inc.note&&<p style={{color:"#4b5563",fontSize:11,margin:"2px 0 0"}}>{inc.note}</p>}
              </div>
              <button onClick={()=>onData(d=>({...d,incomes:d.incomes.filter(i=>i.id!==inc.id)}))} style={{background:"rgba(239,68,68,0.1)",border:"none",borderRadius:8,padding:"6px",color:"#ef4444",cursor:"pointer"}}><Icon name="trash" size={13}/></button>
            </div>
          );
        })}
      </div>}
    </div>
  );
}

function FinAnnual({ data, onData }) {
  const [show,setShow]=useState(false);
  const [form,setForm]=useState({ title:"",amount:"",interval:"annual",nextDate:"",note:"" });
  function dU(ds){ const now=new Date(); now.setHours(0,0,0,0); const d=new Date(ds); d.setHours(0,0,0,0); return Math.round((d-now)/(1000*60*60*24)); }
  const sorted=[...data.annualPayments].sort((a,b)=>dU(a.nextDate)-dU(b.nextDate));
  const yrTotal=data.annualPayments.reduce((s,p)=>s+p.amount*({monthly:12,quarterly:4,biannual:2,annual:1}[p.interval]||1),0);
  function add(){ if(!form.title.trim()||!form.amount||!form.nextDate) return; onData(d=>({...d,annualPayments:[...d.annualPayments,{id:Date.now(),title:form.title,amount:parseFloat(form.amount),interval:form.interval,nextDate:form.nextDate,note:form.note}]})); setForm({ title:"",amount:"",interval:"annual",nextDate:"",note:"" }); setShow(false); }
  return (
    <div>
      <div style={{background:"linear-gradient(135deg,rgba(14,165,233,0.18),rgba(6,182,212,0.07))",border:"1px solid rgba(14,165,233,0.18)",borderRadius:18,padding:"14px 18px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><p style={{color:"#7dd3fc",fontSize:10,fontWeight:800,letterSpacing:"0.09em",margin:"0 0 3px"}}>VUOSIKUSTANNUS YHT.</p><p style={{color:"#f1f5f9",fontSize:26,fontWeight:800,margin:0,fontFamily:"'Syne',serif"}}>{fmt(yrTotal)} €</p></div>
        <Icon name="repeat" size={26}/>
      </div>
      <button onClick={()=>setShow(true)} style={{...btnG("#0ea5e9","#0284c7"),marginBottom:12,display:"flex",alignItems:"center",justifyContent:"center",gap:7}}><Icon name="plus" size={17}/> Lisää toistuva maksu</button>
      {sorted.length===0 ? <Placeholder text="Ei toistuvuusmaksuja"/> : sorted.map(p=>{
        const days=dU(p.nextDate), urgent=days<=14;
        return (
          <div key={p.id} style={{...cardS(urgent?"#f59e0b":"#0ea5e9")}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:11}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
                  <span style={{color:"#f1f5f9",fontSize:14,fontWeight:800}}>{p.title}</span>
                  <span style={{background:"rgba(14,165,233,0.15)",color:"#7dd3fc",fontSize:9,fontWeight:800,padding:"2px 6px",borderRadius:5}}>{ANN_INT[p.interval]}</span>
                  {urgent&&<span style={{background:"rgba(245,158,11,0.18)",color:"#fbbf24",fontSize:9,fontWeight:800,padding:"2px 6px",borderRadius:5}}>⏰ Pian</span>}
                </div>
                <div style={{display:"flex",gap:12,marginTop:5,alignItems:"center"}}>
                  <span style={{color:"#f1f5f9",fontSize:16,fontWeight:800}}>{fmt(p.amount)} €</span>
                  <span style={{color:"#4b5563",fontSize:11}}>{p.nextDate}</span>
                  <span style={{color:urgent?"#fbbf24":"#4b5563",fontSize:11,fontWeight:700}}>{days<0?"Myöhässä!":days===0?"Tänään!":days+" pv"}</span>
                </div>
              </div>
              <button onClick={()=>onData(d=>({...d,annualPayments:d.annualPayments.filter(x=>x.id!==p.id)}))} style={{background:"rgba(239,68,68,0.1)",border:"none",borderRadius:7,padding:"5px",color:"#ef4444",cursor:"pointer"}}><Icon name="trash" size={13}/></button>
            </div>
          </div>
        );
      })}
      <Modal open={show} onClose={()=>setShow(false)} title="Lisää toistuva maksu">
        <div style={{display:"flex",flexDirection:"column",gap:13}}>
          <div><label style={lbl}>Nimi</label><input style={inp} placeholder="Esim. vakuutus..." value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}/></div>
          <div><label style={lbl}>Summa (€)</label><input style={inp} type="number" step="0.01" placeholder="0.00" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))}/></div>
          <div>
            <label style={lbl}>Toistuvuus</label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {Object.entries(ANN_INT).map(([k,v])=>(
                <button key={k} onClick={()=>setForm(f=>({...f,interval:k}))} style={{background:form.interval===k?"rgba(14,165,233,0.2)":"rgba(255,255,255,0.05)",border:`1.5px solid ${form.interval===k?"#0ea5e9":"transparent"}`,borderRadius:9,padding:"8px",color:form.interval===k?"#7dd3fc":"#4b5563",cursor:"pointer",fontSize:11,fontWeight:700}}>{v}</button>
              ))}
            </div>
          </div>
          <div><label style={lbl}>Seuraava maksupäivä</label><input style={inp} type="date" value={form.nextDate} onChange={e=>setForm(f=>({...f,nextDate:e.target.value}))}/></div>
          <div><label style={lbl}>Muistiinpano</label><input style={inp} placeholder="Valinnainen..." value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))}/></div>
          <button style={btnG("#0ea5e9","#0284c7")} onClick={add}>Tallenna</button>
        </div>
      </Modal>
    </div>
  );
}

function FinCategories({ data, onData }) {
  const [show,setShow]=useState(false);
  const [form,setForm]=useState({ name:"",color:"#8b5cf6",icon:"📦" });
  const COLORS=["#ef4444","#f59e0b","#22c55e","#0ea5e9","#8b5cf6","#ec4899","#f43f5e","#14b8a6","#10b981","#94a3b8"];
  const ICONS=["🛒","🚗","🎬","💊","🏠","👗","📦","✈️","🍽️","📱","💪","🐾","🎓","💡","🎮","🏦","☕","🎯"];
  function add(){ if(!form.name.trim()) return; onData(d=>({...d,categories:[...d.categories,{id:Date.now(),name:form.name,color:form.color,icon:form.icon}]})); setForm({ name:"",color:"#8b5cf6",icon:"📦" }); setShow(false); }
  return (
    <div>
      <button onClick={()=>setShow(true)} style={{...btnG("#8b5cf6","#7c3aed"),marginBottom:14,display:"flex",alignItems:"center",justifyContent:"center",gap:7}}><Icon name="plus" size={17}/> Uusi kategoria</button>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
        {data.categories.map(c=>{
          const total=data.expenses.filter(e=>e.categoryId===c.id).reduce((s,e)=>s+e.amount,0);
          const isSav=c.name.includes("Säästö");
          return (
            <div key={c.id} style={{background:"rgba(255,255,255,0.04)",borderRadius:13,padding:"13px",borderTop:`3px solid ${c.color}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <span style={{fontSize:22}}>{c.icon}</span>
                <button onClick={()=>onData(d=>({...d,categories:d.categories.filter(x=>x.id!==c.id)}))} style={{background:"rgba(239,68,68,0.1)",border:"none",borderRadius:7,padding:"4px",color:"#ef4444",cursor:"pointer"}}><Icon name="trash" size={12}/></button>
              </div>
              <p style={{color:"#f1f5f9",fontSize:12,fontWeight:800,margin:"7px 0 1px",lineHeight:1.3}}>{c.name}</p>
              {isSav&&<span style={{background:"rgba(16,185,129,0.15)",color:"#6ee7b7",fontSize:9,fontWeight:800,padding:"2px 6px",borderRadius:5,display:"inline-block",marginBottom:4}}>SÄÄSTÖ</span>}
              <p style={{color:c.color,fontSize:14,fontWeight:800,margin:0}}>{fmt(total)} €</p>
              <p style={{color:"#374151",fontSize:10,margin:"1px 0 0"}}>{data.expenses.filter(e=>e.categoryId===c.id).length} kpl</p>
            </div>
          );
        })}
      </div>
      <Modal open={show} onClose={()=>setShow(false)} title="Uusi kategoria">
        <div style={{display:"flex",flexDirection:"column",gap:13}}>
          <div><label style={lbl}>Nimi</label><input style={inp} placeholder="Kategorian nimi" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>
          <div><label style={lbl}>Ikoni</label><div style={{display:"flex",gap:7,flexWrap:"wrap"}}>{ICONS.map(ic=><button key={ic} onClick={()=>setForm(f=>({...f,icon:ic}))} style={{background:form.icon===ic?"rgba(139,92,246,0.25)":"rgba(255,255,255,0.05)",border:`1.5px solid ${form.icon===ic?"#8b5cf6":"transparent"}`,borderRadius:8,padding:"5px 9px",cursor:"pointer",fontSize:17}}>{ic}</button>)}</div></div>
          <div><label style={lbl}>Väri</label><div style={{display:"flex",gap:7,flexWrap:"wrap"}}>{COLORS.map(cl=><button key={cl} onClick={()=>setForm(f=>({...f,color:cl}))} style={{width:30,height:30,borderRadius:8,background:cl,border:`2.5px solid ${form.color===cl?"#fff":"transparent"}`,cursor:"pointer"}}/>)}</div></div>
          <button style={btnG("#8b5cf6","#7c3aed")} onClick={add}>Lisää kategoria</button>
        </div>
      </Modal>
    </div>
  );
}

function FinBudget({ data, onData }) {
  const [viewMonth,setViewMonth]=useState(curMonthKey());
  const [form,setForm]=useState({ amount:"" });
  const existing=data.budgets.find(b=>b.month===viewMonth);
  const spent=data.expenses.filter(e=>e.date.startsWith(viewMonth)).reduce((s,e)=>s+e.amount,0);
  const income=data.incomes.find(i=>i.month===viewMonth);
  function save(){ if(!form.amount) return; onData(d=>({...d,budgets:[...d.budgets.filter(b=>b.month!==viewMonth),{id:existing?.id||Date.now(),month:viewMonth,amount:parseFloat(form.amount)}]})); setForm({ amount:"" }); }
  const allBudgets=[...data.budgets].sort((a,b)=>b.month.localeCompare(a.month));
  return (
    <div>
      <div style={{background:"rgba(255,255,255,0.04)",borderRadius:16,padding:18,marginBottom:16}}>
        <p style={{color:"#4b5563",fontSize:10,fontWeight:800,letterSpacing:"0.09em",textTransform:"uppercase",margin:"0 0 12px"}}>ASETA KUUKAUSIBUDJETTI</p>
        <div><label style={lbl}>Kuukausi</label><input style={inp} type="month" value={viewMonth} onChange={e=>setViewMonth(e.target.value)}/></div>
        <div style={{marginTop:10}}><label style={lbl}>Budjetti (€)</label><input style={inp} type="number" step="0.01" placeholder={existing?`Nykyinen: ${fmt(existing.amount)} €`:"0.00"} value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))}/></div>
        {existing&&<div style={{background:"rgba(255,255,255,0.04)",borderRadius:10,padding:"10px 12px",marginTop:10}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
            <span style={{color:"#9ca3af",fontSize:11}}>Käytetty {fmt(spent)} / {fmt(existing.amount)} €</span>
            <span style={{color:spent>existing.amount?"#f87171":"#6ee7b7",fontSize:11,fontWeight:800}}>{Math.round((spent/existing.amount)*100)}%</span>
          </div>
          <div style={{background:"rgba(255,255,255,0.08)",borderRadius:5,height:6}}>
            <div style={{background:spent>existing.amount?"#ef4444":"linear-gradient(90deg,#10b981,#059669)",borderRadius:5,height:6,width:`${Math.min(100,existing.amount>0?(spent/existing.amount)*100:0)}%`}}/>
          </div>
          {income&&<div style={{marginTop:8,color:"#6b7280",fontSize:11}}>Tulo: {fmt(income.amount)} € → Jäljellä: <span style={{color:income.amount-spent>=0?"#6ee7b7":"#f87171",fontWeight:700}}>{fmt(income.amount-spent)} €</span></div>}
        </div>}
        <button style={{...btnG("#10b981","#059669"),marginTop:12}} onClick={save}>Tallenna budjetti</button>
      </div>
      {allBudgets.length>0&&<div>
        <p style={{color:"#4b5563",fontSize:10,fontWeight:800,letterSpacing:"0.09em",textTransform:"uppercase",margin:"0 0 9px"}}>AIEMMAT BUDJETIT</p>
        {allBudgets.map(b=>{
          const s=data.expenses.filter(e=>e.date.startsWith(b.month)).reduce((s,e)=>s+e.amount,0);
          const inc=data.incomes.find(i=>i.month===b.month);
          const over=s>b.amount, [by,bm]=b.month.split("-").map(Number);
          return (
            <div key={b.id} style={{...cardS(over?"#ef4444":"#10b981"),display:"flex",alignItems:"center",gap:11}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={{color:"#f1f5f9",fontSize:13,fontWeight:800}}>{MONTHS_FI[bm-1]} {by}</span>
                  <span style={{color:over?"#f87171":"#6ee7b7",fontSize:11,fontWeight:800}}>{over?"⚠️ Ylitetty":"✓ OK"}</span>
                </div>
                <span style={{color:"#4b5563",fontSize:11}}>{fmt(s)} / {fmt(b.amount)} €{inc?` · tulo ${fmt(inc.amount)} €`:""}</span>
              </div>
              <button onClick={()=>onData(d=>({...d,budgets:d.budgets.filter(x=>x.id!==b.id)}))} style={{background:"rgba(239,68,68,0.1)",border:"none",borderRadius:7,padding:"5px",color:"#ef4444",cursor:"pointer"}}><Icon name="trash" size={13}/></button>
            </div>
          );
        })}
      </div>}
    </div>
  );
}

export default FinanceView;
