import { useState, type FormEvent } from 'react';
import type { Soldier, PersonnelStatus } from '../types';
import { uid } from '../lib/helpers';
import { ranks, positions, units } from '../data/options';

const statuses: PersonnelStatus[] = ['У строю', 'У наряді', 'На роботах', 'У відпустці', 'На лікарняному', 'Відсутній'];

type Props = { initial?: Soldier; onSave: (value: Soldier) => void; onCancel: () => void };
export function SoldierForm({ initial, onSave, onCancel }: Props) {
  const [value, setValue] = useState<Soldier>(() => initial ?? {
    id: uid(), fullName: '', rank: 'Солдат', position: '', unit: '', status: 'У строю'
  });
  const [error, setError] = useState('');
  const change = (key: keyof Soldier, next: string) => setValue(old => ({ ...old, [key]: next }));
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!value.fullName.trim() || !value.rank.trim() || !value.position.trim() || !value.unit.trim()) {
      setError('Заповніть ПІБ, звання, посаду та підрозділ.'); return;
    }
    onSave({ ...value, fullName: value.fullName.trim() });
  };
  return <form className="space-y-4" onSubmit={submit}>
    <Field label="ПІБ" value={value.fullName} onChange={x => change('fullName', x)} placeholder="Прізвище Ім’я По батькові" />
    <SelectField label="Військове звання" value={value.rank} options={ranks} onChange={x => change('rank', x)} />
    <SelectField label="Посада" value={value.position} options={positions} onChange={x => change('position', x)} />
    <SelectField label="Підрозділ / відділення" value={value.unit} options={units} onChange={x => change('unit', x)} />
    <SelectField label="Статус" value={value.status} options={statuses} onChange={x => change('status', x)} />
    <Field label="Фото (URL, необов’язково)" value={value.photo ?? ''} onChange={x => change('photo', x)} placeholder="https://…" />
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    <div className="flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={onCancel}>Скасувати</button><button type="submit" className="btn-primary">Зберегти</button></div>
  </form>;
}
function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="block text-sm font-medium">{label}<input className="field mt-1" value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} /></label>;
}
function SelectField({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void }) {
  // Дозволяє зберегти старі записи, якщо їх значення відсутнє в оновленому довіднику.
  const values = value && !options.includes(value) ? [value, ...options] : options;
  return <label className="block text-sm font-medium">{label}<select className="field mt-1" value={value} onChange={e => onChange(e.target.value)}><option value="">Оберіть значення</option>{values.map(item => <option key={item} value={item}>{item}</option>)}</select></label>;
}
