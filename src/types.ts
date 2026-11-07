export type PersonnelStatus = 'У строю' | 'У наряді' | 'На роботах' | 'У відпустці' | 'На лікарняному' | 'Відсутній';
export type AssignmentType = 'Наряд' | 'Інші роботи' | 'Відпустка' | 'Лікарняний' | 'Відсутній';
export interface Soldier { id: string; fullName: string; rank: string; position: string; unit: string; photo?: string; status: PersonnelStatus }
export interface Assignment { id: string; soldierId: string; type: AssignmentType; startDate: string; endDate: string; place: string; comment: string; responsible: string }
export type Page = 'dashboard' | 'personnel' | 'assignments' | 'calendar' | 'duty' | 'works' | 'leave' | 'sick' | 'absent' | 'reports' | 'admin';
