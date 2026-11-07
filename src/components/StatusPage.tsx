import { useMemo } from 'react';
import { CalendarDays, MapPin, Users } from 'lucide-react';
import type { PersonnelStatus } from '../types';
import { useStore } from '../store/useStore';
import { getCurrentStatus, today } from '../lib/helpers';

const descriptions: Record<PersonnelStatus, string> = {
  'У строю': 'Військовослужбовці, які наразі перебувають у строю.',
  'У наряді': 'Окремий список особового складу, призначеного в наряд.',
  'На роботах': 'Окремий список особового складу, залученого до інших робіт.',
  'У відпустці': 'Військовослужбовці, які перебувають у відпустці.',
  'На лікарняному': 'Військовослужбовці, які перебувають на лікарняному.',
  'Відсутній': 'Інші випадки тимчасової відсутності.',
};

export function StatusPage({ status }: { status: PersonnelStatus }) {
  const { soldiers, assignments } = useStore();
  const date = today();
  const people = useMemo(() => soldiers.filter(s => getCurrentStatus(s, assignments, date) === status), [soldiers, assignments, date, status]);
  const activeAssignment = (soldierId: string) => assignments.find(a => a.soldierId === soldierId && a.startDate <= date && a.endDate >= date);
  return <div className="space-y-5">
    <div><h2 className="page-title">{status}</h2><p className="muted">{descriptions[status]}</p></div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <div className="panel"><p className="text-sm text-slate-500">Кількість осіб</p><p className="mt-2 text-3xl font-bold">{people.length}</p></div>
      <div className="panel"><p className="text-sm text-slate-500">Дата обліку</p><p className="mt-2 text-xl font-bold">{new Date(`${date}T00:00:00`).toLocaleDateString('uk-UA')}</p></div>
    </div>
    <div className="panel overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h3 className="font-bold">Список особового складу</h3><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{people.length} ос.</span></div>
      {people.length ? <div className="divide-y divide-slate-100">{people.map(s => { const a = activeAssignment(s.id); return <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-600">{s.fullName.split(' ').slice(0,2).map(x=>x[0]).join('')}</div><div className="min-w-0"><p className="truncate font-semibold">{s.fullName}</p><p className="text-sm text-slate-500">{s.rank} · {s.position}</p><p className="text-xs text-slate-400">{s.unit}</p></div></div>
        {a && <div className="min-w-[180px] text-sm text-slate-500"><p className="flex items-center gap-1"><CalendarDays size={14}/>{a.startDate} — {a.endDate}</p>{a.place && <p className="mt-1 flex items-center gap-1"><MapPin size={14}/>{a.place}</p>}</div>}
      </div>; })}</div> : <div className="px-5 py-14 text-center text-slate-400"><Users className="mx-auto mb-2"/><p>Наразі немає осіб у цій категорії</p></div>}
    </div>
  </div>;
}
