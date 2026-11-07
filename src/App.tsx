import { useState } from 'react';
import { LayoutDashboard, Users, ClipboardList, CalendarDays, ShieldCheck, Menu, X, BriefcaseBusiness, Plane, HeartPulse, UserX, ListChecks, FileSpreadsheet, Settings } from 'lucide-react';
import type { Page, PersonnelStatus } from './types';
import { Dashboard } from './components/Dashboard';
import { Personnel } from './components/Personnel';
import { Assignments } from './components/Assignments';
import { Calendar } from './components/Calendar';
import { StatusPage } from './components/StatusPage';
import { Reports } from './components/Reports';
import { Admin } from './components/Admin';
import { useAccess } from './lib/useAccess';

type NavItem = [Page, string, typeof LayoutDashboard];
const nav: NavItem[] = [
  ['dashboard','Огляд',LayoutDashboard], ['personnel','Особовий склад',Users],
  ['duty','У наряді',ClipboardList], ['works','На роботах',BriefcaseBusiness],
  ['leave','У відпустці',Plane], ['sick','На лікарняному',HeartPulse],
  ['absent','Відсутні',UserX], ['assignments','Усі призначення',ListChecks], ['calendar','Календар',CalendarDays], ['reports','Звіти та Excel',FileSpreadsheet], ['admin','Адміністрування',Settings],
];
const titles: Record<Page,string> = {dashboard:'Огляд',personnel:'Особовий склад',assignments:'Усі призначення',calendar:'Календар',duty:'У наряді',works:'На роботах',leave:'У відпустці',sick:'На лікарняному',absent:'Відсутні',reports:'Звіти та Excel',admin:'Адміністрування'};
const statuses: Partial<Record<Page,PersonnelStatus>> = {duty:'У наряді',works:'На роботах',leave:'У відпустці',sick:'На лікарняному',absent:'Відсутній'};
export default function App(){
 const [page,setPage]=useState<Page>('dashboard'),[open,setOpen]=useState(false);
 const { isAdmin } = useAccess();
 const content = page==='dashboard'?<Dashboard/>:page==='personnel'?<Personnel/>:page==='assignments'?<Assignments/>:page==='calendar'?<Calendar/>:page==='reports'?<Reports/>:page==='admin'?<Admin/>:<StatusPage status={statuses[page] ?? 'У строю'}/>;
 return <div className="min-h-screen bg-slate-50 text-slate-900">
  <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-900 text-white transition-transform lg:translate-x-0 ${open?'translate-x-0':'-translate-x-full'}`}>
   <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6"><div className="rounded-xl bg-blue-500 p-2"><ShieldCheck size={22}/></div><div><div className="font-bold tracking-wide">ОСОБОВИЙ СКЛАД</div><div className="text-xs text-slate-400">Система обліку</div></div><button className="ml-auto lg:hidden" onClick={()=>setOpen(false)}><X/></button></div>
   <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">{nav.filter(([id])=>id!=='admin'||isAdmin).map(([id,label,Icon])=><button key={id} onClick={()=>{setPage(id);setOpen(false)}} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${page===id?'bg-blue-600 text-white shadow-lg shadow-blue-950/30':'text-slate-300 hover:bg-white/10 hover:text-white'}`}><Icon size={19}/>{label}</button>)}</nav>
   <div className="border-t border-white/10 p-5"><div className="text-xs text-slate-500">Версія 3.1</div><div className="mt-1 text-xs text-slate-400">Локальне збереження + хмарна синхронізація</div></div>
  </aside>
  {open&&<div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={()=>setOpen(false)}/>}
  <div className="lg:pl-64"><header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-8"><div className="flex items-center gap-3"><button className="icon-btn lg:hidden" onClick={()=>setOpen(true)}><Menu/></button><h1 className="font-semibold">{titles[page]}</h1></div><div className="text-xs font-medium text-slate-500">{new Date().toLocaleDateString('uk-UA',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div></header><main className="mx-auto max-w-[1500px] space-y-5 p-4 sm:p-8">{content}</main><footer className="px-8 pb-6 text-center text-xs text-slate-400">Облік особового складу · локальна та хмарна версія</footer></div>
 </div>;
}
