import { useState } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { Soldier, PersonnelStatus } from '../types';
import { uid } from '../lib/helpers';

const allowedStatuses: PersonnelStatus[] = ['У строю', 'У наряді', 'На роботах', 'У відпустці', 'На лікарняному', 'Відсутній'];
const normalize = (row: Record<string, unknown>, names: string[]) => {
  const key = Object.keys(row).find(k => names.includes(k.trim().toLocaleLowerCase('uk-UA')));
  return key ? String(row[key] ?? '').trim() : '';
};
export function ExcelImport({ onImport }: { onImport: (soldiers: Soldier[]) => void }) {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const read = async (file?: File) => {
    if (!file) return;
    setBusy(true); setMessage('');
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      const first = workbook.SheetNames[0];
      if (!first) throw new Error('У файлі немає аркушів.');
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[first], { defval: '' });
      const imported = rows.map(row => {
        const fullName = normalize(row, ['піб', 'прізвище ім’я по батькові', 'прізвище ім\'я по батькові', 'п.і.б.', 'фио', 'повне ім’я']);
        const rank = normalize(row, ['звання', 'військове звання', 'rank']) || 'Солдат';
        const position = normalize(row, ['посада', 'position']);
        const unit = normalize(row, ['підрозділ', 'підрозділ / відділення', 'відділення', 'unit']);
        const rawStatus = normalize(row, ['статус', 'status']);
        const status = allowedStatuses.includes(rawStatus as PersonnelStatus) ? rawStatus as PersonnelStatus : 'У строю';
        return { id: uid(), fullName, rank, position, unit, status } satisfies Soldier;
      }).filter(s => s.fullName && s.position && s.unit);
      if (!imported.length) throw new Error('Не знайдено рядків із заповненими ПІБ, посадою та підрозділом. Перевірте заголовки стовпців.');
      onImport(imported);
      setMessage(`Імпортовано записів: ${imported.length}. Неповні рядки пропущено.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Не вдалося прочитати Excel-файл.'); }
    finally { setBusy(false); }
  };
  return <div className="flex flex-wrap items-center gap-2"><label className={`btn-secondary cursor-pointer ${busy ? 'pointer-events-none opacity-50' : ''}`}><FileSpreadsheet size={16}/>{busy ? 'Читання…' : 'Імпорт Excel'}<input type="file" accept=".xlsx,.xls,.csv" className="hidden" disabled={busy} onChange={e => { void read(e.target.files?.[0]); e.currentTarget.value = ''; }}/></label>{message && <span role="status" className="text-xs text-slate-600">{message}</span>}</div>;
}
