import { Activity, BriefcaseBusiness, CalendarClock, ClipboardList, HeartPulse, Plane, UserRound, Users, type LucideIcon } from 'lucide-react';
import { useStore } from '../store/useStore';
import { getCurrentStatus, today } from '../lib/helpers';
import type { PersonnelStatus, Soldier } from '../types';
import { CloudSync } from './CloudSync';

const groups: { status: PersonnelStatus; title: string; Icon: LucideIcon; color: string; accent: string }[] = [
  { status: 'У строю', title: 'У строю', Icon: Users, color: 'bg-emerald-50 text-emerald-700', accent: 'border-emerald-200' },
  { status: 'У наряді', title: 'У наряді', Icon: ClipboardList, color: 'bg-blue-50 text-blue-700', accent: 'border-blue-200' },
  { status: 'На роботах', title: 'На роботах', Icon: BriefcaseBusiness, color: 'bg-amber-50 text-amber-700', accent: 'border-amber-200' },
  { status: 'У відпустці', title: 'У відпустці', Icon: Plane, color: 'bg-violet-50 text-violet-700', accent: 'border-violet-200' },
  { status: 'На лікарняному', title: 'На лікарняному', Icon: HeartPulse, color: 'bg-rose-50 text-rose-700', accent: 'border-rose-200' },
  { status: 'Відсутній', title: 'Відсутні', Icon: UserRound, color: 'bg-slate-100 text-slate-600', accent: 'border-slate-200' },
];

function PersonRow({ soldier, detail }: { soldier: Soldier; detail?: string }) {
  return <div className="flex items-start justify-between gap-3 border-t border-slate-100 py-3 first:border-0">
    <div className="min-w-0">
      <p className="truncate text-sm font-semibold text-slate-800">{soldier.fullName}</p>
      <p className="mt-0.5 text-xs text-slate-500">{soldier.rank} · {soldier.position}</p>
      <p className="mt-0.5 text-xs text-slate-400">{soldier.unit}</p>
    </div>
    {detail && <span className="shrink-0 text-right text-xs text-slate-500">{detail}</span>}
  </div>;
}

export function Dashboard() {
  const { soldiers, assignments } = useStore();
  const date = today();
  const currentStatus = (soldier: Soldier) => getCurrentStatus(soldier, assignments, date);
  const byStatus = (status: PersonnelStatus) => soldiers.filter(soldier => currentStatus(soldier) === status);
  const upcoming = assignments.filter(a => a.endDate >= date).sort((a, b) => a.startDate.localeCompare(b.startDate)).slice(0, 5);

  return <div className="space-y-6">
    <CloudSync />
    <div><h2 className="page-title">Панель керування</h2><p className="muted">Окремий облік особового складу за поточними статусами</p></div>

    <section aria-label="Статистика особового складу" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {groups.filter(group => group.status !== 'Відсутній').map(({ status, title, Icon, color }) => <div className="panel" key={status}>
        <div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-500">{title}</span><span className={`rounded-xl p-2.5 ${color}`}><Icon size={19}/></span></div>
        <div className="mt-3 text-3xl font-bold tracking-tight">{byStatus(status).length}</div><div className="mt-1 text-xs text-slate-400">осіб</div>
      </div>)}
      <div className="panel">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500">Кількість за посадами</span>
          <span className="rounded-xl bg-indigo-50 p-2.5 text-indigo-700"><BriefcaseBusiness size={19}/></span>
        </div>
        <div className="mt-3 max-h-32 space-y-2 overflow-y-auto">
          {Array.from(new Set(soldiers.map(s => s.position.trim()).filter(Boolean)))
            .sort((a, b) => a.localeCompare(b, 'uk'))
            .map(position => <div className="flex items-center justify-between gap-3 text-sm" key={position}>
              <span className="truncate text-slate-600">{position}</span>
              <b className="shrink-0 text-lg tabular-nums">{soldiers.filter(s => s.position.trim() === position).length}</b>
            </div>)}
          {!soldiers.some(s => s.position.trim()) && <p className="text-sm text-slate-400">Посади ще не додані</p>}
        </div>
      </div>
    </section>

    <section className="space-y-3">
      <div><h3 className="text-lg font-bold">Хто в якій категорії сьогодні</h3><p className="muted">Списки оновлюються автоматично за активними призначеннями та статусом у картці військовослужбовця.</p></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {groups.map(({ status, title, Icon, color, accent }) => {
          const people = byStatus(status);
          return <div className={`panel border ${accent}`} key={status}>
            <div className="mb-2 flex items-center justify-between gap-2"><div className="flex items-center gap-2"><span className={`rounded-lg p-2 ${color}`}><Icon size={17}/></span><h4 className="font-bold">{title}</h4></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{people.length}</span></div>
            {people.length ? <div className="max-h-64 divide-y divide-slate-100 overflow-y-auto">{people.map(person => {
              const active = assignments.find(a => a.soldierId === person.id && a.startDate <= date && a.endDate >= date);
              const detail = active ? `${active.startDate === active.endDate ? active.startDate : `${active.startDate} — ${active.endDate}`}` : undefined;
              return <PersonRow key={person.id} soldier={person} detail={detail}/>;
            })}</div> : <p className="py-6 text-center text-sm text-slate-400">Немає записів у цій категорії</p>}
          </div>;
        })}
      </div>
    </section>

    <div className="grid gap-4 lg:grid-cols-3">
      <div className="panel lg:col-span-2"><div className="mb-4 flex items-center justify-between"><h3 className="font-bold">Найближчі призначення</h3><CalendarClock className="text-slate-400"/></div>
        {upcoming.length ? <div className="divide-y divide-slate-100">{upcoming.map(a => <div className="flex flex-wrap items-center justify-between gap-3 py-3" key={a.id}><div><p className="font-semibold">{soldiers.find(s => s.id === a.soldierId)?.fullName ?? '—'}</p><p className="text-sm text-slate-500">{a.type}</p></div><div className="text-right text-xs text-slate-500">{a.startDate}<br/>до {a.endDate}</div></div>)}</div> : <p className="py-8 text-center text-sm text-slate-400">Запланованих призначень поки немає</p>}
      </div>
      <div className="panel"><h3 className="mb-4 font-bold">Склад підрозділу</h3><div className="text-4xl font-bold">{soldiers.length}</div><p className="mb-5 text-sm text-slate-500">військовослужбовців загалом</p><div className="space-y-3">{Array.from(new Set(soldiers.map(s => s.unit))).map(unit => <div className="flex justify-between text-sm" key={unit}><span className="text-slate-600">{unit}</span><b>{soldiers.filter(s => s.unit === unit).length}</b></div>)}</div></div>
    </div>
    <p className="flex items-center gap-2 text-xs text-slate-400"><Activity size={14}/> Статус визначається за активним призначенням на поточну дату; якщо його немає — використовується статус картки.</p>
  </div>;
}
