import { useState, type FormEvent } from 'react';
import type { Assignment, AssignmentType, Soldier } from '../types';
import { uid, overlaps } from '../lib/helpers';
import { assignmentPlaces, responsibles } from '../data/options';

const types: AssignmentType[] = ['Наряд', 'Інші роботи', 'Відпустка', 'Лікарняний', 'Відсутній'];
type Props = { soldiers: Soldier[]; existing: Assignment[]; initial?: Assignment; onSave: (value: Assignment) => void; onCancel: () => void };
export function AssignmentForm({ soldiers, existing, initial, onSave, onCancel }: Props) {
  const [value, setValue] = useState<Assignment>(() => initial ?? {
    id: uid(), soldierId: soldiers[0]?.id ?? '', type: 'Наряд',
    startDate: new Date().toISOString().slice(0, 10), endDate: new Date().toISOString().slice(0, 10),
    place: '', comment: '', responsible: ''
  });
  const [error, setError] = useState('');
  const change = (key: keyof Assignment, next: string) => setValue(old => ({ ...old, [key]: next }));
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!value.soldierId || !value.place.trim() || !value.responsible.trim()) { setError('Оберіть військовослужбовця, місце та відповідального.'); return; }
    if (value.endDate < value.startDate) { setError('Дата завершення не може бути раніше дати початку.'); return; }
    const conflict = existing.some(item => item.id !== value.id && item.soldierId === value.soldierId && overlaps(item, value));
    if (conflict) { setError('Конфлікт: у цього військовослужбовця вже є призначення на цей період.'); return; }
    onSave(value);
  };
  const places = value.place && !assignmentPlaces.includes(value.place as typeof assignmentPlaces[number]) ? [value.place, ...assignmentPlaces] : assignmentPlaces;
  const people = value.responsible && !responsibles.includes(value.responsible as typeof responsibles[number]) ? [value.responsible, ...responsibles] : responsibles;
  return <form className="space-y-4" onSubmit={submit}>
    <Select label="Військовослужбовець" value={value.soldierId} options={soldiers.map(s => ({ value: s.id, label: `${s.fullName} — ${s.unit}` }))} onChange={x => change('soldierId', x)} />
    <Select label="Тип призначення" value={value.type} options={types.map(x => ({ value: x, label: x }))} onChange={x => change('type', x)} />
    <div className="grid grid-cols-2 gap-3"><label className="text-sm font-medium">Дата початку<input type="date" className="field mt-1" value={value.startDate} onChange={e => change('startDate', e.target.value)} /></label><label className="text-sm font-medium">Дата завершення<input type="date" className="field mt-1" value={value.endDate} onChange={e => change('endDate', e.target.value)} /></label></div>
    <Select label="Місце / об’єкт" value={value.place} options={places.map(x => ({ value: x, label: x }))} onChange={x => change('place', x)} />
    <Select label="Відповідальний" value={value.responsible} options={people.map(x => ({ value: x, label: x }))} onChange={x => change('responsible', x)} />
    <label className="block text-sm font-medium">Коментар<textarea className="field mt-1" rows={3} value={value.comment} onChange={e => change('comment', e.target.value)} /></label>
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    <div className="flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={onCancel}>Скасувати</button><button type="submit" className="btn-primary" disabled={!soldiers.length}>Зберегти</button></div>
  </form>;
}
function Select({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void }) {
  return <label className="block text-sm font-medium">{label}<select className="field mt-1" value={value} onChange={e => onChange(e.target.value)}><option value="">Оберіть значення</option>{options.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>;
}
