import { useMemo, useState } from 'react';
import { MapPin, Search, Users } from 'lucide-react';
import type { DistributionStatus, Soldier } from '../types';
import { useStore } from '../store/useStore';
import { useAccess } from '../lib/useAccess';

const options: DistributionStatus[] = [
  'За списком',
  'Відпустка',
  'Лікування',
  'Відрядження',
  'Евак.група',
  'Навчання',
  'У добовому наряді',
  'В наявності',
  'Тернівка 2',
  'За межами',
];

export function Distribution() {
  const { isAdmin } = useAccess();
  const { soldiers, updateSoldier } = useStore();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Усі категорії');

  const rows = useMemo(() => soldiers
    .filter(s => `${s.fullName} ${s.rank} ${s.position} ${s.unit}`.toLowerCase().includes(query.toLowerCase()))
    .filter(s => filter === 'Усі категорії' || (s.distribution ?? 'За списком') === filter)
    .sort((a, b) => a.fullName.localeCompare(b.fullName, 'uk')),
    [soldiers, query, filter]);

  const counts = options.map(option => ({
    option,
    count: soldiers.filter(s => (s.distribution ?? 'За списком') === option).length,
  }));

  const change = (soldier: Soldier, patch: Partial<Soldier>) => {
    if (!isAdmin) return;
    updateSoldier({ ...soldier, ...patch });
  };

  return <div className="space-y-5">
    {!isAdmin && <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
      Режим перегляду. Змінювати розподіл може лише адміністратор.
    </div>}
    <div>
      <h2 className="page-title">Розподіл</h2>
      <p className="muted">Місце перебування та поточна категорія особового складу</p>
    </div>

    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {counts.map(({ option, count }) => <button key={option}
        onClick={() => setFilter(filter === option ? 'Усі категорії' : option)}
        className={`panel text-left transition hover:border-blue-300 ${filter === option ? 'border-blue-500 ring-2 ring-blue-100' : ''}`}>
        <p className="text-xs font-medium text-slate-500">{option}</p>
        <p className="mt-2 text-2xl font-bold">{count}</p>
        <p className="text-xs text-slate-400">осіб</p>
      </button>)}
    </section>

    <div className="panel flex flex-wrap gap-3">
      <div className="relative min-w-[220px] flex-1">
        <Search className="absolute left-3 top-3 text-slate-400" size={17}/>
        <input className="field pl-10" placeholder="Пошук за ПІБ, званням, посадою або підрозділом…"
          value={query} onChange={e => setQuery(e.target.value)}/>
      </div>
      <select className="field w-auto min-w-48" value={filter} onChange={e => setFilter(e.target.value)}>
        <option>Усі категорії</option>
        {options.map(option => <option key={option}>{option}</option>)}
      </select>
    </div>

    <div className="panel overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-4">Військовослужбовець</th>
              <th className="px-4 py-4">Звання</th>
              <th className="px-4 py-4">Посада</th>
              <th className="px-4 py-4">Підрозділ</th>
              <th className="px-4 py-4">Розподіл</th>
              <th className="px-4 py-4">Коментар</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map(soldier => <tr key={soldier.id} className="hover:bg-slate-50/70">
              <td className="px-5 py-3 font-semibold text-slate-800">{soldier.fullName}</td>
              <td className="px-4 py-3">{soldier.rank}</td>
              <td className="px-4 py-3">{soldier.position}</td>
              <td className="px-4 py-3">{soldier.unit}</td>
              <td className="px-4 py-3">
                {isAdmin
                  ? <select className="field min-w-44" value={soldier.distribution ?? 'За списком'}
                      onChange={e => change(soldier, { distribution: e.target.value as DistributionStatus })}>
                      {options.map(option => <option key={option}>{option}</option>)}
                    </select>
                  : <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700"><MapPin size={13}/>{soldier.distribution ?? 'За списком'}</span>}
              </td>
              <td className="px-4 py-3">
                {isAdmin
                  ? <input className="field min-w-48" value={soldier.distributionComment ?? ''} placeholder="Коментар"
                      onChange={e => change(soldier, { distributionComment: e.target.value })}/>
                  : <span className="text-slate-500">{soldier.distributionComment || '—'}</span>}
              </td>
            </tr>)}
            {!rows.length && <tr><td colSpan={6} className="py-12 text-center text-slate-400"><Users className="mx-auto mb-2"/>Записів не знайдено</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="border-t px-5 py-3 text-xs text-slate-500">Показано {rows.length} із {soldiers.length} військовослужбовців</div>
    </div>
  </div>;
}
