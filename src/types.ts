export type PersonnelStatus = 'У строю' | 'У наряді' | 'На роботах' | 'У відпустці' | 'На лікарняному' | 'Відсутній';
export type AssignmentType = 'Наряд' | 'Інші роботи' | 'Відпустка' | 'Лікарняний' | 'Відсутній';
export type DistributionStatus = 'За списком' | 'Відпустка' | 'Лікування' | 'Відрядження' | 'Евак.група' | 'Навчання' | 'У добовому наряді' | 'В наявності' | 'Тернівка 2' | 'За межами';
export interface Soldier { id: string; fullName: string; rank: string; position: string; unit: string; photo?: string; status: PersonnelStatus; distribution?: DistributionStatus; distributionComment?: string }
export interface Assignment { id: string; soldierId: string; type: AssignmentType; startDate: string; endDate: string; place: string; comment: string; responsible: string }
export type Page = 'dashboard' | 'personnel' | 'assignments' | 'calendar' | 'duty' | 'works' | 'leave' | 'sick' | 'absent' | 'reports' | 'admin' | 'distribution';
