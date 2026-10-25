'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PUBLIC_COLS, DIVISIONS } from '@/lib/data';
import { useLang } from '@/components/LangProvider';
import PostCard from '@/components/PostCard';

export default function BoardPage() {
  const { t } = useLang();
  const [kind, setKind] = useState('give_away');
  const [species, setSpecies] = useState('');
  const [division, setDivision] = useState('');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    let q = supabase
      .from('posts')
      .select(PUBLIC_COLS)
      .eq('kind', kind)
      .neq('status', 'closed')
      .order('created_at', { ascending: false })
      .limit(100);
    if (species) q = q.eq('species', species);
    if (division) q = q.eq('division', division);
    q.then(({ data, error }) => {
      if (error) setError(error.message);
      else setPosts(data || []);
      setLoading(false);
    });
  }, [kind, species, division]);

  return (
    <div className="page">
      <div className="tabs">
        {['give_away', 'adopt_request', 'rescue_alert'].map((k) => (
          <button key={k} className={`tab ${kind === k ? 'active' : ''}`} onClick={() => setKind(k)}>
            {t(k)}
          </button>
        ))}
      </div>
      <div className="filters">
        <select value={species} onChange={(e) => setSpecies(e.target.value)}>
          <option value="">{t('cat')} / {t('dog')}</option>
          <option value="cat">{t('cat')}</option>
          <option value="dog">{t('dog')}</option>
        </select>
        <select value={division} onChange={(e) => setDivision(e.target.value)}>
          <option value="">{t('division')}: {t('all')}</option>
          {DIVISIONS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>
      {error && <p className="error">{error}</p>}
      {!loading && posts.length === 0 && <p className="muted">{t('noPosts')}</p>}
      <div className="grid">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </div>
  );
}
