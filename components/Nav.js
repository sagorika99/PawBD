'use client';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/lib/useSession';
import { useLang } from '@/components/LangProvider';

export default function Nav() {
  const { user } = useSession();
  const { lang, setLang, t } = useLang();

  return (
    <header className="nav">
      <Link href="/" className="brand">
        🐾 {t('appName')}
      </Link>
      <nav>
        <Link href="/">{t('map')}</Link>
        <Link href="/board">{t('board')}</Link>
        <Link href="/new" className="cta">
          + {t('post')}
        </Link>
        {user ? (
          <button className="link" onClick={() => supabase.auth.signOut()}>
            {t('logout')}
          </button>
        ) : (
          <Link href="/login">{t('login')}</Link>
        )}
        <button className="link" onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}>
          {lang === 'en' ? 'বাংলা' : 'EN'}
        </button>
      </nav>
    </header>
  );
}
