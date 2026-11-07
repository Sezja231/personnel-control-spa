import { useMemo, useState } from 'react';
import { FileSpreadsheet, CalendarDays, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useStore } from '../store/useStore';
import { getCurrentStatus, today as localToday } from '../lib/helpers';
import type { PersonnelStatus } from '../types';

const statuses: PersonnelStatus[] = ['У строю','У наряді','На роботах','У відпустці','На лікарняному','Відсутній'];
const monthStart = () => `${localToday().slice(0,7)}-01`;
export function Reports(){
 const {soldiers,assignments}=useStore();
 const [date,setDate]=useState(localToday()); const [month,setMonth]=useState(monthStart().slice(0,7));
 const daily=useMemo(()=>soldiers.map(s=>({ПІБ:s.fullName,Звання:s.rank,Посада:s.position,Підрозділ:s.unit,Статус:getCurrentStatus(s,assignments,date),Призначення:assignments.filter(a=>a.soldierId===s.id&&a.startDate<=date&&a.endDate>=date).map(a=>a.type).join(', ')||'—'})),[soldiers,assignments,date]);
 const monthly=useMemo(()=>{
  const from=`${month}-01`, lastDay=new Date(Number(month.slice(0,4)),Number(month.slice(5,7)),0).getDate(), to=`${month}-${String(lastDay).padStart(2,'0')}`;
  return assignments.filter(a=>a.startDate<=to&&a.endDate>=from).map(a=>({ПІБ:soldiers.find(s=>s.id===a.soldierId)?.fullName??'Видалений запис',Тип:a.type,'Дата початку':a.startDate,'Дата завершення':a.endDate,Місце:a.place,Відповідальний:a.responsible,Коментар:a.comment}));
 },[assignments,soldiers,month]);
 const counts=useMemo(()=>statuses.map(status=>({Статус:status,Кількість:daily.filter(x=>x.Статус===status).length})),[daily]);
 const exportDaily=()=>{const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(daily),'Щоденне зведення');XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(counts),'Підсумок');XLSX.writeFile(wb,`zvedennia-${date}.xlsx`)};
 const exportMonthly=()=>{const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(monthly),'Призначення');XLSX.writeFile(wb,`zvit-${month}.xlsx`)};
 return <div className="space-y-5"><div><h2 className="page-title">Звіти та експорт</h2><p className="muted">Формування щоденного зведення та місячного звіту у форматі Excel</p></div>
 <section className="panel space-y-4"><div className="flex items-center gap-2"><CalendarDays className="text-blue-600"/><h3 className="font-bold">Щоденне зведення</h3></div><div className="flex flex-wrap items-end gap-3"><label className="text-sm">Дата<input className="field mt-1 block" type="date" value={date} onChange={e=>setDate(e.target.value)}/></label><button className="btn-primary" onClick={exportDaily}><FileSpreadsheet size={16}/> Експортувати Excel</button></div><div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{counts.map(x=><div className="rounded-xl bg-slate-50 p-3" key={x.Статус}><div className="text-sm text-slate-500">{x.Статус}</div><div className="text-2xl font-bold">{x.Кількість}</div></div>)}</div><p className="text-xs text-slate-500">До зведення включаються лише записи особового складу, що є в локальній базі на момент формування.</p></section>
 <section className="panel space-y-4"><div className="flex items-center gap-2"><FileSpreadsheet className="text-emerald-600"/><h3 className="font-bold">Місячний звіт</h3></div><div className="flex flex-wrap items-end gap-3"><label className="text-sm">Місяць<input className="field mt-1 block" type="month" value={month} onChange={e=>setMonth(e.target.value)}/></label><button className="btn-primary" onClick={exportMonthly}><Download size={16}/> Експортувати Excel</button></div><div className="text-sm text-slate-600">Записів призначень за період: <b>{monthly.length}</b></div><p className="text-xs text-slate-500">Звіт включає призначення, період яких перетинається з обраним місяцем.</p></section>
 </div>
}
