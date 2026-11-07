import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Assignment, Soldier } from '../types';
interface AppState { soldiers: Soldier[]; assignments: Assignment[]; replaceAll:(soldiers:Soldier[], assignments:Assignment[])=>void; addSoldier:(v:Soldier)=>void; updateSoldier:(v:Soldier)=>void; deleteSoldier:(id:string)=>void; addAssignment:(v:Assignment)=>void; updateAssignment:(v:Assignment)=>void; deleteAssignment:(id:string)=>void }
const demoSoldiers: Soldier[] = [];
export const useStore = create<AppState>()(persist((set)=>({
 soldiers:demoSoldiers, assignments:[], replaceAll:(soldiers,assignments)=>set({soldiers,assignments}),
 addSoldier:(v)=>set(s=>({soldiers:[v,...s.soldiers]})), updateSoldier:(v)=>set(s=>({soldiers:s.soldiers.map(x=>x.id===v.id?v:x)})),
 deleteSoldier:(id)=>set(s=>({soldiers:s.soldiers.filter(x=>x.id!==id),assignments:s.assignments.filter(a=>a.soldierId!==id)})),
 addAssignment:(v)=>set(s=>({assignments:[v,...s.assignments]})), updateAssignment:(v)=>set(s=>({assignments:s.assignments.map(x=>x.id===v.id?v:x)})), deleteAssignment:(id)=>set(s=>({assignments:s.assignments.filter(x=>x.id!==id)}))
}),{name:'personnel-control-v1',storage:createJSONStorage(()=>localStorage)}));
