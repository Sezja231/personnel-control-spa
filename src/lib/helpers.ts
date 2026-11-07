import type { Assignment, AssignmentType, Soldier, PersonnelStatus } from '../types';
export const today = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
export const uid = () => crypto.randomUUID();
export const statusForType = (type: AssignmentType): PersonnelStatus => ({'Наряд':'У наряді','Інші роботи':'На роботах','Відпустка':'У відпустці','Лікарняний':'На лікарняному','Відсутній':'Відсутній'}[type] as PersonnelStatus);
export const activeOn = (a:Assignment, date:string) => a.startDate <= date && a.endDate >= date;
export const overlaps = (a:Pick<Assignment,'startDate'|'endDate'>, b:Pick<Assignment,'startDate'|'endDate'>) => a.startDate <= b.endDate && b.startDate <= a.endDate;
export const getCurrentStatus = (s:Soldier, assignments:Assignment[], date=today()):PersonnelStatus => { const a=assignments.find(x=>x.soldierId===s.id && activeOn(x,date)); return a ? statusForType(a.type) : s.status; };
