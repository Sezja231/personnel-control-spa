import { useEffect, useState } from 'react';
import { getCloudClient } from './cloud';

export type AccessRole = 'admin' | 'user' | 'guest' | 'unconfigured' | 'checking';
export function useAccess() {
  const [role, setRole] = useState<AccessRole>('checking');
  const [email, setEmail] = useState('');
  useEffect(() => {
    const db = getCloudClient();
    if (!db) { setRole('unconfigured'); return; }
    let active = true;
    const resolve = async (user: { id: string; email?: string } | null) => {
      if (!user) { if (active) { setEmail(''); setRole('guest'); } return; }
      if (active) { setEmail(user.email ?? ''); setRole('checking'); }
      const { data, error } = await db.from('user_roles').select('role').eq('user_id', user.id).maybeSingle();
      if (active) setRole(!error && data?.role === 'admin' ? 'admin' : !error && data?.role === 'user' ? 'user' : 'guest');
    };
    db.auth.getSession().then(({ data }) => resolve(data.session?.user ?? null));
    const { data: { subscription } } = db.auth.onAuthStateChange((_event, session) => { void Promise.resolve().then(() => resolve(session?.user ?? null)); });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);
  return { role, email, isAdmin: role === 'admin', isReadOnly: role !== 'admin' };
}
