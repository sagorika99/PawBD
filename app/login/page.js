'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/components/LangProvider';

export default function LoginPage() {
  const { t } = useLang();
  const router = useRouter();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setMsg('');
    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else router.push('/');
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName }, emailRedirectTo: window.location.origin },
      });
      if (error) setError(error.message);
      else if (data.session) router.push('/');
      else setMsg('Check your email to confirm your account, then sign in.');
    }
    setBusy(false);
  }

  async function google() {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
  }

  return (
    <div className="page" style={{ maxWidth: 420 }}>
      <div className="tabs">
        <button className={`tab ${mode === 'signin' ? 'active' : ''}`} onClick={() => setMode('signin')}>{t('signIn')}</button>
        <button className={`tab ${mode === 'signup' ? 'active' : ''}`} onClick={() => setMode('signup')}>{t('signUp')}</button>
      </div>
      <form onSubmit={submit}>
        {mode === 'signup' && (
          <>
            <label>{t('fullName')}</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </>
        )}
        <label>{t('email')}</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>{t('password')}</label>
        <input type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
        <div className="row">
          <button className="btn" disabled={busy}>{mode === 'signin' ? t('signIn') : t('signUp')}</button>
          <button type="button" className="btn secondary" onClick={google}>{t('google')}</button>
        </div>
        {error && <p className="error">{error}</p>}
        {msg && <p className="ok">{msg}</p>}
      </form>
    </div>
  );
}
