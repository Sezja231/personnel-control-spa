import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Assignment, Soldier } from '../types';

let client: SupabaseClient | null = null;
export function getCloudClient() {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!url || !key) return null;
  if (!client) client = createClient(url, key);
  return client;
}
export type WorkspaceData = { soldiers: Soldier[]; assignments: Assignment[] };
const WORKSPACE_ID = '00000000-0000-0000-0000-000000000001';
export async function saveCloudData(data: WorkspaceData) {
  const db = getCloudClient(); if (!db) throw new Error('Не налаштовано підключення до хмарної бази даних.');
  const { error } = await db.from('personnel_shared_workspace').upsert({ workspace_id: WORKSPACE_ID, data, updated_at: new Date().toISOString() }, { onConflict: 'workspace_id' });
  if (error) throw error;
}
export async function loadCloudData(): Promise<WorkspaceData | null> {
  const db = getCloudClient(); if (!db) throw new Error('Не налаштовано підключення до хмарної бази даних.');
  const { data, error } = await db.from('personnel_shared_workspace').select('data').eq('workspace_id', WORKSPACE_ID).maybeSingle();
  if (error) throw error;
  return data?.data as WorkspaceData | null;
}
